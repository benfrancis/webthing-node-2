import InteractionAffordance from './interaction-affordance.js';
import ValidationError from './validation-error.js';

/** @import {DataSchema, PartialActionDescription, ActionDescription, Form,
 *    ActionStatus} from "./types.js"
 */

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

    // Parse input member
    try {
      this.#parseInputMember(metadata.input);
    } catch (error) {
      validationError.merge(error);
    }

    // Parse output member
    try {
      this.#parseOutputMember(metadata.output);
    } catch (error) {
      validationError.merge(error);
    }

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

    // Parse synchonrous member
    try {
      this.#parseSynchronousMember(metadata.synchronous);
    } catch (error) {
      validationError.merge(error);
    }

    if (validationError.validationErrors.length > 0) {
      throw validationError;
    }
  }

  /**
   * Parse input member.
   *
   * @param {DataSchema|undefined} input
   */
  #parseInputMember(input) {
    if (!(input === undefined || typeof input === 'object')) {
      throw new ValidationError([
        {
          field: `actions.${this.name}.input`,
          description: 'input member is not valid',
        },
      ]);
    }
    // TODO: Validate DataSchema
    this.input = input;
  }

  /**
   * Parse output member.
   * @param {DataSchema|undefined} output
   */
  #parseOutputMember(output) {
    if (!(output === undefined || typeof output === 'object')) {
      throw new ValidationError([
        {
          field: `actions.${this.name}.output`,
          description: 'output member is not valid',
        },
      ]);
    }
    // TODO: Validate DataSchema
    this.output = output;
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
   * Parse synchronous member.
   *
   * @param {boolean|undefined} synchronous
   */
  #parseSynchronousMember(synchronous) {
    // Throw an error if not a boolean or undefined
    if (!(synchronous === undefined || typeof synchronous == 'boolean')) {
      throw new ValidationError([
        {
          field: `actions.${this.name}.synchronous`,
          description: 'synchronous member is not a boolean',
        },
      ]);
    }
    this.synchronous = synchronous;
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
   * @param {any} input The input to the action, conforming to the input data
   *   schema.
   * @returns {Promise<any>} A Promise which resolves with the output of the
   *   action (if any), conforming to the output data schema.
   *
   * Note: All actions are currently treated as synchronous.
   */
  async invoke(input) {
    // TODO: Validate input against data schema
    if (!this.invokeHandler) {
      console.error(`No invoke handler set for action ${this.name}`);
      throw new Error('InternalError');
    }
    return this.invokeHandler(input);
  }

  /**
   * @returns {ActionDescription}
   */
  getMetadata() {
    let metadata = /** @type {ActionDescription} */ (super.getMetadata());
    if (this.input != undefined) {
      metadata.input = this.input;
    }
    if (this.output != undefined) {
      metadata.output = this.output;
    }
    // Only set safe member if explicitly set to true because false is default
    if (this.safe === true) {
      metadata.safe = true;
    }
    // Only set idempotent member if explicitly set to true because false is default
    if (this.idempotent === true) {
      metadata.idempotent = true;
    }
    // Only set idempotent member if explicitly set to true or false
    if (this.synchronous === true || this.synchronous === false) {
      metadata.synchronous = this.synchronous;
    }
    /** @type {Array<Form>} */
    metadata.forms = [];
    const invokeActionForm = {
      href: `actions/${this.name}`,
      op: 'invokeaction',
    };
    metadata.forms.push(invokeActionForm);
    return metadata;
  }
}

export default ActionAffordance;
