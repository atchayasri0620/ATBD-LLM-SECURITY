import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Monitor,
  TerminalSquare,
  LayoutDashboard,
} from 'lucide-react';

import Header from './components/Header';
import RiskGaugeCard from './components/RiskGaugeCard';
import RiskPipeline from './components/RiskPipeline';
import TelemetryGrid from './components/TelemetryGrid';
import BehavioralAnalysis from './components/BehavioralAnalysis';
import SecurityEventArea from './components/SecurityEventArea';
import ChatConsole from './components/ChatConsole';
import SecurityDetailsModal from './components/SecurityDetailsModal';
import { INITIAL_TELEMETRY } from './types/telemetry';

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [warningToast, setWarningToast] = useState(null);
  const [backendHealthy, setBackendHealthy] = useState(true);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('unified');

  // ------------------------------------------------------------
  // Backend health check
  // ------------------------------------------------------------
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');

        if (res.ok) {
          const data = await res.json();

          console.log('ATBD Health Check:', data);

          setBackendHealthy(true);
        } else {
          console.warn(
            'ATBD Health Check failed:',
            res.status,
            res.statusText
          );

          setBackendHealthy(false);
        }
      } catch (err) {
        console.warn('Backend not responding to health check:', err);

        setBackendHealthy(false);
      }
    }

    checkHealth();
  }, []);

  // ------------------------------------------------------------
  // Auto dismiss warning toast
  // ------------------------------------------------------------
  useEffect(() => {
    if (warningToast) {
      const timer = setTimeout(() => {
        setWarningToast(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [warningToast]);

  // ------------------------------------------------------------
  // Send message to backend
  // ------------------------------------------------------------
  const handleSendMessage = async (promptText) => {
    const trimmed = promptText.trim();

    if (!trimmed || isLoading) {
      return;
    }

    setIsLoading(true);

    // Add user message immediately
    const userMsgId = `user_${Date.now()}`;

    const newUserMessage = {
      id: userMsgId,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputPrompt('');

    const startTime = performance.now();

    try {
      // --------------------------------------------------------
      // Request payload
      // --------------------------------------------------------
      const payload = {
        prompt: trimmed,
        max_tokens: 256,
        temperature: 0.7,
      };

      if (sessionId) {
        payload.session_id = sessionId;
      }

      console.log('ATBD Chat Request:', payload);

      // --------------------------------------------------------
      // API request
      // --------------------------------------------------------
      const response = await fetch('/api/chat', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },

        body: JSON.stringify(payload),
      });

      const elapsed = performance.now() - startTime;

      // --------------------------------------------------------
      // IMPORTANT:
      // Read raw response first.
      // This prevents the generic "Invalid response" error.
      // --------------------------------------------------------
      const rawResponse = await response.text();

      console.log('ATBD HTTP Status:', response.status);
      console.log('ATBD HTTP Status Text:', response.statusText);
      console.log('ATBD Raw Response:', rawResponse);

      let data = null;

      // --------------------------------------------------------
      // Parse JSON safely
      // --------------------------------------------------------
      try {
        data = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error('ATBD JSON Parse Error:', parseError);

        const preview =
          rawResponse && rawResponse.trim()
            ? rawResponse.substring(0, 500)
            : 'EMPTY RESPONSE';

        throw new Error(
          `Server returned invalid JSON (${response.status}): ${preview}`
        );
      }

      // --------------------------------------------------------
      // HTTP error handling
      // --------------------------------------------------------
      if (!response.ok) {
        const serverMessage =
          data?.detail ||
          data?.message ||
          data?.error ||
          `HTTP ${response.status}: ${response.statusText}`;

        throw new Error(serverMessage);
      }

      // --------------------------------------------------------
      // Validate response object
      // --------------------------------------------------------
      if (!data || typeof data !== 'object') {
        throw new Error('Server returned an empty or invalid response.');
      }

      console.log('ATBD Parsed Chat Response:', data);

      // --------------------------------------------------------
      // 1. Update session ID
      // --------------------------------------------------------
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      // --------------------------------------------------------
      // 2. Update telemetry
      // --------------------------------------------------------
      const features = data.features || {};

      const updatedTelemetry = {
        risk_score: Number(data.risk_score ?? 0),

        action: data.action || 'ALLOW',

        token_rate: Number(features.token_rate ?? 0),

        request_frequency: Number(
          features.request_frequency ?? 0
        ),

        prompt_similarity: Number(
          features.prompt_similarity ?? 0
        ),

        session_duration: Number(
          features.session_duration ?? 0
        ),

        output_size: Number(
          features.output_size ?? 0
        ),

        applied_delay: Number(
          data.applied_delay ?? 0
        ),

        allowed_budget: Number(
          data.allowed_budget ?? 512
        ),

        explanation:
          data.explanation ||
          'Behavioral analysis completed.',

        features,
      };

      setTelemetry(updatedTelemetry);

      // --------------------------------------------------------
      // 3. Security event
      // --------------------------------------------------------
      const newEvent = {
        id: `evt_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 4)}`,

        timestamp: new Date().toLocaleTimeString(
          'en-US',
          {
            hour12: false,
          }
        ),

        riskScore: Number(data.risk_score ?? 0),

        action: data.action || 'ALLOW',

        similarity: Number(
          features.prompt_similarity ?? 0
        ),

        delay: Number(
          data.applied_delay ?? 0
        ),

        prompt: trimmed.slice(0, 100),
      };

      setEvents((prev) => [
        newEvent,
        ...prev.slice(0, 24),
      ]);

      // --------------------------------------------------------
      // 4. Assistant response
      // --------------------------------------------------------
      setMessages((prev) => [
        ...prev,

        {
          id: `asst_${Date.now()}`,

          role: 'assistant',

          content:
            data.response ||
            data.message ||
            'No response returned.',

          meta: {
            tokens: Number(
              data.total_tokens ?? 0
            ),

            latency:
              Number(data.latency_ms ?? 0) ||
              elapsed,

            action:
              data.action || 'ALLOW',

            risk:
              Number(data.risk_score ?? 0),
          },
        },
      ]);

      // --------------------------------------------------------
      // 5. Warning notification
      // --------------------------------------------------------
      if (data.warning) {
        setWarningToast(data.warning);
      }
    } catch (err) {
      console.error('=================================');
      console.error('ATBD CHAT API ERROR');
      console.error(err);
      console.error('=================================');

      setMessages((prev) => [
        ...prev,

        {
          id: `err_${Date.now()}`,

          role: 'system',

          content: `Security gateway error: ${
            err?.message || 'Unknown error'
          }`,
        },
      ]);

      setWarningToast(
        `Error: ${
          err?.message || 'Unknown error'
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------
  // New session
  // ------------------------------------------------------------
  const handleNewSession = () => {
    setSessionId(null);
    setMessages([]);
    setEvents([]);
    setTelemetry(INITIAL_TELEMETRY);
    setInputPrompt('');

    setWarningToast(
      'New secure session initialized.'
    );
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      {/* Background Cyber Effect */}
      <div className="cyber-bg" />

      {/* Main Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1840px',
          margin: '0 auto',
          padding: '1.25rem 1.5rem',
        }}
      >
        {/* Header */}
        <Header
          sessionId={sessionId}
          onNewSession={handleNewSession}
          onToggleSecurityDetails={() =>
            setShowSecurityDetails(true)
          }
          backendHealthy={backendHealthy}
        />

        {/* View Mode Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '10px',
            backgroundColor:
              'rgba(15, 23, 42, 0.4)',
            border:
              '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Console View:
            </span>

            <div
              style={{
                display: 'flex',
                gap: '0.35rem',
              }}
            >
              {/* Unified */}
              <button
                onClick={() =>
                  setActiveTab('unified')
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor:
                    activeTab === 'unified'
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'transparent',
                  border:
                    activeTab === 'unified'
                      ? '1px solid rgba(56, 189, 248, 0.3)'
                      : '1px solid transparent',
                  color:
                    activeTab === 'unified'
                      ? '#38bdf8'
                      : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Monitor
                  style={{
                    width: '13px',
                    height: '13px',
                  }}
                />

                Unified Dual-Pane
              </button>

              {/* Dashboard */}
              <button
                onClick={() =>
                  setActiveTab('dashboard')
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor:
                    activeTab === 'dashboard'
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'transparent',
                  border:
                    activeTab === 'dashboard'
                      ? '1px solid rgba(56, 189, 248, 0.3)'
                      : '1px solid transparent',
                  color:
                    activeTab === 'dashboard'
                      ? '#38bdf8'
                      : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <LayoutDashboard
                  style={{
                    width: '13px',
                    height: '13px',
                  }}
                />

                Telemetry Dashboard
              </button>

              {/* Console */}
              <button
                onClick={() =>
                  setActiveTab('console')
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor:
                    activeTab === 'console'
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'transparent',
                  border:
                    activeTab === 'console'
                      ? '1px solid rgba(56, 189, 248, 0.3)'
                      : '1px solid transparent',
                  color:
                    activeTab === 'console'
                      ? '#38bdf8'
                      : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <TerminalSquare
                  style={{
                    width: '13px',
                    height: '13px',
                  }}
                />

                Inference Console
              </button>
            </div>
          </div>

          <div
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <span>
              LIVE DEFENSE:{' '}
              <strong>ACTIVE</strong>
            </span>

            <span>·</span>

            <span>
              BUDGET:{' '}
              <strong>
                {telemetry.allowed_budget} TOKENS
              </strong>
            </span>
          </div>
        </div>

        {/* Defense Pipeline */}
        <RiskPipeline
          currentAction={telemetry.action}
          riskScore={telemetry.risk_score}
        />

        {/* Main Grid */}
        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              activeTab === 'unified'
                ? 'minmax(0, 1.15fr) minmax(0, 0.85fr)'
                : '1fr',

            gap: '1.5rem',

            alignItems: 'start',
          }}
        >
          {/* Dashboard */}
          {(activeTab === 'unified' ||
            activeTab === 'dashboard') && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Risk Card */}
              <div
                style={{
                  display: 'grid',

                  gridTemplateColumns:
                    activeTab === 'unified'
                      ? 'minmax(0, 1fr)'
                      : 'minmax(320px, 380px) minmax(0, 1fr)',

                  gap: '1.5rem',

                  marginBottom: '1.5rem',
                }}
              >
                <RiskGaugeCard
                  riskScore={
                    telemetry.risk_score
                  }
                  action={telemetry.action}
                />
              </div>

              {/* Telemetry */}
              <TelemetryGrid
                features={telemetry.features}
                appliedDelay={
                  telemetry.applied_delay
                }
              />

              {/* Behavioral Analysis */}
              <BehavioralAnalysis
                features={telemetry.features}
                explanation={
                  telemetry.explanation
                }
              />

              {/* Security Events */}
              <SecurityEventArea
                events={events}
              />
            </div>
          )}

          {/* Chat Console */}
          {(activeTab === 'unified' ||
            activeTab === 'console') && (
            <div
              style={{
                position:
                  activeTab === 'unified'
                    ? 'sticky'
                    : 'static',

                top: '1.5rem',
              }}
            >
              <ChatConsole
                messages={messages}
                inputPrompt={inputPrompt}
                setInputPrompt={setInputPrompt}
                onSendMessage={
                  handleSendMessage
                }
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Security Details Modal */}
      <SecurityDetailsModal
        isOpen={showSecurityDetails}
        onClose={() =>
          setShowSecurityDetails(false)
        }
        telemetry={telemetry}
        features={telemetry.features}
      />

      {/* Warning Toast */}
      <AnimatePresence>
        {warningToast && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            transition={{
              duration: 0.3,
            }}
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              zIndex: 1100,

              padding:
                '0.85rem 1.25rem',

              borderRadius: '12px',

              backgroundColor:
                'rgba(15, 23, 42, 0.92)',

              border:
                '1px solid rgba(245, 158, 11, 0.4)',

              boxShadow:
                '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.2)',

              backdropFilter: 'blur(12px)',

              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',

              maxWidth: '440px',
            }}
          >
            <ShieldAlert
              style={{
                width: '20px',
                height: '20px',
                color: '#f59e0b',
                flexShrink: 0,
              }}
            />

            <div
              style={{
                fontSize: '0.82rem',
                color: '#f8fafc',
                lineHeight: 1.4,
              }}
            >
              {warningToast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}