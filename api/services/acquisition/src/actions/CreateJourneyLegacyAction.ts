import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';

import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/createLegacy.contract';
import { alias } from '../shared/acquisition/createLegacy.schema';
import { mapLegacyToLatest } from '../helpers/mapLegacyToLatest';

@handler(handlerConfig)
export class CreateJourneyLegacyAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['journey.create']], ['validate', alias]];

  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // extract the SIRET to set a default sponsor in the incentives
    const operatorSiret = await this.getOperatorSiret(context.call.user.operator_id);

    // send the converted journeys to new acquisition pipeline
    return this.kernel.call('acquisition:create', mapLegacyToLatest(operatorSiret)(params), context);
  }

  /**
   * Extract the operator's SIRET number by operator ID
   * Calls the operator service
   */
  protected async getOperatorSiret(operator_id: string): Promise<string | null> {
    const operator = await this.kernel.call(
      'operator:find',
      { _id: operator_id },
      { channel: { service: 'acquisition' }, call: { user: { permissions: ['operator.read'] } } },
    );

    return 'company' in operator ? operator.company.siret : null;
  }
}