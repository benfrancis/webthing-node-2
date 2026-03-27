import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Thing from '../src/thing.js';

describe('Thing', () => {
  const partialTD = {
    title: 'Test Thing',
    description: 'A thing for testing',
    properties: {
      on: {
        type: 'boolean',
        title: 'On/Off',
      },
    },
  };

  describe('constructor', () => {
    it('should parse and populate mandatory members of the Thing', () => {
      const thing = new Thing(partialTD);
      assert.equal(thing.context, 'https://www.w3.org/2022/wot/td/v1.1');
      assert.equal(thing.title, partialTD.title);
      assert.deepEqual(thing.securityDefinitions, {
        nosec_sc: { scheme: 'nosec' },
      });
      assert.equal(thing.security, 'nosec_sc');
    });
  });

  describe('getThingDescription', () => {
    it('should return the Thing Description', () => {
      const thing = new Thing(partialTD);
      const td = thing.getThingDescription();
      assert.deepEqual(td, {
        '@context': 'https://www.w3.org/2022/wot/td/v1.1',
        title: 'Test Thing',
        securityDefinitions: { nosec_sc: { scheme: 'nosec' } },
        security: 'nosec_sc',
        properties: {
          on: {
            forms: [
              {
                href: 'properties/on',
                op: 'readproperty',
              },
            ],
            title: 'On/Off',
          },
        },
      });
    });
  });

  describe('readProperty', () => {
    it('should return the value from the property read handler', () => {
      const thing = new Thing(partialTD);
      thing.setPropertyReadHandler('on', () => true);
      const value = thing.readProperty('on');
      assert.strictEqual(value, true);
    });

    it('should support async property read handlers', async () => {
      const thing = new Thing(partialTD);
      thing.setPropertyReadHandler('on', async () => false);
      const value = await thing.readProperty('on');
      assert.strictEqual(value, false);
    });

    it('should throw when no handler is registered', () => {
      const thing = new Thing(partialTD);
      assert.throws(() => thing.readProperty('on'));
    });
  });
});
