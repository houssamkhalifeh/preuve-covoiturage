import { ApiGraphTimeMode } from './ApiGraphTimeMode';

export interface TripSearchInterface {
  tz?: string;
  campaign_id?: number[];
  date?: {
    start?: Date;
    end?: Date;
  };
  days?: number[];
  status?: string;
  distance?: {
    min?: number;
    max?: number;
  };
  ranks?: string[];
  operator_id?: number[];
  territory_id?: number[];
  group_by?: ApiGraphTimeMode;
}

export interface TripSearchInterfaceWithPagination extends TripSearchInterface {
  skip: number;
  limit: number;
}
