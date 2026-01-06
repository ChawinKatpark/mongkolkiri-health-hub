-- Allow anonymous/public patient registration
CREATE POLICY "Anyone can register as patient"
ON public.patients
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow public to call generate_hn function
GRANT EXECUTE ON FUNCTION public.generate_hn() TO anon;