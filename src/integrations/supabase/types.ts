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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      allowed_admins: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      clicks: {
        Row: {
          created_at: string
          ep_no: number | null
          episode_id: string | null
          host: string | null
          id: string
          ip_hash: string | null
          is_bot: boolean
          path: string | null
          referer_domain: string | null
          referrer: string | null
          service_id: string
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          variant: string
        }
        Insert: {
          created_at?: string
          ep_no?: number | null
          episode_id?: string | null
          host?: string | null
          id?: string
          ip_hash?: string | null
          is_bot?: boolean
          path?: string | null
          referer_domain?: string | null
          referrer?: string | null
          service_id: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          variant: string
        }
        Update: {
          created_at?: string
          ep_no?: number | null
          episode_id?: string | null
          host?: string | null
          id?: string
          ip_hash?: string | null
          is_bot?: boolean
          path?: string | null
          referer_domain?: string | null
          referrer?: string | null
          service_id?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "clicks_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clicks_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          created_at: string
          custom_url: string | null
          default_platform: Database["public"]["Enums"]["app_platform"]
          ep_no: number
          fallback_behavior: Database["public"]["Enums"]["fallback_behavior"]
          id: string
          instagram_url: string | null
          note_url: string | null
          published_at: string | null
          service_id: string
          spotify_url: string | null
          status: Database["public"]["Enums"]["episode_status"]
          title: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          created_at?: string
          custom_url?: string | null
          default_platform: Database["public"]["Enums"]["app_platform"]
          ep_no: number
          fallback_behavior?: Database["public"]["Enums"]["fallback_behavior"]
          id?: string
          instagram_url?: string | null
          note_url?: string | null
          published_at?: string | null
          service_id: string
          spotify_url?: string | null
          status?: Database["public"]["Enums"]["episode_status"]
          title?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          created_at?: string
          custom_url?: string | null
          default_platform?: Database["public"]["Enums"]["app_platform"]
          ep_no?: number
          fallback_behavior?: Database["public"]["Enums"]["fallback_behavior"]
          id?: string
          instagram_url?: string | null
          note_url?: string | null
          published_at?: string | null
          service_id?: string
          spotify_url?: string | null
          status?: Database["public"]["Enums"]["episode_status"]
          title?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          default_platform: Database["public"]["Enums"]["app_platform"]
          id: string
          instagram_profile_url: string | null
          name: string
          note_home_url: string | null
          slug: string
          spotify_show_url: string | null
          updated_at: string
          youtube_channel_url: string | null
        }
        Insert: {
          created_at?: string
          default_platform: Database["public"]["Enums"]["app_platform"]
          id?: string
          instagram_profile_url?: string | null
          name: string
          note_home_url?: string | null
          slug: string
          spotify_show_url?: string | null
          updated_at?: string
          youtube_channel_url?: string | null
        }
        Update: {
          created_at?: string
          default_platform?: Database["public"]["Enums"]["app_platform"]
          id?: string
          instagram_profile_url?: string | null
          name?: string
          note_home_url?: string | null
          slug?: string
          spotify_show_url?: string | null
          updated_at?: string
          youtube_channel_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_platform: "NOTE" | "YOUTUBE" | "SPOTIFY" | "INSTAGRAM" | "CUSTOM"
      episode_status: "DRAFT" | "LIVE" | "ARCHIVED"
      fallback_behavior: "COMING_SOON" | "FALLBACK_TO_CHANNEL"
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
      app_platform: ["NOTE", "YOUTUBE", "SPOTIFY", "INSTAGRAM", "CUSTOM"],
      episode_status: ["DRAFT", "LIVE", "ARCHIVED"],
      fallback_behavior: ["COMING_SOON", "FALLBACK_TO_CHANNEL"],
    },
  },
} as const
