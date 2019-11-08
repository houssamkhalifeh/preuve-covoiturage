import { get, set } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/geo.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { WorkflowProvider } from '../providers/WorkflowProvider';

// Enrich position data
@handler(handlerConfig)
export class NormalizationGeoAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.transport', ['queue']]];

  constructor(protected wf: WorkflowProvider, private geoProvider: GeoProviderInterfaceResolver) {
    super();
  }

  public async handle(journey: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const normalizedJourney = { ...journey };
    this.logger.debug(`Normalization:geo on ${journey._id}`);

    for (const path of ['passenger.start', 'passenger.end', 'driver.start', 'driver.end']) {
      const { lat, lon, insee, literal } = get(journey, path);
      const result = await this.geoProvider.checkAndComplete({ lat, lon, insee, literal });
      set(normalizedJourney, `${path}.lat`, result.lat);
      set(normalizedJourney, `${path}.lon`, result.lon);
      set(normalizedJourney, `${path}.insee`, result.insee);
    }

    // Call the next step asynchronously
    await this.wf.next('normalization:geo', normalizedJourney);

    return normalizedJourney;
  }
}
