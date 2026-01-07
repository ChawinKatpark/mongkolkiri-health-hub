import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDiagnoses } from "@/hooks/useDiagnoses";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { useProcedureOrders } from "@/hooks/useProcedureOrders";
import { useTreatmentPlans } from "@/hooks/useTreatmentPlans";
import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Stethoscope, Pill, FileText, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { statusLabels, type Visit } from "@/hooks/useVisits";

const PatientVisitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: visit, isLoading: visitLoading } = useQuery({
    queryKey: ['visit', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Visit;
    },
    enabled: !!id
  });

  const { data: diagnoses, isLoading: diagnosesLoading } = useDiagnoses(id);
  const { data: prescriptions, isLoading: prescriptionsLoading } = usePrescriptions(id);
  const { data: procedures, isLoading: proceduresLoading } = useProcedureOrders(id);
  const { data: treatmentPlans, isLoading: treatmentPlansLoading } = useTreatmentPlans(id);

  const isLoading = visitLoading || diagnosesLoading || prescriptionsLoading || proceduresLoading || treatmentPlansLoading;

  if (isLoading) {
    return (
      <PatientLayout title="รายละเอียดการรักษา">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </PatientLayout>
    );
  }

  if (!visit) {
    return (
      <PatientLayout title="รายละเอียดการรักษา">
        <div className="text-center py-12">
          <p className="text-muted-foreground">ไม่พบข้อมูลการรักษา</p>
          <Button onClick={() => navigate("/patient/visits")} className="mt-4">
            กลับหน้าประวัติการรักษา
          </Button>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout title="รายละเอียดการรักษา">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/patient/visits")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          กลับหน้าประวัติการรักษา
        </Button>

        {/* Visit Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>
                    {format(new Date(visit.visit_date), "EEEE d MMMM yyyy", { locale: th })}
                  </CardTitle>
                  <CardDescription>
                    หมายเลขคิว: {visit.queue_number || "-"}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={visit.status === "Completed" ? "default" : "secondary"}>
                {statusLabels[visit.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">อาการหลัก</p>
                <p className="font-medium">{visit.chief_complaint || "ไม่ระบุ"}</p>
              </div>
              {visit.physical_exam_note && (
                <div>
                  <p className="text-sm text-muted-foreground">ผลการตรวจร่างกาย</p>
                  <p className="font-medium">{visit.physical_exam_note}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Diagnoses */}
        {diagnoses && diagnoses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                การวินิจฉัย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diagnoses.map((diagnosis) => (
                  <div key={diagnosis.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{diagnosis.icd10_code}</Badge>
                      <Badge variant="secondary">
                        {diagnosis.diagnosis_type === "primary" ? "หลัก" : "รอง"}
                      </Badge>
                    </div>
                    <p className="text-sm">{diagnosis.description || "-"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Treatment Plans */}
        {treatmentPlans && treatmentPlans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                แผนการรักษา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {treatmentPlans.map((plan) => (
                  <div key={plan.id} className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">{plan.plan_details}</p>
                    {plan.duration && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ระยะเวลา: {plan.duration}
                      </p>
                    )}
                    {plan.follow_up_date && (
                      <p className="text-sm text-muted-foreground">
                        นัดติดตาม: {format(new Date(plan.follow_up_date), "d MMMM yyyy", { locale: th })}
                      </p>
                    )}
                    {plan.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        หมายเหตุ: {plan.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Procedures */}
        {procedures && procedures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                หัตถการ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {procedures.map((procedure) => (
                  <div key={procedure.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{procedure.procedure_name}</p>
                      <Badge variant={procedure.status === "completed" ? "default" : "secondary"}>
                        {procedure.status === "completed" ? "เสร็จสิ้น" : procedure.status === "pending" ? "รอดำเนินการ" : procedure.status}
                      </Badge>
                    </div>
                    {procedure.body_part && (
                      <p className="text-sm text-muted-foreground">ตำแหน่ง: {procedure.body_part}</p>
                    )}
                    {procedure.notes && (
                      <p className="text-sm text-muted-foreground">หมายเหตุ: {procedure.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prescriptions */}
        {prescriptions && prescriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                ยาที่ได้รับ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">
                      {prescription.medicine?.name_thai || "ไม่ระบุชื่อยา"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      จำนวน: {prescription.quantity} {prescription.medicine?.unit || "หน่วย"}
                    </p>
                    {prescription.usage_instruction && (
                      <p className="text-sm text-muted-foreground">
                        วิธีใช้: {prescription.usage_instruction}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientLayout>
  );
};

export default PatientVisitDetail;
