import * as moment from 'moment';

import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import {
  DistanceRangeGlobalRetributionRule,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OperatorIdsGlobalRetributionRule,
  RankGlobalRetributionRule,
  TripRestrictionRetributionRule,
  TimeRetributionRule,
  WeekdayRetributionRule,
} from '~/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import {
  AmountRetributionRule,
  ForDriverRetributionRule,
  ForPassengerRetributionRule,
  FreeRetributionRule,
  PerKmRetributionRule,
  PerPassengerRetributionRule,
  RangeRetributionRule,
} from '~/core/interfaces/campaign/api-format/campaign-rules.interface';
import { TemplateInterface } from '~/core/interfaces/campaign/templateInterface';
import { RestrictionPeriodsEnum, RestrictionTargetsEnum } from '~/core/enums/campaign/restrictions.enum';
import { CampaignInterface } from '~/core/entities/api/shared/common/interfaces/CampaignInterface';

import { CampaignsGenerator } from '../../generators/campaigns.generator';
import { operatorStubs } from '../operator/operator.list';
import { territoryStub } from '../territory/territory.find';
import { CypressExpectedCampaign } from '../../expectedApiPayload/expectedCampaign';

export const campaignTemplateStubs: TemplateInterface[] = [
  {
    _id: 51,
    parent_id: null,
    territory_id: null,
    status: CampaignStatusEnum.TEMPLATE,
    name: 'Encourager financièrement le covoiturage',
    description: "Campagne d'incitation financière au covoiturage à destination des conducteurs et des passagers.",
    global_rules: [
      new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.B, TripRankEnum.C]),
      new DistanceRangeGlobalRetributionRule({
        min: 2000,
        max: 150000,
      }),
      new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
    ],
    rules: [
      [
        new RangeRetributionRule({
          min: 0,
          max: 50000,
        }),
        new ForPassengerRetributionRule(),
        new AmountRetributionRule(10),
        new PerKmRetributionRule(),
      ],
      [
        new RangeRetributionRule({
          min: 0,
          max: 50000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(10),
        new PerPassengerRetributionRule(),
        new PerKmRetributionRule(),
      ],
      [
        new RangeRetributionRule({
          min: 50000,
          max: 150000,
        }),
        new ForPassengerRetributionRule(),
        new AmountRetributionRule(500),
      ],
      [
        new RangeRetributionRule({
          min: 50000,
          max: 150000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(500),
        new PerPassengerRetributionRule(),
      ],
    ],
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
      insee_filter: {
        whiteList: [],
        blackList: [],
      },
    },
    start_date: null,
    end_date: null,
    unit: IncentiveUnitEnum.EUR,
  },
  {
    _id: 52,
    parent_id: null,
    territory_id: null,
    status: CampaignStatusEnum.TEMPLATE,
    name: 'Récompenser le covoiturage',
    description:
      "Campagne d'incitation basée sur un système de gratification par points donnant accès à un catalogue de récompenses (place de parking, place de piscine, composteur, etc.)",
    global_rules: [
      new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.B, TripRankEnum.C]),
      new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
      new DistanceRangeGlobalRetributionRule({
        min: 2000,
        max: 150000,
      }),
    ],
    rules: [
      [
        new RangeRetributionRule({
          min: 0,
          max: 50000,
        }),
        new ForPassengerRetributionRule(),
        new AmountRetributionRule(1),
        new PerKmRetributionRule(),
      ],
      [
        new RangeRetributionRule({
          min: 0,
          max: 50000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(1),
        new PerPassengerRetributionRule(),
        new PerKmRetributionRule(),
      ],
      [
        new RangeRetributionRule({
          min: 50000,
          max: 150000,
        }),
        new ForPassengerRetributionRule(),
        new AmountRetributionRule(50),
      ],
      [
        new RangeRetributionRule({
          min: 50000,
          max: 150000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(50),
        new PerPassengerRetributionRule(),
      ],
    ],
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
      insee_filter: {
        whiteList: [],
        blackList: [],
      },
    },
    start_date: null,
    end_date: null,
    unit: IncentiveUnitEnum.POINT,
  },
  {
    _id: 53,
    parent_id: null,
    territory_id: null,
    status: CampaignStatusEnum.TEMPLATE,
    name: 'Limiter le trafic en semaine',
    description: "Campagne d'incitation pour limiter le trafic en semaine.",
    global_rules: [
      new WeekdayRetributionRule([0, 1, 2, 3, 4]),
      new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.B, TripRankEnum.C]),
      new TimeRetributionRule([
        {
          start: 6,
          end: 20,
        },
      ]),
      new DistanceRangeGlobalRetributionRule({
        min: 2000,
        max: 150000,
      }),
      new TripRestrictionRetributionRule(RestrictionTargetsEnum.DRIVER, 8, RestrictionPeriodsEnum.DAY),
      new TripRestrictionRetributionRule(RestrictionTargetsEnum.PASSENGER, 2, RestrictionPeriodsEnum.DAY),
    ],
    rules: [
      [
        new RangeRetributionRule({
          min: 0,
          max: 50000,
        }),
        new ForPassengerRetributionRule(),
        new AmountRetributionRule(10),
        new PerKmRetributionRule(),
      ],
      [
        new RangeRetributionRule({
          min: 0,
          max: 50000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(10),
        new PerPassengerRetributionRule(),
        new PerKmRetributionRule(),
      ],
      [
        new RangeRetributionRule({
          min: 50000,
          max: 150000,
        }),
        new ForPassengerRetributionRule(),
        new AmountRetributionRule(500),
      ],
      [
        new RangeRetributionRule({
          min: 50000,
          max: 150000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(500),
        new PerPassengerRetributionRule(),
      ],
    ],
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
      insee_filter: {
        whiteList: [],
        blackList: [],
      },
    },
    start_date: null,
    end_date: null,
    unit: IncentiveUnitEnum.EUR,
  },
  {
    _id: 54,
    parent_id: null,
    territory_id: null,
    status: CampaignStatusEnum.TEMPLATE,
    name: 'Limiter la pollution',
    description:
      "Campagne d'incitation financière activable en cas de pic de pollution pour encourager le covoiturage.",
    global_rules: [
      new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
      new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.B, TripRankEnum.C]),
      new DistanceRangeGlobalRetributionRule({
        min: 2000,
        max: 150000,
      }),
      new TripRestrictionRetributionRule(RestrictionTargetsEnum.DRIVER, 8, RestrictionPeriodsEnum.DAY),
      new TripRestrictionRetributionRule(RestrictionTargetsEnum.PASSENGER, 2, RestrictionPeriodsEnum.DAY),
    ],
    rules: [
      [
        new RangeRetributionRule({
          min: 0,
          max: 50000,
        }),
        new ForPassengerRetributionRule(),
        new FreeRetributionRule(),
      ],
      [
        new RangeRetributionRule({
          min: 0,
          max: 50000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(10),
        new PerPassengerRetributionRule(),
        new PerKmRetributionRule(),
      ],
      [
        new RangeRetributionRule({
          min: 50000,
          max: 150000,
        }),
        new ForPassengerRetributionRule(),
        new AmountRetributionRule(500),
      ],
      [
        new RangeRetributionRule({
          min: 50000,
          max: 150000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(500),
        new PerPassengerRetributionRule(),
      ],
    ],
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
      insee_filter: {
        whiteList: [],
        blackList: [],
      },
    },
    start_date: null,
    end_date: null,
    unit: IncentiveUnitEnum.EUR,
  },
  {
    _id: 55,
    parent_id: null,
    territory_id: null,
    status: CampaignStatusEnum.TEMPLATE,
    name: 'Limiter les embouteillages du week-end',
    description:
      "Campagne d'incitation financière pour limiter les embouteillages les week-end notamment en cas de chassé croisé. ",
    global_rules: [
      new WeekdayRetributionRule([4, 6]),
      new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.B, TripRankEnum.C]),
      new DistanceRangeGlobalRetributionRule({
        min: 2000,
        max: 150000,
      }),
      new TimeRetributionRule([
        {
          start: 12,
          end: 23,
        },
      ]),
    ],
    rules: [
      [
        new RangeRetributionRule({
          min: 0,
          max: 50000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(10),
        new PerPassengerRetributionRule(),
        new PerKmRetributionRule(),
      ],
      [
        new RangeRetributionRule({
          min: 50000,
          max: 150000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(500),
        new PerPassengerRetributionRule(),
      ],
    ],
    ui_status: {
      for_driver: true,
      for_passenger: false,
      for_trip: false,
      staggered: false,
      insee_filter: {
        whiteList: [],
        blackList: [],
      },
    },
    start_date: null,
    end_date: null,
    unit: IncentiveUnitEnum.EUR,
  },
  {
    _id: 56,
    parent_id: null,
    territory_id: null,
    status: CampaignStatusEnum.TEMPLATE,
    name: "Limiter le trafic lors d'un évènement ponctuel",
    description: "Campagne d'incitation financière au covoiturage pour un événement ponctuel.",
    global_rules: [
      new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
      new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.B, TripRankEnum.C]),
      new DistanceRangeGlobalRetributionRule({
        min: 2000,
        max: 150000,
      }),
    ],
    rules: [
      [
        new RangeRetributionRule({
          min: 0,
          max: 50000,
        }),
        new ForPassengerRetributionRule(),
        new AmountRetributionRule(10),
        new PerKmRetributionRule(),
      ],
      [
        new RangeRetributionRule({
          min: 0,
          max: 50000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(10),
        new PerPassengerRetributionRule(),
        new PerKmRetributionRule(),
      ],
      [
        new RangeRetributionRule({
          min: 50000,
          max: 150000,
        }),
        new ForPassengerRetributionRule(),
        new AmountRetributionRule(500),
      ],
      [
        new RangeRetributionRule({
          min: 50000,
          max: 150000,
        }),
        new ForDriverRetributionRule(),
        new AmountRetributionRule(500),
        new PerPassengerRetributionRule(),
      ],
    ],
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
      insee_filter: {
        whiteList: [],
        blackList: [],
      },
    },
    start_date: null,
    end_date: null,
    unit: IncentiveUnitEnum.EUR,
  },
  {
    _id: 57,
    parent_id: null,
    territory_id: null,
    status: CampaignStatusEnum.TEMPLATE,
    name: 'Gratuité du covoiturage pour les passagers',
    description:
      "Campagne d'incitation ou la participation financière du passager est pris en charge par la collectivité.",
    global_rules: [
      new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.B, TripRankEnum.C]),
      new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
      new DistanceRangeGlobalRetributionRule({
        min: 2000,
        max: 150000,
      }),
    ],
    rules: [[new ForPassengerRetributionRule(), new FreeRetributionRule()]],
    ui_status: {
      for_driver: false,
      for_passenger: true,
      for_trip: false,
      staggered: false,
      insee_filter: {
        whiteList: [],
        blackList: [],
      },
    },
    start_date: null,
    end_date: null,
    unit: IncentiveUnitEnum.EUR,
  },
];

export const campaignStubs: CampaignInterface[] = [
  {
    _id: 31,
    parent_id: campaignTemplateStubs[0]._id,
    status: CampaignStatusEnum.VALIDATED,
    name: 'Encourager le covoiturage',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
    start_date: moment()
      .subtract('1', 'months')
      .toDate(),
    end_date: moment()
      .add('2', 'months')
      .toDate(),
    unit: IncentiveUnitEnum.EUR,
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    global_rules: [
      new MaxAmountRetributionRule(10000),
      new MaxTripsRetributionRule(Math.floor(Math.random() * 20000)),
      new DistanceRangeGlobalRetributionRule({
        min: 0,
        max: 15000,
      }),
      new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
      new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.C]),
      new OperatorIdsGlobalRetributionRule([operatorStubs[0]._id]),
      new TimeRetributionRule([
        {
          start: 8,
          end: 9,
        },
      ]),
    ],
    rules: [[new ForPassengerRetributionRule(), new AmountRetributionRule(100)]],
    trips_number: Math.floor(Math.random() * 10000),
    amount_spent: 5000,
    territory_id: territoryStub._id,
  },
  {
    _id: 32,
    parent_id: campaignTemplateStubs[0]._id,
    territory_id: null,
    status: CampaignStatusEnum.VALIDATED,
    name: 'Limiter le trafic en semaine',
    description: 'Fusce vehicula dolor arcu, sit amet blandit dolor mollis.',
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    global_rules: [
      new MaxAmountRetributionRule(10000),
      new MaxTripsRetributionRule(Math.floor(Math.random() * 20000)),
      new DistanceRangeGlobalRetributionRule({
        min: 0,
        max: 15000,
      }),
      new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
      new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.C]),
      new OperatorIdsGlobalRetributionRule([operatorStubs[0]._id]),
      new TimeRetributionRule([
        {
          start: 8,
          end: 9,
        },
      ]),
    ],
    rules: [[new ForPassengerRetributionRule(), new AmountRetributionRule(100)]],
    start_date: moment()
      .subtract('1', 'months')
      .toDate(),
    end_date: moment()
      .add('2', 'months')
      .toDate(),
    unit: IncentiveUnitEnum.EUR,
    trips_number: Math.floor(Math.random() * 10000),
    amount_spent: 5000,
    territory_id: territoryStub._id,
  },
  {
    _id: 33,
    parent_id: null,
    territory_id: null,
    status: CampaignStatusEnum.VALIDATED,
    name: 'Limiter la pollution',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    start_date: moment()
      .subtract('1', 'months')
      .toDate(),
    end_date: moment()
      .add('2', 'months')
      .toDate(),
    unit: IncentiveUnitEnum.EUR,
    global_rules: [
      new MaxAmountRetributionRule(10000),
      new MaxTripsRetributionRule(Math.floor(Math.random() * 20000)),
      new DistanceRangeGlobalRetributionRule({
        min: 0,
        max: 15000,
      }),
      new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
      new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.C]),
      new OperatorIdsGlobalRetributionRule([operatorStubs[0]._id]),
      new TimeRetributionRule([
        {
          start: 8,
          end: 9,
        },
      ]),
    ],
    rules: [[new ForPassengerRetributionRule(), new AmountRetributionRule(100)]],
    trips_number: Math.floor(Math.random() * 10000),
    amount_spent: 5000,
    territory_id: territoryStub._id,
  },
  CypressExpectedCampaign.getAfterCreate(),
];

export function stubCampaignList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=campaign:list',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: [...campaignStubs, ...CampaignsGenerator.list, ...campaignTemplateStubs],
          },
        },
      ],
  });
}
