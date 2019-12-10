import { expect } from 'chai';

import { TripInterface, CampaignInterface } from '../../src/interfaces';
import { PolicyEngine } from '../../src/engine/PolicyEngine';
import { helper } from './helper';
import { eventTrafficLimitPolicy } from '../../src/engine/template';
import { trips as fakeTrips } from './trips';

describe('Template: eventTrafficLimitPolicy', () => {
  const template: CampaignInterface = {
    ...eventTrafficLimitPolicy,
    territory_id: 1,
    status: 'active',
    start_date: new Date('2019-01-15T00:00:00.000Z'),
    end_date: new Date('2019-01-15T23:59:59.999Z'),
  };

  const trips: TripInterface[] = [...fakeTrips];

  const { up, down } = helper();
  let engine: PolicyEngine;
  let policy_id: number;

  before(async () => {
    ({ engine, policy_id } = await up(template));
  });

  after(async () => {
    await down();
  });

  it('should work', async () => {
    const results = [];
    for (const trip of trips) {
      const r = await engine.process(trip);
      results.push(...r);
    }
    expect(results).to.deep.members([
      { policy_id, acquisition_id: 3, identity_uuid: '4', amount: 100 },
      { policy_id, acquisition_id: 3, identity_uuid: '5', amount: 50 },
      { policy_id, acquisition_id: 4, identity_uuid: '4', amount: 300 },
      { policy_id, acquisition_id: 4, identity_uuid: '5', amount: 75 },
      { policy_id, acquisition_id: 5, identity_uuid: '4', amount: 1000 },
      { policy_id, acquisition_id: 5, identity_uuid: '5', amount: 500 },
    ]);
  });
});
