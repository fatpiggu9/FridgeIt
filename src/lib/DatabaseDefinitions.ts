export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      favourites: {
        Row: {
          id: string
          recipe_id: number
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          recipe_id: number
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: string
          recipe_id?: number
          timestamp?: string
          user_id?: string
        }
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
