import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTodayQueue, statusLabels, VisitStatus, useUpdateVisitStatus } from '@/hooks/useVisits';
import { usePatients } from '@/hooks/usePatients';
import { 
  Users, 
  ClipboardList, 
  Clock, 
  UserPlus,
  AlertTriangle,
  ChevronRight,
  Activity,
  Stethoscope
} from 'lucide-react';
import { differenceInYears } from 'date-fns';

const statusColors: Record<VisitStatus, string> = {
  Registered: 'bg-muted text-muted-foreground',
  InQueue: 'bg-warning/20 text-warning border-warning/30',
  VitalSigns: 'bg-blue-100 text-blue-700 border-blue-300',
  WaitingForDoctor: 'bg-sage-light text-sage-dark border-sage/30',
  InConsultation: 'bg-primary/20 text-primary border-primary/30',
  Diagnosing: 'bg-primary/30 text-primary border-primary/40',
  Ordering: 'bg-accent/20 text-accent border-accent/30',
  OrderConfirmed: 'bg-accent/30 text-accent border-accent/40',
  PerformingProcedure: 'bg-purple-100 text-purple-700 border-purple-300',
  ProcedureCompleted: 'bg-purple-200 text-purple-800 border-purple-400',
  AwaitingPayment: 'bg-orange-100 text-orange-700 border-orange-300',
  PaymentProcessed: 'bg-orange-200 text-orange-800 border-orange-400',
  Dispensing: 'bg-teal-100 text-teal-700 border-teal-300',
  Completed: 'bg-success/20 text-success border-success/30'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const { isPatient, isStaff, isLoading: roleLoading } = useUserRole();
  const { data: visits = [], isLoading: visitsLoading } = useTodayQueue();
  const { data: patients = [] } = usePatients();
  const updateStatus = useUpdateVisitStatus();

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

  const queueVisits = visits.filter(v => 
    ['InQueue', 'VitalSigns', 'WaitingForDoctor', 'InConsultation'].includes(v.status)
  );

  const inQueueCount = visits.filter(v => v.status === 'InQueue').length;
  const waitingDoctorCount = visits.filter(v => v.status === 'WaitingForDoctor').length;
  const completedCount = visits.filter(v => v.status === 'Completed').length;

  const handleStatusChange = (visitId: string, newStatus: VisitStatus) => {
    updateStatus.mutate({ visitId, status: newStatus });
  };

  const getNextStatus = (currentStatus: VisitStatus): VisitStatus | null => {
    const flow: Record<VisitStatus, VisitStatus | null> = {
      Registered: 'InQueue',
      InQueue: 'VitalSigns',
      VitalSigns: 'WaitingForDoctor',
      WaitingForDoctor: 'InConsultation',
      InConsultation: 'Diagnosing',
      Diagnosing: 'Ordering',
      Ordering: 'OrderConfirmed',
      OrderConfirmed: 'AwaitingPayment',
      PerformingProcedure: 'ProcedureCompleted',
      ProcedureCompleted: 'AwaitingPayment',
      AwaitingPayment: 'PaymentProcessed',
      PaymentProcessed: 'Dispensing',
      Dispensing: 'Completed',
      Completed: null
    };
    return flow[currentStatus];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

          <Card className="glass-card hover:shadow-lg transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">รอคิว</p>
                  <p className="text-2xl font-display font-bold text-foreground">{inQueueCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-sage-dark" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">รอพบแพทย์</p>
                  <p className="text-2xl font-display font-bold text-foreground">{waitingDoctorCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">เสร็จสิ้นวันนี้</p>
                  <p className="text-2xl font-display font-bold text-foreground">{completedCount}</p>
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
                <Users className="w-4 h-4" />
                ค้นหาผู้ป่วย
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Queue */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle className="font-display text-lg">คิวผู้ป่วยวันนี้</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('th-TH', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => navigate('/queue')} className="gap-1">
              ดูทั้งหมด
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {visitsLoading ? (
              <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
            ) : queueVisits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>ไม่มีคิวผู้ป่วย</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queueVisits.map((visit) => {
                  const patient = visit.patients;
                  const age = patient?.dob 
                    ? differenceInYears(new Date(), new Date(patient.dob)) 
                    : null;
                  const hasAllergies = patient?.allergies && patient.allergies.length > 0;
                  const nextStatus = getNextStatus(visit.status);

                  return (
                    <div 
                      key={visit.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
                    >
                      {/* Queue Number */}
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                        <span className="text-xs text-muted-foreground">คิว</span>
                        <span className="text-xl font-display font-bold text-primary">
                          {visit.queue_number || '-'}
                        </span>
                      </div>

                      {/* Patient Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">
                            {patient?.first_name} {patient?.last_name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({patient?.hn})
                          </span>
                          {hasAllergies && (
                            <Badge variant="destructive" className="gap-1 text-xs">
                              <AlertTriangle className="w-3 h-3" />
                              แพ้ยา
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          อายุ {age !== null ? `${age} ปี` : '-'}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <Badge className={`status-badge ${statusColors[visit.status]}`}>
                        {statusLabels[visit.status]}
                      </Badge>

                      {/* Action Button */}
                      {nextStatus && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(visit.id, nextStatus)}
                          disabled={updateStatus.isPending}
                        >
                          {statusLabels[nextStatus]}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
