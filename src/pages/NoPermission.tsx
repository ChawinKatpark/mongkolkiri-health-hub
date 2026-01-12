import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NoPermission = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">ไม่มีสิทธิ์เข้าถึง</CardTitle>
          <CardDescription className="text-base">
            บัญชีนี้ยังไม่ได้รับสิทธิ์เจ้าหน้าที่
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อขอสิทธิ์การเข้าใช้งานระบบเจ้าหน้าที่
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าก่อนหน้า
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoPermission;
