import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import Thing from '../src/thing.js';
import ThingServer from '../src/thing-server.js';

describe('ThingServer', () => {
  const partialTD = {
    title: 'Test Lamp',
    description: 'A test lamp',
    properties: {
      on: {
        type: 'boolean',
        title: 'On/Off',
      },
    },
  };

  let server;
  let baseUrl;
  let currentValue = true;

  before(async () => {
    const thing = new Thing(partialTD);
    thing.setPropertyReadHandler('on', async () => currentValue);
    thing.setPropertyWriteHandler('on', async (value) => {
      currentValue = value;
    });
    server = new ThingServer(thing);
    // Listen on a random available port to avoid port conflicts
    await new Promise((resolve) => {
      server.server = server.app.listen(0, () => {
        const port = server.server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(() => {
    server.stop();
  });

  describe('GET /', () => {
    it('should return the Thing Description', async () => {
      const response = await fetch(baseUrl + '/');
      assert.strictEqual(response.status, 200);
      const td = await response.json();
      assert.strictEqual(td.title, 'Test Lamp');
      assert.equal(td['@context'], 'https://www.w3.org/2022/wot/td/v1.1');
      assert.deepEqual(td.securityDefinitions, {
        nosec_sc: { scheme: 'nosec' },
      });
      assert.equal(td.security, 'nosec_sc');
    });
  });

  describe('GET /properties/:name', () => {
    it('should return the property value', async () => {
      const response = await fetch(baseUrl + '/properties/on');
      assert.strictEqual(response.status, 200);
      const value = await response.json();
      assert.strictEqual(value, true);
    });
  });

  describe('GET /properties/:invalidname', () => {
    it('should return 404 for an invalid property name', async () => {
      const response = await fetch(baseUrl + '/properties/foo');
      assert.strictEqual(response.status, 404);
    });
  });

  describe('PUT /properties/:name', () => {
    it('should update the property value when the property exists', async () => {
      const response = await fetch(baseUrl + '/properties/on', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(false),
      });

      assert.strictEqual(response.status, 204);
      assert.strictEqual(currentValue, false);
    });
  });

  describe('PUT /properties/:invalidname', () => {
    it('should return 404 when the property does not exist', async () => {
      const response = await fetch(baseUrl + '/properties/foo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(true),
      });

      assert.strictEqual(response.status, 404);
    });
  });
});
