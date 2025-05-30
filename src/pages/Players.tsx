import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Lock, ArrowRightLeft, Clock } from 'lucide-react';
import TransferModal from '@/components/TransferModal';
import SuccessModal from '@/components/SuccessModal';
import { storage } from '@/services/storage';
import { useNavigate } from 'react-router-dom';
import TopMenuBar from '@/components/TopMenuBar';

interface Player {
  _id: string;
  name: string;
  category: string;
  cost: number | null;
  created_at: string;
  phone_number: string;
  skill: string;
  team_id?: string | null;
  updated_at: string;
  team?: {
    id: string;
    name: string;
    owner: string;
  };
  base_price: number;
}

type SortField = 'name' | 'skill' | 'category' | 'cost' | 'base_price' | 'team' | 'phone';
type SortDirection = 'asc' | 'desc';

const Players: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<{ playerName: string; teamName: string } | null>(null);
  const [hasSecretKey, setHasSecretKey] = useState(false);

  useEffect(() => {
    const secretKey = storage.getSecretKey();
    setHasSecretKey(!!secretKey);
  }, []);

  const fetchPlayers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPlayers(searchQuery);
      setPlayers(data);
    } catch (err) {
      setError('Failed to load players. Please try again later.');
      console.error('Error loading players:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPlayers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedPlayers = () => {
    return [...players].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle team name sorting
      if (sortField === 'team') {
        aValue = a.team?.name || '';
        bValue = b.team?.name || '';
      }

      // Handle null values
      if (aValue === null) aValue = sortField === 'cost' ? -1 : '';
      if (bValue === null) bValue = sortField === 'cost' ? -1 : '';

      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const handleTransferClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsTransferModalOpen(true);
  };

  const handleTransferSuccess = (updatedPlayer: Player) => {
    setTransferSuccess({
      playerName: updatedPlayer.name,
      teamName: updatedPlayer.team?.name || '',
    });
    setIsSuccessModalOpen(true);
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    setTransferSuccess(null);
    fetchPlayers(); // Refresh the player list
  };

  const handleTeamClick = (teamId: string) => {
    navigate(`/?team=${teamId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TopMenuBar />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Players</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort('team')}
                  >
                    <div className="flex items-center gap-2">
                      Team
                      <SortIcon field="team" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort('cost')}
                  >
                    <div className="flex items-center gap-2">
                      Cost
                      <SortIcon field="cost" />
                    </div>
                  </th>
                  {hasSecretKey && (
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('base_price')}
                    >
                      <div className="flex items-center gap-2">
                        Base Price
                        <SortIcon field="base_price" />
                      </div>
                    </th>
                  )}
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort('skill')}
                  >
                    <div className="flex items-center gap-2">
                      Skill
                      <SortIcon field="skill" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-2">
                      Category
                      <SortIcon field="category" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {getSortedPlayers().map((player) => (
                  <tr 
                    key={player._id} 
                    className={`hover:bg-slate-50 transition-colors ${
                      player.team 
                        ? 'bg-rose-100/70' 
                        : 'bg-emerald-100/70'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="group relative">
                        <div className="text-sm font-medium text-slate-900 max-w-[150px] truncate">{player.name}</div>
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                          {player.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {player.team ? (
                        <div>
                          <div className="text-sm font-medium text-slate-900">{player.team.name}</div>
                          <div className="text-xs text-slate-500">{player.team.owner}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Available</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-emerald-600">
                        {player.cost ? `€${player.cost}` : '-'}
                      </div>
                    </td>
                    {hasSecretKey && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-600">
                          €{player.base_price}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{player.skill}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        player.category === 'Category A+' ? 'bg-purple-600 text-white' :
                        player.category === 'Category A' ? 'bg-blue-600 text-white' :
                        player.category === 'Category B' ? 'bg-emerald-600 text-white' :
                        player.category === 'Category C' ? 'bg-amber-600 text-white' :
                        'bg-slate-600 text-white'
                      } shadow-sm`}>
                        {player.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {player.team ? (
                          <Lock className="w-4 h-4 text-rose-600" />
                        ) : hasSecretKey ? (
                          <button 
                            onClick={() => handleTransferClick(player)}
                            className="p-1 hover:bg-emerald-100 rounded-full transition-colors"
                            title="Transfer player"
                          >
                            <Clock className="w-4 h-4 text-emerald-600" />
                          </button>
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedPlayer && (
        <TransferModal
          player={selectedPlayer}
          isOpen={isTransferModalOpen}
          onClose={() => {
            setIsTransferModalOpen(false);
            setSelectedPlayer(null);
          }}
          onSuccess={handleTransferSuccess}
        />
      )}

      {transferSuccess && (
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleSuccessModalClose}
          playerName={transferSuccess.playerName}
          teamName={transferSuccess.teamName}
        />
      )}
    </div>
  );
};

export default Players; 