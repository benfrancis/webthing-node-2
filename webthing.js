import express from 'express';
const app = express();

/**
 * Web Thing.
 * 
 * Represents a W3C WoT Web Thing.
 */
class WebThing {
  propertyReadHandlers = {};

  constructor(partialTD) {
    // TODO: Parse and validate TD.
    this.partialTD = partialTD;
  }

  getThingDescription() {
    // TODO: Add forms etc.
    return this.partialTD;
  }

  setPropertyReadHandler(name, handler) {
    this.propertyReadHandlers[name] = handler;
  }

  readProperty(name) {
    if(!this.propertyReadHandlers[name]) {
      console.error('No property read handler for the property ' + name);
      throw new Error();
    } else {
      return this.propertyReadHandlers[name]();
    }
  }

  expose(port) {
    app.get('/', (request, response) => {
      response.json(this.getThingDescription());
    });

    app.get('/properties/:name', async (request, response) => {
      const name = request.params.name;
      const value = await this.readProperty(name);
      response.status(200).json(value);
    });

    app.listen(port, () => {
      console.log(`Web Thing being served on port ${port}`)
    });
  }
}

export default WebThing;