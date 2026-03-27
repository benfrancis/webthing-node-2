import ValidationError from './validation-error.js';
import PropertyAffordance from './property-affordance.js';
/** @import {SecurityScheme, PartialPropertyDescription, PropertyDescription, PartialThingDescription, ThingDescription} from "./types.js" */

/**
 * Thing
 *
 * Represents a Web Thing.
 *
 * Implements a Thing from the W3C WoT Thing Description 1.1 specification.
 * https://www.w3.org/TR/wot-thing-description/#thing
 */
class Thing {
  DEFAULT_CONTEXT = 'https://www.w3.org/2022/wot/td/v1.1';

  /**
   * @type {string|Array<string|Record<string, string>>}
   */
  context = this.DEFAULT_CONTEXT;

  /**
   * @type {string}
   */
  title = '';

  /**
   * @type {Map<string, PropertyAffordance>}
   */
  properties = new Map();

  /**
   * @type {Record<string, SecurityScheme>}
   */
  securityDefinitions;

  /**
   * @type {string|Array<string>}
   */
  security;

  /**
   * @type {URL|undefined}
   */
  base;

  /**
   * Construct Thing from partial Thing Description.
   *
   * @param {PartialThingDescription} partialTD A partial Thing Description
   *   to which Forms will be added.
   */
  constructor(partialTD) {
    // Create an empty validation error to collect errors during parsing.
    let validationError = new ValidationError([]);

    // Parse base member
    try {
      this.#parseBaseMember(partialTD['base']);
    } catch (error) {
      if (error instanceof ValidationError) {
        validationError.validationErrors.push(...error.validationErrors);
      } else {
        throw error;
      }
    }

    // Parse @context member
    try {
      this.#parseContextMember(partialTD['@context']);
    } catch (error) {
      if (error instanceof ValidationError) {
        validationError.validationErrors.push(...error.validationErrors);
      } else {
        throw error;
      }
    }

    // Parse title member
    try {
      this.#parseTitleMember(partialTD.title);
    } catch (error) {
      if (error instanceof ValidationError) {
        validationError.validationErrors.push(...error.validationErrors);
      } else {
        throw error;
      }
    }

    // Parse properties member
    try {
      this.#parsePropertiesMember(partialTD.properties);
    } catch (error) {
      if (error instanceof ValidationError) {
        validationError.validationErrors.push(...error.validationErrors);
      } else {
        throw error;
      }
    }

    // Hard code the nosec security scheme for now
    this.securityDefinitions = {
      nosec_sc: {
        scheme: 'nosec',
      },
    };
    this.security = 'nosec_sc';

    // TODO: Parse other members
  }

  /**
   * Parse the base member of a Thing Description.
   *
   * Note: If being served with ThingServer, the base can automatically be
   * derived from the Host header of an HTTP request for the Thing Description
   * so does not need to be provided in the partialTD when instantiating the
   * Thing.
   *
   * @param {string|undefined} base The base URL, if any, provided in the partialTD.
   * @throws {ValidationError} A validation error.
   */
  #parseBaseMember(base) {
    // If no base member is provided then assume it will be automatically
    // generated and continue.
    if (base === undefined) {
      return;
    }

    // Test whether the provided base member is a valid URL
    try {
      const baseURL = new URL(base);
      this.base = baseURL;
    } catch (error) {
      console.error(
        `Error instantiating URL from provided base member: ${error}`,
      );
      throw new ValidationError([
        {
          field: 'base',
          description: 'base is not a valid URL',
        },
      ]);
    }
  }

  /**
   * Parse the @context member of a Thing Description.
   *
   * @param {string|Array<string|Record<string, string>>|undefined} context The @context, if any, provided in the partialTD.
   * @throws {ValidationError} A validation error.
   */
  #parseContextMember(context) {
    // If no @context provided then set it to the default
    if (context === undefined) {
      this.context = this.DEFAULT_CONTEXT;
      return;
    }

    // If @context is a string but not the default then turn it into an Array
    // and add the default as well
    if (typeof context === 'string') {
      if (context == this.DEFAULT_CONTEXT) {
        this.context = context;
        return;
      } else {
        this.context = new Array();
        this.context.push(context);
        this.context.push(this.DEFAULT_CONTEXT);
      }
      return;
    }

    // If @context is provided and it's an array but doesn't contain the default,
    // then add the default
    if (Array.isArray(context)) {
      // TODO: Check that members of the Array are valid
      this.context = context;
      if (!this.context.includes(this.DEFAULT_CONTEXT)) {
        this.context.push(this.DEFAULT_CONTEXT);
      }
      return;
    }

    // If @context is set but it's not a string or Array then it's invalid
    throw new ValidationError([
      {
        field: 'title',
        description: 'context member is set but is not a string or Array',
      },
    ]);
  }

  /**
   * Parse the title member of a Thing Description.
   *
   * @param {string} title The title provided in the partialTD.
   * @throws {ValidationError} A validation error.
   */
  #parseTitleMember(title) {
    // Require the user to provide a title
    if (!title) {
      throw new ValidationError([
        {
          field: '(root)',
          description: 'Mandatory title member not provided',
        },
      ]);
    }

    if (typeof title !== 'string') {
      throw new ValidationError([
        {
          field: 'title',
          description: 'title member is not a string',
        },
      ]);
    }

    this.title = title;
  }

  /**
   * Parse the properties member of a Thing Description.
   *
   * @param {Record<string, PartialPropertyDescription>|undefined} propertyDescriptions Map of property
   *   descriptions provided in a partial TD, indexed by property name.
   */
  #parsePropertiesMember(propertyDescriptions) {
    // If the properties member is not set then continue
    if (!propertyDescriptions) {
      return;
    }

    // If the provided properties member is not an object then throw a validation error
    if (typeof propertyDescriptions !== 'object') {
      throw new ValidationError([
        {
          field: 'properties',
          description: 'properties member is not an object',
        },
      ]);
    }

    // Generate a map of Property objects from property descriptions
    for (const propertyName in propertyDescriptions) {
      this.addProperty(propertyName, propertyDescriptions[propertyName]);
    }
  }

  /**
   * Add a Property.
   *
   * @param {string} propertyName The name of the property to add.
   * @param {PartialPropertyDescription} propertyDescription A description of a
   *   PropertyAffordance from a Thing Description.
   */
  addProperty(propertyName, propertyDescription) {
    let property = new PropertyAffordance(propertyName, propertyDescription);
    this.properties.set(propertyName, property);
  }

  /**
   * Get Thing Description.
   *
   * @param {string|undefined} host The host at which the Thing is being served.
   * @returns {ThingDescription} A complete Thing Description for the Thing.
   */
  getThingDescription(host) {
    /**
     * @type {Record<string, PropertyDescription>}
     */
    let properties = {};
    for (const propertyName of this.properties.keys()) {
      const property = this.properties.get(propertyName);
      if (property) {
        properties[propertyName] = property.getMetadata();
      }
    }

    /** @type {ThingDescription} */
    const thingDescription = {
      '@context': this.context,
      title: this.title,
      securityDefinitions: this.securityDefinitions,
      security: this.security,
      properties: properties,
      // TODO: generate top level forms
    };
    // If a base argument is provided then use that, otherwise use the base provided in the
    // partial Thing Description.
    if (host) {
      thingDescription.base = `http://${host}/`;
    } else if (this.base) {
      thingDescription.base = this.base.href;
    }
    return thingDescription;
  }

  /**
   * Set Property Read Handler.
   *
   * @param {string} name The name of the property to handle.
   * @param {function} handler A function to handle property reads.
   */
  setPropertyReadHandler(name, handler) {
    let property = this.properties.get(name);
    if (!property) {
      throw new Error(`No property called ${name} could be found`);
    }
    property.setReadHandler(handler);
  }

  /**
   * Read Property.
   *
   * @param {string} name The name of the property to read.
   * @returns {any} The current value of the property, with a format conforming
   *   to its data schema in the Thing Description.
   */
  readProperty(name) {
    let property = this.properties.get(name);
    if (!property) {
      console.error(`No property called ${name} could be found`);
      throw new Error('NotFoundError');
    }
    return property.read();
  }
}

export default Thing;
