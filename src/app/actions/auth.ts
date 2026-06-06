import { login as storeLogin, logout as storeLogout } from "@/lib/auth-store";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const result = storeLogin(email, password);
  if (result.error) return { error: result.error };
  return { success: true };
}

export async function logout() {
  storeLogout();
  return { success: true };
}
