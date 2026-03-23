export type Site = {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  lat: number;
  lng: number;
  points_value: number;
  created_by: string | null;
  created_at: string;
};

export type Checkin = {
  id: string;
  user_id: string;
  site_id: string;
  checked_in_at: string;
};

export type Profile = {
  id: string;
  username: string | null;
  total_score: number;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      sites: {
        Row: Site;
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          photo_url?: string | null;
          lat: number;
          lng: number;
          points_value?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          photo_url?: string | null;
          lat?: number;
          lng?: number;
          points_value?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      checkins: {
        Row: Checkin;
        Insert: {
          id?: string;
          user_id: string;
          site_id: string;
          checked_in_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          site_id?: string;
          checked_in_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username?: string | null;
          total_score?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          total_score?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_score: {
        Args: { p_user_id: string; p_amount: number };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
