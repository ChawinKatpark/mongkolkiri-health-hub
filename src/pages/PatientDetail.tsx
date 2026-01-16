import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Plus
} from 'lucide-react';
import { differenceInYears, format } from 'date-fns';
import { th } from 'date-fns/locale';
import { usePatientDiagnoses, useCreatePatientDiagnosis } from '@/hooks/usePatientDiagnoses';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  
  // Dialog state
  const [diagnosisDialogOpen, setDiagnosisDialogOpen] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState({
    diagnosis_date: format(new Date(), 'yyyy-MM-dd'),
    icd10_code: '',
    description: '',
    diagnosis_type: 'primary',
    notes: ''
  });

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

  // Fetch patient diagnoses from new standalone table
  const { data: patientDiagnoses = [], isLoading: diagnosesLoading } = usePatientDiagnoses(patientId || '');
  const createDiagnosis = useCreatePatientDiagnosis();

  const handleAddDiagnosis = async () => {
    if (!patientId || !newDiagnosis.icd10_code.trim()) return;
    
    await createDiagnosis.mutateAsync({
      patient_id: patientId,
      diagnosis_date: newDiagnosis.diagnosis_date,
      icd10_code: newDiagnosis.icd10_code.trim(),
      description: newDiagnosis.description.trim() || undefined,
      diagnosis_type: newDiagnosis.diagnosis_type,
      notes: newDiagnosis.notes.trim() || undefined,
      created_by: user?.id
    });
    
    // Reset form and close dialog
    setNewDiagnosis({
      diagnosis_date: format(new Date(), 'yyyy-MM-dd'),
      icd10_code: '',
      description: '',
      diagnosis_type: 'primary',
      notes: ''
    });
    setDiagnosisDialogOpen(false);
  };

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
        <Tabs defaultValue="diagnoses" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="diagnoses" className="gap-1">
              <Stethoscope className="h-4 w-4" />
              ประวัติการวินิจฉัย
            </TabsTrigger>
            <TabsTrigger value="visits" className="gap-1">
              <ClipboardList className="h-4 w-4" />
              ประวัติการเข้ารับบริการ
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-1">
              <Pill className="h-4 w-4" />
              ประวัติการรับยา
            </TabsTrigger>
          </TabsList>

          {/* Diagnosis History - Now uses standalone patient_diagnoses table */}
          <TabsContent value="diagnoses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">ประวัติการวินิจฉัย ({patientDiagnoses.length} รายการ)</CardTitle>
                <Button onClick={() => setDiagnosisDialogOpen(true)} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  เพิ่มการวินิจฉัย
                </Button>
              </CardHeader>
              <CardContent>
                {diagnosesLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : patientDiagnoses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">ยังไม่มีประวัติการวินิจฉัย</p>
                ) : (
                  <div className="space-y-3">
                    {patientDiagnoses.map((diagnosis) => (
                      <div key={diagnosis.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="font-mono">{diagnosis.icd10_code}</Badge>
                            <Badge variant={diagnosis.diagnosis_type === 'primary' ? 'default' : 'secondary'}>
                              {diagnosis.diagnosis_type === 'primary' ? 'หลัก' : 'รอง'}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(diagnosis.diagnosis_date), 'd MMM yyyy', { locale: th })}
                          </span>
                        </div>
                        {diagnosis.description && (
                          <p className="text-sm">{diagnosis.description}</p>
                        )}
                        {diagnosis.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{diagnosis.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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

        {/* Add Diagnosis Dialog */}
        <Dialog open={diagnosisDialogOpen} onOpenChange={setDiagnosisDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>เพิ่มการวินิจฉัยใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis_date">วันที่วินิจฉัย</Label>
                <Input
                  id="diagnosis_date"
                  type="date"
                  value={newDiagnosis.diagnosis_date}
                  onChange={(e) => setNewDiagnosis(prev => ({ ...prev, diagnosis_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icd10_code">รหัส ICD-10 *</Label>
                <Input
                  id="icd10_code"
                  placeholder="เช่น J06.9"
                  value={newDiagnosis.icd10_code}
                  onChange={(e) => setNewDiagnosis(prev => ({ ...prev, icd10_code: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">คำอธิบาย</Label>
                <Input
                  id="description"
                  placeholder="เช่น Upper respiratory infection"
                  value={newDiagnosis.description}
                  onChange={(e) => setNewDiagnosis(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis_type">ประเภท</Label>
                <Select
                  value={newDiagnosis.diagnosis_type}
                  onValueChange={(value) => setNewDiagnosis(prev => ({ ...prev, diagnosis_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">หลัก (Primary)</SelectItem>
                    <SelectItem value="secondary">รอง (Secondary)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">หมายเหตุ</Label>
                <Textarea
                  id="notes"
                  placeholder="หมายเหตุเพิ่มเติม..."
                  value={newDiagnosis.notes}
                  onChange={(e) => setNewDiagnosis(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDiagnosisDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button 
                onClick={handleAddDiagnosis} 
                disabled={!newDiagnosis.icd10_code.trim() || createDiagnosis.isPending}
              >
                {createDiagnosis.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetail;
