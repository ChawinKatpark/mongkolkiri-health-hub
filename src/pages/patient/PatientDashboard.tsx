import { useNavigate } from "react-router-dom";
import { usePatientAccount } from "@/hooks/usePatientAccount";
import { usePatient } from "@/hooks/usePatients";
import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill, User } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { data: patientAccount, isLoading: accountLoading } = usePatientAccount();
  const { data: patient, isLoading: patientLoading } = usePatient(patientAccount?.patient_id || "");

  const isLoading = accountLoading || patientLoading;

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
        <div className="grid grid-cols-1 gap-4">
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
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;
