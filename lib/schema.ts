export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          created_by: string | null
          declined_at: string | null
          email: string
          expires_at: string
          id: string
          team_id: number | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          created_by?: string | null
          declined_at?: string | null
          email: string
          expires_at: string
          id?: string
          team_id?: number | null
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          created_by?: string | null
          declined_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          team_id?: number | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          role: string | null
          team_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string | null
          team_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string | null
          team_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: number
          name: string
          owner_id: string
          url_key: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          owner_id: string
          url_key: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          owner_id?: string
          url_key?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          id: number
          inserted_at: string
          is_complete: boolean
          task: string
          team_id: number | null
          user_id: string
        }
        Insert: {
          id?: number
          inserted_at?: string
          is_complete?: boolean
          task: string
          team_id?: number | null
          user_id: string
        }
        Update: {
          id?: number
          inserted_at?: string
          is_complete?: boolean
          task?: string
          team_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          declined_at: string | null
          email: string | null
          expires_at: string | null
          id: string | null
          team_id: number | null
          team_name: string | null
          token: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_team_invitation: {
        Args: {
          invitation_token: string
        }
        Returns: boolean
      }
      create_team: {
        Args: {
          team_name: string
          team_url_key: string
        }
        Returns: Json
      }
      create_team_invitation: {
        Args: {
          team_id: number
          invitee_email: string
          expires_in?: unknown
        }
        Returns: string
      }
      create_team_todo: {
        Args: {
          team_id: number
          task: string
        }
        Returns: Database["public"]["CompositeTypes"]["todo_type"]
      }
      decline_team_invitation: {
        Args: {
          invitation_token: string
        }
        Returns: boolean
      }
      delete_team: {
        Args: {
          team_id: number
        }
        Returns: boolean
      }
      delete_team_invitation: {
        Args: {
          invitation_id: string
        }
        Returns: boolean
      }
      delete_todo: {
        Args: {
          todo_id: number
        }
        Returns: undefined
      }
      delete_user_invitations: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      get_team_by_url_key: {
        Args: {
          team_url_key: string
        }
        Returns: Json
      }
      get_team_invitations: {
        Args: {
          team_id: number
        }
        Returns: Json[]
      }
      get_team_invitations_v2: {
        Args: {
          team_id: number
        }
        Returns: {
          accepted_at: string | null
          created_at: string | null
          created_by: string | null
          declined_at: string | null
          email: string
          expires_at: string
          id: string
          team_id: number | null
          token: string
        }[]
      }
      get_team_todos: {
        Args: {
          team_id: number
        }
        Returns: Database["public"]["CompositeTypes"]["todo_type"][]
      }
      get_user_invitations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          team_id: number
          team_name: string
          email: string
          created_at: string
          expires_at: string
          token: string
          accepted_at: string
          status: string
        }[]
      }
      get_user_invitations_v2: {
        Args: Record<PropertyKey, never>
        Returns: {
          accepted_at: string | null
          created_at: string | null
          declined_at: string | null
          email: string | null
          expires_at: string | null
          id: string | null
          team_id: number | null
          team_name: string | null
          token: string | null
        }[]
      }
      get_user_teams: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          name: string
          created_at: string
          owner_id: string
          url_key: string
          is_owner: boolean
        }[]
      }
      get_user_teams_v2: {
        Args: Record<PropertyKey, never>
        Returns: Json[]
      }
      set_todo_completed: {
        Args: {
          todo_id: number
          is_completed: boolean
        }
        Returns: Database["public"]["CompositeTypes"]["todo_type"]
      }
      update_team: {
        Args: {
          team_id: number
          new_name: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      member_type: {
        id: string | null
        aud: string | null
        email: string | null
        joined_at: string | null
      }
      team_type: {
        id: number | null
        name: string | null
        created_at: string | null
        members: Database["public"]["CompositeTypes"]["member_type"][] | null
      }
      todo_type: {
        id: number | null
        team_id: number | null
        user_id: string | null
        todo: string | null
        is_completed: boolean | null
        created_at: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

