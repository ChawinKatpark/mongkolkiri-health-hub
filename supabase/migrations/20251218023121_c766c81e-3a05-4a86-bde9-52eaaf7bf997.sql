-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'nurse', 'pharmacist', 'receptionist');

-- Create enum for visit status (based on state diagram)
CREATE TYPE public.visit_status AS ENUM (
  'Registered',
  'InQueue', 
  'VitalSigns',
  'WaitingForDoctor',
  'InConsultation',
  'Diagnosing',
  'Ordering',
  'OrderConfirmed',
  'PerformingProcedure',
  'ProcedureCompleted',
  'AwaitingPayment',
  'PaymentProcessed',
  'Dispensing',
  'Completed'
);

-- Create enum for gender
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hn TEXT UNIQUE NOT NULL,
  national_id TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE NOT NULL,
  gender gender_type NOT NULL DEFAULT 'other',
  allergies JSONB DEFAULT '[]'::jsonb,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create visits table
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.profiles(id),
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  queue_number INT,
  vital_signs JSONB DEFAULT '{}'::jsonb,
  chief_complaint TEXT,
  physical_exam_note TEXT,
  status visit_status NOT NULL DEFAULT 'Registered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create medicines table
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_thai TEXT NOT NULL,
  name_english TEXT,
  properties TEXT,
  unit TEXT DEFAULT 'เม็ด',
  stock_qty INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create diagnoses table
CREATE TABLE public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  icd10_code TEXT NOT NULL,
  description TEXT,
  diagnosis_type TEXT DEFAULT 'primary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID REFERENCES public.medicines(id) NOT NULL,
  quantity INT NOT NULL,
  usage_instruction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create procedure_orders table
CREATE TABLE public.procedure_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  procedure_name TEXT NOT NULL,
  body_part TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_orders ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user is any staff role
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_staff(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for patients (staff only)
CREATE POLICY "Staff can view patients" ON public.patients
  FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert patients" ON public.patients
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update patients" ON public.patients
  FOR UPDATE USING (public.is_staff(auth.uid()));

-- RLS Policies for visits
CREATE POLICY "Staff can view visits" ON public.visits
  FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert visits" ON public.visits
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update visits" ON public.visits
  FOR UPDATE USING (public.is_staff(auth.uid()));

-- RLS Policies for medicines
CREATE POLICY "Staff can view medicines" ON public.medicines
  FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage medicines" ON public.medicines
  FOR ALL USING (public.is_staff(auth.uid()));

-- RLS Policies for diagnoses
CREATE POLICY "Staff can view diagnoses" ON public.diagnoses
  FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage diagnoses" ON public.diagnoses
  FOR ALL USING (public.is_staff(auth.uid()));

-- RLS Policies for prescriptions
CREATE POLICY "Staff can view prescriptions" ON public.prescriptions
  FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage prescriptions" ON public.prescriptions
  FOR ALL USING (public.is_staff(auth.uid()));

-- RLS Policies for procedure_orders
CREATE POLICY "Staff can view procedure_orders" ON public.procedure_orders
  FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage procedure_orders" ON public.procedure_orders
  FOR ALL USING (public.is_staff(auth.uid()));

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate HN
CREATE OR REPLACE FUNCTION public.generate_hn()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Enable realtime for visits table
ALTER PUBLICATION supabase_realtime ADD TABLE public.visits;