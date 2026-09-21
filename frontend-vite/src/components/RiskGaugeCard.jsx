import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { getActionConfig, getRiskAction } from '../types/telemetry';

export default function RiskGaugeCard({ riskScore = 0.0, action = 'ALLOW' }) {
  const currentAction = action || getRiskAction(riskScore);
  const config = getActionConfig(currentAction);

  // SVG Gauge calculations
  // Semi-circle or full circular gauge (260 degree arc or full 360)
  // Let's use a 260-degree speedometer-style arc or full circle
  const size = 220;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Clamped score 0 - 100
  const clampedScore = Math.min(100, Math.max(0, Number(riskScore || 0)));
  const progressOffset = circumference - (clampedScore / 100) * circumference;

  const getActionIcon = () => {
    switch (currentAction) {
      case 'BLOCK':
        return <Flame style={{ width: '18px', height: '18px', color: config.color }} />;
      case 'THROTTLE':
        return <AlertTriangle style={{ width: '18px', height: '18px', color: config.color }} />;
      case 'DELAY':
        return <ShieldAlert style={{ width: '18px', height: '18px', color: config.color }} />;
      default:
        return <CheckCircle2 style={{ width: '18px', height: '18px', color: config.color }} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card relative overflow-hidden"
      style={{
        position: 'relative',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 50% 30%, ${config.glow} 0%, rgba(15, 23, 42, 0.7) 70%)`,
        border: `1px solid ${config.glow}`,
        boxShadow: `0 12px 40px -10px ${config.glow}`,
        minHeight: '340px',
      }}
    >
      {/* Header Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#94a3b8',
              textTransform: 'uppercase',
            }}
          >
            Current Risk
          </span>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#64748b',
          }}
        >
          LIVE DEFENSE EVAL
        </span>
      </div>

      {/* Circular Gauge */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Range ticks / background zones */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={strokeWidth}
            strokeDasharray="4 8"
          />

          {/* Dynamic Animated Value Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: progressOffset,
              stroke: config.color,
            }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{
              filter: `drop-shadow(0 0 10px ${config.color})`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#64748b',
              marginBottom: '0.1rem',
            }}
          >
            THREAT SCORE
          </span>

          <div
            style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              lineHeight: 1,
              color: '#f8fafc',
              textShadow: `0 0 25px ${config.glow}`,
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            <AnimatedCounter value={clampedScore} decimals={1} />
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 500,
              marginTop: '0.2rem',
            }}
          >
            / 100.0
          </span>
        </div>
      </div>

      {/* Action Badge & State */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAction}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          style={{
            marginTop: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1.4rem',
              borderRadius: '9999px',
              backgroundColor: config.badge,
              border: `1px solid ${config.color}`,
              boxShadow: `0 0 20px ${config.glow}`,
            }}
          >
            {getActionIcon()}
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: config.color,
              }}
            >
              {currentAction}
            </span>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontWeight: 500,
            }}
          >
            {config.desc}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Scale Markers Indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '85%',
          marginTop: '1.25rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.68rem',
          color: '#64748b',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span style={{ color: clampedScore < 30 ? '#10b981' : '#64748b' }}>0 (ALLOW)</span>
        <span style={{ color: clampedScore >= 30 && clampedScore < 60 ? '#f59e0b' : '#64748b' }}>
          30 (DELAY)
        </span>
        <span style={{ color: clampedScore >= 60 && clampedScore < 80 ? '#f97316' : '#64748b' }}>
          60 (THROTTLE)
        </span>
        <span style={{ color: clampedScore >= 80 ? '#ef4444' : '#64748b' }}>80 (BLOCK)</span>
      </div>
    </motion.div>
  );
}
