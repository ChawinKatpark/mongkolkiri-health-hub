-- Fix search_path for generate_hn function
CREATE OR REPLACE FUNCTION public.generate_hn()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_suffix TEXT;
  seq_num INT;
  new_hn TEXT;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(hn FROM 4) AS INT)), 0) + 1
  INTO seq_num
  FROM public.patients
  WHERE hn LIKE 'HN' || year_suffix || '%';
  new_hn := 'HN' || year_suffix || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_hn;
END;
$$;