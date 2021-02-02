import { get } from 'lodash-es';
import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { StatNumber } from '~/core/entities/stat/statNumber';
import { statNumbers } from '~/modules/stat/config/statNumbers';
import { URLS } from '~/core/const/main.const';
import { PUBLIC_STATS } from '~/modules/stat/config/stat';
import { StatPublicService } from '~/modules/stat/services/stat-public.service';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-public-stat',
  templateUrl: './public-stat.component.html',
  styleUrls: ['./public-stat.component.scss'],
})
export class PublicStatComponent extends DestroyObservable implements OnInit {
  statNumbers: StatNumber[] = [];
  gitbookLinkStats = URLS.gitbookLinkStats;

  statNumberNames = PUBLIC_STATS;

  hideStats = false;

  constructor(private publicStatService: StatPublicService) {
    super();
  }

  ngOnInit(): void {
    this.loadStat();
    this.publicStatService.stat$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const statNumbersArray = [];
      for (const statName of this.statNumberNames) {
        let title = get(this.publicStatService.stat, statNumbers[statName].path);
        const statCard = statNumbers[statName];

        if (statName === 'co2') {
          title = (title / 1000).toFixed(2);
          statCard.unit = 'tonnes';
        }

        statNumbersArray.push(
          new StatNumber({
            title,
            hint: statCard.hint,
            svgIcon: statCard.svgIcon,
            unit: statCard.unit,
          }),
        );
      }

      this.statNumbers = statNumbersArray;
    });
  }

  get loading(): boolean {
    return this.publicStatService.loading;
  }

  get loaded(): boolean {
    return this.publicStatService.loaded;
  }

  private loadStat(): void {
    if (this.publicStatService.loading) {
      return;
    }
    this.publicStatService.loadOne().subscribe();
  }
}
