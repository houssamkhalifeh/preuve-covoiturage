import { Trip } from '../../src/app/core/entities/trip/trip';
import { UserGroupEnum } from './../../src/app/core/enums/user/user-group.enum';

import { stubCampaignList } from '../support/stubs/campaign/campaign.list';
import { stubStatList } from '../support/stubs/stat/stat.list';
import { stubTripList } from '../support/stubs/trip/trip.list';
import { stubOperatorList } from '../support/stubs/operator/operator.list';
import { stubUserMe } from '../support/stubs/user/user.me';
import { stubTerritoryList } from '../support/stubs/territory/territory.list';
import { TripGenerator } from '../support/generators/trips.generator';
import { stubLogout } from '../support/stubs/auth/logout';
import { stubUserPatch } from '../support/stubs/user/user.patch';
import { stubMainLists } from '../support/stubs/loadMainLists';
import { testOperatorStory } from '../support/stories/operator.story';
import { stubLogin } from '../support/stubs/auth/login';
import { stubOperatorPatchContacts } from '../support/stubs/operator/operator.patchContacts';

context('OPERATOR', () => {
  const tripGenerator = new TripGenerator();
  const trips: Trip[] = [];
  for (let i = 0; i < 5; i = i + 1) {
    trips.push(tripGenerator.generateTrip());
  }

  beforeEach(() => {
    cy.server();
    stubCampaignList();
    stubOperatorList();
    stubTerritoryList();
    stubTripList(trips);
    stubStatList();
    stubOperatorPatchContacts();
    stubMainLists(UserGroupEnum.OPERATOR);
    stubLogin(UserGroupEnum.OPERATOR);
    stubUserMe(UserGroupEnum.OPERATOR);
    stubUserPatch(UserGroupEnum.OPERATOR);
    stubLogout();
  });

  testOperatorStory();
});
