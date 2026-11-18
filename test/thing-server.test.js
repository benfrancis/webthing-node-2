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
    actions: {
      blink: {
        title: 'Blink',
        synchronous: true,
      },
      delayedBlink: {
        title: 'Delayed Blink',
        synchronous: false,
      },
      failedBlink: {
        title: 'Failed Blink',
        synchronous: false,
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
    thing.setActionInvokeHandler('blink', async (input) => input);
    thing.setActionInvokeHandler('delayedBlink', async (input) => input);
    thing.setActionInvokeHandler('failedBlink', async () => {
      throw new Error('Blink failed');
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

  describe('POST /actions/:name', () => {
    it('should invoke the action and return its output', async () => {
      const input = { duration: 3 };
      const response = await fetch(baseUrl + '/actions/blink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      assert.strictEqual(response.status, 200);
      assert.deepEqual(await response.json(), input);
    });
  });

  describe('POST /actions/:invalidname', () => {
    it('should return 404 when the action does not exist', async () => {
      const response = await fetch(baseUrl + '/actions/foo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('asynchronous action requests', () => {
    it('should return an accepted request and expose its status', async () => {
      const input = { duration: 3 };
      const response = await fetch(baseUrl + '/actions/delayedBlink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      assert.equal(response.status, 202);
      const requestStatus = await response.json();
      const statusUrl = response.headers.get('location');
      assert.equal(statusUrl, `/actions/delayedBlink/${requestStatus.id}`);

      const statusResponse = await fetch(baseUrl + statusUrl);
      assert.equal(statusResponse.status, 200);
      const status = await statusResponse.json();
      assert.equal(status.id, requestStatus.id);
      assert.equal(status.state, 'completed');
      assert.deepEqual(status.output, input);
    });

    it('should return 404 for an unknown action request', async () => {
      const response = await fetch(baseUrl + '/actions/delayedBlink/unknown');
      assert.equal(response.status, 404);
    });

    it('should expose action failures in the request status', async () => {
      const response = await fetch(baseUrl + '/actions/failedBlink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      assert.equal(response.status, 202);
      const requestStatus = await response.json();
      const statusResponse = await fetch(
        baseUrl + response.headers.get('location'),
      );
      const status = await statusResponse.json();
      assert.equal(statusResponse.status, 200);
      assert.equal(status.id, requestStatus.id);
      assert.equal(status.state, 'failed');
      assert.deepEqual(status.error, {
        title: 'Error',
        detail: 'Blink failed',
      });
    });
  });
});
