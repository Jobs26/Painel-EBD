// Tipos do banco gerados pelo Supabase (generate_typescript_types).
// Regenerar depois de cada migration nova.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      usuarios: {
        Row: {
          created_at: string;
          data_nascimento: string;
          email: string;
          id: string;
          nome: string;
          telefone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          data_nascimento: string;
          email: string;
          id: string;
          nome: string;
          telefone: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          data_nascimento?: string;
          email?: string;
          id?: string;
          nome?: string;
          telefone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type UsuarioRow = Database['public']['Tables']['usuarios']['Row'];
