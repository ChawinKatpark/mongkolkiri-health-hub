import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Heart, Stethoscope, User } from "lucide-react";

type UserRole = 'doctor' | 'patient' | null;

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', fullName: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      toast.error('เข้าสู่ระบบไม่สำเร็จ', {
        description: error.message === 'Invalid login credentials' 
          ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' 
          : error.message
      });
    } else {
      toast.success('เข้าสู่ระบบสำเร็จ');
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (signupForm.password.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      setLoading(false);
      return;
    }
    
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.fullName);
    
    if (error) {
      toast.error('ลงทะเบียนไม่สำเร็จ', { description: error.message });
    } else {
      toast.success('ลงทะเบียนสำเร็จ', { description: 'กรุณาติดต่อผู้ดูแลระบบเพื่อเปิดใช้งานบัญชี' });
    }
    setLoading(false);
  };

  const handlePatientClick = () => {
    navigate('/patient-register');
  };

  // Role selection screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-background to-pink-100 p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              คลินิกแพทย์แผนไทย
            </h1>
            <p className="text-muted-foreground">
              กรุณาเลือกบทบาทของคุณ
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Doctor Card */}
            <Card 
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 group"
              onClick={() => setSelectedRole('doctor')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Stethoscope className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl font-display">แพทย์/เจ้าหน้าที่</CardTitle>
                <CardDescription>
                  เข้าสู่ระบบเพื่อจัดการคิวและข้อมูลผู้ป่วย
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  เข้าสู่ระบบ
                </Button>
              </CardContent>
            </Card>

            {/* Patient Card */}
            <Card 
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 group"
              onClick={() => setSelectedRole('patient')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl font-display">ผู้ป่วย</CardTitle>
                <CardDescription>
                  เข้าสู่ระบบเพื่อดูประวัติการรักษา
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  เข้าสู่ระบบผู้ป่วย
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Doctor login/signup form
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 right-16 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="h-10 w-10 text-primary-foreground" />
            <h1 className="text-2xl font-display font-bold text-primary-foreground">
              คลินิกแพทย์แผนไทย
            </h1>
          </div>
        </div>
        
        <div className="relative z-10">
          <blockquote className="text-xl text-primary-foreground/90 italic mb-4">
            "การรักษาที่ดีที่สุด คือการดูแลด้วยหัวใจ"
          </blockquote>
          <p className="text-primary-foreground/70">— ภูมิปัญญาแพทย์แผนไทย</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => setSelectedRole(null)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            ← กลับ
          </Button>

          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              คลินิกแพทย์แผนไทย
            </h1>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
              <TabsTrigger value="signup">ลงทะเบียนบัญชี</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-display">เข้าสู่ระบบ</CardTitle>
                  <CardDescription>
                    เข้าสู่ระบบด้วยบัญชีแพทย์/เจ้าหน้าที่
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">อีเมล</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">รหัสผ่าน</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-display">ลงทะเบียนบัญชี</CardTitle>
                  <CardDescription>
                    สร้างบัญชีใหม่สำหรับแพทย์/เจ้าหน้าที่
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">ชื่อ-นามสกุล</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="ชื่อ นามสกุล"
                        value={signupForm.fullName}
                        onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">อีเมล</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">รหัสผ่าน</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
