import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronDown, Lock } from 'lucide-react';
import { api } from '@/services/api';
import { Team, Player } from '@/types/team';

interface TransferModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (player: Player) => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ player, isOpen, onClose, onSuccess }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [cost, setCost] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await api.getTeams();
        setTeams(data);
      } catch (err) {
        setError('Failed to load teams');
      }
    };

    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setSearchQuery(team.name);
    setIsDropdownOpen(false);
  };

  const handleTransfer = async () => {
    if (!selectedTeam || !cost) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.transferPlayer(player._id, selectedTeam._id, parseInt(cost));
      onSuccess(response);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to transfer player');
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = selectedTeam && cost && 
    parseInt(cost) > 0 && 
    parseInt(cost) >= player.base_price &&
    parseInt(cost) <= (selectedTeam.budget - selectedTeam.budget_spent);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Transfer Player</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Player Summary */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{player.name}</h3>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span>{player.skill}</span>
              <span>•</span>
              <span>{player.category}</span>
              <span>•</span>
              <span>Base Price: €{player.base_price}</span>
            </div>
          </div>

          {/* Team Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Team
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                    if (!e.target.value) {
                      setSelectedTeam(null);
                    }
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {isDropdownOpen && filteredTeams.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg max-h-48 overflow-y-auto">
                  {filteredTeams.map((team) => {
                    const isFull = team.players.length >= 10;
                    return (
                      <button
                        key={team._id}
                        onClick={() => !isFull && handleTeamSelect(team)}
                        disabled={isFull}
                        className={`w-full p-3 text-left transition-colors ${
                          isFull
                            ? 'bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-60'
                            : selectedTeam?._id === team._id
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">{team.name}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{team.owner}</div>
                            <div className="text-sm text-emerald-600 dark:text-emerald-400">
                              Budget Left: €{team.budget - team.budget_spent}
                            </div>
                          </div>
                          {isFull && (
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                              <Lock className="w-4 h-4" />
                              <span className="text-sm">Full</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cost Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Cost (€)
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              min={player.base_price}
              max={selectedTeam ? selectedTeam.budget - selectedTeam.budget_spent : undefined}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
            />
            {selectedTeam && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Minimum cost: €{player.base_price} | Maximum cost: €{selectedTeam.budget - selectedTeam.budget_spent}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={!isValid || isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                isValid && !isLoading
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Transferring...' : 'Confirm Transfer'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransferModal; 