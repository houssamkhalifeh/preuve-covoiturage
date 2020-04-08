import { CertificateInterface } from './common/interfaces/CertificateInterface';

export interface ParamsInterface {
  identity: string;
  start_at?: Date;
  end_at?: Date;
}

export interface ResultInterface extends CertificateInterface {}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'create',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;