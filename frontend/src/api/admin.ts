import api from "./axios";

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  plan: "free" | "pro" | "enterprise";
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<ApiEnvelope<AdminUser[]>>("/admin/users");
  return response.data.data;
}

export async function updateUserRole(userId: number, role: "admin" | "user"): Promise<void> {
  await api.put(`/admin/users/${userId}/role`, { role });
}

export async function deleteAdminUser(userId: number): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
}
