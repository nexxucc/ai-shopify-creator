const { z } = require('zod');

const storeCreateSchema = z.object({
  niche: z.string().min(3).max(200),
  targetAudience: z.string().min(10).max(500),
  budgetTier: z.enum(['budget', 'mid', 'premium', 'luxury']),
  uniqueSellingPoint: z.string().min(10).max(500),
  contactEmail: z.string().email(),
  productCount: z.number().min(5).max(100).default(20)
});

module.exports = { storeCreateSchema };
