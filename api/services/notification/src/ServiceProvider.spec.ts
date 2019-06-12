import { describe } from 'mocha';
import { Parents, Interfaces } from '@ilos/core';
import path from 'path';
import chai from 'chai';
import nock from 'nock';
import chaiNock from 'chai-nock';
import { ConfigProviderInterfaceResolver, ConfigProvider } from '@ilos/provider-config';
import { EnvProviderInterfaceResolver, EnvProvider } from '@ilos/provider-env';

import { ServiceProvider } from './ServiceProvider';

chai.use(chaiNock);

process.env.APP_WORKING_PATH = path.resolve(process.cwd(), 'dist');
process.env.APP_ENV = 'testing';
process.env.APP_MJ_FROM_EMAIL = 'from@example.com';
process.env.APP_MJ_FROM_NAME = 'From Example';
process.env.APP_MJ_TEMPLATE = '123456';
process.env.APP_MJ_DEBUG_EMAIL = 'test@fake.com';
process.env.APP_MJ_DEBUG_NAME = 'Mad tester';

const { expect } = chai;
class ServiceKernel extends Parents.Kernel {
  readonly alias = [
    [ConfigProviderInterfaceResolver, ConfigProvider],
    [EnvProviderInterfaceResolver, EnvProvider],
  ];

  readonly serviceProviders = [ServiceProvider];
}

const service = <Interfaces.KernelInterface>new ServiceKernel();
let nockRequest;
const url: RegExp = /mailjet/;
const endpoint: RegExp = /send/;
describe('Notification service', async () => {
  before(async () => {
    await service.boot();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('notifies user', async () => {
    nockRequest = nock(url)
      .post(endpoint)
      .reply(200, {
        Messages: [],
      });

    const response = await service.handle({
      id: 1,
      jsonrpc: '2.0',
      method: 'notification:sendmail',
      params: {
        email: 'test@fake.com',
        fullname: 'Mad tester',
        subject: 'Mot de passe oublié',
        content: 'Hello world !!!',
      },
    });
    expect(response).to.deep.equal({
      jsonrpc: '2.0',
      id: 1,
      result: undefined,
    });
  });

  it('send correct request to mailjet', (done) => {
    let body;
    nockRequest = nock(url)
      .post(endpoint, (b) => {
        body = b;
        return b;
      })
      .reply(200, {
        Messages: [],
      })
      .on('replied', (req) => {
        expect(body).to.deep.equal({
          Messages: [
            {
              From: {
                Email: 'from@example.com',
                Name: 'From Example',
              },
              To: [
                {
                  Email: 'test@fake.com',
                  Name: 'Mad tester',
                },
              ],
              TemplateID: 123456,
              TemplateLanguage: true,
              Subject: 'Mot de passe oublié',
              Variables: {
                title: 'Mot de passe oublié',
                content: 'Hello world !!!',
              },
            },
          ],
        });
        done();
      });

    service.handle({
      id: 1,
      jsonrpc: '2.0',
      method: 'notification:sendmail',
      params: {
        email: 'test@fake.com',
        fullname: 'Mad tester',
        subject: 'Mot de passe oublié',
        content: 'Hello world !!!',
      },
    });
  });
  it('send correct request to mailjet with template', (done) => {
    let body;
    nockRequest = nock(url)
      .post(endpoint, (b) => {
        body = b;
        return b;
      })
      .reply(200, {
        Messages: [],
      })
      .on('replied', (req) => {
        expect(body).to.deep.equal({
          Messages: [
            {
              From: {
                Email: 'from@example.com',
                Name: 'From Example',
              },
              To: [
                {
                  Email: 'test@fake.com',
                  Name: 'Mad tester',
                },
              ],
              TemplateID: 123456,
              TemplateLanguage: true,
              Subject: 'Mot de passe oublié',
              Variables: {
                title: 'Mot de passe oublié',
                content: `Bonjour Mad tester,<br>
              Vous avez demandé la réinitialisation de votre mot de passe sur le site du Registre de preuve de covoiturage.<br>
              <br>
              Veuillez cliquer sur le lien suivant et choisir un nouveau mot de passe.
              <br>
              <br>
              http://givememoney`.replace(/ {14}/g, ''),
              },
            },
          ],
        });
        done();
      });

    service.handle({
      id: 1,
      jsonrpc: '2.0',
      method: 'notification:sendtemplatemail',
      params: {
        email: 'test@fake.com',
        fullname: 'Mad tester',
        template: 'forgotten_password',
        opts: {
          link: 'http://givememoney',
        },
      },
    });
  });
});
