import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Heart, ArrowLeft, UserPlus, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PatientRegister = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isStaff, setIsStaff] = useState<boolean | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    dob: '',
    gender: 'other' as 'male' | 'female' | 'other',
    phone: '',
    address: '',
    allergies: ''
  });

  // Check if user is staff
  useEffect(() => {
    const checkStaffStatus = async () => {
      if (!user) {
        setIsStaff(false);
        return;
      }

      const { data, error } = await supabase.rpc('is_staff', { _user_id: user.id });
      if (error) {
        console.error('Error checking staff status:', error);
        setIsStaff(false);
      } else {
        setIsStaff(data);
      }
    };

    if (!authLoading) {
      checkStaffStatus();
    }
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !isStaff) {
      toast.error('ไม่มีสิทธิ์เข้าถึง', {
        description: 'กรุณาเข้าสู่ระบบในฐานะเจ้าหน้าที่'
      });
      return;
    }

    setLoading(true);

    try {
      // Generate HN
      const { data: hnData, error: hnError } = await supabase.rpc('generate_hn');
      
      if (hnError) throw hnError;

      // Parse allergies
      const allergiesArray = form.allergies
        ? form.allergies.split(',').map(a => a.trim()).filter(a => a)
        : [];

      // Insert patient
      const { error: insertError } = await supabase
        .from('patients')
        .insert({
          hn: hnData,
          first_name: form.firstName,
          last_name: form.lastName,
          national_id: form.nationalId || null,
          dob: form.dob,
          gender: form.gender,
          phone: form.phone || null,
          address: form.address || null,
          allergies: allergiesArray
        });

      if (insertError) throw insertError;

      toast.success('ลงทะเบียนสำเร็จ', {
        description: `หมายเลข HN ของคุณคือ: ${hnData}`
      });

      // Reset form
      setForm({
        firstName: '',
        lastName: '',
        nationalId: '',
        dob: '',
        gender: 'other',
        phone: '',
        address: '',
        allergies: ''
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('ลงทะเบียนไม่สำเร็จ', {
        description: error.message || 'กรุณาลองใหม่อีกครั้ง'
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading || isStaff === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-background to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or not staff - show login prompt
  if (!user || !isStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-background to-pink-100 p-4">
        <div className="max-w-md mx-auto mt-20">
          <Button
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>

          <Card>
            <CardHeader className="text-center">
              <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="font-display">ต้องเข้าสู่ระบบ</CardTitle>
              <CardDescription>
                การลงทะเบียนผู้ป่วยต้องดำเนินการโดยเจ้าหน้าที่เท่านั้น
                <br />
                กรุณาเข้าสู่ระบบในฐานะเจ้าหน้าที่เพื่อดำเนินการ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/auth')}
              >
                เข้าสู่ระบบสำหรับเจ้าหน้าที่
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-background to-pink-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              ลงทะเบียนผู้ป่วยใหม่
            </h1>
            <p className="text-muted-foreground">
              กรอกข้อมูลเพื่อลงทะเบียนเข้ารับการรักษา
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <UserPlus className="h-5 w-5" />
              ข้อมูลผู้ป่วย
            </CardTitle>
            <CardDescription>
              กรุณากรอกข้อมูลให้ครบถ้วน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ *</Label>
                  <Input
                    id="firstName"
                    placeholder="ชื่อ"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล *</Label>
                  <Input
                    id="lastName"
                    placeholder="นามสกุล"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* National ID */}
              <div className="space-y-2">
                <Label htmlFor="nationalId">เลขบัตรประชาชน</Label>
                <Input
                  id="nationalId"
                  placeholder="1234567890123"
                  maxLength={13}
                  value={form.nationalId}
                  onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                />
              </div>

              {/* DOB and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">วันเกิด *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">เพศ *</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(value: 'male' | 'female' | 'other') => setForm({ ...form, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกเพศ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ชาย</SelectItem>
                      <SelectItem value="female">หญิง</SelectItem>
                      <SelectItem value="other">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0812345678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">ที่อยู่</Label>
                <Textarea
                  id="address"
                  placeholder="ที่อยู่"
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <Label htmlFor="allergies">ประวัติแพ้ยา/อาหาร</Label>
                <Textarea
                  id="allergies"
                  placeholder="คั่นด้วยเครื่องหมาย , เช่น แอสไพริน, เพนิซิลลิน"
                  rows={2}
                  value={form.allergies}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  หากมีหลายรายการ กรุณาคั่นด้วยเครื่องหมายคอมม่า (,)
                </p>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientRegister;
