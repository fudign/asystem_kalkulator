import { z } from 'zod';

export const serviceOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().min(0),
  description: z.string(),
  hasQuantity: z.boolean().default(false),
  minQuantity: z.number().min(1).optional(),
  maxQuantity: z.number().optional(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  options: z.array(serviceOptionSchema),
});

export type ServiceOption = z.infer<typeof serviceOptionSchema>;
export type Category = z.infer<typeof categorySchema>;
