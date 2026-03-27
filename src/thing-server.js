import express from 'express';

/** @typedef {import('./thing.js').default} Thing */
/** @typedef {express.Request} Request */
/** @typedef {express.Response} Response */

class ThingServer {
  /**
   * Construct the Thing Server.
   *
   * @param {Thing} thing The Thing to serve.
   */
  constructor(thing) {
    this.thing = thing;
    this.app = express();
    this.server = null;

    this.app.get(
      '/',
      /**
       * @param {Request} request
       * @param {Response} response
       */
      (request, response) => {
        const host = request.headers.host;
        response.json(this.thing.getThingDescription(host));
      },
    );

    this.app.get(
      '/properties/:name',
      /**
       * @param {Request} request
       * @param {Response} response
       */
      async (request, response) => {
        // Make sure name is a string since param can also be array
        const name = Array.isArray(request.params.name)
          ? request.params.name[0]
          : request.params.name;
        let value;
        try {
          value = await this.thing.readProperty(name);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'InternalError';
          switch (errorMessage) {
            case 'NotFoundError':
              response.status(404).send();
              break;
            case 'InternalError':
              response.status(500).send();
              break;
            default:
              response.status(500).send();
          }
          return;
        }
        response.status(200).json(value);
      },
    );
  }

  /**
   * Start the Thing Server.
   *
   * @param {number} port The TCP port number to listen on.
   */
  start(port) {
    this.server = this.app.listen(port, () => {
      console.log(`Web Thing being served on port ${port}`);
    });
  }

  /**
   * Stop the Thing Server.
   */
  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

export default ThingServer;
