import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { DifficultyLevel } from '../../data/types';
import { DIFFICULTY_CONFIGS } from '../../data/difficulty';
import { Shield } from 'lucide-react';

interface DifficultySelectorProps {
  className?: string;
  compact?: boolean;
  onDifficultyChange?: (level: DifficultyLevel) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  className = '',
  compact = false,
  onDifficultyChange,
}) => {
  const { difficulty, setDifficulty } = useGameStore();

  const levels: DifficultyLevel[] = ['regular', 'medium', 'hard'];

  const handleSelect = (lvl: DifficultyLevel) => {
    setDifficulty(lvl);
    if (onDifficultyChange) {
      onDifficultyChange(lvl);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-0.5 p-0.5 sm:p-1 rounded-xl bg-slate-950/80 border border-white/10 shadow-inner ${className}`}
      title="Select challenge difficulty: Regular (Famous), Medium (Intermediate), or Hard (All 196)"
    >
      <div className="hidden sm:flex items-center gap-1 px-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <Shield className="h-3 w-3 text-slate-400" />
      </div>

      {levels.map((lvl) => {
        const config = DIFFICULTY_CONFIGS[lvl];
        const isActive = difficulty === lvl;

        return (
          <button
            key={lvl}
            onClick={() => handleSelect(lvl)}
            className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all duration-200 capitalize whitespace-nowrap ${
              isActive
                ? lvl === 'regular'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/50'
                  : lvl === 'medium'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/50'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
            title={config.desc}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
};
