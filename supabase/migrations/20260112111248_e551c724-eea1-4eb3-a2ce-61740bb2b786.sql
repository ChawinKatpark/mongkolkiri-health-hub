-- Remove the conflicting RESTRICTIVE policy that causes the RLS violation
-- Only staff should be able to register new patients
DROP POLICY IF EXISTS "Authenticated users can insert patient record" ON public.patients;