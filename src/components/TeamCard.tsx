import React from 'react';
import { Team } from '@/types/team';
import { Lock } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  onClick: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onClick }) => {
  const budgetLeft = team.budget - team.budget_spent;
  const usagePercent = (team.budget_spent / team.budget) * 100;
  const usageBarClass = usagePercent >= 75
    ? 'bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-600 dark:to-rose-600'
    : 'bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700';
  
  const playerCount = team.players.length;
  const playerPercent = (playerCount / 10) * 100;
  const playerColor = playerCount >= 10 
    ? 'text-emerald-600 dark:text-emerald-400' 
    : 'text-slate-600 dark:text-slate-400';

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  return (
    <div
      onClick={onClick}
      className={`backdrop-blur-sm rounded-xl shadow-sm border p-6 cursor-pointer hover:shadow-lg transition-all duration-300 group ${
        playerCount >= 10
          ? 'bg-gradient-to-br from-rose-50/50 to-red-50/50 border-rose-100/40 hover:border-rose-200 hover:from-rose-50/60 hover:to-red-50/60'
          : 'bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-emerald-100/40 hover:border-emerald-200 hover:from-emerald-50/60 hover:to-teal-50/60'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center">
            <img
              src={`/${encodeURIComponent(team.name)}.png`}
              alt={`${team.name} logo`}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">
              {team.name}
            </h3>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-1">{team.owner}</p>
          </div>
        </div>
        <div className="relative w-12 h-12">
          {playerCount >= 10 ? (
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
              <Lock className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
          ) : (
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${playerPercent * 1.26} 126`}
                className={`${playerCount >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'} transition-all duration-300`}
              />
            </svg>
          )}
          {playerCount < 10 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-medium ${playerColor}`}>
                {playerCount}/10
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">First Player</span>
          <span className="text-sm text-slate-800 dark:text-slate-200 truncate max-w-24">{team.first_player}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Budget Spent</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">€{team.budget_spent}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Budget Left</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">€{budgetLeft}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Budget Usage</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{usagePercent.toFixed(1)}%</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
          <div
            className={`${usageBarClass} h-1.5 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard; 