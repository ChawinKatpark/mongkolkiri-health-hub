-- Create a secure function to verify patient for account linking
-- This bypasses RLS safely by only returning patient_id after verification
CREATE OR REPLACE FUNCTION public.verify_patient_for_linking(
  p_hn text,
  p_national_id text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_id uuid;
  v_stored_national_id text;
BEGIN
  -- Find patient by HN (case insensitive)
  SELECT id, national_id INTO v_patient_id, v_stored_national_id
  FROM patients
  WHERE hn = UPPER(p_hn);
  
  -- Check if patient exists
  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'ไม่พบข้อมูลผู้ป่วย กรุณาตรวจสอบหมายเลข HN';
  END IF;
  
  -- Verify national ID matches
  IF v_stored_national_id IS NULL OR v_stored_national_id != p_national_id THEN
    RAISE EXCEPTION 'เลขบัตรประชาชนไม่ตรงกับข้อมูลในระบบ';
  END IF;
  
  -- Check if patient is already linked to any account
  IF EXISTS (SELECT 1 FROM patient_accounts WHERE patient_id = v_patient_id) THEN
    RAISE EXCEPTION 'ข้อมูลผู้ป่วยนี้ถูกเชื่อมโยงกับบัญชีอื่นแล้ว';
  END IF;
  
  -- Return patient_id for linking
  RETURN v_patient_id;
END;
$$;