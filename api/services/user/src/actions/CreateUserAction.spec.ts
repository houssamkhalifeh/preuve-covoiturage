// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { Container, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';

import { CreateUserAction } from './CreateUserAction';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserBaseInterface } from '../interfaces/UserInterfaces';

import { User } from '../entities/User';

import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
import { mockNewUserBase } from '../../tests/mocks/newUserBase';

import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';
import { defaultUserProperties } from '../../tests/mocks/defaultUserProperties';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
  permissions: ['user.create'],
};

const mockNewUser = {
  ...mockNewUserBase,
};


const mockCreateUserParams = {
  ...mockNewUser,
};

delete mockCreateUserParams.permissions;

const mockNewUserId = 'newUserId';

@Container.provider()
class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async boot() {
    return;
  }
  public async create(user: UserBaseInterface): Promise<User> {
    return new User({ ...mockNewUser, _id: mockNewUserId });
  }
  public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
    return null;
  }
  async update(user: any): Promise<User> {
    return user;
  }
}

@Container.provider()
class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
  generateToken(length?: number) {
    return 'randomToken';
  }
  async cryptToken(plainToken: string): Promise<string> {
    return 'cryptedToken';
  }
}

@Container.provider()
class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
  async boot() {
    return;
  }
  async call(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<Types.ResultType> {
    return undefined;
  }
}

@Container.provider()
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  async boot() {
    return;
  }
  get(key: string, fallback?: any): any {
    if (key === 'user.status.notActive') {
      return 'notActive';
    }
    return 'https://app.covoiturage.beta.gouv.fr';
  }
}


class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [CreateUserAction];
  readonly alias: any[] = [
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    [CryptoProviderInterfaceResolver, FakeCryptoProvider],
    [Interfaces.KernelInterfaceResolver, FakeKernelProvider],
    [UserRepositoryProviderInterfaceResolver, FakeUserRepository],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
  ];

  protected registerConfig() {}
}

let serviceProvider;
let handlers;
let action;


describe('USER ACTION  - Create user', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
    handlers = serviceProvider.getContainer().getHandlers();
    action = serviceProvider.getContainer().getHandler(handlers[0]);
  });

  it('should return new user', async () => {
    const result = await action.call({
      method: 'user:createUser',
      context: { call: { user: mockConnectedUser }, channel: { service: '' } },
      params: mockCreateUserParams,
    });

    expect(result).to.eql({
      ...defaultUserProperties,
      ...mockNewUser,
      _id: mockNewUserId,
    });
  });
});
