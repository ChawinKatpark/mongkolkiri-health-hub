import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { differenceInYears } from 'date-fns';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCreatePatient } from '@/hooks/usePatients';
import { UserPlus, AlertTriangle, X, Calendar, Phone, MapPin, CreditCard } from 'lucide-react';

const patientSchema = z.object({
  national_id: z.string().regex(/^\d{13}$/, 'เลขบัตรประชาชนต้องมี 13 หลัก').optional().or(z.literal('')),
  first_name: z.string().min(1, 'กรุณากรอกชื่อ').max(100),
  last_name: z.string().min(1, 'กรุณากรอกนามสกุล').max(100),
  dob: z.string().min(1, 'กรุณาเลือกวันเกิด'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

const Register = () => {
  const navigate = useNavigate();
  const createPatient = useCreatePatient();
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: 'male'
    }
  });

  const dob = watch('dob');
  const age = dob ? differenceInYears(new Date(), new Date(dob)) : null;

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      await createPatient.mutateAsync({
        first_name: data.first_name,
        last_name: data.last_name,
        dob: data.dob,
        gender: data.gender,
        national_id: data.national_id || undefined,
        allergies,
        phone: data.phone || undefined,
        address: data.address || undefined
      });

      navigate('/');
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">ลงทะเบียนผู้ป่วยใหม่</CardTitle>
                <CardDescription>กรอกข้อมูลผู้ป่วยเพื่อสร้างเวชระเบียน</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">ชื่อ *</Label>
                  <Input
                    id="first_name"
                    placeholder="ชื่อ"
                    {...register('first_name')}
                    className="h-11"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">นามสกุล *</Label>
                  <Input
                    id="last_name"
                    placeholder="นามสกุล"
                    {...register('last_name')}
                    className="h-11"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="national_id" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    เลขบัตรประชาชน
                  </Label>
                  <Input
                    id="national_id"
                    placeholder="1234567890123"
                    maxLength={13}
                    {...register('national_id')}
                    className="h-11"
                  />
                  {errors.national_id && (
                    <p className="text-sm text-destructive">{errors.national_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>เพศ *</Label>
                  <Select 
                    defaultValue="male" 
                    onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="เลือกเพศ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ชาย</SelectItem>
                      <SelectItem value="female">หญิง</SelectItem>
                      <SelectItem value="other">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    วันเกิด *
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    {...register('dob')}
                    className="h-11"
                  />
                  {errors.dob && (
                    <p className="text-sm text-destructive">{errors.dob.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>อายุ</Label>
                  <div className="h-11 px-3 flex items-center rounded-lg border border-input bg-muted/50">
                    <span className="text-foreground font-medium">
                      {age !== null ? `${age} ปี` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    เบอร์โทรศัพท์
                  </Label>
                  <Input
                    id="phone"
                    placeholder="0812345678"
                    {...register('phone')}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  ที่อยู่
                </Label>
                <Textarea
                  id="address"
                  placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                  {...register('address')}
                  rows={3}
                />
              </div>

              {/* Allergies Section */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  ประวัติแพ้ยา/อาหาร
                </Label>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="กรอกชื่อสารที่แพ้"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                    className="h-11"
                  />
                  <Button type="button" variant="secondary" onClick={addAllergy}>
                    เพิ่ม
                  </Button>
                </div>

                {allergies.length > 0 && (
                  <div className="allergy-alert">
                    <div className="flex flex-wrap gap-2">
                      {allergies.map((allergy, index) => (
                        <Badge 
                          key={index} 
                          variant="destructive" 
                          className="gap-1 pr-1"
                        >
                          {allergy}
                          <button
                            type="button"
                            onClick={() => removeAllergy(allergy)}
                            className="ml-1 hover:bg-destructive-foreground/20 rounded p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/')}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || createPatient.isPending}
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Register;
