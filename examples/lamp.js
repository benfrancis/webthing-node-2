import WebThing from '../webthing.js';

const partialTD = {
  "title": "My Lamp",
  "description": "A web connected lamp",
  "properties": {
    "on": {
      "type": "boolean",
      "title": "On/Off",
      "description": "Whether the lamp is turned on",
    },
    "level" : {
      "type": "integer",
      "title": "Brightness",
      "description": "The level of light from 0-100",
      "unit": "percent",
      "minimum" : 0,
      "maximum" : 100,
    }
  },
  "actions": {
    "fade": {
      "title": "Fade",
      "description": "Fade the lamp to a given level",
      "synchronous": false,
      "input": {
        "type": "object",
        "properties": {
          "level": {
            "title": "Brightness",
            "type": "integer",
            "minimum": 0,
            "maximum": 100,
            "unit": "percent"
          },
          "duration": {
            "title": "Duration",
            "type": "integer",
            "minimum": 0,
            "unit": "milliseconds"
          }
        }
      },
    }
  },
  "events": {
    "overheated": {
      "title": "Overheated",
      "data": {
        "type": "number",
        "unit": "degree celsius"
      },
      "description": "The lamp has exceeded its safe operating temperature",
    }
  },
}

const thing = new WebThing(partialTD);

thing.setPropertyReadHandler('on', async function() {
  return true;
});

thing.setPropertyReadHandler('level', async function() {
  return 50;
});

thing.expose(8080);