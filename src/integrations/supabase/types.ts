export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      career_verdicts: {
        Row: {
          created_at: string
          hiring_probability: number
          id: string
          interview_readiness: number
          next_actions: string[] | null
          recommended_roles: string[] | null
          resume_readiness: number
          roles_to_avoid: string[] | null
          salary_range: Json | null
          skill_readiness: number
          top_risks: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          hiring_probability?: number
          id?: string
          interview_readiness?: number
          next_actions?: string[] | null
          recommended_roles?: string[] | null
          resume_readiness?: number
          roles_to_avoid?: string[] | null
          salary_range?: Json | null
          skill_readiness?: number
          top_risks?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          hiring_probability?: number
          id?: string
          interview_readiness?: number
          next_actions?: string[] | null
          recommended_roles?: string[] | null
          resume_readiness?: number
          roles_to_avoid?: string[] | null
          salary_range?: Json | null
          skill_readiness?: number
          top_risks?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
        }
        Relationships: []
      }
      game_achievements: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          attempts: number
          code_submitted: string | null
          completed: boolean
          created_at: string
          game_id: string
          id: string
          score: number
          time_taken_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          code_submitted?: string | null
          completed?: boolean
          created_at?: string
          game_id: string
          id?: string
          score?: number
          time_taken_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          code_submitted?: string | null
          completed?: boolean
          created_at?: string
          game_id?: string
          id?: string
          score?: number
          time_taken_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_scores_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          code_template: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          expected_output: string | null
          hints: string[] | null
          id: string
          image_url: string | null
          instructions: string | null
          is_active: boolean
          language: Database["public"]["Enums"]["game_language"]
          order_index: number
          time_limit_seconds: number | null
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          code_template?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          expected_output?: string | null
          hints?: string[] | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean
          language: Database["public"]["Enums"]["game_language"]
          order_index?: number
          time_limit_seconds?: number | null
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          code_template?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          expected_output?: string | null
          hints?: string[] | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean
          language?: Database["public"]["Enums"]["game_language"]
          order_index?: number
          time_limit_seconds?: number | null
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      interview_attempts: {
        Row: {
          created_at: string
          evaluation: Json | null
          experience_level: string
          id: string
          messages: Json | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evaluation?: Json | null
          experience_level: string
          id?: string
          messages?: Json | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          evaluation?: Json | null
          experience_level?: string
          id?: string
          messages?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_analyses: {
        Row: {
          ats_score: number
          created_at: string
          id: string
          resume_id: string | null
          role_mismatch: string[] | null
          score: number
          skill_inflation: string[] | null
          strength_areas: string[] | null
          suggestions: string[] | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          ats_score?: number
          created_at?: string
          id?: string
          resume_id?: string | null
          role_mismatch?: string[] | null
          score?: number
          skill_inflation?: string[] | null
          strength_areas?: string[] | null
          suggestions?: string[] | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          ats_score?: number
          created_at?: string
          id?: string
          resume_id?: string | null
          role_mismatch?: string[] | null
          score?: number
          skill_inflation?: string[] | null
          strength_areas?: string[] | null
          suggestions?: string[] | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_analyses_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          achievements: string[] | null
          certifications: Json | null
          created_at: string
          education: Json | null
          email: string | null
          experience: Json | null
          id: string
          links: Json | null
          location: string | null
          name: string | null
          phone: string | null
          portfolio_link: string | null
          projects: Json | null
          share_token: string | null
          skills: string[] | null
          summary: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          achievements?: string[] | null
          certifications?: Json | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          id?: string
          links?: Json | null
          location?: string | null
          name?: string | null
          phone?: string | null
          portfolio_link?: string | null
          projects?: Json | null
          share_token?: string | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          achievements?: string[] | null
          certifications?: Json | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          id?: string
          links?: Json | null
          location?: string | null
          name?: string | null
          phone?: string | null
          portfolio_link?: string | null
          projects?: Json | null
          share_token?: string | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      skill_gaps: {
        Row: {
          created_at: string
          experience_level: string
          id: string
          missing_skills: Json | null
          readiness_score: number
          target_role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_level: string
          id?: string
          missing_skills?: Json | null
          readiness_score?: number
          target_role: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_level?: string
          id?: string
          missing_skills?: Json | null
          readiness_score?: number
          target_role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "game_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_game_stats: {
        Row: {
          created_at: string
          css_level: number
          current_streak: number
          games_completed: number
          html_level: number
          id: string
          javascript_level: number
          last_played_at: string | null
          longest_streak: number
          python_level: number
          rust_level: number
          total_xp: number
          typescript_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          css_level?: number
          current_streak?: number
          games_completed?: number
          html_level?: number
          id?: string
          javascript_level?: number
          last_played_at?: string | null
          longest_streak?: number
          python_level?: number
          rust_level?: number
          total_xp?: number
          typescript_level?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          css_level?: number
          current_streak?: number
          games_completed?: number
          html_level?: number
          id?: string
          javascript_level?: number
          last_played_at?: string | null
          longest_streak?: number
          python_level?: number
          rust_level?: number
          total_xp?: number
          typescript_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      difficulty_level:
        | "beginner"
        | "intermediate"
        | "advanced"
        | "expert"
        | "master"
      game_language:
        | "html"
        | "css"
        | "javascript"
        | "typescript"
        | "python"
        | "rust"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      difficulty_level: [
        "beginner",
        "intermediate",
        "advanced",
        "expert",
        "master",
      ],
      game_language: [
        "html",
        "css",
        "javascript",
        "typescript",
        "python",
        "rust",
      ],
    },
  },
} as const
