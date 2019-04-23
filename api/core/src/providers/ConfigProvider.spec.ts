// tslint:disable no-shadowed-variable max-classes-per-file no-invalid-this
import { describe } from 'mocha';
import { expect } from 'chai';
import mockFs from 'mock-fs';

import { ConfigProvider } from './ConfigProvider';
import { ProviderInterface } from '../interfaces/ProviderInterface';

const kernel = {
  providers: [class FakeEnvProvider implements ProviderInterface {
    public readonly signature: 'env';
    boot() { return; }
    get(key, fb) { return fb; }
  }],
  services: [],
  boot() { this.env = new this.providers[0](this); },
  async handle(call) {
    return {
      id: null,
      jsonrpc: '2.0',
    };
  },
  get() { return this.env; },
};

kernel.boot();

describe('Config provider', () => {
  it('should throw error if no env provider found', async () => {
    const configProvider = new ConfigProvider({
      providers: [],
      services: [],
      boot() { return; },
      async handle(call) {
        return {
          id: null,
          jsonrpc: '2.0',
        };
      },
      get() { throw new Error(); },
    });
    try {
      await configProvider.boot();
      expect(true).to.equal(false);
    } catch (e) {
      expect(e).to.be.instanceOf(Error);
      expect(e.message).to.equal('');
    }
  });

  it('should work', async () => {
    mockFs({
      [`${process.cwd()}/config/hello-world.yml`]: `
        hi:\n
            - name: 'john' \n
        \n`,
    });

    const configProvider = new ConfigProvider(kernel);
    await configProvider.boot();
    expect(configProvider.get('helloWorld')).to.deep.equal({
      hi: [
        { name: 'john' },
      ],
    });

    mockFs.restore();
  });

  it('should return fallback if key not found', async () => {
    const configProvider = new ConfigProvider(kernel);
    await configProvider.boot();
    expect(configProvider.get('hello', 'world')).to.equal('world');
  });
});