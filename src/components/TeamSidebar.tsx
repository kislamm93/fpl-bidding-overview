import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { Team } from '@/types/team';
import { api } from '@/services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { storage } from '@/services/storage';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface TeamSidebarProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
}

interface BudgetDataItem {
  name: string;
  value: number;
  type: 'spent' | 'left';
  hideFromLegend?: boolean;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'A+':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200'
      };
    case 'A':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200'
      };
    case 'B':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200'
      };
    case 'C':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200'
      };
    case 'D':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200'
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200'
      };
  }
};

const TeamSidebar: React.FC<TeamSidebarProps> = ({
  team,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [detailedTeam, setDetailedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSecretKey, setHasSecretKey] = useState(false);

  useEffect(() => {
    const secretKey = storage.getSecretKey();
    setHasSecretKey(!!secretKey);
  }, []);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      
      try {
        const data = await api.getTeamDetails(team._id);
        setDetailedTeam(data);
      } catch (err) {
        toast.error('Failed to load team details', {
          description: 'Please try again later',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamDetails();
  }, [isOpen, team._id]);

  const getBudgetData = (team: Team): BudgetDataItem[] => {
    const budgetLeft = team.budget - team.budget_spent;
    return [
      ...team.players.map(player => ({
        name: player.name,
        value: player.cost,
        type: 'spent' as const
      })),
      {
        name: 'Budget Left',
        value: budgetLeft,
        type: 'left' as const
      }
    ];
  };

  const handleDownloadCSV = async () => {
    if (!detailedTeam || !hasSecretKey) return;

    try {
      const secretKey = storage.getSecretKey();
      const response = await api.getTeamFullDetails(detailedTeam._id, secretKey);
      
      const headers = ['Name', 'Skill', 'Category', 'Cost', 'Base Price', 'Phone Number'];
      const rows = response.players.map(player => [
        player.name,
        player.skill,
        player.category,
        player.cost,
        player.base_price,
        player.phone_number
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${detailedTeam.name}_${detailedTeam.owner}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error('Failed to download team details', {
        description: 'Please try again later',
      });
    }
  };

  const handlePlayerClick = (playerName: string) => {
    navigate(`/players?search=${encodeURIComponent(playerName)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl z-50 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center border-2 border-slate-200">
                  <img
                    src={`/fpl-bidding-overview/${encodeURIComponent(team.name)}.png`}
                    alt={`${team.name} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/fpl-bidding-overview/placeholder.svg';
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{team.name}</h2>
                  <p className="text-sm text-slate-600">{team.owner}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Budget Spent</span>
                      <span className="font-semibold text-rose-600">€{team.budget_spent}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Budget Left</span>
                      <span className="font-semibold text-emerald-600">
                        €{team.budget - team.budget_spent}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Budget Usage</span>
                      <span className="font-semibold text-slate-900">
                        {((team.budget_spent / team.budget) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            ) : detailedTeam ? (
              <div className="space-y-6">
                {/* Budget Overview */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Budget Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ right: 20, left: 20 }}>
                        <Pie
                          data={getBudgetData(detailedTeam)}
                          cx="40%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {getBudgetData(detailedTeam).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.type === 'left' ? '#22c55e' : COLORS[index % COLORS.length]}
                              stroke={entry.type === 'left' ? '#16a34a' : undefined}
                              strokeWidth={entry.type === 'left' ? 2 : 0}
                              className="hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => {
                            const total = getBudgetData(detailedTeam).reduce((sum, item) => sum + item.value, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return (
                              <div className="space-y-1">
                                <div className="text-sm text-slate-600">€{value}</div>
                                <div className="text-sm text-slate-500">{percentage}%</div>
                              </div>
                            );
                          }}
                          labelFormatter={(name) => (
                            <div className="text-sm font-medium text-slate-900">{name}</div>
                          )}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            padding: '12px',
                          }}
                        />
                        <Legend
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          iconType="circle"
                          iconSize={8}
                          formatter={(value, entry, index) => {
                            const total = getBudgetData(detailedTeam).reduce((sum, item) => sum + item.value, 0);
                            const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                            return `${value} (${percentage}%)`;
                          }}
                          wrapperStyle={{
                            paddingLeft: '8px',
                            fontSize: '14px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Export Button */}
                {hasSecretKey && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleDownloadCSV}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Download Squad Information
                    </button>
                  </div>
                )}

                {/* Players List */}
                <div>
                  <div className="space-y-3">
                    {detailedTeam.players.map((player) => {
                      const categoryColors = getCategoryColor(player.category);
                      return (
                        <div
                          key={player._id}
                          className={`p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border ${categoryColors.border} hover:shadow-md transition-all duration-200`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 
                              className="font-medium text-slate-900 hover:text-emerald-600 cursor-pointer transition-colors"
                              onClick={() => handlePlayerClick(player.name)}
                            >
                              {player.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-sm px-2 py-1 rounded-full bg-slate-200 text-slate-600">Base: €{player.base_price}</span>
                              <span className="text-sm px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 font-medium">Cost: €{player.cost}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600">{player.skill}</span>
                            <span className={`px-3 py-1 rounded-full ${
                              player.category === 'Category A+' ? 'bg-purple-600 text-white' :
                              player.category === 'Category A' ? 'bg-blue-600 text-white' :
                              player.category === 'Category B' ? 'bg-emerald-600 text-white' :
                              player.category === 'Category C' ? 'bg-amber-600 text-white' :
                              'bg-slate-600 text-white'
                            } font-semibold shadow-sm`}>
                              {player.category}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamSidebar;
