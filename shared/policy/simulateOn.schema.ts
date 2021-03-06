import { schema as campaignSchema } from './create.schema';

export const alias = 'campaign.simulateOn';

export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['campaign'],
  properties: {
    campaign: campaignSchema,
  },
};

export const binding = [alias, schema];
