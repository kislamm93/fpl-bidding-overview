import React, { useState, useEffect } from 'react';
import { Team } from '@/types/team';
import TeamSidebar from './TeamSidebar';
import { api } from '@/services/api';
import TeamCard from './TeamCard';
import TopMenuBar from './TopMenuBar';

const TeamDashboard: React.FC = () => {
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
      } catch (err) {
        setError('Failed to load teams. Please try again later.');
        console.error('Error loading teams:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => setSelectedTeam(null), 300);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Error</h2>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <TopMenuBar />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">FPL 2025 Budget Overview</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              onClick={() => handleTeamClick(team)}
            />
          ))}
        </div>
      </div>

      {selectedTeam && (
        <TeamSidebar
          team={selectedTeam}
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
        />
      )}
    </div>
  );
};

export default TeamDashboard;
