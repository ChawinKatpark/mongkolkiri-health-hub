-- Create RPC function for patient verification during signup
CREATE OR REPLACE FUNCTION public.verify_patient_for_signup(
  p_national_id TEXT,
  p_dob DATE,
  p_phone TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient RECORD;
BEGIN
  -- Find patient matching all 3 criteria
  SELECT id, first_name, last_name INTO v_patient
  FROM patients
  WHERE national_id = p_national_id
    AND dob = p_dob
    AND phone = p_phone;
  
  -- Check if patient exists
  IF v_patient.id IS NULL THEN
    RAISE EXCEPTION 'ไม่พบข้อมูลผู้ป่วย กรุณาตรวจสอบข้อมูลให้ถูกต้อง';
  END IF;
  
  -- Check if already linked to an account
  IF EXISTS (SELECT 1 FROM patient_accounts WHERE patient_id = v_patient.id) THEN
    RAISE EXCEPTION 'บัญชีนี้ถูกลงทะเบียนแล้ว';
  END IF;
  
  -- Return patient info for confirmation display
  RETURN json_build_object(
    'patient_id', v_patient.id,
    'first_name', v_patient.first_name,
    'last_name', v_patient.last_name
  );
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.verify_patient_for_signup(TEXT, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_patient_for_signup(TEXT, DATE, TEXT) TO anon;