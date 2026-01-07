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
      diagnoses: {
        Row: {
          created_at: string
          description: string | null
          diagnosis_type: string | null
          icd10_code: string
          id: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          diagnosis_type?: string | null
          icd10_code: string
          id?: string
          visit_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          diagnosis_type?: string | null
          icd10_code?: string
          id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          created_at: string
          id: string
          name_english: string | null
          name_thai: string
          properties: string | null
          stock_qty: number
          unit: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name_english?: string | null
          name_thai: string
          properties?: string | null
          stock_qty?: number
          unit?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name_english?: string | null
          name_thai?: string
          properties?: string | null
          stock_qty?: number
          unit?: string | null
        }
        Relationships: []
      }
      patient_accounts: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_accounts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: Json | null
          created_at: string
          dob: string
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          hn: string
          id: string
          last_name: string
          national_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: Json | null
          created_at?: string
          dob: string
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"]
          hn: string
          id?: string
          last_name: string
          national_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: Json | null
          created_at?: string
          dob?: string
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          hn?: string
          id?: string
          last_name?: string
          national_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          id: string
          medicine_id: string
          quantity: number
          usage_instruction: string | null
          visit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medicine_id: string
          quantity: number
          usage_instruction?: string | null
          visit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medicine_id?: string
          quantity?: number
          usage_instruction?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      procedure_orders: {
        Row: {
          body_part: string | null
          created_at: string
          id: string
          notes: string | null
          procedure_name: string
          status: string | null
          visit_id: string
        }
        Insert: {
          body_part?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          procedure_name: string
          status?: string | null
          visit_id: string
        }
        Update: {
          body_part?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          procedure_name?: string
          status?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedure_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      treatment_plans: {
        Row: {
          created_at: string
          duration: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          plan_details: string
          updated_at: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          duration?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          plan_details: string
          updated_at?: string
          visit_id: string
        }
        Update: {
          created_at?: string
          duration?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          plan_details?: string
          updated_at?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          chief_complaint: string | null
          created_at: string
          doctor_id: string | null
          id: string
          patient_id: string
          physical_exam_note: string | null
          queue_number: number | null
          status: Database["public"]["Enums"]["visit_status"]
          updated_at: string
          visit_date: string
          vital_signs: Json | null
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          patient_id: string
          physical_exam_note?: string | null
          queue_number?: number | null
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
          visit_date?: string
          vital_signs?: Json | null
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          patient_id?: string
          physical_exam_note?: string | null
          queue_number?: number | null
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
          visit_date?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_hn: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_patient: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "doctor" | "nurse" | "pharmacist" | "receptionist"
      gender_type: "male" | "female" | "other"
      visit_status:
        | "Registered"
        | "InQueue"
        | "VitalSigns"
        | "WaitingForDoctor"
        | "InConsultation"
        | "Diagnosing"
        | "Ordering"
        | "OrderConfirmed"
        | "PerformingProcedure"
        | "ProcedureCompleted"
        | "AwaitingPayment"
        | "PaymentProcessed"
        | "Dispensing"
        | "Completed"
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
      app_role: ["admin", "doctor", "nurse", "pharmacist", "receptionist"],
      gender_type: ["male", "female", "other"],
      visit_status: [
        "Registered",
        "InQueue",
        "VitalSigns",
        "WaitingForDoctor",
        "InConsultation",
        "Diagnosing",
        "Ordering",
        "OrderConfirmed",
        "PerformingProcedure",
        "ProcedureCompleted",
        "AwaitingPayment",
        "PaymentProcessed",
        "Dispensing",
        "Completed",
      ],
    },
  },
} as const
