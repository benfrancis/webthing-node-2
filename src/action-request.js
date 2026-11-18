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
   * Create a new instance of an action.
   *
   * @param {Promise<any>} invokeHandlerPromise The promise returned by the action invoke handler.
   */
  constructor(invokeHandlerPromise) {
    this.id = uuidv4();
    this.state = 'pending';
    this.timeRequested = new Date();
    invokeHandlerPromise.then((output) => {
      this.output = output;
      this.state = 'completed';
      this.timeEnded = new Date();
      // TODO: Figure out how to tell invoker the action finished
    }).catch((error) => {
      // TODO: Set error
      this.state = 'failed';
      this.timeEnded = new Date();
      // TODO: Figure out how to tell invoker the action finished
    });
  }

  /**
   * @returns {ActionStatus} The current status of the action request.
   */
  query() {
    /** @type {ActionStatus} */
    let status = {
      id: this.id,
      state: this.state,
      timeRequested: this.timeRequested?.toISOString(),
    };
    if (this.output != undefined) {
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

  cancel() {

  }

}

export default ActionRequest;