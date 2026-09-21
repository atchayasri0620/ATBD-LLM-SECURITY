import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, SlidersHorizontal, Plus, Cpu, Activity } from 'lucide-react';

export default function Header({
  sessionId,
  onNewSession,
  onToggleSecurityDetails,
  backendHealthy = true,
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card mb-6 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/10"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1rem 1.75rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.15)',
          }}
        >
          <Shield style={{ width: '24px', height: '24px', color: '#38bdf8' }} />
          <span
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ATBD
            </h1>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                letterSpacing: '0.08em',
              }}
            >
              v1.0 DEFENSE
            </span>
          </div>
          <p
            style={{
              fontSize: '0.8rem',
              color: '#94a3b8',
              letterSpacing: '0.02em',
              fontWeight: 400,
            }}
          >
            Adaptive Token-Level Behavioral Defense
          </p>
        </div>
      </div>

      {/* Center Status: PROTECTION ACTIVE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.45rem 1.1rem',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.12)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981',
              display: 'inline-block',
              animation: 'pulseGlow 2s infinite',
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#34d399',
            }}
          >
            ● PROTECTION ACTIVE
          </span>
        </div>

        {/* Model Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '9999px',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Sparkles style={{ width: '14px', height: '14px', color: '#a78bfa' }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
            Model: <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>Llama 3.2</strong>
          </span>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: backendHealthy ? '#10b981' : '#f59e0b',
            }}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {sessionId && (
          <div
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
            }}
          >
            SESSION:{' '}
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>
              {sessionId.slice(0, 8).toUpperCase()}
            </span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.04, backgroundColor: 'rgba(56, 189, 248, 0.15)' }}
          whileTap={{ scale: 0.96 }}
          onClick={onNewSession}
          title="New conversation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#e2e8f0',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Plus style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
          <span>New Session</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04, backgroundColor: 'rgba(148, 163, 184, 0.15)' }}
          whileTap={{ scale: 0.96 }}
          onClick={onToggleSecurityDetails}
          title="Security telemetry details"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#94a3b8',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <SlidersHorizontal style={{ width: '15px', height: '15px', color: '#94a3b8' }} />
          <span>Details</span>
        </motion.button>
      </div>
    </motion.header>
  );
}
