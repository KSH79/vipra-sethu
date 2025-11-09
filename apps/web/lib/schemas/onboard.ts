import { z } from "zod";

export const onboardSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone is required"),
  whatsapp: z.union([z.string().min(0), z.literal("")]).optional(),
  category: z.string().min(1, "Category is required"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  sampradaya: z.union([z.string().min(0), z.literal("")]).optional(),
  serviceRadius: z.union([z.string().min(0), z.literal("")]).optional(),
  photo: z.any().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
});

export type OnboardFormValues = z.infer<typeof onboardSchema>;
