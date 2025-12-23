
import { z } from 'zod';
import apiClient from '../lib/apiClient';

// ---------- Schema ----------
export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  // Never expose password from server; keep only on inbound payload.
  createdAt: z.string().datetime(),
  lastLogin: z.string().datetime().nullable().optional(),
  disabled: z.boolean().default(false),
});
export type User = z.infer<typeof UserSchema>;

export const SignupSchema = z.object({
    firstname: z.string().min(1, 'First name is required'),
    lastname: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });
export type SignupPayload = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });
  
export type LoginPayload = z.infer<typeof LoginSchema>;

// ---------- Services (/api/users/*) ----------
const BASE = "/users";

export const signup = async (payload: SignupPayload) => {
  const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
  const emailExists = existingUsers.some(
    (u: any) => u.email.toLowerCase() === payload.email.toLowerCase()
  );

  if (emailExists) {
    // ✅ Must return after throwing to stop execution completely
    throw { code: "duplicate_email", message: "Email already registered" };
  }

  // ⛔ This should never run if a dupe is detected
  const res = await apiClient.post(`/users/signup`, payload);
  const data = res.data.user;

  const updatedUsers = [...existingUsers, data];
  localStorage.setItem("users", JSON.stringify(updatedUsers));

  return data;
};


  export const LoginResponseSchema = z.object({
    message: z.string(),
    user: z.object({
      id: z.string(),
      firstname: z.string(),
      lastname: z.string(),
      email: z.string().email(),
    }),
  });
  export type LoginResponse = z.infer<typeof LoginResponseSchema>;
  

  export const login = async (payload: LoginPayload): Promise<User> => {
    const res = await apiClient.post(`${BASE}/login`, payload);
  
    const parsed = LoginResponseSchema.parse(res.data);
  
    // you can reuse the existing User type for consistency
    return {
      id: parsed.user.id,
      firstName: parsed.user.firstname,
      lastName: parsed.user.lastname,
      email: parsed.user.email,
      createdAt: new Date().toISOString(), // if backend doesn’t send it
      disabled: false,
    };
  };
  

export const logout = async (): Promise<void> => {
  await apiClient.post(`${BASE}/logout`);
};

export const me = async (): Promise<User> => {
  const res = await apiClient.get(`${BASE}/me`);
  return UserSchema.parse(res.data);
};

export const checkAuth = async (): Promise<{ authenticated: boolean; user?: User }> => {
  const res = await apiClient.get(`${BASE}/check`);
  // If backend returns just the user or a boolean, adjust here.
  try {
    const user = UserSchema.parse(res.data);
    return { authenticated: true, user };
  } catch {
    return { authenticated: !!res.data?.authenticated, user: undefined };
  }
};



export type SignupForm = z.infer<typeof SignupSchema>;

export type LoginForm = z.infer<typeof LoginSchema>;
