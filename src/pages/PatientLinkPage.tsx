import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLinkPatientAccount } from "@/hooks/usePatientAccount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Link2 } from "lucide-react";

const PatientLinkPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const linkAccount = useLinkPatientAccount();
  
  const [hn, setHn] = useState("");
  const [nationalId, setNationalId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await linkAccount.mutateAsync({ hn, nationalId });
    navigate("/patient");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-background to-pink-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>กรุณาเข้าสู่ระบบ</CardTitle>
            <CardDescription>
              คุณต้องเข้าสู่ระบบก่อนเชื่อมโยงบัญชี
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} className="w-full">
              ไปหน้าเข้าสู่ระบบ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-background to-pink-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            เชื่อมโยงบัญชีผู้ป่วย
          </h1>
          <p className="text-muted-foreground">
            กรอกข้อมูลเพื่อเชื่อมโยงบัญชีกับข้อมูลผู้ป่วยของคุณ
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Link2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-center">ยืนยันตัวตน</CardTitle>
            <CardDescription className="text-center">
              กรอกหมายเลข HN และเลขบัตรประชาชนที่ลงทะเบียนไว้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hn">หมายเลข HN</Label>
                <Input
                  id="hn"
                  placeholder="เช่น HN250001"
                  value={hn}
                  onChange={(e) => setHn(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">เลขบัตรประชาชน 13 หลัก</Label>
                <Input
                  id="nationalId"
                  placeholder="X-XXXX-XXXXX-XX-X"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  maxLength={13}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={linkAccount.isPending}
              >
                {linkAccount.isPending ? "กำลังเชื่อมโยง..." : "เชื่อมโยงบัญชี"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => navigate("/auth")}>
            ← กลับหน้าเข้าสู่ระบบ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientLinkPage;
