export const ACTION_THRESHOLDS = {
  ALLOW: { min: 0, max: 29.99, label: 'ALLOW', color: '#10b981', glow: 'rgba(16, 185, 129, 0.35)', badge: 'rgba(16, 185, 129, 0.15)', desc: 'Normal Interaction' },
  DELAY: { min: 30, max: 59.99, label: 'DELAY', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.35)', badge: 'rgba(245, 158, 11, 0.15)', desc: 'Adaptive Delay Injected' },
  THROTTLE: { min: 60, max: 79.99, label: 'THROTTLE', color: '#f97316', glow: 'rgba(249, 115, 22, 0.35)', badge: 'rgba(249, 115, 22, 0.15)', desc: 'Token Budget Constrained' },
  BLOCK: { min: 80, max: 100, label: 'BLOCK', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.35)', badge: 'rgba(239, 68, 68, 0.15)', desc: 'Request Terminated' },
};

export function getActionConfig(action) {
  const key = String(action || 'ALLOW').toUpperCase();
  return ACTION_THRESHOLDS[key] || ACTION_THRESHOLDS.ALLOW;
}

export function getRiskAction(score) {
  const num = Number(score || 0);
  if (num < 30) return 'ALLOW';
  if (num < 60) return 'DELAY';
  if (num < 80) return 'THROTTLE';
  return 'BLOCK';
}

export const INITIAL_TELEMETRY = {
  risk_score: 0.0,
  action: 'ALLOW',
  token_rate: 0.0,
  request_frequency: 0.0,
  prompt_similarity: 0.0,
  session_duration: 0.0,
  output_size: 0.0,
  applied_delay: 0.0,
  allowed_budget: 512,
  explanation: 'No interaction has been analyzed yet.',
  features: {
    token_rate: 0.0,
    normalized_token_rate: 0.0,
    token_rate_contribution: 0.0,
    request_frequency: 0.0,
    normalized_request_frequency: 0.0,
    request_frequency_contribution: 0.0,
    prompt_similarity: 0.0,
    prompt_similarity_contribution: 0.0,
    session_duration: 0.0,
    normalized_session_duration: 0.0,
    session_duration_contribution: 0.0,
    output_size: 0.0,
    normalized_output_size: 0.0,
    output_size_contribution: 0.0,
  },
};
