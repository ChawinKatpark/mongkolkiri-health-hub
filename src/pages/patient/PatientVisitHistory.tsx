import { useNavigate } from "react-router-dom";
import { usePatientAccount } from "@/hooks/usePatientAccount";
import { useVisits, statusLabels } from "@/hooks/useVisits";
import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const PatientVisitHistory = () => {
  const navigate = useNavigate();
  const { data: patientAccount, isLoading: accountLoading } = usePatientAccount();
  const { data: visits, isLoading: visitsLoading } = useVisits();

  const isLoading = accountLoading || visitsLoading;

  // Filter visits for this patient
  const patientVisits = visits?.filter(v => v.patient_id === patientAccount?.patient_id) || [];

  if (isLoading) {
    return (
      <PatientLayout title="ประวัติการรักษา">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout title="ประวัติการรักษา">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ประวัติการเข้ารับบริการ ({patientVisits.length} ครั้ง)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patientVisits.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">ยังไม่มีประวัติการเข้ารับบริการ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/patient/visits/${visit.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {format(new Date(visit.visit_date), "EEEE d MMMM yyyy", { locale: th })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {visit.chief_complaint || "ไม่ระบุอาการ"}
                        </p>
                        {visit.queue_number && (
                          <p className="text-xs text-muted-foreground">
                            หมายเลขคิว: {visit.queue_number}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={visit.status === "Completed" ? "default" : "secondary"}>
                        {statusLabels[visit.status]}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default PatientVisitHistory;
