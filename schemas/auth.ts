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

/**
 * Name rules mirror the backend PasswordRegisterRequestDTO:
 * 2-50 chars, letters only, with space / apostrophe / hyphen allowed as
 * internal separators ("Mary Jane", "O'Brien", "Smith-Jones").
 */
const nameSchema = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .min(2, `${label} must be at least 2 characters`)
    .max(50, `${label} must not exceed 50 characters`)
    .regex(
      /^[a-zA-Z]+(?:[ '-][a-zA-Z]+)*$/,
      `${label} can only contain letters, with spaces, hyphens, or apostrophes between them`,
    );

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: passwordSchema,
});

export type LoginForm = z.infer<typeof loginSchema>;

/** Step 1 of registration — who the user is. */
export const registerIdentitySchema = z.object({
  firstName: nameSchema("First name"),
  lastName: nameSchema("Last name"),
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must not exceed 255 characters")
    .email("Enter a valid email"),
});

export type RegisterIdentityForm = z.infer<typeof registerIdentitySchema>;

/**
 * Step 2 of registration — credentials. confirmPassword exists only for
 * this form; it is never stored or sent to the API.
 */
export const registerPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterPasswordForm = z.infer<typeof registerPasswordSchema>;

/** Full registration payload shape (what the register API will receive). */
export type RegisterForm = RegisterIdentityForm & { password: string };
