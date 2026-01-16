-- Create standalone patient_diagnoses table (not tied to visits)
CREATE TABLE public.patient_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  diagnosis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  icd10_code TEXT NOT NULL,
  description TEXT,
  diagnosis_type TEXT DEFAULT 'primary',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE public.patient_diagnoses ENABLE ROW LEVEL SECURITY;

-- Staff can manage patient diagnoses
CREATE POLICY "Staff can manage patient diagnoses"
ON public.patient_diagnoses
FOR ALL
TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

-- Patients can view their own diagnoses
CREATE POLICY "Patients can view own patient diagnoses"
ON public.patient_diagnoses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patient_accounts 
    WHERE user_id = auth.uid() 
    AND patient_id = patient_diagnoses.patient_id
  )
);

-- Index for faster queries
CREATE INDEX idx_patient_diagnoses_patient_id ON public.patient_diagnoses(patient_id);
CREATE INDEX idx_patient_diagnoses_date ON public.patient_diagnoses(diagnosis_date DESC);