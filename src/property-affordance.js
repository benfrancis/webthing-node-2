import InteractionAffordance from './interaction-affordance.js';
import ValidationError from './validation-error.js';

/** @import {DataSchema, PartialPropertyDescription, PropertyDescription, Form} from "./types.js" */

/**
 * Property Affordance
 *
 * Represents a PropertyAffordance from the W3C WoT Thing Description 1.1
 * specification https://www.w3.org/TR/wot-thing-description/#propertyaffordance
 */
class PropertyAffordance extends InteractionAffordance {
  // *** DataSchema ***/
  // TODO: Consider making this a mixin or use @implements InteractionAffordance
  // and @implements DataSchema

  /**
   * @type {any}
   */
  const;

  /**
   * @type {any}
   */
  default;

  /**
   * @type {string|undefined}
   */
  unit;

  /**
   * @type {Array<DataSchema>|undefined}
   */
  oneOf;

  /**
   * @type {Array<any>|undefined}
   */
  enum;

  /**
   * @type {boolean|undefined}
   */
  readOnly;

  /**
   * @type {boolean|undefined}
   */
  writeOnly;

  /**
   * @type {string|undefined}
   */
  format;

  /**
   * @type {('object'|'array'|'string'|'number'|'integer'|'boolean'|'null')|undefined}
   */
  type;

  // *** End of DataSchema ***

  /**
   * @type {boolean|undefined}
   */
  observeable;

  /**
   * Create a new Property.
   *
   * @param {string} name The name of the PropertyAffordance from its
   *   key in a properties Map.
   * @param {PartialPropertyDescription} metadata Metadata describing a
   *   PropertyAffordance from a partial Thing Description.
   */
  constructor(name, metadata) {
    super(name, metadata);

    let validationError = new ValidationError([]);

    // Parse readOnly member
    try {
      this.#parseReadOnlyMember(metadata.readOnly);
    } catch (error) {
      validationError.merge(error);
    }

    // Parse writeOnly member
    try {
      this.#parseWriteOnlyMember(metadata.writeOnly);
    } catch (error) {
      validationError.merge(error);
    }

    // Check that readOnly and writeOnly are not both set
    if (this.readOnly && this.writeOnly) {
      let readWriteError = new ValidationError([
        {
          field: `properties.${this.name}.readOnly`,
          description: 'property can not be readOnly and writeOnly',
        },
      ]);
      validationError.merge(readWriteError);
    }

    // Parse type member
    try {
      this.#parseTypeMember(metadata.type);
    } catch (error) {
      validationError.merge(error);
    }

    // TODO: Parse other members

    if (validationError.validationErrors.length > 0) {
      throw validationError;
    }
  }

  /**
   * Parse readOnly member.
   *
   * @param {boolean|undefined} readOnly
   */
  #parseReadOnlyMember(readOnly) {
    // Throw an error if not a boolean or undefined
    if (!(readOnly === undefined || typeof readOnly == 'boolean')) {
      throw new ValidationError([
        {
          field: `properties.${this.name}.readOnly`,
          description: 'readOnly member is not a boolean',
        },
      ]);
    }

    // If undefined then default to false
    if (readOnly === undefined) {
      this.readOnly = false;
      // Otherwise set the provided value
    } else {
      this.readOnly = readOnly;
    }
  }

  /**
   * Parse writeOnly member.
   *
   * @param {boolean|undefined} writeOnly
   */
  #parseWriteOnlyMember(writeOnly) {
    // Throw an error if not a boolean or undefined
    if (!(writeOnly === undefined || typeof writeOnly == 'boolean')) {
      throw new ValidationError([
        {
          field: `properties.${this.name}.writeOnly`,
          description: 'writeOnly member is not a boolean',
        },
      ]);
    }

    // If undefined then default to false
    if (writeOnly === undefined) {
      this.writeOnly = false;
      // Otherwise set the provided value
    } else {
      this.writeOnly = writeOnly;
    }
  }

  /**
   * Parse type member.
   *
   * @param {string|undefined} type
   */
  #parseTypeMember(type) {
    // Throw an error if not a boolean or undefined
    if (type === undefined) {
      return;
    }
    if (typeof type != 'string') {
      throw new ValidationError([
        {
          field: `properties.${this.name}.type`,
          description: 'type is set but is not a string',
        },
      ]);
    }

    if (
      !(
        type == 'object' ||
        type == 'array' ||
        type == 'string' ||
        type == 'number' ||
        type == 'integer' ||
        type == 'boolean' ||
        type == 'null'
      )
    ) {
      throw new ValidationError([
        {
          field: `properties.${this.name}.type`,
          description: 'Invalid value',
        },
      ]);
    }

    this.type = type;
  }

  /**
   * Set read handler function.
   *
   * @param {() => Promise<any>} handler An asynchronous function to handle property reads.
   */
  setReadHandler(handler) {
    this.readHandler = handler;
  }

  /**
   * Set write handler function.
   *
   * @param {(value: any) => Promise<void>} handler An asynchronous function to handle property writes.
   */
  setWriteHandler(handler) {
    this.writeHandler = handler;
  }

  /**
   * Read the property.
   *
   * @returns {Promise<any>} The current value of the property.
   */
  async read() {
    if (this.readHandler) {
      return this.readHandler();
    } else {
      console.error(`No read handler set for property ${this.name}`);
      throw new Error('InternalError');
    }
  }

  /**
   * Write the property.
   *
   * @param {any} value The value to write.
   * @returns {Promise<void>} A Promise.
   */
  async write(value) {
    // TODO: Validate value against data schema
    if (this.writeHandler) {
      return this.writeHandler(value);
    } else {
      console.error(`No write handler set for property ${this.name}`);
      throw new Error('InternalError');
    }
  }

  /**
   * @returns {PropertyDescription}
   */
  getMetadata() {
    let metadata = /** @type {PropertyDescription} */ (super.getMetadata());
    /** @type {Array<Form>} */
    metadata.forms = [];

    // Only set type member if explicitly set
    if (this.type != undefined) {
      metadata.type = this.type;
    }

    // Only set readOnly member if explicitly set to true since false is default
    if (this.readOnly === true) {
      metadata.readOnly = true;
    }

    // Only set writeOnly member if explicitly set to true since false is default
    if (this.writeOnly === true) {
      metadata.writeOnly = true;
    }

    // Generate Form
    const propertyForm = {
      href: `properties/${this.name}`,
      op: /** @type {Array<string>} */ ([]),
    };
    if (this.writeOnly !== true) {
      propertyForm.op.push('readproperty');
    }
    if (this.readOnly !== true) {
      propertyForm.op.push('writeproperty');
    }
    metadata.forms.push(propertyForm);

    return metadata;
  }
}

export default PropertyAffordance;
