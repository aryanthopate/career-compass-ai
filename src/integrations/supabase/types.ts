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
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
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
          created_at: string
          education: Json | null
          email: string | null
          experience: Json | null
          id: string
          location: string | null
          name: string | null
          phone: string | null
          projects: Json | null
          skills: string[] | null
          summary: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          achievements?: string[] | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          id?: string
          location?: string | null
          name?: string | null
          phone?: string | null
          projects?: Json | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          achievements?: string[] | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          id?: string
          location?: string | null
          name?: string | null
          phone?: string | null
          projects?: Json | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id?: string
          version?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
