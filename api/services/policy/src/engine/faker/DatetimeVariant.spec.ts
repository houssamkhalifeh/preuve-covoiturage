import test from 'ava';

import { DatetimeVariant } from './DatetimeVariant';
import { FakerEngine } from './FakerEngine';

test('should fill datetime', (t) => {
  let start = new Date();
  start.setHours(0, 0, 0, 0);
  let end = new Date();
  end.setDate(start.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  let datetimeVariant = new DatetimeVariant({
    start,
    end,
    weekday: 10,
    hours: {
      night: 0,
      morning: 0,
      lunch: 10,
      afternoon: 0,
      evening: 0,
    },
  });
  let trip = FakerEngine.getBasicTrip(1);
  let completedTrip = datetimeVariant.generate(trip);
  let datetime = completedTrip[0].datetime;

  for (let d of completedTrip.map((t) => t.datetime)) {
    t.is(d, datetime);
  }

  t.log(datetime);
  // is on date range
  t.true(datetime >= start);
  t.true(datetime <= end);

  // is on hour range
  t.true(datetime.getHours() >= 11);
  t.true(datetime.getHours() <= 15);

  // is on weekday range
  t.true(datetime.getDay() > 0);
  t.true(datetime.getDay() < 6);
});
