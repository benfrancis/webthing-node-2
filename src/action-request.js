import { v4 as uuidv4 } from 'uuid';
/** @import {ProblemDetails, ActionStatus} from "./types.js" */

/**
 * Action Request
 *
 * Represents an individual instance of an asynchronous action and tracks its status.
 */
class ActionRequest {
  /**
   * @type {string}
   */
  id;

  /**
   * @type {'pending'|'running'|'completed'|'failed'}
   */
  state;

  /**
   * @type {any}
   */
  output;

  /**
   * @type {ProblemDetails|undefined}
   */
  error;

  /**
   * @type {Date}
   */
  timeRequested;

  /**
   * @type {Date|undefined}
   */
  timeEnded;

  /**
   * @type {Promise<any>}
   */
  completion;

  /**
   * @type {(output: any) => void}
   */
  #resolveCompletion = () => {};

  /**
   * @type {(error: any) => void}
   */
  #rejectCompletion = () => {};

  constructor() {
    this.id = uuidv4();
    this.state = 'pending';
    this.timeRequested = new Date();
    this.completion = new Promise((resolve, reject) => {
      this.#resolveCompletion = resolve;
      this.#rejectCompletion = reject;
    });
    // The request may be monitored by status rather than by awaiting completion.
    this.completion.catch(() => {});
  }

  /**
   * Start this request's handler.
   *
   * @param {() => Promise<any>} invokeHandler The action invoke handler.
   * @returns {Promise<any>} Resolves with the handler output or rejects with its error.
   */
  start(invokeHandler) {
    if (this.state !== 'pending') {
      throw new Error('Action request has already been started');
    }

    this.state = 'running';
    Promise.resolve()
      .then(invokeHandler)
      .then(
        (output) => {
          this.output = output;
          this.state = 'completed';
          this.timeEnded = new Date();
          this.#resolveCompletion(output);
        },
        (error) => {
          this.error =
            error instanceof Error
              ? { title: error.name, detail: error.message }
              : {
                  title: 'Action failed',
                  ...(typeof error === 'string' ? { detail: error } : {}),
                };
          this.state = 'failed';
          this.timeEnded = new Date();
          this.#rejectCompletion(error);
        },
      );

    return this.completion;
  }

  /**
   * @returns {ActionStatus} The current status of the action request.
   */
  query() {
    /** @type {ActionStatus} */
    const status = {
      id: this.id,
      state: this.state,
      timeRequested: this.timeRequested.toISOString(),
    };
    if (this.output !== undefined) {
      status.output = this.output;
    }
    if (this.error) {
      status.error = this.error;
    }
    if (this.timeEnded) {
      status.timeEnded = this.timeEnded.toISOString();
    }
    return status;
  }
}

export default ActionRequest;
