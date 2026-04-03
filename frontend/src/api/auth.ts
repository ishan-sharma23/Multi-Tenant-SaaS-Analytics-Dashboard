import api from "./axios";
import { AuthApiPayload } from "../types/auth";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export async function login(payload: {
  tenantSlug: string;
  email: string;
  password: string;
}): Promise<AuthApiPayload> {
  const response = await api.post<ApiEnvelope<AuthApiPayload>>("/auth/login", payload);
  return response.data.data;
}

export async function register(payload: {
  tenantSlug: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}): Promise<AuthApiPayload> {
  const response = await api.post<ApiEnvelope<AuthApiPayload>>("/auth/register", payload);
  return response.data.data;
}
