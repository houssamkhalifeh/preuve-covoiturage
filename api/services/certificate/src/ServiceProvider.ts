import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelServiceWhitelistMiddleware, FeatureFlagMiddleware } from '@pdc/provider-middleware';
import { PermissionMiddleware } from '@pdc/provider-acl';
import { DateProvider } from '@pdc/provider-date';
import { QrcodeProvider } from '@pdc/provider-qrcode';
import { CryptoProvider } from '@pdc/provider-crypto';
import { PdfCertProvider } from '@pdc/provider-pdfcert';
import { TemplateExtension } from '@pdc/provider-template';

import { config } from './config';
import { CertificatePgRepositoryProvider } from './providers/CertificatePgRepositoryProvider';
import { CarpoolPgRepositoryProvider } from './providers/CarpoolPgRepositoryProvider';
import { CreateCertificateAction } from './actions/CreateCertificateAction';
import { FindCertificateAction } from './actions/FindCertificateAction';
import { ListCertificateAction } from './actions/ListCertificateAction';
import { DownloadCertificateAction } from './actions/DownloadCertificateAction';
import { SeedCommand } from './commands/SeedCommand';
import { binding as createBinding } from './shared/certificate/create.schema';
import { binding as findBinding } from './shared/certificate/find.schema';
import { binding as downloadBinding } from './shared/certificate/download.schema';
import { binding as listBinding } from './shared/certificate/list.schema';

@serviceProvider({
  config,
  providers: [
    DateProvider,
    QrcodeProvider,
    CryptoProvider,
    CertificatePgRepositoryProvider,
    CarpoolPgRepositoryProvider,
    PdfCertProvider,
  ],
  validator: [createBinding, findBinding, downloadBinding, listBinding],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['can', PermissionMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
    ['featureflag', FeatureFlagMiddleware],
  ],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [DownloadCertificateAction, CreateCertificateAction, FindCertificateAction, ListCertificateAction],
  commands: [SeedCommand],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension, TemplateExtension];
}
