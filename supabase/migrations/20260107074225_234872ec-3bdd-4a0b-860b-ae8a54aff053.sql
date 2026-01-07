-- First create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create patient_accounts table to link auth.users with patients
CREATE TABLE public.patient_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id),
  UNIQUE(patient_id)
);

ALTER TABLE public.patient_accounts ENABLE ROW LEVEL SECURITY;

-- Patients can view their own account
CREATE POLICY "Patients can view own account"
ON public.patient_accounts FOR SELECT
USING (auth.uid() = user_id);

-- Staff can view all patient accounts
CREATE POLICY "Staff can view patient accounts"
ON public.patient_accounts FOR SELECT
USING (is_staff(auth.uid()));

-- Staff can insert patient accounts
CREATE POLICY "Staff can insert patient accounts"
ON public.patient_accounts FOR INSERT
WITH CHECK (is_staff(auth.uid()));

-- Allow users to insert their own patient account (for self-linking)
CREATE POLICY "Users can link own account"
ON public.patient_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create treatment_plans table
CREATE TABLE public.treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  plan_details TEXT NOT NULL,
  duration TEXT,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;

-- Staff can manage treatment plans
CREATE POLICY "Staff can manage treatment_plans"
ON public.treatment_plans FOR ALL
USING (is_staff(auth.uid()));

-- Patients can view their own treatment plans
CREATE POLICY "Patients can view own treatment_plans"
ON public.treatment_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_accounts pa
    JOIN public.visits v ON v.patient_id = pa.patient_id
    WHERE pa.user_id = auth.uid() AND treatment_plans.visit_id = v.id
  )
);

-- Create trigger for updated_at on treatment_plans
CREATE TRIGGER update_treatment_plans_updated_at
BEFORE UPDATE ON public.treatment_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if user is a patient
CREATE OR REPLACE FUNCTION public.is_patient(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patient_accounts WHERE user_id = _user_id
  )
$$;

-- Add RLS policy for patients to view their own visits
CREATE POLICY "Patients can view own visits"
ON public.visits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_accounts pa
    WHERE pa.user_id = auth.uid() AND pa.patient_id = visits.patient_id
  )
);

-- Add RLS policy for patients to view their own prescriptions
CREATE POLICY "Patients can view own prescriptions"
ON public.prescriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_accounts pa
    JOIN public.visits v ON v.patient_id = pa.patient_id
    WHERE pa.user_id = auth.uid() AND prescriptions.visit_id = v.id
  )
);

-- Add RLS policy for patients to view their own diagnoses
CREATE POLICY "Patients can view own diagnoses"
ON public.diagnoses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_accounts pa
    JOIN public.visits v ON v.patient_id = pa.patient_id
    WHERE pa.user_id = auth.uid() AND diagnoses.visit_id = v.id
  )
);

-- Add RLS policy for patients to view their own procedure orders
CREATE POLICY "Patients can view own procedure_orders"
ON public.procedure_orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_accounts pa
    JOIN public.visits v ON v.patient_id = pa.patient_id
    WHERE pa.user_id = auth.uid() AND procedure_orders.visit_id = v.id
  )
);

-- Add RLS policy for patients to view medicines (for medication history)
CREATE POLICY "Patients can view medicines"
ON public.medicines FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_accounts WHERE user_id = auth.uid()
  )
);

-- Add RLS policy for patients to view their own patient record
CREATE POLICY "Patients can view own patient record"
ON public.patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_accounts pa
    WHERE pa.user_id = auth.uid() AND pa.patient_id = patients.id
  )
);