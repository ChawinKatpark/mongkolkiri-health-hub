import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePatients } from '@/hooks/usePatients';
import { 
  Search, 
  UserPlus, 
  AlertTriangle, 
  Calendar,
  Phone,
  Eye
} from 'lucide-react';
import { differenceInYears } from 'date-fns';

const Patients = () => {
  const navigate = useNavigate();
  const { data: patients = [], isLoading } = usePatients();
  const [search, setSearch] = useState('');

  const filteredPatients = patients.filter(patient => {
    const searchLower = search.toLowerCase();
    return (
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      patient.hn.toLowerCase().includes(searchLower) ||
      (patient.national_id && patient.national_id.includes(search)) ||
      (patient.phone && patient.phone.includes(search))
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ค้นหาผู้ป่วย (ชื่อ, HN, เลขบัตรประชาชน)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button onClick={() => navigate('/register')} className="gap-2">
            <UserPlus className="w-4 h-4" />
            ลงทะเบียนใหม่
          </Button>
        </div>

        {/* Patient List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              รายชื่อผู้ป่วย ({filteredPatients.length} ราย)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>ไม่พบข้อมูลผู้ป่วย</p>
                {search && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearch('')}
                    className="mt-2"
                  >
                    ล้างการค้นหา
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((patient) => {
                  const age = differenceInYears(new Date(), new Date(patient.dob));
                  const hasAllergies = patient.allergies && patient.allergies.length > 0;

                  return (
                    <div 
                      key={patient.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
                    >
                      {/* HN Badge */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                          <span className="text-xs text-muted-foreground">HN</span>
                          <span className="text-sm font-display font-bold text-primary">
                            {patient.hn.replace('HN', '')}
                          </span>
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground text-lg">
                              {patient.first_name} {patient.last_name}
                            </span>
                            {hasAllergies && (
                              <Badge variant="destructive" className="gap-1 text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                แพ้ยา: {patient.allergies.join(', ')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              อายุ {age} ปี
                            </span>
                            {patient.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {patient.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 sm:ml-auto">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          ดูข้อมูล
                        </Button>
                      </div>
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

export default Patients;
