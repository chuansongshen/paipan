import { z } from 'zod';

const createOrderSchema = z.object({
  productType: z.enum(['report_unlock', 'follow_up_pack']),
  payerOpenId: z.string().trim().optional(),
  reportId: z.string().trim().optional(),
  userId: z.string().trim().optional()
});

export function parseCreateOrderRequest(input) {
  return createOrderSchema.parse(input);
}

const orderIdSchema = z.object({
  orderId: z.string().trim().min(1)
});

export function parseOrderIdParams(input) {
  return orderIdSchema.parse(input);
}
