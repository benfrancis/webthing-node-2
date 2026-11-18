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
    actions: {
      blink: {
        title: 'Blink',
        synchronous: true,
        input: {
          type: 'object',
          properties: {
            count: { type: 'integer' },
          },
        },
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
                op: ['readproperty', 'writeproperty'],
              },
            ],
            title: 'On/Off',
            type: 'boolean',
          },
        },
        actions: {
          blink: {
            forms: [{ href: 'actions/blink', op: 'invokeaction' }],
            title: 'Blink',
            synchronous: true,
            input: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
              },
            },
          },
        },
      });
    });
  });

  describe('setPropertyReadHandler', () => {
    it('should throw when the property does not exist', () => {
      const thing = new Thing(partialTD);
      assert.throws(
        () => thing.setPropertyReadHandler('missing', async () => {}),
        /No property called missing could be found/,
      );
    });
  });

  describe('readProperty', () => {
    it('should return the value from the property read handler', async () => {
      const thing = new Thing(partialTD);
      thing.setPropertyReadHandler('on', async () => true);
      const value = await thing.readProperty('on');
      assert.strictEqual(value, true);
    });

    it('should reject when no handler is registered', async () => {
      const thing = new Thing(partialTD);
      await assert.rejects(() => thing.readProperty('on'), /InternalError/);
    });
  });

  describe('setPropertyWriteHandler', () => {
    it('should throw when the property does not exist', () => {
      const thing = new Thing(partialTD);
      assert.throws(
        () => thing.setPropertyWriteHandler('missing', async () => {}),
        /No property called missing could be found/,
      );
    });
  });

  describe('writeProperty', () => {
    it('should return the value from the property write handler', async () => {
      const thing = new Thing(partialTD);
      thing.setPropertyWriteHandler('on', async (value) => value);
      const value = await thing.writeProperty('on', true);
      assert.strictEqual(value, true);
    });

    it('should reject when no handler is registered', async () => {
      const thing = new Thing(partialTD);
      await assert.rejects(
        () => thing.writeProperty('on', true),
        /InternalError/,
      );
    });
  });

  describe('setActionInvokeHandler', () => {
    it('should throw when the action does not exist', () => {
      const thing = new Thing(partialTD);
      assert.throws(
        () => thing.setActionInvokeHandler('missing', async () => {}),
        /No action called missing could be found/,
      );
    });

    it('should retain the setActionHandler alias', async () => {
      const thing = new Thing(partialTD);
      thing.setActionHandler('blink', async () => 'ok');
      assert.equal(await thing.invokeAction('blink', {}), 'ok');
    });
  });

  describe('invokeAction', () => {
    it('should return the result from the action handler', async () => {
      const thing = new Thing(partialTD);
      thing.setActionInvokeHandler('blink', async (input) => input.count);

      const result = await thing.invokeAction('blink', { count: 3 });
      assert.equal(result, 3);
    });

    it('should return an asynchronous request and allow its status to be queried', async () => {
      const thing = new Thing({
        ...partialTD,
        actions: { blink: { synchronous: false } },
      });
      thing.setActionInvokeHandler('blink', async () => false);

      const request = await thing.invokeAction('blink', {});
      assert.equal(await request.completion, false);
      assert.deepEqual(thing.queryAction('blink', request.id), request.query());
    });

    it('should reject when the action does not exist', async () => {
      const thing = new Thing(partialTD);

      await assert.rejects(
        () => thing.invokeAction('missing', {}),
        /NotFoundError/,
      );
    });
  });
});
