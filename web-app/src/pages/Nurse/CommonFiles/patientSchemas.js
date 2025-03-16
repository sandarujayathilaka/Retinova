// patientSchemas.js
import { z } from "zod";

// Step 1 schema
export const step1Schema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  birthDate: z.string().min(1, { message: "Date of birth is required." }),
  nic: z.string().min(10, { message: "NIC must be at least 10 characters." }),
  gender: z.enum(["Male", "Female", "Other"], { message: "Gender is required." }),
  contactNumber: z
    .string()
    .min(1, { message: "Number is required." })
    .regex(/^\d{10}$/, { message: "Number is invalid." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email address." }),
});

// Step 2 schema
export const step2Schema = z.object({
  bloodType: z.string().optional(),
  height: z.number().min(0, { message: "Height cannot be negative" }).optional().or(z.literal("")),
  weight: z.number().min(0, { message: "Weight cannot be negative" }).optional().or(z.literal("")),
  allergies: z.array(z.string()).optional(),
  primaryPhysician: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z
        .string()
        .optional()
        .refine(
          (val) => !val || /^\d{10}$/.test(val),
          { message: "Phone number must be a valid 10-digit number if provided." }
        ),
    })
    .optional()
    .refine(
      (data) => {
        // If emergencyContact is not provided or no subfields are filled, validation passes
        if (!data || (!data.name && !data.relationship && !data.phone)) {
          return true;
        }
        // If any subfield is provided, all must be present
        return data.name && data.relationship && data.phone;
      },
      {
        message: "If any emergency contact detail is provided, all fields (name, relationship, phone) are required.",
        path: ["emergencyContact"],
      }
    ),
});