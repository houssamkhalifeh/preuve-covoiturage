// tslint:disable:prefer-conditional-expression
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

import { Operator } from '~/core/entities/operator/operator';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { User } from '~/core/entities/authentication/user';
import { Territory } from '~/core/entities/territory/territory';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { OperatorApiService } from '~/modules/operator/services/operator-api.service';

@Injectable({
  providedIn: 'root',
})
export class CommonDataService {
  private _currentOperator$ = new BehaviorSubject<Operator>(null);
  private _currentTerritory$ = new BehaviorSubject<Territory>(null);

  private _territories$ = new BehaviorSubject<Territory[]>([]);
  private _operators$ = new BehaviorSubject<Operator[]>([]);
  private _campaigns$ = new BehaviorSubject<Campaign[]>([]);

  get currentOperator$(): Observable<Operator> {
    return this._currentOperator$;
  }

  get currentTerritory$(): Observable<Territory> {
    return this._currentTerritory$;
  }

  get territories$(): Observable<Territory[]> {
    return this._territories$;
  }

  get operators$(): Observable<Operator[]> {
    return this._operators$;
  }

  get campaigns$(): Observable<Campaign[]> {
    return this._campaigns$;
  }

  get currentOperator(): Operator {
    return this._currentOperator$.value;
  }

  get currentTerritory(): Territory {
    return this._currentTerritory$.value;
  }

  get territories(): Territory[] {
    return this._territories$.value;
  }

  get operators(): Operator[] {
    return this._operators$.value;
  }

  get campaigns(): Campaign[] {
    return this._campaigns$.value;
  }

  constructor(
    private operatorApiService: OperatorApiService,
    private territoryApiService: TerritoryApiService,
    private campaignService: CampaignService,
    private authenticationService: AuthenticationService,
    private jsonRPCService: JsonRPCService,
  ) {
    this.authenticationService.user$.subscribe((user) => (user ? this.loadAll().subscribe() : this.resetAll()));
  }

  loadCurrentOperator(): Observable<Operator> {
    return this.authenticationService.check().pipe(
      mergeMap<User, Observable<Operator>>((user: User) => {
        if (!user || !user.operator_id) return of<Operator>(null);
        return this.operatorApiService.getById(user.operator_id);
      }),
      tap((operator) => this._currentOperator$.next(operator)),
    );
  }

  loadCurrentTerritory(): Observable<Territory> {
    return this.authenticationService.check().pipe(
      mergeMap((user: User) => {
        if (!user || !user.territory_id) return of<Territory>(null);
        return this.territoryApiService.getById(user.territory_id);
      }),
      tap((territory) => this._currentTerritory$.next(territory)),
    );
  }

  loadOperators(): Observable<Operator[]> {
    return this.operatorApiService.getList().pipe(
      map((operators) => operators.sort((operatorA, operatorB) => (operatorA.name > operatorB.name ? 1 : -1))),
      tap((operators) => this._operators$.next(operators)),
    );
  }

  loadTerritories(): Observable<Territory[]> {
    return this.territoryApiService.getList().pipe(
      map((territories) => territories.sort((territoryA, territoryB) => (territoryA.name > territoryB.name ? 1 : -1))),
      tap((territories) => this._territories$.next(territories)),
    );
  }

  loadCampaigns(): Observable<Campaign[]> {
    return this.campaignService.load().pipe(
      map((campaigns) => campaigns.sort((campaignA, campaignB) => (campaignA.name > campaignB.name ? 1 : -1))),
      tap((campaigns) => this._campaigns$.next(campaigns)),
    );
  }

  public loadAll() {
    return this.authenticationService.check().pipe(
      mergeMap((user) => {
        if (user) {
          const params = [this.operatorApiService.paramGetList(), this.territoryApiService.paramGetList()];

          if (this.authenticationService.hasAnyPermission(['incentive-campaign.list'])) {
            params.push(this.campaignService.getListJSONParam());
          }

          if (user.territory_id) {
            params.push(this.territoryApiService.paramGetById(user.territory_id ? user.territory_id : null));
          } else if (user.operator_id) {
            params.push(this.operatorApiService.paramGetById(user.operator_id ? user.operator_id : null));
          }

          return this.jsonRPCService.call(params, {}, false);
        }

        return of(null);
      }),
      map((results: any[]) => {
        if (!results) return false;

        const operatorsR = results.shift();
        const territoriesR = results.shift();

        const campaignsR = this.authenticationService.hasAnyPermission(['incentive-campaign.list'])
          ? results.shift()
          : null;

        const currentContextData = results.shift();

        if (currentContextData && currentContextData.data) {
          if (this.authenticationService.user.operator_id) {
            this._currentOperator$.next(currentContextData.data);
          } else {
            this._currentTerritory$.next(currentContextData.data);
          }

          if (!this.authenticationService.user.operator_id) this._currentOperator$.next(null);
          if (!this.authenticationService.user.territory_id) this._currentTerritory$.next(null);
        }

        if (operatorsR.data) {
          this._operators$.next(
            operatorsR.data.sort((operatorA, operatorB) => (operatorA.name > operatorB.name ? 1 : -1)),
          );
        }

        if (territoriesR.data) {
          this._territories$.next(
            territoriesR.data.sort((territoryA, territoryB) => (territoryA.name > territoryB.name ? 1 : -1)),
          );
        }

        if (campaignsR && campaignsR.data) {
          this._campaigns$.next(
            campaignsR.data.sort((campaignA, campaignB) => (campaignA.name > campaignB.name ? 1 : -1)),
          );
        }

        return true;
      }),
    );
  }

  public resetAll() {
    this._territories$.next(null);
    this._campaigns$.next(null);
    this._operators$.next(null);
    this._currentOperator$.next(null);
    this._currentTerritory$.next(null);
  }
}
