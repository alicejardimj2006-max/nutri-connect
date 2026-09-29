export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: "XX" }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      anamneses: {
        Row: {
          created_at: string;
          data: NonNullable<Json>;
          id: string;
          patient_id: string;
          professional_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          data?: NonNullable<Json>;
          id?: string;
          patient_id: string;
          professional_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          data?: NonNullable<Json>;
          id?: string;
          patient_id?: string;
          professional_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "anamneses_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "anamneses_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "anamneses_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      anthropometrics: {
        Row: {
          activity_factor: number | null;
          appointment_id: string | null;
          bmr_formula: string | null;
          bmr_kcal: number | null;
          body_fat_pct: number | null;
          body_fat_protocol: string | null;
          circumferences: NonNullable<Json>;
          created_at: string;
          height_cm: number | null;
          id: string;
          measured_at: string;
          notes: string | null;
          patient_id: string;
          professional_id: string | null;
          skinfolds: NonNullable<Json>;
          tdee_kcal: number | null;
          weight_kg: number | null;
        };
        Insert: {
          activity_factor?: number | null;
          appointment_id?: string | null;
          bmr_formula?: string | null;
          bmr_kcal?: number | null;
          body_fat_pct?: number | null;
          body_fat_protocol?: string | null;
          circumferences?: NonNullable<Json>;
          created_at?: string;
          height_cm?: number | null;
          id?: string;
          measured_at?: string;
          notes?: string | null;
          patient_id: string;
          professional_id?: string | null;
          skinfolds?: NonNullable<Json>;
          tdee_kcal?: number | null;
          weight_kg?: number | null;
        };
        Update: {
          activity_factor?: number | null;
          appointment_id?: string | null;
          bmr_formula?: string | null;
          bmr_kcal?: number | null;
          body_fat_pct?: number | null;
          body_fat_protocol?: string | null;
          circumferences?: NonNullable<Json>;
          created_at?: string;
          height_cm?: number | null;
          id?: string;
          measured_at?: string;
          notes?: string | null;
          patient_id?: string;
          professional_id?: string | null;
          skinfolds?: NonNullable<Json>;
          tdee_kcal?: number | null;
          weight_kg?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "anthropometrics_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "anthropometrics_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "anthropometrics_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "anthropometrics_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      appointments: {
        Row: {
          cancel_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          created_by: string | null;
          ends_at: string;
          hold_expires_at: string | null;
          id: string;
          location: string | null;
          meeting_url: string | null;
          modality: Database["public"]["Enums"]["appointment_modality"];
          patient_id: string;
          patient_notes: string | null;
          price_cents: number;
          professional_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          summary_for_patient: string | null;
          updated_at: string;
        };
        Insert: {
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          created_by?: string | null;
          ends_at: string;
          hold_expires_at?: string | null;
          id?: string;
          location?: string | null;
          meeting_url?: string | null;
          modality: Database["public"]["Enums"]["appointment_modality"];
          patient_id: string;
          patient_notes?: string | null;
          price_cents?: number;
          professional_id: string;
          starts_at: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          summary_for_patient?: string | null;
          updated_at?: string;
        };
        Update: {
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          created_by?: string | null;
          ends_at?: string;
          hold_expires_at?: string | null;
          id?: string;
          location?: string | null;
          meeting_url?: string | null;
          modality?: Database["public"]["Enums"]["appointment_modality"];
          patient_id?: string;
          patient_notes?: string | null;
          price_cents?: number;
          professional_id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          summary_for_patient?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_cancelled_by_fkey";
            columns: ["cancelled_by"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_cancelled_by_fkey";
            columns: ["cancelled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      availability_blocks: {
        Row: {
          created_at: string;
          ends_at: string;
          id: string;
          professional_id: string;
          reason: string | null;
          starts_at: string;
        };
        Insert: {
          created_at?: string;
          ends_at: string;
          id?: string;
          professional_id: string;
          reason?: string | null;
          starts_at: string;
        };
        Update: {
          created_at?: string;
          ends_at?: string;
          id?: string;
          professional_id?: string;
          reason?: string | null;
          starts_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "availability_blocks_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      availability_rules: {
        Row: {
          created_at: string;
          end_time: string;
          id: string;
          modality: string;
          professional_id: string;
          start_time: string;
          weekday: number;
        };
        Insert: {
          created_at?: string;
          end_time: string;
          id?: string;
          modality?: string;
          professional_id: string;
          start_time: string;
          weekday: number;
        };
        Update: {
          created_at?: string;
          end_time?: string;
          id?: string;
          modality?: string;
          professional_id?: string;
          start_time?: string;
          weekday?: number;
        };
        Relationships: [
          {
            foreignKeyName: "availability_rules_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      care_invites: {
        Row: {
          code: string;
          created_at: string;
          expires_at: string;
          invitee_email: string | null;
          invitee_name: string | null;
          note: string | null;
          professional_id: string;
          revoked_at: string | null;
          used_at: string | null;
          used_by: string | null;
        };
        Insert: {
          code?: string;
          created_at?: string;
          expires_at?: string;
          invitee_email?: string | null;
          invitee_name?: string | null;
          note?: string | null;
          professional_id: string;
          revoked_at?: string | null;
          used_at?: string | null;
          used_by?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          expires_at?: string;
          invitee_email?: string | null;
          invitee_name?: string | null;
          note?: string | null;
          professional_id?: string;
          revoked_at?: string | null;
          used_at?: string | null;
          used_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "care_invites_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "care_invites_used_by_fkey";
            columns: ["used_by"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "care_invites_used_by_fkey";
            columns: ["used_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      care_links: {
        Row: {
          community_slug: string | null;
          created_at: string;
          ended_at: string | null;
          ended_by: string | null;
          id: string;
          message: string | null;
          origin: Database["public"]["Enums"]["link_origin"];
          patient_id: string;
          professional_id: string;
          responded_at: string | null;
          status: Database["public"]["Enums"]["link_status"];
        };
        Insert: {
          community_slug?: string | null;
          created_at?: string;
          ended_at?: string | null;
          ended_by?: string | null;
          id?: string;
          message?: string | null;
          origin?: Database["public"]["Enums"]["link_origin"];
          patient_id: string;
          professional_id: string;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["link_status"];
        };
        Update: {
          community_slug?: string | null;
          created_at?: string;
          ended_at?: string | null;
          ended_by?: string | null;
          id?: string;
          message?: string | null;
          origin?: Database["public"]["Enums"]["link_origin"];
          patient_id?: string;
          professional_id?: string;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["link_status"];
        };
        Relationships: [
          {
            foreignKeyName: "care_links_ended_by_fkey";
            columns: ["ended_by"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "care_links_ended_by_fkey";
            columns: ["ended_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "care_links_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "care_links_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "care_links_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      clinical_notes: {
        Row: {
          appointment_id: string | null;
          assessment: string | null;
          created_at: string;
          id: string;
          objective: string | null;
          patient_id: string;
          plan: string | null;
          professional_id: string;
          subjective: string | null;
          updated_at: string;
        };
        Insert: {
          appointment_id?: string | null;
          assessment?: string | null;
          created_at?: string;
          id?: string;
          objective?: string | null;
          patient_id: string;
          plan?: string | null;
          professional_id: string;
          subjective?: string | null;
          updated_at?: string;
        };
        Update: {
          appointment_id?: string | null;
          assessment?: string | null;
          created_at?: string;
          id?: string;
          objective?: string | null;
          patient_id?: string;
          plan?: string | null;
          professional_id?: string;
          subjective?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinical_notes_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_notes_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_notes_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_notes_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      diary_comments: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          entry_id: string;
          id: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          entry_id: string;
          id?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          entry_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diary_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diary_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diary_comments_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "diary_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      diary_entries: {
        Row: {
          created_at: string;
          description: string;
          eaten_at: string;
          followed_plan: boolean | null;
          hunger_before: number | null;
          id: string;
          meal_type: string;
          mood: string | null;
          patient_id: string;
          photo_path: string | null;
          satiety_after: number | null;
        };
        Insert: {
          created_at?: string;
          description?: string;
          eaten_at?: string;
          followed_plan?: boolean | null;
          hunger_before?: number | null;
          id?: string;
          meal_type: string;
          mood?: string | null;
          patient_id: string;
          photo_path?: string | null;
          satiety_after?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          eaten_at?: string;
          followed_plan?: boolean | null;
          hunger_before?: number | null;
          id?: string;
          meal_type?: string;
          mood?: string | null;
          patient_id?: string;
          photo_path?: string | null;
          satiety_after?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "diary_entries_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diary_entries_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      foods: {
        Row: {
          calcium_mg: number | null;
          carbs_g: number;
          category: string;
          created_at: string;
          fat_g: number;
          fiber_g: number | null;
          household_measures: NonNullable<Json>;
          id: number;
          iron_mg: number | null;
          kcal: number;
          name: string;
          owner_id: string | null;
          protein_g: number;
          sodium_mg: number | null;
          source: string;
          source_code: string | null;
        };
        Insert: {
          calcium_mg?: number | null;
          carbs_g?: number;
          category: string;
          created_at?: string;
          fat_g?: number;
          fiber_g?: number | null;
          household_measures?: NonNullable<Json>;
          id?: number;
          iron_mg?: number | null;
          kcal?: number;
          name: string;
          owner_id?: string | null;
          protein_g?: number;
          sodium_mg?: number | null;
          source?: string;
          source_code?: string | null;
        };
        Update: {
          calcium_mg?: number | null;
          carbs_g?: number;
          category?: string;
          created_at?: string;
          fat_g?: number;
          fiber_g?: number | null;
          household_measures?: NonNullable<Json>;
          id?: number;
          iron_mg?: number | null;
          kcal?: number;
          name?: string;
          owner_id?: string | null;
          protein_g?: number;
          sodium_mg?: number | null;
          source?: string;
          source_code?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "foods_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      goal_checkins: {
        Row: {
          day: string;
          goal_id: string;
          patient_id: string;
          updated_at: string;
          value: number;
        };
        Insert: {
          day: string;
          goal_id: string;
          patient_id: string;
          updated_at?: string;
          value?: number;
        };
        Update: {
          day?: string;
          goal_id?: string;
          patient_id?: string;
          updated_at?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "goal_checkins_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goal_checkins_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goal_checkins_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      goals: {
        Row: {
          active: boolean;
          created_at: string;
          description: string | null;
          icon: string;
          id: string;
          patient_id: string;
          professional_id: string | null;
          target_value: number;
          title: string;
          unit: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          icon?: string;
          id?: string;
          patient_id: string;
          professional_id?: string | null;
          target_value?: number;
          title: string;
          unit?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          icon?: string;
          id?: string;
          patient_id?: string;
          professional_id?: string | null;
          target_value?: number;
          title?: string;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goals_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goals_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      meal_plan_items: {
        Row: {
          carbs_g: number;
          fat_g: number;
          food_id: number | null;
          food_name: string;
          household_measure: string | null;
          id: string;
          kcal: number;
          meal_id: string;
          notes: string | null;
          position: number;
          protein_g: number;
          quantity_g: number;
          substitute_of: string | null;
        };
        Insert: {
          carbs_g?: number;
          fat_g?: number;
          food_id?: number | null;
          food_name: string;
          household_measure?: string | null;
          id?: string;
          kcal?: number;
          meal_id: string;
          notes?: string | null;
          position?: number;
          protein_g?: number;
          quantity_g: number;
          substitute_of?: string | null;
        };
        Update: {
          carbs_g?: number;
          fat_g?: number;
          food_id?: number | null;
          food_name?: string;
          household_measure?: string | null;
          id?: string;
          kcal?: number;
          meal_id?: string;
          notes?: string | null;
          position?: number;
          protein_g?: number;
          quantity_g?: number;
          substitute_of?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_food_id_fkey";
            columns: ["food_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_plan_items_meal_id_fkey";
            columns: ["meal_id"];
            isOneToOne: false;
            referencedRelation: "meal_plan_meals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_plan_items_substitute_of_fkey";
            columns: ["substitute_of"];
            isOneToOne: false;
            referencedRelation: "meal_plan_items";
            referencedColumns: ["id"];
          },
        ];
      };
      meal_plan_meals: {
        Row: {
          id: string;
          name: string;
          notes: string | null;
          plan_id: string;
          position: number;
          time_of_day: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          notes?: string | null;
          plan_id: string;
          position?: number;
          time_of_day?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          notes?: string | null;
          plan_id?: string;
          position?: number;
          time_of_day?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "meal_plan_meals_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "meal_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      meal_plans: {
        Row: {
          created_at: string;
          ends_on: string | null;
          guidelines: string | null;
          id: string;
          patient_id: string;
          professional_id: string;
          published_at: string | null;
          starts_on: string | null;
          status: Database["public"]["Enums"]["meal_plan_status"];
          target_carbs_g: number | null;
          target_fat_g: number | null;
          target_kcal: number | null;
          target_protein_g: number | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ends_on?: string | null;
          guidelines?: string | null;
          id?: string;
          patient_id: string;
          professional_id: string;
          published_at?: string | null;
          starts_on?: string | null;
          status?: Database["public"]["Enums"]["meal_plan_status"];
          target_carbs_g?: number | null;
          target_fat_g?: number | null;
          target_kcal?: number | null;
          target_protein_g?: number | null;
          title?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_on?: string | null;
          guidelines?: string | null;
          id?: string;
          patient_id?: string;
          professional_id?: string;
          published_at?: string | null;
          starts_on?: string | null;
          status?: Database["public"]["Enums"]["meal_plan_status"];
          target_carbs_g?: number | null;
          target_fat_g?: number | null;
          target_kcal?: number | null;
          target_protein_g?: number | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_plans_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_plans_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_plans_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      messages: {
        Row: {
          attachment_name: string | null;
          attachment_path: string | null;
          body: string;
          created_at: string;
          id: string;
          patient_id: string;
          professional_id: string;
          read_at: string | null;
          sender_id: string;
        };
        Insert: {
          attachment_name?: string | null;
          attachment_path?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          patient_id: string;
          professional_id: string;
          read_at?: string | null;
          sender_id: string;
        };
        Update: {
          attachment_name?: string | null;
          attachment_path?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          patient_id?: string;
          professional_id?: string;
          read_at?: string | null;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      patient_documents: {
        Row: {
          created_at: string;
          document_date: string | null;
          file_path: string;
          id: string;
          kind: Database["public"]["Enums"]["document_kind"];
          mime_type: string | null;
          notes: string | null;
          patient_id: string;
          size_bytes: number | null;
          title: string;
          uploaded_by: string;
        };
        Insert: {
          created_at?: string;
          document_date?: string | null;
          file_path: string;
          id?: string;
          kind?: Database["public"]["Enums"]["document_kind"];
          mime_type?: string | null;
          notes?: string | null;
          patient_id: string;
          size_bytes?: number | null;
          title: string;
          uploaded_by: string;
        };
        Update: {
          created_at?: string;
          document_date?: string | null;
          file_path?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["document_kind"];
          mime_type?: string | null;
          notes?: string | null;
          patient_id?: string;
          size_bytes?: number | null;
          title?: string;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patient_documents_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_documents_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount_cents: number;
          appointment_id: string;
          checkout_url: string | null;
          created_at: string;
          id: string;
          method: string | null;
          mp_payment_id: string | null;
          mp_preference_id: string | null;
          paid_at: string | null;
          patient_id: string;
          platform_fee_cents: number;
          professional_id: string;
          provider: string;
          raw: Json | null;
          refunded_at: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          appointment_id: string;
          checkout_url?: string | null;
          created_at?: string;
          id?: string;
          method?: string | null;
          mp_payment_id?: string | null;
          mp_preference_id?: string | null;
          paid_at?: string | null;
          patient_id: string;
          platform_fee_cents?: number;
          professional_id: string;
          provider?: string;
          raw?: Json | null;
          refunded_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          appointment_id?: string;
          checkout_url?: string | null;
          created_at?: string;
          id?: string;
          method?: string | null;
          mp_payment_id?: string | null;
          mp_preference_id?: string | null;
          paid_at?: string | null;
          patient_id?: string;
          platform_fee_cents?: number;
          professional_id?: string;
          provider?: string;
          raw?: Json | null;
          refunded_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      platform_admins: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      platform_settings: {
        Row: {
          key: string;
          updated_at: string;
          value: NonNullable<Json>;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value: NonNullable<Json>;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: NonNullable<Json>;
        };
        Relationships: [];
      };
      professional_mp_accounts: {
        Row: {
          access_token: string;
          expires_at: string | null;
          live_mode: boolean;
          mp_user_id: string;
          professional_id: string;
          public_key: string | null;
          refresh_token: string | null;
          updated_at: string;
        };
        Insert: {
          access_token: string;
          expires_at?: string | null;
          live_mode?: boolean;
          mp_user_id: string;
          professional_id: string;
          public_key?: string | null;
          refresh_token?: string | null;
          updated_at?: string;
        };
        Update: {
          access_token?: string;
          expires_at?: string | null;
          live_mode?: boolean;
          mp_user_id?: string;
          professional_id?: string;
          public_key?: string | null;
          refresh_token?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professional_mp_accounts_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: true;
            referencedRelation: "professionals";
            referencedColumns: ["user_id"];
          },
        ];
      };
      professionals: {
        Row: {
          accepting_patients: boolean;
          address: string | null;
          consultation_duration_min: number;
          consultation_price_cents: number;
          council: string;
          headline: string | null;
          mp_connected: boolean;
          offers_online: boolean;
          offers_presential: boolean;
          online_instructions: string | null;
          profession: string;
          registration: string;
          specialties: string[];
          timezone: string;
          uf: string;
          updated_at: string;
          user_id: string;
          verified_at: string;
        };
        Insert: {
          accepting_patients?: boolean;
          address?: string | null;
          consultation_duration_min?: number;
          consultation_price_cents?: number;
          council: string;
          headline?: string | null;
          mp_connected?: boolean;
          offers_online?: boolean;
          offers_presential?: boolean;
          online_instructions?: string | null;
          profession: string;
          registration: string;
          specialties?: string[];
          timezone?: string;
          uf: string;
          updated_at?: string;
          user_id: string;
          verified_at?: string;
        };
        Update: {
          accepting_patients?: boolean;
          address?: string | null;
          consultation_duration_min?: number;
          consultation_price_cents?: number;
          council?: string;
          headline?: string | null;
          mp_connected?: boolean;
          offers_online?: boolean;
          offers_presential?: boolean;
          online_instructions?: string | null;
          profession?: string;
          registration?: string;
          specialties?: string[];
          timezone?: string;
          uf?: string;
          updated_at?: string;
          user_id?: string;
          verified_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professionals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professionals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_private: {
        Row: {
          birth_date: string | null;
          cpf: string | null;
          email: string | null;
          id: string;
          phone: string | null;
          sex: string | null;
          updated_at: string;
        };
        Insert: {
          birth_date?: string | null;
          cpf?: string | null;
          email?: string | null;
          id: string;
          phone?: string | null;
          sex?: string | null;
          updated_at?: string;
        };
        Update: {
          birth_date?: string | null;
          cpf?: string | null;
          email?: string | null;
          id?: string;
          phone?: string | null;
          sex?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_private_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_private_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string;
          created_at: string;
          goal: string | null;
          id: string;
          journey_goal: string | null;
          name: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
          goal?: string | null;
          id: string;
          journey_goal?: string | null;
          name?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
          goal?: string | null;
          id?: string;
          journey_goal?: string | null;
          name?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      verification_requests: {
        Row: {
          bio: string | null;
          council: string;
          document_path: string;
          full_name: string;
          id: string;
          profession: string;
          public_lookup_url: string | null;
          registration: string;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          selfie_path: string;
          specialties: string[];
          status: Database["public"]["Enums"]["verification_status"];
          submitted_at: string;
          uf: string;
          user_id: string;
        };
        Insert: {
          bio?: string | null;
          council: string;
          document_path: string;
          full_name: string;
          id?: string;
          profession: string;
          public_lookup_url?: string | null;
          registration: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          selfie_path: string;
          specialties?: string[];
          status?: Database["public"]["Enums"]["verification_status"];
          submitted_at?: string;
          uf: string;
          user_id: string;
        };
        Update: {
          bio?: string | null;
          council?: string;
          document_path?: string;
          full_name?: string;
          id?: string;
          profession?: string;
          public_lookup_url?: string | null;
          registration?: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          selfie_path?: string;
          specialties?: string[];
          status?: Database["public"]["Enums"]["verification_status"];
          submitted_at?: string;
          uf?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "professional_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      professional_directory: {
        Row: {
          accepting_patients: boolean | null;
          avatar_url: string | null;
          bio: string | null;
          consultation_duration_min: number | null;
          consultation_price_cents: number | null;
          council: string | null;
          headline: string | null;
          id: string | null;
          mp_connected: boolean | null;
          name: string | null;
          offers_online: boolean | null;
          offers_presential: boolean | null;
          profession: string | null;
          registration: string | null;
          specialties: string[] | null;
          uf: string | null;
          verified_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      accept_care_invite: {
        Args: { p_code: string };
        Returns: {
          community_slug: string | null;
          created_at: string;
          ended_at: string | null;
          ended_by: string | null;
          id: string;
          message: string | null;
          origin: Database["public"]["Enums"]["link_origin"];
          patient_id: string;
          professional_id: string;
          responded_at: string | null;
          status: Database["public"]["Enums"]["link_status"];
        };
        SetofOptions: {
          from: "*";
          to: "care_links";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      book_appointment: {
        Args: {
          p_community_slug?: string;
          p_modality: Database["public"]["Enums"]["appointment_modality"];
          p_notes?: string;
          p_professional: string;
          p_starts_at: string;
        };
        Returns: {
          cancel_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          created_by: string | null;
          ends_at: string;
          hold_expires_at: string | null;
          id: string;
          location: string | null;
          meeting_url: string | null;
          modality: Database["public"]["Enums"]["appointment_modality"];
          patient_id: string;
          patient_notes: string | null;
          price_cents: number;
          professional_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          summary_for_patient: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "appointments";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      can_edit_meal_plan: { Args: { p_plan: string }; Returns: boolean };
      can_read_meal_plan: { Args: { p_plan: string }; Returns: boolean };
      cancel_appointment: {
        Args: { p_appointment: string; p_reason?: string };
        Returns: {
          cancel_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          created_by: string | null;
          ends_at: string;
          hold_expires_at: string | null;
          id: string;
          location: string | null;
          meeting_url: string | null;
          modality: Database["public"]["Enums"]["appointment_modality"];
          patient_id: string;
          patient_notes: string | null;
          price_cents: number;
          professional_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          summary_for_patient: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "appointments";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      diary_entry_patient: { Args: { p_entry: string }; Returns: string };
      duplicate_meal_plan: {
        Args: { p_plan: string };
        Returns: {
          created_at: string;
          ends_on: string | null;
          guidelines: string | null;
          id: string;
          patient_id: string;
          professional_id: string;
          published_at: string | null;
          starts_on: string | null;
          status: Database["public"]["Enums"]["meal_plan_status"];
          target_carbs_g: number | null;
          target_fat_g: number | null;
          target_kcal: number | null;
          target_protein_g: number | null;
          title: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "meal_plans";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      end_care_link: {
        Args: { p_link: string };
        Returns: {
          community_slug: string | null;
          created_at: string;
          ended_at: string | null;
          ended_by: string | null;
          id: string;
          message: string | null;
          origin: Database["public"]["Enums"]["link_origin"];
          patient_id: string;
          professional_id: string;
          responded_at: string | null;
          status: Database["public"]["Enums"]["link_status"];
        };
        SetofOptions: {
          from: "*";
          to: "care_links";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      ever_linked: { Args: { p_patient: string; p_professional?: string }; Returns: boolean };
      expire_payment_holds: { Args: { p_professional?: string }; Returns: number };
      get_available_slots: {
        Args: { p_from: string; p_professional: string; p_to: string };
        Returns: {
          ends_at: string;
          modality: string;
          starts_at: string;
        }[];
      };
      get_care_invite: {
        Args: { p_code: string };
        Returns: {
          code: string;
          invitee_name: string;
          professional_id: string;
          professional_name: string;
          valid: boolean;
        }[];
      };
      has_active_link: { Args: { p_patient: string; p_professional?: string }; Returns: boolean };
      is_platform_admin: { Args: { uid?: string }; Returns: boolean };
      is_verified_professional: { Args: { uid?: string }; Returns: boolean };
      meal_plan_of_meal: { Args: { p_meal: string }; Returns: string };
      publish_meal_plan: {
        Args: { p_plan: string };
        Returns: {
          created_at: string;
          ends_on: string | null;
          guidelines: string | null;
          id: string;
          patient_id: string;
          professional_id: string;
          published_at: string | null;
          starts_on: string | null;
          status: Database["public"]["Enums"]["meal_plan_status"];
          target_carbs_g: number | null;
          target_fat_g: number | null;
          target_kcal: number | null;
          target_protein_g: number | null;
          title: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "meal_plans";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      register_manual_payment: {
        Args: { p_amount_cents?: number; p_appointment: string; p_method: string };
        Returns: {
          amount_cents: number;
          appointment_id: string;
          checkout_url: string | null;
          created_at: string;
          id: string;
          method: string | null;
          mp_payment_id: string | null;
          mp_preference_id: string | null;
          paid_at: string | null;
          patient_id: string;
          platform_fee_cents: number;
          professional_id: string;
          provider: string;
          raw: Json | null;
          refunded_at: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "payments";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      reschedule_appointment: {
        Args: { p_appointment: string; p_starts_at: string };
        Returns: {
          cancel_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          created_by: string | null;
          ends_at: string;
          hold_expires_at: string | null;
          id: string;
          location: string | null;
          meeting_url: string | null;
          modality: Database["public"]["Enums"]["appointment_modality"];
          patient_id: string;
          patient_notes: string | null;
          price_cents: number;
          professional_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          summary_for_patient: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "appointments";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      respond_care_link: {
        Args: { p_accept: boolean; p_link: string };
        Returns: {
          community_slug: string | null;
          created_at: string;
          ended_at: string | null;
          ended_by: string | null;
          id: string;
          message: string | null;
          origin: Database["public"]["Enums"]["link_origin"];
          patient_id: string;
          professional_id: string;
          responded_at: string | null;
          status: Database["public"]["Enums"]["link_status"];
        };
        SetofOptions: {
          from: "*";
          to: "care_links";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      review_verification: {
        Args: { p_approve: boolean; p_reason?: string; p_request: string };
        Returns: {
          bio: string | null;
          council: string;
          document_path: string;
          full_name: string;
          id: string;
          profession: string;
          public_lookup_url: string | null;
          registration: string;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          selfie_path: string;
          specialties: string[];
          status: Database["public"]["Enums"]["verification_status"];
          submitted_at: string;
          uf: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "verification_requests";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      setting_int: { Args: { p_default: number; p_key: string }; Returns: number };
      storage_owner: { Args: { p_name: string }; Returns: string };
    };
    Enums: {
      app_role: "paciente" | "profissional";
      appointment_modality: "presencial" | "online";
      appointment_status:
        "aguardando_pagamento" | "agendada" | "confirmada" | "realizada" | "cancelada" | "faltou";
      document_kind: "exame" | "documento" | "plano" | "outro";
      link_origin: "solicitacao" | "convite" | "comunidade" | "agendamento";
      link_status: "pendente" | "ativo" | "recusado" | "encerrado";
      meal_plan_status: "rascunho" | "ativo" | "arquivado";
      payment_status:
        "pendente" | "em_processamento" | "aprovado" | "recusado" | "reembolsado" | "cancelado";
      verification_status: "em_analise" | "aprovado" | "recusado";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["paciente", "profissional"],
      appointment_modality: ["presencial", "online"],
      appointment_status: [
        "aguardando_pagamento",
        "agendada",
        "confirmada",
        "realizada",
        "cancelada",
        "faltou",
      ],
      document_kind: ["exame", "documento", "plano", "outro"],
      link_origin: ["solicitacao", "convite", "comunidade", "agendamento"],
      link_status: ["pendente", "ativo", "recusado", "encerrado"],
      meal_plan_status: ["rascunho", "ativo", "arquivado"],
      payment_status: [
        "pendente",
        "em_processamento",
        "aprovado",
        "recusado",
        "reembolsado",
        "cancelado",
      ],
      verification_status: ["em_analise", "aprovado", "recusado"],
    },
  },
} as const;
