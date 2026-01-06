-- Remove the unsafe anonymous insert policy on patients table
DROP POLICY IF EXISTS "Anyone can register as patient" ON public.patients;

-- Revoke EXECUTE permission on generate_hn() from anon role
REVOKE EXECUTE ON FUNCTION public.generate_hn() FROM anon;