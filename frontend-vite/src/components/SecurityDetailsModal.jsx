import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Sliders, Database, AlertTriangle, Layers } from 'lucide-react';
import { ACTION_THRESHOLDS } from '../types/telemetry';

export default function SecurityDetailsModal({
  isOpen = false,
  onClose,
  telemetry = {},
  features = {},
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(3, 7, 18, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 999,
            }}
          />

          {/* Modal / Drawer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: '5%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#0b1120',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
              padding: '2rem',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sliders style={{ width: '20px', height: '20px', color: '#38bdf8' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                    Security Intelligence Inspector
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Telemetry breakdown, feature weights & defense thresholds
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Threshold Legend */}
            <div style={{ marginBottom: '1.75rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.75rem',
                }}
              >
                Defense Thresholds
              </span>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {Object.values(ACTION_THRESHOLDS).map((cfg) => (
                  <div
                    key={cfg.label}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${cfg.color}33`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem', color: cfg.color }}>
                        {cfg.label}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#64748b',
                        }}
                      >
                        {cfg.min} – {cfg.max}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{cfg.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Breakdown Table */}
            <div style={{ marginBottom: '1.75rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.75rem',
                }}
              >
                Telemetry Feature Weights
              </span>

              <div
                style={{
                  overflowX: 'auto',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#94a3b8' }}>
                      <th style={{ padding: '0.65rem 1rem' }}>Feature</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Live Value</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Normalized</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Contribution</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: '#cbd5e1' }}>
                    <tr style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>Token Rate</td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>
                        {Number(features.token_rate || 0).toFixed(2)} t/m
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>
                        {Number(features.normalized_token_rate || 0).toFixed(3)}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#38bdf8',
                        }}
                      >
                        +{Number(features.token_rate_contribution || 0).toFixed(2)} pts
                      </td>
                    </tr>
                    <tr style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>Request Frequency</td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>
                        {Number(features.request_frequency || 0).toFixed(2)} r/m
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>
                        {Number(features.normalized_request_frequency || 0).toFixed(3)}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#a855f7',
                        }}
                      >
                        +{Number(features.request_frequency_contribution || 0).toFixed(2)} pts
                      </td>
                    </tr>
                    <tr style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>Prompt Similarity</td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>
                        {Number(features.prompt_similarity || 0).toFixed(2)} / 100
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>
                        {(Number(features.prompt_similarity || 0) / 100).toFixed(3)}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#f59e0b',
                        }}
                      >
                        +{Number(features.prompt_similarity_contribution || 0).toFixed(2)} pts
                      </td>
                    </tr>
                    <tr style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>Session Duration</td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>
                        {Number(features.session_duration || 0).toFixed(2)} s
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>
                        {Number(features.normalized_session_duration || 0).toFixed(3)}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#06b6d4',
                        }}
                      >
                        +{Number(features.session_duration_contribution || 0).toFixed(2)} pts
                      </td>
                    </tr>
                    <tr style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>Output Size</td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>
                        {Number(features.output_size || 0).toFixed(0)} tokens
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>
                        {Number(features.normalized_output_size || 0).toFixed(3)}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#3b82f6',
                        }}
                      >
                        +{Number(features.output_size_contribution || 0).toFixed(2)} pts
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Raw JSON telemetry for audit */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.6rem',
                }}
              >
                <Database style={{ width: '14px', height: '14px', color: '#64748b' }} />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                  }}
                >
                  Raw Audit Telemetry
                </span>
              </div>

              <pre
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: '#070a13',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: '#38bdf8',
                  overflowX: 'auto',
                  maxHeight: '180px',
                }}
              >
                {JSON.stringify(
                  {
                    risk_score: telemetry.risk_score,
                    action: telemetry.action,
                    applied_delay: telemetry.applied_delay,
                    allowed_budget: telemetry.allowed_budget,
                    features,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
