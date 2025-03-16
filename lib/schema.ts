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
      [_ in never]: never
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

