import { z } from 'zod';

const followUpSchema = z.object({
  message: z.string().trim().min(1)
});

export function parseFollowUpRequest(input) {
  return followUpSchema.parse(input);
}
