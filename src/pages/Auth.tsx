import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Leaf, Heart, Shield } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-sage-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0zNiAxNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
              <Leaf className="w-9 h-9 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">มงคลคีรี</h1>
              <p className="text-primary-foreground/80">คลินิกแพทย์แผนไทย</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-display font-bold leading-tight mb-6">
            ระบบบริหารจัดการ<br/>คลินิกแพทย์แผนไทย
          </h2>
          
          <p className="text-lg text-primary-foreground/80 mb-10 leading-relaxed">
            บูรณาการภูมิปัญญาดั้งเดิมเข้ากับเทคโนโลยีสมัยใหม่<br/>
            เพื่อการดูแลสุขภาพที่ครบวงจร
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-primary-foreground/90">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <span>ดูแลผู้ป่วยด้วยใจ</span>
            </div>
            <div className="flex items-center gap-4 text-primary-foreground/90">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span>ปลอดภัย เชื่อถือได้</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-display font-bold text-foreground">มงคลคีรี</h1>
                <p className="text-sm text-muted-foreground">คลินิกแพทย์แผนไทย</p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-display">ยินดีต้อนรับ</CardTitle>
              <CardDescription>เข้าสู่ระบบเพื่อจัดการคลินิก</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
                  <TabsTrigger value="signup">ลงทะเบียน</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
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
                        className="h-11"
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
                        className="h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                      {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
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
                        className="h-11"
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
                        className="h-11"
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
                        className="h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                      {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ระบบบริหารจัดการคลินิก MCMS v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
