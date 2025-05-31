import axios from 'axios';
import { Team, Player } from '@/types/team';
import { storage } from '@/services/storage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    if (error.response) {
      console.log('Response Error:', error.response);
    } else if (error.request) {
      console.log('Request Error:', error.request);
    } else {
      console.log('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const api = {
  getTeams: async (): Promise<Team[]> => {
    const response = await apiClient.get('/teams');
    return response.data;
  },

  getTeamDetails: async (teamId: string): Promise<Team> => {
    const response = await apiClient.get<Team>(`/teams/${teamId}`);
    return response.data;
  },

  getTeamFullDetails: async (teamId: string, secretKey: string): Promise<Team> => {
    const response = await apiClient.get<Team>(`/teams/${teamId}/full?secret_key=${secretKey}`);
    return response.data;
  },

  getPlayers: async (name?: string): Promise<Player[]> => {
    const url = name ? `/players?name=${encodeURIComponent(name)}` : '/players';
    const response = await apiClient.get<Player[]>(url);
    return response.data;
  },

  searchPlayers: async (name: string): Promise<Player[]> => {
    const response = await apiClient.get<Player[]>(`/players?name=${encodeURIComponent(name)}`);
    const playersWithTeamNames = await Promise.all(
      response.data.map(async (player) => {
        if (player.team_id) {
          try {
            const team = await apiClient.get<Team>(`/teams/${player.team_id}`);
            return { ...player, team_name: team.data.name };
          } catch (error) {
            return player;
          }
        }
        return player;
      })
    );
    return playersWithTeamNames;
  },

  transferPlayer: async (playerId: string, teamId: string, cost: number): Promise<Player> => {
    const secretKey = storage.getSecretKey();
    if (!secretKey) {
      throw new Error('Secret key is required for player transfer');
    }

    try {
      const response = await apiClient.put<Player>(`/players/${playerId}`, {
        team_id: teamId,
        cost,
        secret_key: secretKey
      });

      if (!response.data) {
        throw new Error('Failed to transfer player');
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  removePlayer: async (playerId: string, secretKey: string): Promise<Player> => {
    const response = await apiClient.put<Player>(`/players/${playerId}/remove`, {
      secret_key: secretKey
    });

    if (!response.data) {
      throw new Error('Failed to remove player');
    }

    return response.data;
  },
}; 