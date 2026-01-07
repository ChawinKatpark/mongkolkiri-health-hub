import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDiagnoses, useCreateDiagnosis, useDeleteDiagnosis } from "@/hooks/useDiagnoses";
import { usePrescriptions, useCreatePrescription, useDeletePrescription } from "@/hooks/usePrescriptions";
import { useProcedureOrders, useCreateProcedureOrder, useDeleteProcedureOrder } from "@/hooks/useProcedureOrders";
import { useTreatmentPlans, useCreateTreatmentPlan, useDeleteTreatmentPlan } from "@/hooks/useTreatmentPlans";
import { useMedicines } from "@/hooks/useMedicines";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2, FileDown, Stethoscope, Pill, FileText, ClipboardList, User } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import type { Visit } from "@/hooks/useVisits";

const VisitConsultation = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form states
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [physicalExam, setPhysicalExam] = useState("");
  const [diagnosisForm, setDiagnosisForm] = useState({ icd10_code: "", description: "", diagnosis_type: "primary" });
  const [prescriptionForm, setPrescriptionForm] = useState({ medicine_id: "", quantity: "", usage_instruction: "" });
  const [procedureForm, setProcedureForm] = useState({ procedure_name: "", body_part: "", notes: "" });
  const [treatmentForm, setTreatmentForm] = useState({ plan_details: "", duration: "", follow_up_date: "", notes: "" });

  // Queries
  const { data: visit, isLoading: visitLoading } = useQuery({
    queryKey: ['visit', visitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select(`*, patient:patients(*)`)
        .eq('id', visitId)
        .single();
      if (error) throw error;
      setChiefComplaint(data.chief_complaint || "");
      setPhysicalExam(data.physical_exam_note || "");
      return data as Visit & { patient: { first_name: string; last_name: string; hn: string; allergies: string[] } };
    },
    enabled: !!visitId
  });

  const { data: diagnoses } = useDiagnoses(visitId);
  const { data: prescriptions } = usePrescriptions(visitId);
  const { data: procedures } = useProcedureOrders(visitId);
  const { data: treatmentPlans } = useTreatmentPlans(visitId);
  const { data: medicines } = useMedicines();

  // Mutations
  const createDiagnosis = useCreateDiagnosis();
  const deleteDiagnosis = useDeleteDiagnosis();
  const createPrescription = useCreatePrescription();
  const deletePrescription = useDeletePrescription();
  const createProcedure = useCreateProcedureOrder();
  const deleteProcedure = useDeleteProcedureOrder();
  const createTreatmentPlan = useCreateTreatmentPlan();
  const deleteTreatmentPlan = useDeleteTreatmentPlan();

  const updateVisit = useMutation({
    mutationFn: async (data: { chief_complaint?: string; physical_exam_note?: string }) => {
      const { error } = await supabase.from('visits').update(data).eq('id', visitId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visit', visitId] });
      toast.success("บันทึกข้อมูลสำเร็จ");
    }
  });

  const handleExportPDF = () => {
    window.print();
    toast.success("กำลังเปิดหน้าพิมพ์เอกสาร");
  };

  if (visitLoading) {
    return <DashboardLayout><Skeleton className="h-96 w-full" /></DashboardLayout>;
  }

  if (!visit) {
    return <DashboardLayout><div className="text-center py-12">ไม่พบข้อมูล</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 print:space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={() => navigate("/queue")}>
            <ArrowLeft className="h-4 w-4 mr-2" />กลับ
          </Button>
          <Button onClick={handleExportPDF}><FileDown className="h-4 w-4 mr-2" />ส่งออก PDF</Button>
        </div>

        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {visit.patient?.first_name} {visit.patient?.last_name} ({visit.patient?.hn})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              วันที่: {format(new Date(visit.visit_date), "d MMMM yyyy", { locale: th })} | 
              การแพ้ยา: {visit.patient?.allergies?.length > 0 ? (visit.patient.allergies as string[]).join(", ") : "ไม่มี"}
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="complaint" className="print:hidden">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="complaint">อาการ</TabsTrigger>
            <TabsTrigger value="diagnosis">วินิจฉัย</TabsTrigger>
            <TabsTrigger value="treatment">แผนรักษา</TabsTrigger>
            <TabsTrigger value="procedure">หัตถการ</TabsTrigger>
            <TabsTrigger value="prescription">สั่งยา</TabsTrigger>
          </TabsList>

          <TabsContent value="complaint" className="space-y-4">
            <Card>
              <CardHeader><CardTitle><Stethoscope className="h-5 w-5 inline mr-2" />บันทึกอาการ</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>อาการหลัก (Chief Complaint)</Label>
                  <Textarea value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="อาการที่ผู้ป่วยมา" />
                </div>
                <div>
                  <Label>ผลการตรวจร่างกาย (Physical Examination)</Label>
                  <Textarea value={physicalExam} onChange={(e) => setPhysicalExam(e.target.value)} placeholder="ผลการตรวจร่างกาย" />
                </div>
                <Button onClick={() => updateVisit.mutate({ chief_complaint: chiefComplaint, physical_exam_note: physicalExam })} disabled={updateVisit.isPending}>
                  <Save className="h-4 w-4 mr-2" />บันทึก
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnosis" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>เพิ่มการวินิจฉัย</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="ICD-10 Code" value={diagnosisForm.icd10_code} onChange={(e) => setDiagnosisForm({ ...diagnosisForm, icd10_code: e.target.value })} />
                  <Input placeholder="คำอธิบาย" value={diagnosisForm.description} onChange={(e) => setDiagnosisForm({ ...diagnosisForm, description: e.target.value })} />
                  <Select value={diagnosisForm.diagnosis_type} onValueChange={(v) => setDiagnosisForm({ ...diagnosisForm, diagnosis_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">หลัก</SelectItem>
                      <SelectItem value="secondary">รอง</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { createDiagnosis.mutate({ visit_id: visitId!, ...diagnosisForm }); setDiagnosisForm({ icd10_code: "", description: "", diagnosis_type: "primary" }); }}>
                  <Plus className="h-4 w-4 mr-2" />เพิ่ม
                </Button>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {diagnoses?.map((d) => (
                <div key={d.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div><Badge>{d.icd10_code}</Badge> {d.description}</div>
                  <Button variant="ghost" size="icon" onClick={() => deleteDiagnosis.mutate({ id: d.id, visitId: visitId! })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="treatment" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>เพิ่มแผนการรักษา</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder="รายละเอียดแผนการรักษา" value={treatmentForm.plan_details} onChange={(e) => setTreatmentForm({ ...treatmentForm, plan_details: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="ระยะเวลา" value={treatmentForm.duration} onChange={(e) => setTreatmentForm({ ...treatmentForm, duration: e.target.value })} />
                  <Input type="date" value={treatmentForm.follow_up_date} onChange={(e) => setTreatmentForm({ ...treatmentForm, follow_up_date: e.target.value })} />
                </div>
                <Button onClick={() => { createTreatmentPlan.mutate({ visit_id: visitId!, ...treatmentForm }); setTreatmentForm({ plan_details: "", duration: "", follow_up_date: "", notes: "" }); }}>
                  <Plus className="h-4 w-4 mr-2" />เพิ่ม
                </Button>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {treatmentPlans?.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>{t.plan_details} {t.duration && `(${t.duration})`}</div>
                  <Button variant="ghost" size="icon" onClick={() => deleteTreatmentPlan.mutate({ id: t.id, visitId: visitId! })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="procedure" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>เพิ่มหัตถการ</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="ชื่อหัตถการ" value={procedureForm.procedure_name} onChange={(e) => setProcedureForm({ ...procedureForm, procedure_name: e.target.value })} />
                  <Input placeholder="ตำแหน่ง" value={procedureForm.body_part} onChange={(e) => setProcedureForm({ ...procedureForm, body_part: e.target.value })} />
                  <Input placeholder="หมายเหตุ" value={procedureForm.notes} onChange={(e) => setProcedureForm({ ...procedureForm, notes: e.target.value })} />
                </div>
                <Button onClick={() => { createProcedure.mutate({ visit_id: visitId!, ...procedureForm }); setProcedureForm({ procedure_name: "", body_part: "", notes: "" }); }}>
                  <Plus className="h-4 w-4 mr-2" />เพิ่ม
                </Button>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {procedures?.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>{p.procedure_name} {p.body_part && `- ${p.body_part}`}</div>
                  <Button variant="ghost" size="icon" onClick={() => deleteProcedure.mutate({ id: p.id, visitId: visitId! })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prescription" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>สั่งจ่ายยา</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Select value={prescriptionForm.medicine_id} onValueChange={(v) => setPrescriptionForm({ ...prescriptionForm, medicine_id: v })}>
                    <SelectTrigger><SelectValue placeholder="เลือกยา" /></SelectTrigger>
                    <SelectContent>{medicines?.map((m) => <SelectItem key={m.id} value={m.id}>{m.name_thai}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="จำนวน" value={prescriptionForm.quantity} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, quantity: e.target.value })} />
                  <Input placeholder="วิธีใช้" value={prescriptionForm.usage_instruction} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, usage_instruction: e.target.value })} />
                </div>
                <Button onClick={() => { createPrescription.mutate({ visit_id: visitId!, medicine_id: prescriptionForm.medicine_id, quantity: parseInt(prescriptionForm.quantity), usage_instruction: prescriptionForm.usage_instruction }); setPrescriptionForm({ medicine_id: "", quantity: "", usage_instruction: "" }); }}>
                  <Plus className="h-4 w-4 mr-2" />เพิ่ม
                </Button>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {prescriptions?.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>{p.medicine?.name_thai} x{p.quantity} - {p.usage_instruction}</div>
                  <Button variant="ghost" size="icon" onClick={() => deletePrescription.mutate({ id: p.id, visitId: visitId! })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default VisitConsultation;
