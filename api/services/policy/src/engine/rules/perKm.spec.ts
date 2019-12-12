import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { perKm } from './perKm';
import { MetadataWrapper } from '../MetadataWrapper';
import { faker } from '../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;
const apply = perKm.apply(true);

const trip = faker.trip([{ distance: 10000 }, { distance: 20000 }]);

describe('Policy rule: per km', () => {
  it('should multiply result by distance in km', async () => {
    const context = {
      result: 1,
      person: trip.people[0],
      trip,
      meta,
    };
    await apply(context, async () => {});
    expect(context.result).to.eq(trip.people[0].distance / 1000);
  });
});
