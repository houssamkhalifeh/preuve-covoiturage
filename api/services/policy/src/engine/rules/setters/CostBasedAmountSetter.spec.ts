import test from 'ava';

import { CostBasedAmountSetter } from './CostBasedAmountSetter';
import { faker } from '../../helpers/faker';
import { TripInterface } from '../../../interfaces';

function setup(): { rule: CostBasedAmountSetter; trip: TripInterface } {
  const rule = new CostBasedAmountSetter();
  const trip = faker.trip([{ cost: 10 }, { cost: -10 }]);

  return { rule, trip };
}

test('should replace result by cost', async (t) => {
  const { rule, trip } = setup();
  const context = {
    trip,
    stack: [],
    result: 0,
    person: trip[0],
  };
  await rule.apply(context);
  t.is(context.result, trip[0].cost);

  const context2 = {
    trip,
    stack: [],
    result: 0,
    person: trip[1],
  };
  await rule.apply(context2);
  t.is(context2.result, Math.abs(trip[1].cost));
});
