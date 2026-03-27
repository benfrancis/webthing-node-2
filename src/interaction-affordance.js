import ValidationError from './validation-error.js';
/** @import {DataSchema, Form} from "./types.js" */

/**
 * Interaction Affordance
 *
 * Represents an InteractionAffordance from the W3C WoT Thing Description 1.1
 * specification
 * https://www.w3.org/TR/wot-thing-description/#interactionaffordance
 */
class InteractionAffordance {
  /**
   * @type {string} The name of the InteractionAffordance from its key in
   *   a properties, actions or events Map.
   */
  name;

  /**
   * @type {string|Array<string>|undefined} Semantic type of the affordance.
   */
  '@type';

  /**
   * @type {string|undefined} Human redable title of the affordance.
   */
  title;

  /**
   * @type {string|undefined} Human readable description of the affordance.
   */
  description;

  /**
   * @type {Array<Form>}
   */
  forms = [];

  /**
   *
   * @param {string} name The name of the InteractionAffordance from its key in
   *   a properties, actions or events Map.
   * @param {Object<string, any>} metadata Metadata describing an InteractionAffordance in
   *   a partial Thing Description.
   */
  constructor(name, metadata) {
    let validationError = new ValidationError([]);

    if (
      !name ||
      !metadata ||
      typeof name != 'string' ||
      typeof metadata != 'object'
    ) {
      throw new ValidationError([
        {
          field: `(root)`,
          description:
            'Tried to instantiate an InteractionAffordance with an invalid name or description',
        },
      ]);
    }

    this.name = name;

    // Parse @type member
    try {
      this.#parseSemanticTypeMember(metadata['@type']);
    } catch (error) {
      if (error instanceof ValidationError) {
        validationError.validationErrors.push(...error.validationErrors);
      } else {
        throw error;
      }
    }

    // Parse title member
    try {
      this.#parseTitleMember(metadata.title);
    } catch (error) {
      if (error instanceof ValidationError) {
        validationError.validationErrors.push(...error.validationErrors);
      } else {
        throw error;
      }
    }

    // TODO: Parse titles member

    // Parse description member
    try {
      this.#parseDescriptionMember(metadata.description);
    } catch (error) {
      if (error instanceof ValidationError) {
        validationError.validationErrors.push(...error.validationErrors);
      } else {
        throw error;
      }
    }

    // TODO: Parse descriptions member

    // Note: If a forms member or uriVariables member is included in the partialTD
    // it is current ignored since forms are automatically generated and uriVariables
    // are not currently used in the WoT Thing Protocol.

    // TODO: Allow additional custom forms?
  }

  /**
   * Parse the semantic type member.
   *
   * @param {string|Array<string>|undefined} type The provided value of semantic type.
   */
  #parseSemanticTypeMember(type) {
    if (!type) {
      return;
    }

    // Check that @type has a valid type
    if (!(typeof type == 'string' || Array.isArray(type))) {
      throw new ValidationError([
        {
          field: `properties.${this.name}['@type']`,
          description: '@type member is not a string or Array',
        },
      ]);
    }

    // If @type is a string then use that value
    if (typeof type == 'string') {
      this['@type'] = type;
      return;
    }

    // If @type is an array then validate its contents then set this['@type']
    if (Array.isArray(type)) {
      if (Array.length < 1) {
        return;
      }
      /**
       * @type {Array<string>}
       */
      let types = [];

      /**
       * @type {Array<Object>}
       */
      let errors = [];

      type.forEach((typeItem) => {
        if (typeof typeItem == 'string') {
          types.push(typeItem);
        } else {
          errors.push({
            field: `properties.${this.name}['@type']`,
            description: '@type member is not string or Array of string',
          });
        }
      });
      if (errors.length > 0) {
        throw new ValidationError(errors);
      } else {
        this['@type'] = types;
      }
    }
  }

  /**
   * Parse title member.
   *
   * @param {string|undefined} title
   */
  #parseTitleMember(title) {
    if (!title) {
      return;
    }

    if (typeof title !== 'string') {
      throw new ValidationError([
        {
          field: `properties.${this.name}.title`,
          description: 'title member is not a string',
        },
      ]);
    }

    this.title = title;
  }

  /**
   * Parse description member.
   *
   * @param {string|undefined} description
   */
  #parseDescriptionMember(description) {
    if (!description) {
      return;
    }

    if (typeof description !== 'string') {
      throw new ValidationError([
        {
          field: `properties.${this.name}.description`,
          description: 'description member is not a string',
        },
      ]);
    }

    this.description = description;
  }
}

export default InteractionAffordance;
