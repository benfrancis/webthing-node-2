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
   * @type {('object'|'array'|'string'|'number'|'integer'|'bool * @property {Array<Form>} formsean'|'null')|undefined}
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
      if (error instanceof ValidationError) {
        validationError.validationErrors.push(...error.validationErrors);
      } else {
        throw error;
      }
    }

    // Parse writeOnly member
    try {
      this.#parseWriteOnlyMember(metadata.writeOnly);
    } catch (error) {
      if (error instanceof ValidationError) {
        validationError.validationErrors.push(...error.validationErrors);
      } else {
        throw error;
      }
    }

    // Check that readOnly and writeOnly are not both set
    if (this.readOnly && this.writeOnly) {
      let readWriteError = new ValidationError([
        {
          field: `properties.${this.name}.readOnly`,
          description: 'readOnly member is not a boolean',
        },
      ]);
      validationError.validationErrors.push(...readWriteError.validationErrors);
    }

    // TODO: Parse other members
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
   * Set read handler function.
   *
   * @param {function} handler A function to handle property reads.
   */
  setReadHandler(handler) {
    this.readHandler = handler;
  }

  /**
   * Read the property.
   *
   * @returns {any} The current value of the property.
   */
  read() {
    if (this.readHandler) {
      return this.readHandler();
    } else {
      console.error(`No read handler set for property ${this.name}`);
      throw new Error('InternalError');
    }
  }

  /**
   * @returns {PropertyDescription}
   */
  getMetadata() {
    let metadata = {};
    if (this['@type']) {
      metadata['@type'] = this['@type'];
    }
    if (this.title) {
      metadata.title = this.title;
    }
    if (this.description) {
      metadata.description = this.description;
    }
    /** @type {Array<Form>} */
    metadata.forms = [];

    if (this.writeOnly !== true) {
      const readPropertyForm = {
        href: `properties/${this.name}`,
        op: 'readproperty',
      };
      metadata.forms.push(readPropertyForm);
    }

    return metadata;
  }
}

export default PropertyAffordance;
