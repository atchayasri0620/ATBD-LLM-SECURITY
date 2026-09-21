import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Clock, History, AlertOctagon, ArrowUpRight } from 'lucide-react';
import { getActionConfig } from '../types/telemetry';

export default function SecurityEventArea({ events = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
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
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <History style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
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
              Recent Security Activity
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Real-time audit log of evaluated requests & triggered defenses
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
            }}
          >
            {events.length} {events.length === 1 ? 'EVENT' : 'EVENTS'} LOGGED
          </span>
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {events.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '10px',
              border: '1px dashed rgba(255, 255, 255, 0.08)',
            }}
          >
            <ShieldCheck
              style={{
                width: '32px',
                height: '32px',
                color: '#475569',
                margin: '0 auto 0.6rem auto',
                display: 'block',
              }}
            />
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>
              No security events recorded in this session yet.
            </p>
            <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
              Interact with the chat console below to evaluate live behavioral defense telemetry.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((event) => {
              const config = getActionConfig(event.action);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -16, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 16, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  {/* Left: Timestamp & Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#64748b',
                      }}
                    >
                      <Clock style={{ width: '12px', height: '12px', color: '#475569' }} />
                      {event.timestamp}
                    </div>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        backgroundColor: config.badge,
                        color: config.color,
                        border: `1px solid ${config.color}44`,
                      }}
                    >
                      {event.action}
                    </span>
                  </div>

                  {/* Middle: Prompt snippet */}
                  <div
                    style={{
                      flex: '1 1 200px',
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '380px',
                    }}
                    title={event.prompt}
                  >
                    "{event.prompt}"
                  </div>

                  {/* Right: Telemetry chips */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        color: '#94a3b8',
                      }}
                    >
                      Risk:{' '}
                      <strong style={{ color: config.color }}>
                        {Number(event.riskScore || 0).toFixed(1)}
                      </strong>
                    </div>

                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        color: '#94a3b8',
                      }}
                    >
                      Sim:{' '}
                      <strong style={{ color: '#f8fafc' }}>
                        {Number(event.similarity || 0).toFixed(1)}
                      </strong>
                    </div>

                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        color: '#94a3b8',
                      }}
                    >
                      Delay:{' '}
                      <strong
                        style={{
                          color: Number(event.delay || 0) > 0 ? '#f97316' : '#94a3b8',
                        }}
                      >
                        {Number(event.delay || 0).toFixed(1)}s
                      </strong>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
