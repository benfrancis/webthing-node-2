import InteractionAffordance from './interaction-affordance.js';
import ValidationError from './validation-error.js';

/** @import {DataSchema, PartialActionDescription, ActionDescription, Form} from "./types.js" */

/**
 * Action Affordance
 *
 * Represents an ActionAffordance from the W3C WoT Thing Description 1.1
 * specification https://www.w3.org/TR/wot-thing-description/#actionaffordance
 */
class ActionAffordance extends InteractionAffordance {
  /**
   * @type {DataSchema|undefined}
   */
  input;

  /**
   * @type {DataSchema|undefined}
   */
  output;

  /**
   * @type {boolean|undefined}
   */
  safe;

  /**
   * @type {boolean|undefined}
   */
  idempotent;

  /**
   * @type {boolean|undefined}
   */
  synchronous;

  /**
   * Create a new Action.
   *
   * @param {string} name The name of the ActionAffordance from its
   *   key in an actions Map.
   * @param {PartialActionDescription} metadata Metadata describing an
   *   ActionAffordance from a partial Thing Description.
   */
  constructor(name, metadata) {
    super(name, metadata);

    let validationError = new ValidationError([]);

    // Parse safe member
    try {
      this.#parseSafeMember(metadata.safe);
    } catch (error) {
      validationError.merge(error);
    }

    // Parse idempotent member
    try {
      this.#parseIdempotentMember(metadata.idempotent);
    } catch (error) {
      validationError.merge(error);
    }

    // TODO: Parse other members
  }

  /**
   * Parse safe member.
   *
   * @param {boolean|undefined} safe
   *
   * TODO: Consider omitting this member if not specified
   */
  #parseSafeMember(safe) {
    // Throw an error if not a boolean or undefined
    if (!(safe === undefined || typeof safe == 'boolean')) {
      throw new ValidationError([
        {
          field: `actions.${this.name}.safe`,
          description: 'safe member is not a boolean',
        },
      ]);
    }
    // If undefined then default to false
    if (safe === undefined) {
      this.safe = false;
      // Otherwise set the provided value
    } else {
      this.safe = safe;
    }
  }

  /**
   * Parse idempotent member.
   *
   * @param {boolean|undefined} idempotent
   *
   * TODO: Consider omitting this member if not specified
   */
  #parseIdempotentMember(idempotent) {
    // Throw an error if not a boolean or undefined
    if (!(idempotent === undefined || typeof idempotent == 'boolean')) {
      throw new ValidationError([
        {
          field: `actions.${this.name}.idempotent`,
          description: 'idempotent member is not a boolean',
        },
      ]);
    }
    // If undefined then default to false
    if (idempotent === undefined) {
      this.idempotent = false;
      // Otherwise set the provided value
    } else {
      this.idempotent = idempotent;
    }
  }

  /**
   * Set invoke handler function.
   *
   * @param {(value: any) => Promise<void>} handler An asynchronous function to action invocations.
   */
  setInvokeHandler(handler) {
    this.invokeHandler = handler;
  }

  /**
   * Invoke the action.
   *
   * @param {any} input The input to the action.
   * @returns {Promise<any>} A Promise which resolves with the output of the action.
   */
  async invoke(input) {
    // TODO
  }

  /**
   * @returns {ActionDescription}
   */
  getMetadata() {
    //TODO
    return { forms: [{ href: 'http://localhost' }] };
  }
}

export default ActionAffordance;
