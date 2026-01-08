import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTodayQueue, statusLabels, VisitStatus, useUpdateVisitStatus } from '@/hooks/useVisits';
import { 
  Clock, 
  AlertTriangle, 
  Activity,
  Stethoscope,
  CreditCard,
  ClipboardList
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

const statusGroups = {
  registration: ['Registered', 'InQueue'] as VisitStatus[],
  screening: ['VitalSigns', 'WaitingForDoctor'] as VisitStatus[],
  consultation: ['InConsultation', 'Diagnosing', 'Ordering', 'OrderConfirmed'] as VisitStatus[],
  treatment: ['PerformingProcedure', 'ProcedureCompleted'] as VisitStatus[],
  finance: ['AwaitingPayment', 'PaymentProcessed', 'Dispensing', 'Completed'] as VisitStatus[],
};

const Queue = () => {
  const navigate = useNavigate();
  const { data: visits = [], isLoading } = useTodayQueue();
  const updateStatus = useUpdateVisitStatus();

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

  const handleStatusChange = (visitId: string, newStatus: VisitStatus) => {
    updateStatus.mutate({ visitId, status: newStatus });
  };

  const renderVisitCard = (visit: typeof visits[0]) => {
    const patient = visit.patients;
    const age = patient?.dob 
      ? differenceInYears(new Date(), new Date(patient.dob)) 
      : null;
    const hasAllergies = patient?.allergies && patient.allergies.length > 0;
    const nextStatus = getNextStatus(visit.status);
    
    // Show consult button for statuses in consultation flow
    const showConsultButton = ['WaitingForDoctor', 'InConsultation', 'Diagnosing', 'Ordering', 'OrderConfirmed'].includes(visit.status);

    return (
      <div 
        key={visit.id}
        className="flex flex-col gap-3 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-3">
          {/* Queue Number */}
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
            <span className="text-xs text-muted-foreground">คิว</span>
            <span className="text-lg font-display font-bold text-primary">
              {visit.queue_number || '-'}
            </span>
          </div>

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground">
                {patient?.first_name} {patient?.last_name}
              </span>
              {hasAllergies && (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  แพ้ยา
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {patient?.hn} • อายุ {age !== null ? `${age} ปี` : '-'}
            </p>
          </div>
        </div>

        {/* Status and Action */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          <Badge className={`status-badge ${statusColors[visit.status]}`}>
            {statusLabels[visit.status]}
          </Badge>
          
          <div className="flex items-center gap-2">
            {showConsultButton && (
              <Button 
                size="sm"
                variant="outline"
                onClick={() => navigate(`/visit/${visit.id}/consult`)}
                className="gap-1"
              >
                <ClipboardList className="w-4 h-4" />
                เข้าตรวจ
              </Button>
            )}
            
            {nextStatus && (
              <Button 
                size="sm" 
                onClick={() => handleStatusChange(visit.id, nextStatus)}
                disabled={updateStatus.isPending}
              >
                {statusLabels[nextStatus]}
              </Button>
            )}
          </div>
        </div>

        {/* Allergies Detail */}
        {hasAllergies && (
          <div className="allergy-alert text-sm">
            <strong>แพ้:</strong> {patient?.allergies.join(', ')}
          </div>
        )}
      </div>
    );
  };

  const filterByStatuses = (statuses: VisitStatus[]) => 
    visits.filter(v => statuses.includes(v.status));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
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
          </CardHeader>
        </Card>

        {/* Tabs by Station */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent p-0">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              ทั้งหมด ({visits.length})
            </TabsTrigger>
            <TabsTrigger value="registration" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="w-4 h-4 mr-1" />
              เวชระเบียน ({filterByStatuses(statusGroups.registration).length})
            </TabsTrigger>
            <TabsTrigger value="screening" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="w-4 h-4 mr-1" />
              คัดกรอง ({filterByStatuses(statusGroups.screening).length})
            </TabsTrigger>
            <TabsTrigger value="consultation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Stethoscope className="w-4 h-4 mr-1" />
              ห้องตรวจ ({filterByStatuses(statusGroups.consultation).length})
            </TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CreditCard className="w-4 h-4 mr-1" />
              การเงิน ({filterByStatuses(statusGroups.finance).length})
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">กำลังโหลด...</div>
          ) : (
            <>
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visits.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>ไม่มีคิวผู้ป่วยวันนี้</p>
                    </div>
                  ) : (
                    visits.map(renderVisitCard)
                  )}
                </div>
              </TabsContent>

              <TabsContent value="registration" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByStatuses(statusGroups.registration).length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      <p>ไม่มีผู้ป่วยในจุดเวชระเบียน</p>
                    </div>
                  ) : (
                    filterByStatuses(statusGroups.registration).map(renderVisitCard)
                  )}
                </div>
              </TabsContent>

              <TabsContent value="screening" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByStatuses(statusGroups.screening).length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      <p>ไม่มีผู้ป่วยในจุดคัดกรอง</p>
                    </div>
                  ) : (
                    filterByStatuses(statusGroups.screening).map(renderVisitCard)
                  )}
                </div>
              </TabsContent>

              <TabsContent value="consultation" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByStatuses(statusGroups.consultation).length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      <p>ไม่มีผู้ป่วยในห้องตรวจ</p>
                    </div>
                  ) : (
                    filterByStatuses(statusGroups.consultation).map(renderVisitCard)
                  )}
                </div>
              </TabsContent>

              <TabsContent value="finance" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByStatuses(statusGroups.finance).length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      <p>ไม่มีผู้ป่วยในจุดการเงิน</p>
                    </div>
                  ) : (
                    filterByStatuses(statusGroups.finance).map(renderVisitCard)
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Queue;
