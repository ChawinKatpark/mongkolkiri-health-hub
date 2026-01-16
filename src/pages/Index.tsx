import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePatients } from '@/hooks/usePatients';
import { 
  Users, 
  UserPlus,
  Search
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const { isPatient, isStaff, isLoading: roleLoading } = useUserRole();
  const { data: patients = [] } = usePatients();

  // Redirect patients to patient dashboard
  useEffect(() => {
    if (!roleLoading && isPatient && !isStaff) {
      navigate('/patient', { replace: true });
    }
  }, [roleLoading, isPatient, isStaff, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-primary">กำลังโหลด...</div>
      </div>
    );
  }

  // Don't render staff dashboard for patients
  if (isPatient && !isStaff) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="glass-card hover:shadow-lg transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ผู้ป่วยทั้งหมด</p>
                  <p className="text-2xl font-display font-bold text-foreground">{patients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">ดำเนินการด่วน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/register')} className="gap-2">
                <UserPlus className="w-4 h-4" />
                ลงทะเบียนผู้ป่วยใหม่
              </Button>
              <Button variant="outline" onClick={() => navigate('/patients')} className="gap-2">
                <Search className="w-4 h-4" />
                ค้นหาผู้ป่วย
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
