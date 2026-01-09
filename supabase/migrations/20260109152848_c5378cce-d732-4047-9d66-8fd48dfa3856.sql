-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Patients can insert own patient record" ON public.patients;

-- Create a more restrictive INSERT policy that only allows authenticated users
CREATE POLICY "Authenticated users can insert patient record"
ON public.patients
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);