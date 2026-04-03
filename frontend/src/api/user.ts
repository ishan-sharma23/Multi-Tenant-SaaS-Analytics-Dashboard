import api from "./axios";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface CurrentUserResponse {
  id: number;
  tenantId: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<"admin" | "user">;
}

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  const response = await api.get<ApiEnvelope<CurrentUserResponse>>("/users/me");
  return response.data.data;
}
