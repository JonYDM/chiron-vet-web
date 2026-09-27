import { http } from "@/lib/http";
import type { LoginRequest, LoginResponse } from "@/types/api";

/** Llama al endpoint público de login. */
export function login(body: LoginRequest): Promise<LoginResponse> {
  return http.post<LoginResponse>("/api/auth/login", body);
}
