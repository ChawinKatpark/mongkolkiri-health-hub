import { usePatientAccount } from "@/hooks/usePatientAccount";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill, Calendar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface MedicationWithVisit {
  id: string;
  quantity: number;
  usage_instruction: string | null;
  created_at: string;
  medicine: {
    id: string;
    name_thai: string;
    name_english: string | null;
    unit: string | null;
    properties: string | null;
  };
  visit: {
    id: string;
    visit_date: string;
  };
}

const PatientMedicationHistory = () => {
  const { data: patientAccount, isLoading: accountLoading } = usePatientAccount();

  const { data: medications, isLoading: medicationsLoading } = useQuery({
    queryKey: ['patient-medications', patientAccount?.patient_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          id,
          quantity,
          usage_instruction,
          created_at,
          medicine:medicines(id, name_thai, name_english, unit, properties),
          visit:visits!inner(id, visit_date, patient_id)
        `)
        .eq('visit.patient_id', patientAccount?.patient_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as MedicationWithVisit[];
    },
    enabled: !!patientAccount?.patient_id
  });

  const isLoading = accountLoading || medicationsLoading;

  // Group medications by visit date
  const groupedMedications = medications?.reduce((acc, med) => {
    const date = med.visit.visit_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(med);
    return acc;
  }, {} as Record<string, MedicationWithVisit[]>) || {};

  if (isLoading) {
    return (
      <PatientLayout title="ประวัติการรับยา">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </PatientLayout>
    );
  }

  const sortedDates = Object.keys(groupedMedications).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <PatientLayout title="ประวัติการรับยา">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              ประวัติการรับยา
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedDates.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">ยังไม่มีประวัติการรับยา</p>
              </div>
            ) : (
              <div className="space-y-8">
                {sortedDates.map((date) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-muted-foreground">
                        {format(new Date(date), "EEEE d MMMM yyyy", { locale: th })}
                      </h3>
                    </div>
                    <div className="space-y-3 ml-6">
                      {groupedMedications[date].map((med) => (
                        <div 
                          key={med.id} 
                          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                              <Pill className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-lg">
                                {med.medicine?.name_thai}
                              </p>
                              {med.medicine?.name_english && (
                                <p className="text-sm text-muted-foreground">
                                  {med.medicine.name_english}
                                </p>
                              )}
                              <div className="mt-2 space-y-1">
                                <p className="text-sm">
                                  <span className="text-muted-foreground">จำนวน: </span>
                                  <span className="font-medium">
                                    {med.quantity} {med.medicine?.unit || "หน่วย"}
                                  </span>
                                </p>
                                {med.usage_instruction && (
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">วิธีใช้: </span>
                                    <span>{med.usage_instruction}</span>
                                  </p>
                                )}
                                {med.medicine?.properties && (
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">สรรพคุณ: </span>
                                    <span>{med.medicine.properties}</span>
                                  </p>
                                )}
                              </div>
                            </div>
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
      </div>
    </PatientLayout>
  );
};

export default PatientMedicationHistory;
