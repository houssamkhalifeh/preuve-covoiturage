import { RestrictionPeriodsEnum, RestrictionTargetsEnum } from '~/core/enums/campaign/restrictions.enum';

import { CAMPAIGN_RULES_MAX_DISTANCE_KM } from '../../../src/app/core/const/campaign/rules.const';
import { Campaign } from '../../../src/app/core/entities/campaign/api-format/campaign';
import {
  BlackListGlobalRetributionRule,
  DistanceRangeGlobalRetributionRule,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OperatorIdsGlobalRetributionRule,
  RankGlobalRetributionRule,
  TripRestrictionRetributionRule,
  TimeRetributionRule,
  WeekdayRetributionRule,
} from '../../../src/app/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import {
  AmountRetributionRule,
  ForDriverRetributionRule,
  ForPassengerRetributionRule,
  PerKmRetributionRule,
  RangeRetributionRule,
} from '../../../src/app/core/interfaces/campaign/api-format/campaign-rules.interface';
import { UserGroupEnum } from '../../../src/app/core/enums/user/user-group.enum';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';
import { IncentiveUnitEnum } from '../../../src/app/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { operatorStubs } from '../stubs/operator/operator.list';
import { cypress_logging_users } from '../stubs/auth/login';

export class CypressExpectedCampaign {
  static startMoment = Cypress.moment()
    .add(1, 'days')
    .startOf('day');
  static endMoment = Cypress.moment()
    .add(3, 'months')
    .endOf('day');

  static maxAmount = 10000;
  static maxTrips = 50000;
  static forDriverAmount = 10; // cents
  static description = `Description de la campagne`;
  static campaignName = `Nouvelle campagne d'incitation ${Math.floor(Math.random() * 100)}`;

  static afterEditionForPassengerAmount = 10; // cents
  static afterEditionForDriverAmount5km = 20; // cents
  static afterEditionForPassengerAmount5km = 20; // cents
  static staggeredDistance = 5000; // meters

  static firstTimeStart = 8;
  static firstTimeEnd = 12;

  static secondTimeStart = 18;
  static secondTimeEnd = 22;

  // restrictions
  static firstRestrictionAmount = 5;
  static secondRestrictionAmount = 6;

  static get(): Campaign {
    return new Campaign({
      _id: null,
      start_date: <any>CypressExpectedCampaign.startMoment.toISOString(),
      end_date: <any>CypressExpectedCampaign.endMoment.toISOString(),
      unit: IncentiveUnitEnum.EUR,
      description: CypressExpectedCampaign.description,
      name: CypressExpectedCampaign.campaignName,
      global_rules: [
        new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.C]),
        new TimeRetributionRule([
          {
            start: CypressExpectedCampaign.firstTimeStart,
            end: CypressExpectedCampaign.firstTimeEnd,
          },
          {
            start: CypressExpectedCampaign.secondTimeStart,
            end: CypressExpectedCampaign.secondTimeEnd,
          },
        ]),
        new WeekdayRetributionRule([1]),
        new OperatorIdsGlobalRetributionRule([operatorStubs[0]._id]),
        new DistanceRangeGlobalRetributionRule({
          min: 2000,
          max: 150000,
        }),
        new BlackListGlobalRetributionRule([
          {
            start: ['69123'],
            end: ['13055'],
          },
          {
            start: ['75056'],
            end: ['91377'],
          },
        ]),
        new MaxAmountRetributionRule(CypressExpectedCampaign.maxAmount),
        new MaxTripsRetributionRule(CypressExpectedCampaign.maxTrips),
        new TripRestrictionRetributionRule(
          RestrictionTargetsEnum.PASSENGER,
          CypressExpectedCampaign.firstRestrictionAmount,
          RestrictionPeriodsEnum.ALL,
        ),
        new TripRestrictionRetributionRule(
          RestrictionTargetsEnum.DRIVER,
          CypressExpectedCampaign.secondRestrictionAmount,
          RestrictionPeriodsEnum.DAY,
        ),
      ],
      rules: [
        [
          new ForDriverRetributionRule(),
          new AmountRetributionRule(CypressExpectedCampaign.forDriverAmount),
          new PerKmRetributionRule(),
        ],
      ],
      ui_status: {
        for_driver: true,
        for_passenger: false,
        for_trip: false,
        staggered: false,
        insee_filter: {
          blackList: [
            {
              start: [
                {
                  territory_literal: 'Lyon',
                  insees: ['69123'],
                  context: '69, Rh\u00f4ne, Auvergne-Rh\u00f4ne-Alpes',
                },
              ],
              end: [
                {
                  territory_literal: 'Marseille',
                  insees: ['13055'],
                  context: "13, Bouches-du-Rh\u00f4ne, Provence-Alpes-C\u00f4te d'Azur",
                },
              ],
            },
            {
              start: [
                {
                  territory_literal: 'Paris',
                  insees: ['75056'],
                  context: '75, Paris, \u00cele-de-France',
                },
              ],
              end: [
                {
                  territory_literal: 'Massy',
                  insees: ['91377'],
                  context: '91, Essonne, \u00cele-de-France',
                },
              ],
            },
          ],
          whiteList: [],
        },
      },
      status: CampaignStatusEnum.DRAFT,
      parent_id: null,
      territory_id: cypress_logging_users[UserGroupEnum.TERRITORY].territory_id,
    });
  }

  static getAfterCreate(): Campaign {
    const afterCreationCampaign = CypressExpectedCampaign.get();
    afterCreationCampaign._id = 1;
    return afterCreationCampaign;
  }

  static getAfterEdition(): Campaign {
    const afterEditionCampaign = CypressExpectedCampaign.getAfterCreate();
    afterEditionCampaign.rules[0].unshift(
      new RangeRetributionRule({
        min: 2000,
        max: CypressExpectedCampaign.staggeredDistance,
      }),
    );
    afterEditionCampaign.rules.unshift([
      new RangeRetributionRule({
        min: 2000,
        max: CypressExpectedCampaign.staggeredDistance,
      }),
      new ForPassengerRetributionRule(),
      new AmountRetributionRule(CypressExpectedCampaign.afterEditionForPassengerAmount),
    ]);
    afterEditionCampaign.rules.push([
      new RangeRetributionRule({
        min: CypressExpectedCampaign.staggeredDistance,
        max: CAMPAIGN_RULES_MAX_DISTANCE_KM * 1000,
      }),
      new ForPassengerRetributionRule(),
      new AmountRetributionRule(CypressExpectedCampaign.afterEditionForPassengerAmount5km),
    ]);
    afterEditionCampaign.rules.push([
      new RangeRetributionRule({
        min: CypressExpectedCampaign.staggeredDistance,
        max: CAMPAIGN_RULES_MAX_DISTANCE_KM * 1000,
      }),
      new ForDriverRetributionRule(),
      new AmountRetributionRule(CypressExpectedCampaign.afterEditionForDriverAmount5km),
    ]);
    afterEditionCampaign.ui_status.for_passenger = true;
    afterEditionCampaign.ui_status.staggered = true;
    return afterEditionCampaign;
  }

  static getLaunched(): Campaign {
    const launchedCampaign = CypressExpectedCampaign.getAfterEdition();
    launchedCampaign.status = CampaignStatusEnum.PENDING;
    return launchedCampaign;
  }
}
