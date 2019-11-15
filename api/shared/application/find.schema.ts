export const alias = 'application.find';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['uuid', 'owner_id', 'owner_service'],
  additionalProperties: false,
  properties: {
    uuid: { macro: 'dbid' },
    owner_id: { macro: 'dbid' },
    owner_service: { enum: ['operator'] },
  },
};
export const binding = [alias, schema];
