export interface Team {
  _id: string;
  name: string;
  owner: string;
  budget: number;
  budget_spent: number;
  budget_left: number;
  first_player: string;
  first_player_cost: number;
  created_at: string;
  updated_at: string;
  players: Player[];
}

export interface Player {
  _id: string;
  name: string;
  skill: string;
  category: string;
  cost: number;
  base_price: number;
  team_id?: string;
  team_name?: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
} 