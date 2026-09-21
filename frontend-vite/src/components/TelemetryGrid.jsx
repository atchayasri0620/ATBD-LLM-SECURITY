import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Fingerprint, Clock, FileText, ShieldAlert } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function TelemetryGrid({ features = {}, appliedDelay = 0.0 }) {
  const cards = [
    {
      id: 'token_rate',
      title: 'Token Rate',
      value: features.token_rate ?? 0,
      decimals: 1,
      unit: 'tokens / min',
      desc: 'Consumption velocity in 60s window',
      icon: Zap,
      iconColor: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.15)',
    },
    {
      id: 'request_freq',
      title: 'Request Frequency',
      value: features.request_frequency ?? 0,
      decimals: 1,
      unit: 'req / min',
      desc: 'Query cadence within window',
      icon: Activity,
      iconColor: '#a855f7',
      accentGlow: 'rgba(168, 85, 247, 0.15)',
    },
    {
      id: 'prompt_sim',
      title: 'Prompt Similarity',
      value: features.prompt_similarity ?? 0,
      decimals: 1,
      unit: 'score / 100',
      desc: 'Semantic overlap with history',
      icon: Fingerprint,
      iconColor: '#f59e0b',
      accentGlow: 'rgba(245, 158, 11, 0.15)',
    },
    {
      id: 'session_dur',
      title: 'Session Duration',
      value: features.session_duration ?? 0,
      decimals: 1,
      unit: 'seconds',
      desc: 'Elapsed active interaction time',
      icon: Clock,
      iconColor: '#06b6d4',
      accentGlow: 'rgba(6, 182, 212, 0.15)',
    },
    {
      id: 'output_size',
      title: 'Output Size',
      value: features.output_size ?? 0,
      decimals: 0,
      unit: 'tokens',
      desc: 'Average output payload generated',
      icon: FileText,
      iconColor: '#3b82f6',
      accentGlow: 'rgba(59, 130, 246, 0.15)',
    },
    {
      id: 'defense_delay',
      title: 'Defense Delay',
      value: appliedDelay ?? 0,
      decimals: 2,
      unit: 'seconds',
      desc: 'Adaptive latency injected',
      icon: ShieldAlert,
      iconColor: Number(appliedDelay || 0) > 0 ? '#f97316' : '#10b981',
      accentGlow:
        Number(appliedDelay || 0) > 0
          ? 'rgba(249, 115, 22, 0.15)'
          : 'rgba(16, 185, 129, 0.15)',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.id}
            variants={cardVariants}
            whileHover={{
              y: -4,
              borderColor: 'rgba(56, 189, 248, 0.35)',
              boxShadow: `0 12px 28px -8px ${card.accentGlow}`,
            }}
            className="glass-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'default',
            }}
          >
            {/* Top Row: Icon & Unit */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: card.accentGlow,
                  border: `1px solid ${card.iconColor}33`,
                }}
              >
                <Icon style={{ width: '18px', height: '18px', color: card.iconColor }} />
              </div>

              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#64748b',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                }}
              >
                {card.unit}
              </span>
            </div>

            {/* Middle: Title & Value */}
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.3rem',
                }}
              >
                {card.title}
              </span>

              <div
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.1,
                  color: '#f8fafc',
                  letterSpacing: '-0.02em',
                }}
              >
                <AnimatedCounter value={card.value} decimals={card.decimals} />
              </div>
            </div>

            {/* Bottom: Description hint */}
            <p
              style={{
                fontSize: '0.72rem',
                color: '#64748b',
                marginTop: '0.65rem',
                lineHeight: 1.3,
              }}
            >
              {card.desc}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
