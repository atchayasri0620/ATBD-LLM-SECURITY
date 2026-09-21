import json
import time
import logging
from typing import Dict, Any, List, Optional
import redis
import fakeredis
from backend.config import settings

logger = logging.getLogger("atbd.redis")


class RedisClient:
    """Resilient Redis Client for ATBD Session and Telemetry Storage."""

    def __init__(self):
        self._client = None
        self._is_fake = False
        self._initialize()

    def _initialize(self):
        """Attempts to connect to native Redis; seamlessly falls back to fakeredis."""
        try:
            native_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD or None,
                decode_responses=True,
                socket_connect_timeout=1.5
            )
            native_client.ping()
            self._client = native_client
            self._is_fake = False
            logger.info("Connected successfully to native Redis server.")
        except Exception as e:
            if settings.REDIS_AUTO_FALLBACK:
                logger.warning(f"Native Redis unavailable ({e}). Initializing in-memory FakeRedis.")
                self._client = fakeredis.FakeRedis(decode_responses=True)
                self._is_fake = True
            else:
                raise ConnectionError(f"Cannot connect to Redis at {settings.REDIS_HOST}:{settings.REDIS_PORT}: {e}")

    @property
    def client(self):
        if self._client is None:
            self._initialize()
        return self._client

    def check_health(self) -> Dict[str, Any]:
        """Check status of Redis connection."""
        try:
            self.client.ping()
            return {
                "status": "healthy",
                "mode": "fakeredis (in-memory)" if self._is_fake else "native_redis",
                "host": settings.REDIS_HOST,
                "port": settings.REDIS_PORT
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "mode": "none",
                "error": str(e)
            }

    # Session Management
    def get_or_create_session(self, session_id: str, user_id: str = "user_default") -> Dict[str, Any]:
        key = f"session:{session_id}"
        data = self.client.hgetall(key)
        now = time.time()
        if not data:
            data = {
                "session_id": session_id,
                "user_id": user_id,
                "created_at": str(now),
                "last_activity": str(now),
                "total_tokens": "0",
                "request_count": "0",
                "risk_score": "0.0",
                "current_action": "ALLOW"
            }
            self.client.hset(key, mapping=data)
            self.client.sadd("active_sessions", session_id)
        return data

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        key = f"session:{session_id}"
        data = self.client.hgetall(key)
        return data if data else None

    def update_session(self, session_id: str, updates: Dict[str, Any]):
        key = f"session:{session_id}"
        mapping = {k: str(v) for k, v in updates.items()}
        self.client.hset(key, mapping=mapping)

    def get_all_active_session_ids(self) -> List[str]:
        return list(self.client.smembers("active_sessions"))

    # Prompt and Timestamp Telemetry History
    def add_prompt_event(self, session_id: str, prompt: str, input_tokens: int, timestamp: float):
        key = f"prompts:{session_id}"
        record = json.dumps({
            "prompt": prompt,
            "timestamp": timestamp,
            "input_tokens": input_tokens,
            "output_tokens": 0
        })
        self.client.rpush(key, record)
        # Keep last 50 prompts per session to bound memory
        self.client.ltrim(key, -50, -1)

    def update_last_prompt_output(self, session_id: str, output_tokens: int):
        key = f"prompts:{session_id}"
        last_item = self.client.rpop(key)
        if last_item:
            try:
                data = json.loads(last_item)
                data["output_tokens"] = output_tokens
                self.client.rpush(key, json.dumps(data))
            except Exception:
                self.client.rpush(key, last_item)

    def get_session_prompts(self, session_id: str) -> List[Dict[str, Any]]:
        key = f"prompts:{session_id}"
        items = self.client.lrange(key, 0, -1)
        res = []
        for item in items:
            try:
                res.append(json.loads(item))
            except Exception:
                continue
        return res

    # Global Metrics Tracking
    def increment_metric(self, metric_name: str, amount: int = 1):
        self.client.hincrby("metrics:global", metric_name, amount)

    def get_global_metrics(self) -> Dict[str, int]:
        data = self.client.hgetall("metrics:global")
        default_keys = [
            "total_requests", "total_tokens", "delayed_requests",
            "throttled_requests", "blocked_requests", "allowed_requests"
        ]
        res = {}
        for k in default_keys:
            res[k] = int(data.get(k, 0))
        return res

    # Security Incident Logging
    def log_security_event(self, event_data: Dict[str, Any]):
        key = "security_events"
        self.client.lpush(key, json.dumps(event_data))
        self.client.ltrim(key, 0, 499)  # Retain latest 500 security incidents

    def get_security_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        key = "security_events"
        items = self.client.lrange(key, 0, limit - 1)
        res = []
        for item in items:
            try:
                res.append(json.loads(item))
            except Exception:
                continue
        return res


redis_client = RedisClient()
