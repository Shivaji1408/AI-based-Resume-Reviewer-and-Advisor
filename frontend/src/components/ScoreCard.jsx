import { useState, useEffect } from 'react';
import clsx from 'clsx';

const getScoreColor = (score) => {
  if (score >= 80) return { text: 'text-emerald-400', ring: 'stroke-emerald-400', bg: 'bg-emerald-500/10', label: 'Excellent' };
  if (score >= 60) return { text: 'text-yellow-400', ring: 'stroke-yellow-400', bg: 'bg-yellow-500/10', label: 'Good' };
  if (score >= 40) return { text: 'text-orange-400', ring: 'stroke-orange-400', bg: 'bg-orange-500/10', label: 'Fair' };
  return { text: 'text-red-400', ring: 'stroke-red-400', bg: 'bg-red-500/10', label: 'Needs Work' };
};

export default function ScoreCard({ title, score, icon: Icon, subtitle, color }) {
  const [displayScore, setDisplayScore] = useState(0);
  const colors = getScoreColor(score);

  // Animate score count up
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = score / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  // SVG circle calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="glass-card p-5 flex flex-col items-center text-center group hover:border-white/20 transition-all duration-300">
      {/* Icon */}
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colors.bg)}>
        <Icon size={20} className={colors.text} />
      </div>

      {/* Title */}
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">{title}</p>

      {/* Circular Score Ring */}
      <div className="relative flex items-center justify-center mb-3">
        <svg width="100" height="100" className="-rotate-90">
          {/* Background ring */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Score ring */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            className={clsx(colors.ring, 'transition-all duration-1000')}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        {/* Score text in center */}
        <div className="absolute flex flex-col items-center">
          <span className={clsx('text-2xl font-bold tabular-nums', colors.text)}>
            {displayScore}
          </span>
          <span className="text-slate-500 text-xs">/100</span>
        </div>
      </div>

      {/* Status label */}
      <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', colors.bg, colors.text)}>
        {colors.label}
      </span>

      {subtitle && (
        <p className="text-slate-500 text-xs mt-2">{subtitle}</p>
      )}
    </div>
  );
}
