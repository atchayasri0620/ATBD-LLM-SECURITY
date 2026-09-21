import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Info, Zap, Activity, Fingerprint, History } from 'lucide-react';

export default function BehavioralAnalysis({ features = {}, explanation = '' }) {
  // Normalize metrics for bar display (0 to 100%)
  // If backend returns normalized_* (which are 0 to 1), multiply by 100
  const tokenUsagePercent = Math.min(
    100,
    Math.max(
      0,
      features.normalized_token_rate != null
        ? features.normalized_token_rate * 100
        : (Number(features.token_rate || 0) / 600) * 100
    )
  );

  const requestFreqPercent = Math.min(
    100,
    Math.max(
      0,
      features.normalized_request_frequency != null
        ? features.normalized_request_frequency * 100
        : (Number(features.request_frequency || 0) / 40) * 100
    )
  );

  const promptSimPercent = Math.min(
    100,
    Math.max(
      0,
      features.prompt_similarity != null
        ? Number(features.prompt_similarity)
        : 0
    )
  );

  const sessionActPercent = Math.min(
    100,
    Math.max(
      0,
      features.normalized_session_duration != null
        ? features.normalized_session_duration * 100
        : (Number(features.session_duration || 0) / 300) * 100
    )
  );

  const getBarColor = (percent) => {
    if (percent < 30) return { bar: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' };
    if (percent < 60) return { bar: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' };
    if (percent < 80) return { bar: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' };
    return { bar: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' };
  };

  const indicators = [
    {
      id: 'token_usage',
      label: 'Token Usage',
      rawVal: `${Number(features.token_rate || 0).toFixed(1)} t/m`,
      contribution: features.token_rate_contribution != null ? `+${Number(features.token_rate_contribution).toFixed(1)} pts` : null,
      percent: tokenUsagePercent,
      icon: Zap,
    },
    {
      id: 'request_freq',
      label: 'Request Frequency',
      rawVal: `${Number(features.request_frequency || 0).toFixed(1)} r/m`,
      contribution: features.request_frequency_contribution != null ? `+${Number(features.request_frequency_contribution).toFixed(1)} pts` : null,
      percent: requestFreqPercent,
      icon: Activity,
    },
    {
      id: 'prompt_sim',
      label: 'Prompt Similarity',
      rawVal: `${Number(features.prompt_similarity || 0).toFixed(1)} / 100`,
      contribution: features.prompt_similarity_contribution != null ? `+${Number(features.prompt_similarity_contribution).toFixed(1)} pts` : null,
      percent: promptSimPercent,
      icon: Fingerprint,
    },
    {
      id: 'session_act',
      label: 'Session Activity',
      rawVal: `${Number(features.session_duration || 0).toFixed(1)} s`,
      contribution: features.session_duration_contribution != null ? `+${Number(features.session_duration_contribution).toFixed(1)} pts` : null,
      percent: sessionActPercent,
      icon: History,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-card"
      style={{
        padding: '1.5rem 1.75rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <BrainCircuit style={{ width: '20px', height: '20px', color: '#38bdf8' }} />
          <div>
            <h2
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#f8fafc',
                textTransform: 'uppercase',
              }}
            >
              Behavioral Analysis
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Dynamic feature contribution & vector load tracking
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            background: 'rgba(56, 189, 248, 0.08)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.2)',
          }}
        >
          WEIGHTED VECTOR ENGINE
        </span>
      </div>

      {/* 4 Horizontal Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {indicators.map((item) => {
          const Icon = item.icon;
          const colorTheme = getBarColor(item.percent);

          return (
            <div key={item.id}>
              {/* Bar Label & Value Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>
                    {item.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.contribution && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        color: colorTheme.bar,
                        background: `${colorTheme.bar}1a`,
                        padding: '0.1rem 0.45rem',
                        borderRadius: '4px',
                      }}
                    >
                      {item.contribution}
                    </span>
                  )}

                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: '#f8fafc',
                    }}
                  >
                    {item.rawVal}
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                {/* Animated Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    background: `linear-gradient(90deg, ${colorTheme.bar}88 0%, ${colorTheme.bar} 100%)`,
                    boxShadow: `0 0 10px ${colorTheme.glow}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation Banner */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.6rem',
        }}
      >
        <Info
          style={{
            width: '16px',
            height: '16px',
            color: '#38bdf8',
            flexShrink: 0,
            marginTop: '0.15rem',
          }}
        />
        <div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#94a3b8',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '0.2rem',
            }}
          >
            ATBD Assessment Summary
          </span>
          <p
            style={{
              fontSize: '0.78rem',
              color: '#cbd5e1',
              lineHeight: 1.45,
            }}
          >
            {explanation || 'No interaction has been analyzed yet.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
