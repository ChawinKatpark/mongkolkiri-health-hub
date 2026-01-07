import { useNavigate } from "react-router-dom";
import { usePatientAccount } from "@/hooks/usePatientAccount";
import { usePatient } from "@/hooks/usePatients";
import { useVisits } from "@/hooks/useVisits";
import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Pill, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { data: patientAccount, isLoading: accountLoading } = usePatientAccount();
  const { data: patient, isLoading: patientLoading } = usePatient(patientAccount?.patient_id || "");
  const { data: visits, isLoading: visitsLoading } = useVisits();

  const isLoading = accountLoading || patientLoading || visitsLoading;

  // Filter visits for this patient
  const patientVisits = visits?.filter(v => v.patient_id === patientAccount?.patient_id) || [];
  const recentVisits = patientVisits.slice(0, 3);

  if (isLoading) {
    return (
      <PatientLayout title="หน้าหลัก">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout title="หน้าหลัก">
      <div className="space-y-6">
        {/* Patient Info Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {patient?.first_name} {patient?.last_name}
                </CardTitle>
                <CardDescription className="text-base">
                  HN: {patient?.hn}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">วันเกิด</p>
                <p className="font-medium">
                  {patient?.dob ? format(new Date(patient.dob), "d MMMM yyyy", { locale: th }) : "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">เพศ</p>
                <p className="font-medium">
                  {patient?.gender === "male" ? "ชาย" : patient?.gender === "female" ? "หญิง" : "อื่นๆ"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">เบอร์โทร</p>
                <p className="font-medium">{patient?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">การแพ้ยา</p>
                <p className="font-medium">
                  {patient?.allergies && patient.allergies.length > 0 
                    ? (patient.allergies as string[]).join(", ")
                    : "ไม่มี"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate("/patient/visits")}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">ประวัติการรักษา</CardTitle>
                <CardDescription>ดูประวัติการเข้ารับบริการทั้งหมด</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate("/patient/medications")}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Pill className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">ประวัติการรับยา</CardTitle>
                <CardDescription>ดูประวัติการรับยาทั้งหมด</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              การเข้ารับบริการล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentVisits.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                ยังไม่มีประวัติการเข้ารับบริการ
              </p>
            ) : (
              <div className="space-y-4">
                {recentVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/patient/visits/${visit.id}`)}
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(visit.visit_date), "d MMMM yyyy", { locale: th })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {visit.chief_complaint || "ไม่ระบุอาการ"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      ดูรายละเอียด →
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {patientVisits.length > 3 && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => navigate("/patient/visits")}>
                  ดูทั้งหมด ({patientVisits.length} รายการ)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;
