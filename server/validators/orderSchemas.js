import { z } from 'zod';

const createOrderSchema = z.object({
  productType: z.enum(['report_unlock', 'follow_up_pack']),
  amountFen: z.number().int().positive(),
  payerOpenId: z.string().trim().min(1),
  userId: z.string().trim().optional()
});

export function parseCreateOrderRequest(input) {
  return createOrderSchema.parse(input);
}
