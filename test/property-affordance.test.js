import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import PropertyAffordance from '../src/property-affordance.js';
import ValidationError from '../src/validation-error.js';

describe('PropertyAffordance', () => {
  describe('constructor', () => {
    it('should parse valid property metadata', () => {
      const property = new PropertyAffordance('on', {
        title: 'On/Off',
        description: 'Whether the light is on',
        type: 'boolean',
        readOnly: true,
      });

      assert.equal(property.name, 'on');
      assert.equal(property.title, 'On/Off');
      assert.equal(property.type, 'boolean');
      assert.equal(property.readOnly, true);
      assert.equal(property.writeOnly, false);
    });

    it('should default readOnly and writeOnly to false when omitted', () => {
      const property = new PropertyAffordance('status', { type: 'string' });

      assert.equal(property.readOnly, false);
      assert.equal(property.writeOnly, false);
      assert.equal(property.type, 'string');
    });

    it('should reject invalid member types', () => {
      assert.throws(
        () => new PropertyAffordance('badReadOnly', { readOnly: 'yes' }),
        (error) => {
          assert.ok(error instanceof ValidationError);
          assert.equal(
            error.validationErrors[0].field,
            'properties.badReadOnly.readOnly',
          );
          assert.equal(
            error.validationErrors[0].description,
            'readOnly member is not a boolean',
          );
          return true;
        },
      );

      assert.throws(
        () => new PropertyAffordance('badType', { type: 42 }),
        (error) => {
          assert.ok(error instanceof ValidationError);
          assert.equal(
            error.validationErrors[0].field,
            'properties.badType.type',
          );
          assert.equal(
            error.validationErrors[0].description,
            'type is set but is not a string',
          );
          return true;
        },
      );
    });

    it('should reject properties that are both readOnly and writeOnly', () => {
      assert.throws(
        () =>
          new PropertyAffordance('conflict', {
            readOnly: true,
            writeOnly: true,
          }),
        (error) => {
          assert.ok(error instanceof ValidationError);
          assert.equal(
            error.validationErrors[0].field,
            'properties.conflict.readOnly',
          );
          assert.equal(
            error.validationErrors[0].description,
            'property can not be readOnly and writeOnly',
          );
          return true;
        },
      );
    });
  });

  describe('getMetadata', () => {
    it('should generate default forms', () => {
      const property = new PropertyAffordance('brightness', {
        type: 'number',
      });

      assert.deepEqual(property.getMetadata(), {
        type: 'number',
        forms: [
          {
            href: 'properties/brightness',
            op: ['readproperty', 'writeproperty'],
          },
        ],
      });
    });

    it('should generate read-only form operations for readOnly properties', () => {
      const property = new PropertyAffordance('temperature', {
        type: 'number',
        readOnly: true,
      });

      assert.deepEqual(property.getMetadata(), {
        type: 'number',
        readOnly: true,
        forms: [{ href: 'properties/temperature', op: ['readproperty'] }],
      });
    });

    it('should generate write-only form operations for writeOnly properties', () => {
      const property = new PropertyAffordance('token', {
        type: 'string',
        writeOnly: true,
      });

      assert.deepEqual(property.getMetadata(), {
        type: 'string',
        writeOnly: true,
        forms: [{ href: 'properties/token', op: ['writeproperty'] }],
      });
    });
  });

  describe('read and write', () => {
    it('should call the registered read and write handlers', async () => {
      const property = new PropertyAffordance('level', { type: 'number' });
      property.setReadHandler(async () => 42);
      property.setWriteHandler(async (value) => value);

      assert.equal(await property.read(), 42);
      assert.equal(await property.write(7), 7);
    });

    it('should reject when no read or write handler is registered', async () => {
      const property = new PropertyAffordance('level', { type: 'number' });

      await assert.rejects(() => property.read(), /InternalError/);
      await assert.rejects(() => property.write(1), /InternalError/);
    });
  });
});
