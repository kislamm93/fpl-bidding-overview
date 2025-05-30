import React, { useEffect, useState } from 'react';
import { Team } from '@/types/team';
import { api } from '@/services/api';
import TeamCard from '@/components/TeamCard';
import TeamSidebar from '@/components/TeamSidebar';
import { useSearchParams } from 'react-router-dom';
import TopMenuBar from '@/components/TopMenuBar';

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await api.getTeams();
        setTeams(data);
        
        // Check if there's a team ID in the URL
        const teamId = searchParams.get('team');
        if (teamId) {
          const team = data.find(t => t._id === teamId);
          if (team) {
            setSelectedTeam(team);
            setIsSidebarOpen(true);
          }
        }
      } catch (err) {
        setError('Failed to load teams. Please try again later.');
        console.error('Error loading teams:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [searchParams]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedTeam(null);
  };

  const handleRemovePlayer = (teamId: string, playerIndex: number) => {
    setTeams(prevTeams => 
      prevTeams.map(team => {
        if (team._id === teamId) {
          const updatedPlayers = [...team.players];
          updatedPlayers.splice(playerIndex, 1);
          return { ...team, players: updatedPlayers };
        }
        return team;
      })
    );
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              onClick={() => handleTeamClick(team)}
            />
          ))}
        </div>

        {selectedTeam && (
          <TeamSidebar
            team={selectedTeam}
            isOpen={isSidebarOpen}
            onClose={handleCloseSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default Home; 