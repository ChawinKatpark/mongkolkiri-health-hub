-- Create new function that verifies patient by national ID only
CREATE OR REPLACE FUNCTION public.verify_patient_by_national_id(p_national_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_patient_id uuid;
BEGIN
  -- Find patient by national ID
  SELECT id INTO v_patient_id
  FROM patients
  WHERE national_id = p_national_id;
  
  -- Check if patient exists
  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'ไม่พบข้อมูลผู้ป่วย กรุณาตรวจสอบเลขบัตรประชาชน';
  END IF;
  
  -- Check if patient is already linked to any account
  IF EXISTS (SELECT 1 FROM patient_accounts WHERE patient_id = v_patient_id) THEN
    RAISE EXCEPTION 'ข้อมูลผู้ป่วยนี้ถูกเชื่อมโยงกับบัญชีอื่นแล้ว';
  END IF;
  
  -- Return patient_id for linking
  RETURN v_patient_id;
END;
$$;