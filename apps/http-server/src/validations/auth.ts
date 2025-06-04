import { z } from 'zod';

// Signup validation schema
export const signupSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address" })
    .min(5, { message: "Email must be at least 5 characters" })
    .max(255, { message: "Email cannot exceed 255 characters" }),
  
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name cannot exceed 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { 
      message: "Name can only contain letters, spaces, hyphens, and apostrophes" 
    }),
  
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password cannot exceed 100 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" })
});

// Type inference for TypeScript
export type SignupInput = z.infer<typeof signupSchema>;