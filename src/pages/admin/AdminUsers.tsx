import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, UserPlus, Trash2, Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Profile {
  id: string;
  email: string | null;
  full_name: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "ผู้ดูแลระบบ",
  doctor: "แพทย์",
  nurse: "พยาบาล",
  pharmacist: "เภสัชกร",
  receptionist: "เจ้าหน้าที่ต้อนรับ",
};

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<Record<string, AppRole>>({});

  // Fetch all profiles (admin can read all)
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("full_name");
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch all user roles
  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role");
      if (error) throw error;
      return data as UserRole[];
    },
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("เพิ่มสิทธิ์สำเร็จ");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("ผู้ใช้มีสิทธิ์นี้อยู่แล้ว");
      } else {
        toast.error("เกิดข้อผิดพลาด", { description: error.message });
      }
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("ลบสิทธิ์สำเร็จ");
    },
    onError: (error: Error) => {
      toast.error("เกิดข้อผิดพลาด", { description: error.message });
    },
  });

  const handleAddRole = (userId: string) => {
    const role = selectedRole[userId];
    if (!role) {
      toast.error("กรุณาเลือกสิทธิ์");
      return;
    }
    addRoleMutation.mutate({ userId, role });
    setSelectedRole((prev) => ({ ...prev, [userId]: undefined as unknown as AppRole }));
  };

  const getUserRoles = (userId: string) => {
    return userRoles?.filter((r) => r.user_id === userId) || [];
  };

  const isLoading = profilesLoading || rolesLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">จัดการสิทธิ์ผู้ใช้</h1>
            <p className="text-muted-foreground">เพิ่มหรือลบสิทธิ์เจ้าหน้าที่</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายชื่อผู้ใช้ทั้งหมด</CardTitle>
            <CardDescription>
              ผู้ใช้ที่มีสิทธิ์อย่างน้อย 1 รายการจะสามารถเข้าถึงระบบเจ้าหน้าที่ได้
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>สิทธิ์ปัจจุบัน</TableHead>
                    <TableHead>เพิ่มสิทธิ์</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles?.map((profile) => {
                    const roles = getUserRoles(profile.id);
                    return (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.full_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.email || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {roles.length === 0 ? (
                              <span className="text-muted-foreground text-sm">
                                ไม่มีสิทธิ์
                              </span>
                            ) : (
                              roles.map((role) => (
                                <Badge
                                  key={role.id}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {ROLE_LABELS[role.role]}
                                  <button
                                    onClick={() => removeRoleMutation.mutate(role.id)}
                                    className="ml-1 hover:text-destructive"
                                    disabled={removeRoleMutation.isPending}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={selectedRole[profile.id] || ""}
                              onValueChange={(value) =>
                                setSelectedRole((prev) => ({
                                  ...prev,
                                  [profile.id]: value as AppRole,
                                }))
                              }
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue placeholder="เลือกสิทธิ์" />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(ROLE_LABELS) as AppRole[]).map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {ROLE_LABELS[role]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleAddRole(profile.id)}
                              disabled={!selectedRole[profile.id] || addRoleMutation.isPending}
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
