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
      chart_of_accounts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      client_interactions: {
        Row: {
          client_id: string
          created_at: string
          id: string
          interaction_date: string
          notes: string | null
          subject: string | null
          type: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          interaction_date?: string
          notes?: string | null
          subject?: string | null
          type: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          interaction_date?: string
          notes?: string | null
          subject?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_services: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          monthly_value: number | null
          service_name: string
          start_date: string | null
          status: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          monthly_value?: number | null
          service_name: string
          start_date?: string | null
          status?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          monthly_value?: number | null
          service_name?: string
          start_date?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          cnpj_cpf: string | null
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj_cpf?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj_cpf?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proposal_items: {
        Row: {
          description: string
          id: string
          proposal_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          description: string
          id?: string
          proposal_id: string
          quantity?: number
          unit_price?: number
        }
        Update: {
          description?: string
          id?: string
          proposal_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          additional_notes: string | null
          client_id: string
          contract_text: string | null
          created_at: string
          id: string
          monthly_fee: number
          sent_at: string | null
          setup_fee: number
          status: string
          title: string
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          additional_notes?: string | null
          client_id: string
          contract_text?: string | null
          created_at?: string
          id?: string
          monthly_fee?: number
          sent_at?: string | null
          setup_fee?: number
          status?: string
          title?: string
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          additional_notes?: string | null
          client_id?: string
          contract_text?: string | null
          created_at?: string
          id?: string
          monthly_fee?: number
          sent_at?: string | null
          setup_fee?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          transaction_date: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_proposal_user_id: { Args: { p_proposal_id: string }; Returns: string }
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
