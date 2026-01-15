import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  CreditCard, 
  AlertTriangle,
  ClipboardList,
  Stethoscope,
  Pill,
  FileText
} from 'lucide-react';
import { differenceInYears, format } from 'date-fns';
import { th } from 'date-fns/locale';

interface PatientWithVisits {
  id: string;
  hn: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  national_id: string | null;
  phone: string | null;
  address: string | null;
  allergies: string[];
  created_at: string;
  visits: {
    id: string;
    visit_date: string;
    status: string;
    chief_complaint: string | null;
    queue_number: number | null;
    diagnoses: {
      id: string;
      icd10_code: string;
      description: string | null;
      diagnosis_type: string | null;
    }[];
    prescriptions: {
      id: string;
      quantity: number;
      usage_instruction: string | null;
      medicine: {
        name_thai: string;
        name_english: string | null;
      } | null;
    }[];
    treatment_plans: {
      id: string;
      plan_details: string;
      duration: string | null;
      follow_up_date: string | null;
    }[];
  }[];
}

const PatientDetail = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient-detail', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          visits (
            id,
            visit_date,
            status,
            chief_complaint,
            queue_number,
            diagnoses (id, icd10_code, description, diagnosis_type),
            prescriptions (id, quantity, usage_instruction, medicine:medicines(name_thai, name_english)),
            treatment_plans (id, plan_details, duration, follow_up_date)
          )
        `)
        .eq('id', patientId)
        .order('visit_date', { referencedTable: 'visits', ascending: false })
        .single();

      if (error) throw error;
      return data as PatientWithVisits;
    },
    enabled: !!patientId
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">ไม่พบข้อมูลผู้ป่วย</p>
          <Button variant="link" onClick={() => navigate('/patients')}>
            กลับหน้ารายชื่อผู้ป่วย
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const age = differenceInYears(new Date(), new Date(patient.dob));
  const hasAllergies = patient.allergies && patient.allergies.length > 0;
  const genderLabel = patient.gender === 'male' ? 'ชาย' : patient.gender === 'female' ? 'หญิง' : 'อื่นๆ';

  // Collect all diagnoses across visits
  const allDiagnoses = patient.visits.flatMap(v => 
    v.diagnoses.map(d => ({ ...d, visit_date: v.visit_date, visit_id: v.id }))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>
        </div>

        {/* Patient Info Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-display">
                    {patient.first_name} {patient.last_name}
                  </span>
                  {hasAllergies && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      แพ้ยา
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-normal">
                  HN: {patient.hn}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">วันเกิด:</span>
                  <span>{format(new Date(patient.dob), 'd MMMM yyyy', { locale: th })} ({age} ปี)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">เพศ:</span>
                  <span>{genderLabel}</span>
                </div>
                {patient.national_id && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">เลขบัตรประชาชน:</span>
                    <span>{patient.national_id}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {patient.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">โทรศัพท์:</span>
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">ที่อยู่:</span>
                    <span>{patient.address}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {hasAllergies && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      การแพ้ยา/อาหาร
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.map((allergy, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Medical History */}
        <Tabs defaultValue="visits" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="visits" className="gap-1">
              <ClipboardList className="h-4 w-4" />
              ประวัติการเข้ารับบริการ
            </TabsTrigger>
            <TabsTrigger value="diagnoses" className="gap-1">
              <Stethoscope className="h-4 w-4" />
              ประวัติการวินิจฉัย
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-1">
              <Pill className="h-4 w-4" />
              ประวัติการรับยา
            </TabsTrigger>
          </TabsList>

          {/* Visit History */}
          <TabsContent value="visits">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ประวัติการเข้ารับบริการ ({patient.visits.length} ครั้ง)</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.visits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">ยังไม่มีประวัติการเข้ารับบริการ</p>
                ) : (
                  <div className="space-y-3">
                    {patient.visits.map((visit) => (
                      <div 
                        key={visit.id} 
                        className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/visit/${visit.id}/consult`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {format(new Date(visit.visit_date), 'd MMM yyyy', { locale: th })}
                            </Badge>
                            {visit.queue_number && (
                              <Badge variant="secondary">คิว #{visit.queue_number}</Badge>
                            )}
                          </div>
                          <Badge>{visit.status}</Badge>
                        </div>
                        {visit.chief_complaint && (
                          <p className="text-sm text-muted-foreground">
                            อาการ: {visit.chief_complaint}
                          </p>
                        )}
                        {visit.diagnoses.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {visit.diagnoses.map((d) => (
                              <Badge key={d.id} variant="outline" className="text-xs">
                                {d.icd10_code}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnosis History */}
          <TabsContent value="diagnoses">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ประวัติการวินิจฉัย ({allDiagnoses.length} รายการ)</CardTitle>
              </CardHeader>
              <CardContent>
                {allDiagnoses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">ยังไม่มีประวัติการวินิจฉัย</p>
                ) : (
                  <div className="space-y-3">
                    {allDiagnoses.map((diagnosis) => (
                      <div key={diagnosis.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="font-mono">{diagnosis.icd10_code}</Badge>
                            <Badge variant={diagnosis.diagnosis_type === 'primary' ? 'default' : 'secondary'}>
                              {diagnosis.diagnosis_type === 'primary' ? 'หลัก' : 'รอง'}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(diagnosis.visit_date), 'd MMM yyyy', { locale: th })}
                          </span>
                        </div>
                        {diagnosis.description && (
                          <p className="text-sm">{diagnosis.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medication History */}
          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ประวัติการรับยา</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.visits.every(v => v.prescriptions.length === 0) ? (
                  <p className="text-muted-foreground text-center py-8">ยังไม่มีประวัติการรับยา</p>
                ) : (
                  <div className="space-y-4">
                    {patient.visits.filter(v => v.prescriptions.length > 0).map((visit) => (
                      <div key={visit.id} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(visit.visit_date), 'd MMMM yyyy', { locale: th })}
                        </div>
                        <div className="pl-6 space-y-2">
                          {visit.prescriptions.map((p) => (
                            <div key={p.id} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                              <div>
                                <span className="font-medium">{p.medicine?.name_thai || 'ไม่ระบุ'}</span>
                                {p.medicine?.name_english && (
                                  <span className="text-muted-foreground text-sm ml-2">({p.medicine.name_english})</span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {p.quantity} {p.usage_instruction && `- ${p.usage_instruction}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetail;
