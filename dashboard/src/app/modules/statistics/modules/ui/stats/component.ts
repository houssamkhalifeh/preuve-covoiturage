// tslint:disable: no-bitwise
import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

import { MAIN } from '~/config/main';

@Component({
  selector: 'app-stats-content',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StatisticsContentComponent implements OnInit {
  public loaded = false;
  public toggle = {};
  public data = {};
  public gitbookLinkStats: string = MAIN.gitbookLinkStats;
  public graphLineOptions = {
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: 'month',
            locale: 'fr',
          },
        },
      ],
    },
    legend: {
      display: false,
    },
  };

  @Input() set apiData(d) {
    console.log(d);
    if (!d || !d.collected || !d.distance || !d.duration) return;

    this.loaded = true;
    this.data = {
      summary: {
        journeys: d.collected.total,
        distance: (parseInt(d.distance.total[0].total, 10) / 1000) | 0,
        aom: 3,
        petrol: (parseInt(d.distance.total[0].total, 10) * 0.0000636) | 0,
        co2: (parseInt(d.distance.total[0].total, 10) * 0.000195) | 0,
      },
      graphs: {
        journeysPerDay: {
          labels: d.collected.day.map(this.mapDateLabels),
          datasets: [
            {
              label: 'Trajets par jour',
              data: d.collected.day.map((i) => i.total),
              backgroundColor: '#42A5F588',
              borderColor: '#1E88E5',
            },
          ],
        },
        journeysPerDayTotal: {
          labels: d.collected.day.map(this.mapDateLabels),
          datasets: [
            {
              label: 'Trajets cumulés',
              data: d.collected.day.reduce(this.reduceCumulativeData, []),
              backgroundColor: '#42A5F588',
              borderColor: '#1E88E5',
            },
          ],
        },
        distancePerDay: {
          labels: d.distance.day.map(this.mapDateLabels),
          datasets: [
            {
              label: 'Distance par jour',
              data: d.distance.day.map((i) => (i.total / 1000) | 0),
              backgroundColor: '#42A5F588',
              borderColor: '#1E88E5',
            },
          ],
        },
        distancePerDayTotal: {
          labels: d.distance.day.map(this.mapDateLabels),
          datasets: [
            {
              label: 'Distance cumulée',
              data: d.distance.day
                .reduce(this.reduceCumulativeData, [])
                .map((i) => {
                  i.y = (i.y / 1000) | 0;
                  return i;
                }),
              backgroundColor: '#42A5F588',
              borderColor: '#1E88E5',
            },
          ],
        },
      },
    };
  }

  // constructor() {}

  private mapDateLabels({ _id }) {
    return new Date(_id.year, _id.month, _id.day);
  }

  private reduceCumulativeData(p, c, i) {
    p[i] = p[i] || {};
    p[i].t = new Date(c._id.year, c._id.month, c._id.day, 0, 0, 0);
    p[i].y = i > 1 ? p[i - 1].y + c.total : c.total;
    return p;
  }

  public handleChange(event, key) {
    this.toggle[key] = event.checked;
  }

  ngOnInit(): void {
    // nada
  }
}
