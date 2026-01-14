import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Heart, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

interface VerificationFormData {
  nationalId: string;
  dob: string;
  phone: string;
}

interface AccountFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface VerifiedPatient {
  patient_id: string;
  first_name: string;
  last_name: string;
}

const PatientSignup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = verification, 2 = account creation
  const [verifiedPatient, setVerifiedPatient] = useState<VerifiedPatient | null>(null);

  const [verificationData, setVerificationData] = useState<VerificationFormData>({
    nationalId: '',
    dob: '',
    phone: ''
  });

  const [accountData, setAccountData] = useState<AccountFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateVerification = () => {
    if (!verificationData.nationalId.trim() || verificationData.nationalId.length !== 13) {
      toast.error('กรุณากรอกเลขบัตรประชาชน 13 หลัก');
      return false;
    }
    if (!verificationData.dob) {
      toast.error('กรุณาเลือกวันเกิด');
      return false;
    }
    if (!verificationData.phone.trim()) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return false;
    }
    return true;
  };

  const validateAccount = () => {
    if (!accountData.email.trim()) {
      toast.error('กรุณากรอกอีเมล');
      return false;
    }
    if (accountData.password.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }
    if (accountData.password !== accountData.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return false;
    }
    return true;
  };

  const handleVerify = async () => {
    if (!validateVerification()) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('verify_patient_for_signup', {
        p_national_id: verificationData.nationalId,
        p_dob: verificationData.dob,
        p_phone: verificationData.phone
      });

      if (error) {
        // Extract user-friendly message from Postgres exception
        const message = error.message || 'เกิดข้อผิดพลาดในการตรวจสอบ';
        toast.error('ไม่สามารถยืนยันตัวตนได้', { description: message });
        return;
      }

      if (data) {
        const result = data as unknown as VerifiedPatient;
        setVerifiedPatient(result);
        setStep(2);
        toast.success('พบข้อมูลในระบบ');
      }
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAccount() || !verifiedPatient) return;
    
    setLoading(true);
    
    try {
      // 1. Create user account
      const { error: signUpError } = await signUp(
        accountData.email, 
        accountData.password, 
        `${verifiedPatient.first_name} ${verifiedPatient.last_name}`
      );
      
      if (signUpError) {
        toast.error('ลงทะเบียนไม่สำเร็จ', { description: signUpError.message });
        setLoading(false);
        return;
      }

      // Wait for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ');
        navigate('/auth');
        setLoading(false);
        return;
      }

      // 3. Link patient account to verified patient
      const { error: linkError } = await supabase
        .from('patient_accounts')
        .insert({
          user_id: session.user.id,
          patient_id: verifiedPatient.patient_id
        });

      if (linkError) {
        console.error('Link error:', linkError);
        toast.error('ไม่สามารถเชื่อมโยงบัญชีได้');
        setLoading(false);
        return;
      }

      toast.success('ลงทะเบียนสำเร็จ!');
      navigate('/patient');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-background to-pink-100 p-4">
      <div className="w-full max-w-lg">
        <Button
          variant="ghost"
          onClick={() => step === 1 ? navigate('/auth') : setStep(1)}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 1 ? 'กลับ' : 'ย้อนกลับ'}
        </Button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            ลงทะเบียนบัญชีผู้ป่วย
          </h1>
          <p className="text-muted-foreground">
            ขั้นตอนที่ {step} จาก 2
          </p>
          {/* Progress bar */}
          <div className="flex gap-2 mt-4 justify-center">
            <div className={`h-2 w-20 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-20 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? 'ยืนยันตัวตน' : 'สร้างบัญชี'}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? 'กรอกข้อมูลเพื่อตรวจสอบในระบบ (ต้องลงทะเบียนที่คลินิกก่อน)' 
                : 'สร้างบัญชีสำหรับเข้าสู่ระบบ'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nationalId">เลขบัตรประชาชน 13 หลัก *</Label>
                  <Input
                    id="nationalId"
                    placeholder="X-XXXX-XXXXX-XX-X"
                    value={verificationData.nationalId}
                    onChange={(e) => setVerificationData({ 
                      ...verificationData, 
                      nationalId: e.target.value.replace(/\D/g, '').slice(0, 13) 
                    })}
                    maxLength={13}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">วันเกิด *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={verificationData.dob}
                    onChange={(e) => setVerificationData({ ...verificationData, dob: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    value={verificationData.phone}
                    onChange={(e) => setVerificationData({ ...verificationData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    หากยังไม่เคยลงทะเบียนที่คลินิก กรุณาติดต่อเจ้าหน้าที่เพื่อลงทะเบียนก่อน
                  </p>
                </div>

                <Button onClick={handleVerify} className="w-full" disabled={loading}>
                  {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบข้อมูล'}
                  {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Verified patient info */}
                {verifiedPatient && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-medium text-green-800">พบข้อมูลในระบบ</p>
                    </div>
                    <p className="text-sm text-green-700">
                      ชื่อ: {verifiedPatient.first_name} {verifiedPatient.last_name}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={accountData.password}
                    onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="ยืนยันรหัสผ่าน"
                    value={accountData.confirmPassword}
                    onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          มีบัญชีอยู่แล้ว?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
            เข้าสู่ระบบ
          </Button>
        </p>
      </div>
    </div>
  );
};

export default PatientSignup;
