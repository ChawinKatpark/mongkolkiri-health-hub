import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePatientAccount } from '@/hooks/usePatientAccount';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  isPatient: boolean;
  isStaff: boolean;
  isLoading: boolean;
}

export const useUserRole = (): UserRole => {
  const { user } = useAuth();
  const { data: patientAccount, isLoading: patientLoading } = usePatientAccount();
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [staffLoading, setStaffLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkStaffRole = async () => {
      if (!user) {
        setIsStaff(false);
        setStaffLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_staff', { _user_id: user.id });
        
        if (error) {
          console.error('Error checking staff role:', error);
          setIsStaff(false);
        } else {
          setIsStaff(data || false);
        }
      } catch (err) {
        console.error('Error checking staff role:', err);
        setIsStaff(false);
      } finally {
        setStaffLoading(false);
      }
    };

    checkStaffRole();
  }, [user]);

  return {
    isPatient: !!patientAccount,
    isStaff,
    isLoading: patientLoading || staffLoading
  };
};
