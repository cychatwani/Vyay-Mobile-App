import { z } from "zod";

/**
 * Password rules mirror the backend StandardPasswordPolicy
 * (com.vyay.core.security). Keep these in sync — if the server policy
 * changes, update here too.
 */
const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(10, "Password must be at least 10 characters")
  .max(72, "Password must not exceed 72 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a digit")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character")
  .refine((val) => !val.includes(" "), "Must not contain spaces");

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: passwordSchema,
});

export type LoginForm = z.infer<typeof loginSchema>;
