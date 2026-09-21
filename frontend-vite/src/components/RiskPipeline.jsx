import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Clock, Gauge, ShieldX } from 'lucide-react';
import { ACTION_THRESHOLDS, getRiskAction } from '../types/telemetry';

const PIPELINE_STEPS = [
  {
    id: 'ALLOW',
    label: 'ALLOW',
    range: '0 – 29.9',
    desc: 'Normal Baseline',
    icon: ShieldCheck,
    config: ACTION_THRESHOLDS.ALLOW,
  },
  {
    id: 'DELAY',
    label: 'DELAY',
    range: '30 – 59.9',
    desc: 'Adaptive Delay',
    icon: Clock,
    config: ACTION_THRESHOLDS.DELAY,
  },
  {
    id: 'THROTTLE',
    label: 'THROTTLE',
    range: '60 – 79.9',
    desc: 'Token Budget Capped',
    icon: Gauge,
    config: ACTION_THRESHOLDS.THROTTLE,
  },
  {
    id: 'BLOCK',
    label: 'BLOCK',
    range: '80 – 100',
    desc: 'Request Rejected',
    icon: ShieldX,
    config: ACTION_THRESHOLDS.BLOCK,
  },
];

export default function RiskPipeline({ currentAction = 'ALLOW', riskScore = 0 }) {
  const activeAction = currentAction || getRiskAction(riskScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card px-6 py-5 mb-6"
      style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#94a3b8',
              textTransform: 'uppercase',
            }}
          >
            Defense Action Pipeline
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Current Level:{' '}
          <strong style={{ color: ACTION_THRESHOLDS[activeAction]?.color || '#38bdf8' }}>
            {activeAction}
          </strong>{' '}
          (Risk {Number(riskScore || 0).toFixed(1)})
        </div>
      </div>

      {/* Steps Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          position: 'relative',
        }}
      >
        {PIPELINE_STEPS.map((step, index) => {
          const isActive = step.id === activeAction;
          const Icon = step.icon;

          return (
            <div key={step.id} style={{ position: 'relative' }}>
              <motion.div
                animate={{
                  borderColor: isActive ? step.config.color : 'rgba(255, 255, 255, 0.08)',
                  backgroundColor: isActive
                    ? 'rgba(30, 41, 59, 0.85)'
                    : 'rgba(15, 23, 42, 0.4)',
                  boxShadow: isActive
                    ? `0 0 25px ${step.config.glow}, inset 0 0 15px ${step.config.badge}`
                    : 'none',
                }}
                transition={{ duration: 0.4 }}
                style={{
                  padding: '1rem 0.9rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Active pulsating bar on top */}
                {isActive && (
                  <motion.div
                    layoutId="active-pipeline-bar"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor: step.config.color,
                      boxShadow: `0 0 10px ${step.config.color}`,
                    }}
                  />
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isActive
                          ? step.config.badge
                          : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${
                          isActive ? step.config.color : 'rgba(255, 255, 255, 0.06)'
                        }`,
                      }}
                    >
                      <Icon
                        style={{
                          width: '15px',
                          height: '15px',
                          color: isActive ? step.config.color : '#64748b',
                        }}
                      />
                    </div>

                    <strong
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        color: isActive ? step.config.color : '#94a3b8',
                      }}
                    >
                      {step.label}
                    </strong>
                  </div>

                  {isActive && (
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                        backgroundColor: step.config.badge,
                        color: step.config.color,
                        border: `1px solid ${step.config.color}`,
                        letterSpacing: '0.06em',
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.2rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: isActive ? '#cbd5e1' : '#64748b',
                      fontWeight: 500,
                    }}
                  >
                    {step.desc}
                  </span>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      color: isActive ? step.config.color : '#475569',
                      fontWeight: 600,
                    }}
                  >
                    {step.range}
                  </span>
                </div>
              </motion.div>

              {/* Connecting Flow Arrow */}
              {index < PIPELINE_STEPS.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-14px',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <ChevronRight
                    style={{
                      width: '12px',
                      height: '12px',
                      color: isActive ? step.config.color : '#475569',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
