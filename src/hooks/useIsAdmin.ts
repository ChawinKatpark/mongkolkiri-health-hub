import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AdminStatus {
  isAdmin: boolean;
  isLoading: boolean;
}

export const useIsAdmin = (): AdminStatus => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data || false);
        }
      } catch (err) {
        console.error("Error checking admin role:", err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  return { isAdmin, isLoading };
};
