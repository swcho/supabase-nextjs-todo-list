export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: number
          name: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          owner_id?: string
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: number
          team_id: number
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: number
          team_id: number
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: number
          team_id?: number
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      todos: {
        Row: {
          id: number
          user_id: string
          task: string
          is_complete: boolean
          inserted_at: string
          team_id?: number
        }
        Insert: {
          id?: number
          user_id: string
          task: string
          is_complete?: boolean
          inserted_at?: string
          team_id?: number
        }
        Update: {
          id?: number
          user_id?: string
          task?: string
          is_complete?: boolean
          inserted_at?: string
          team_id?: number
        }
      }
    }
  }
}