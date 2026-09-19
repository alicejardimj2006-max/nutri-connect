export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          role: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          display_name: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      private_profiles: {
        Row: {
          user_id: string;
          full_name: string;
          cpf: string | null;
          birth_date: string | null;
          phone: string | null;
          email: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          full_name: string;
          cpf?: string | null;
          birth_date?: string | null;
          phone?: string | null;
          email: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          full_name?: string;
          cpf?: string | null;
          birth_date?: string | null;
          phone?: string | null;
          email?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      privacy_settings: {
        Row: {
          user_id: string;
          profile_visibility: string | null;
          discoverability: string | null;
          message_allowance: string | null;
          show_location: boolean | null;
          use_location_for_features: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          profile_visibility?: string | null;
          discoverability?: string | null;
          message_allowance?: string | null;
          show_location?: boolean | null;
          use_location_for_features?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          profile_visibility?: string | null;
          discoverability?: string | null;
          message_allowance?: string | null;
          show_location?: boolean | null;
          use_location_for_features?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      privacy_requests: {
        Row: {
          id: string;
          user_id: string | null;
          type: string;
          status: string | null;
          internal_notes: string | null;
          response: string | null;
          protocol: string | null;
          created_at: string | null;
          updated_at: string | null;
          processed_at: string | null;
          processed_by: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: string;
          status?: string | null;
          internal_notes?: string | null;
          response?: string | null;
          protocol?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          processed_at?: string | null;
          processed_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?: string;
          status?: string | null;
          internal_notes?: string | null;
          response?: string | null;
          protocol?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          processed_at?: string | null;
          processed_by?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
