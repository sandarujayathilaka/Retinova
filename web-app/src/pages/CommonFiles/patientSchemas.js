
// patientSchemas.js
import { z } from "zod";

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

export const step2Schema = z.object({
  bloodType: z.string().optional(),
  height: z.number().min(0, { message: "Height cannot be negative" }).optional().or(z.literal("")),
  weight: z.number().min(0, { message: "Weight cannot be negative" }).optional().or(z.literal("")),
  allergies: z.array(z.string()).optional(),
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
    .superRefine((data, ctx) => {
      const { name, relationship, phone } = data || {};
      const hasAnyField = name || (relationship && relationship !== "None") || phone;

      if (hasAnyField && !(name && relationship && relationship !== "None" && phone)) {
        if (!name) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["name"],
            message: "Name is required if any emergency contact field is provided.",
          });
        }
        if (!relationship || relationship === "None") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["relationship"],
            message: "Relationship is required if any emergency contact field is provided.",
          });
        }
        if (!phone) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["phone"],
            message: "Phone is required if any emergency contact field is provided.",
          });
        }
      }
    }),
});

export const validateEmergencyContact = (emergencyContact) => {
  if (!emergencyContact || emergencyContact.relationship === "None") return { valid: true, errors: {} };

  const { name, relationship, phone } = emergencyContact;
  const hasAnyField = name || (relationship && relationship !== "None") || phone;

  if (!hasAnyField) return { valid: true, errors: {} };

  const errors = {};
  if (!name) errors.name = "Name is required if any emergency contact field is provided.";
  if (!relationship || relationship === "None") errors.relationship = "Relationship is required if any emergency contact field is provided.";
  if (!phone) errors.phone = "Phone is required if any emergency contact field is provided.";
  else if (!/^\d{10}$/.test(phone)) errors.phone = "Phone must be a valid 10-digit number";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};