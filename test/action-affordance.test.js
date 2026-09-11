import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import ActionAffordance from '../src/action-affordance.js';
import ValidationError from '../src/validation-error.js';

describe('ActionAffordance', () => {
  describe('constructor', () => {
    it('should parse valid action metadata', () => {
      const action = new ActionAffordance('toggle', {
        title: 'Toggle',
        description: 'Toggle the light',
        input: { type: 'boolean' },
        output: { type: 'boolean' },
        safe: true,
        idempotent: true,
        synchronous: false,
      });

      assert.equal(action.name, 'toggle');
      assert.equal(action.title, 'Toggle');
      assert.deepEqual(action.input, { type: 'boolean' });
      assert.deepEqual(action.output, { type: 'boolean' });
      assert.equal(action.safe, true);
      assert.equal(action.idempotent, true);
      assert.equal(action.synchronous, false);
    });

    it('should default safe and idempotent to false when omitted', () => {
      const action = new ActionAffordance('reboot', {});

      assert.equal(action.safe, false);
      assert.equal(action.idempotent, false);
      assert.equal(action.synchronous, undefined);
    });

    it('should reject invalid member types', () => {
      assert.throws(
        () => new ActionAffordance('badInput', { input: 'not-an-object' }),
        (error) => {
          assert.ok(error instanceof ValidationError);
          assert.equal(
            error.validationErrors[0].field,
            'actions.badInput.input',
          );
          assert.equal(
            error.validationErrors[0].description,
            'input member is not valid',
          );
          return true;
        },
      );

      assert.throws(
        () => new ActionAffordance('badSafe', { safe: 'yes' }),
        (error) => {
          assert.ok(error instanceof ValidationError);
          assert.equal(error.validationErrors[0].field, 'actions.badSafe.safe');
          assert.equal(
            error.validationErrors[0].description,
            'safe member is not a boolean',
          );
          return true;
        },
      );
    });
  });

  describe('getMetadata', () => {
    it('should return the action metadata with the generated invocation form', () => {
      const action = new ActionAffordance('blink', {
        title: 'Blink',
        output: { type: 'string' },
        safe: true,
        idempotent: true,
        synchronous: true,
      });

      assert.deepEqual(action.getMetadata(), {
        title: 'Blink',
        output: { type: 'string' },
        safe: true,
        idempotent: true,
        synchronous: true,
        forms: [{ href: 'actions/blink', op: 'invokeaction' }],
      });
    });
  });

  describe('invoke', () => {
    it('should call the registered invoke handler with the action input', async () => {
      const action = new ActionAffordance('setColor', {
        input: { type: 'string' },
      });
      action.setInvokeHandler(async (value) => ({ value }));

      const result = await action.invoke('red');
      assert.deepEqual(result, { value: 'red' });
    });

    it('should reject when no invoke handler has been registered', async () => {
      const action = new ActionAffordance('setColor', {
        input: { type: 'string' },
      });

      await assert.rejects(() => action.invoke('red'), /InternalError/);
    });
  });
});
