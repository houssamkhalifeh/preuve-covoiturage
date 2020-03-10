export const territory = {
  admin: {
    slug: 'admin',
    name: 'Admin',
    permissions: [
      'company.fetch',
      'company.find',
      'user.list',
      'user.invite',
      'user.create',
      'user.read',
      'user.update',
      'user.delete',
      'territory.users.add',
      'territory.users.list',
      'territory.users.remove',
      'territory.users.send-confirm-email',
      'territory.contacts.update',
      'territory.trip.export',
      'territory.trip.list',
      'territory.trip.stats',
      'territory.update',
      'territory.stats',
      'territory.list',
      'territory.read',
      'operator.list',
      'operator.read',
      'journey.read',
      'journey.list',
      'profile.read',
      'profile.update',
      'profile.password',
      'profile.delete',
      'incentive.list',
      'incentive.read',
      'incentive-parameter.list',
      'incentive-parameter.create',
      'incentive-parameter.read',
      'incentive-parameter.update',
      'incentive-parameter.delete',
      'incentive-unit.list',
      'incentive-unit.create',
      'incentive-unit.read',
      'incentive-unit.update',
      'incentive-unit.delete',
      'incentive-policy.list',
      'incentive-policy.create',
      'incentive-policy.read',
      'incentive-policy.update',
      'incentive-policy.delete',
      'incentive-campaign.list',
      'incentive-campaign.create',
      'incentive-campaign.read',
      'incentive-campaign.update',
      'incentive-campaign.delete',
      'incentive-campaign.templates',
      'incentive-campaign.launch',
    ],
  },
  demo: {
    slug: 'demo',
    name: 'Demo',
    permissions: [
      'company.fetch',
      'company.find',
      'user.list',
      'territory.contacts.update',

      'territory.trip.list',
      'territory.trip.stats',
      'territory.update',
      'territory.stats',
      'territory.list',
      'territory.read',
      'journey.read',
      'journey.list',
      'profile.read',
      'profile.update',
      'profile.password',
      'profile.delete',
      'incentive.list',
      'incentive.read',
      'incentive-parameter.list',
      'incentive-parameter.create',
      'incentive-parameter.read',
      'incentive-parameter.update',
      'incentive-parameter.delete',
      'incentive-unit.list',
      'incentive-unit.create',
      'incentive-unit.read',
      'incentive-unit.update',
      'incentive-unit.delete',
      'incentive-policy.list',
      'incentive-policy.create',
      'incentive-policy.read',
      'incentive-policy.update',
      'incentive-policy.delete',
      'incentive-campaign.list',
      'incentive-campaign.create',
      'incentive-campaign.read',
      'incentive-campaign.update',
      'incentive-campaign.delete',
    ],
  },
  user: {
    slug: 'user',
    name: 'User',
    permissions: [
      'company.fetch',
      'company.find',
      'user.list',
      'territory.stats',
      'territory.list',
      'territory.read',
      'territory.trip.export',
      'territory.trip.list',
      'territory.trip.stats',
      'journey.read',
      'journey.list',
      'profile.read',
      'profile.update',
      'profile.password',
      'profile.delete',
      'incentive.list',
      'incentive.read',
      'incentive-parameter.list',
      'incentive-parameter.read',
      'incentive-unit.list',
      'incentive-unit.read',
      'incentive-policy.list',
      'incentive-policy.read',
      'incentive-campaign.list',
      'incentive-campaign.read',
      'incentive-campaign.templates',
      'users.list',
      'territory.users.list',
      'operator.list',
    ],
  },
};

export const operator = {
  admin: {
    slug: 'admin',
    name: 'Admin',
    permissions: [
      'company.fetch',
      'company.find',
      'user.list',
      'user.invite',
      'user.create',
      'user.read',
      'user.update',
      'user.delete',
      'territory.list',
      'territory.read',
      'operator.users.add',
      'operator.users.remove',
      'operator.users.list',
      'operator.users.send-confirm-email',
      'operator.contacts.update',
      'application.list',
      'application.find',
      'application.create',
      'application.revoke',
      'operator.list',
      'operator.read',
      'operator.update',
      'journey.read',
      'journey.create',
      'journey.list',
      'journey.import',
      'profile.read',
      'profile.update',
      'profile.password',
      'profile.delete',
      'operator.trip.export',
      'operator.trip.list',
      'operator.trip.stats',
      'incentive-campaign.list',
      'incentive-campaign.templates',
    ],
  },
  user: {
    slug: 'user',
    name: 'User',
    permissions: [
      'company.fetch',
      'company.find',
      'territory.list',
      'territory.read',
      'operator.list',
      'operator.read',
      'journey.read',
      'journey.list',
      'user.list',
      'profile.read',
      'profile.update',
      'profile.password',
      'profile.delete',
      'operator.trip.export',
      'operator.trip.list',
      'operator.trip.stats',
      'incentive-campaign.list',
      'incentive-campaign.templates',
      'user.list',
      'operator.users.list',
    ],
  },
};

export const registry = {
  admin: {
    slug: 'admin',
    name: 'Admin',
    permissions: [
      ...new Set([
        'company.fetch',
        'company.find',
        'user.list',
        'user.invite',
        'user.create',
        'user.read',
        'user.update',
        'user.delete',
        'user.send-confirm-email',
        'trip.export',
        'trip.list',
        'trip.stats',
        'operator.create',
        'operator.delete',
        'journey.import',
        'journey.process',
        ...territory.admin.permissions,
        ...operator.admin.permissions,
      ]),
    ],
  },
  user: {
    slug: 'user',
    name: 'User',
    permissions: [
      'company.fetch',
      'company.find',
      'user.list',
      'profile.read',
      'profile.update',
      'profile.password',
      'profile.delete',
      'incentive-campaign.list',
      'incentive-campaign.templates',
    ],
  },
};
