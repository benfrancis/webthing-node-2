import Thing from '../src/thing.js';
import ThingServer from '../src/thing-server.js';

/** @import {PartialThingDescription} from '../src/types.js' */

/** @satisfies {PartialThingDescription} */
const partialTD = {
  title: 'My Lamp',
  description: 'A web connected lamp',
  properties: {
    on: {
      type: 'boolean',
      title: 'On/Off',
      description: 'Whether the lamp is turned on',
    },
    level: {
      type: 'number',
      title: 'Brightness',
      description: 'The level of light from 0-100',
      unit: 'percent',
      minimum: 0,
      maximum: 100,
    },
  },
  actions: {
    fade: {
      title: 'Fade',
      description: 'Fade the lamp to a given level',
      synchronous: false,
      input: {
        type: 'object',
        properties: {
          level: {
            title: 'Brightness',
            type: 'number',
            minimum: 0,
            maximum: 100,
            unit: 'percent',
          },
          duration: {
            title: 'Duration',
            type: 'integer',
            minimum: 0,
            unit: 'milliseconds',
          },
        },
      },
    },
  },
  events: {
    overheated: {
      title: 'Overheated',
      data: {
        type: 'number',
        unit: 'degree celsius',
      },
      description: 'The lamp has exceeded its safe operating temperature',
    },
  },
};

const thing = new Thing(partialTD);
let currentOnValue = false;
let currentLevelValue = 100;

thing.setPropertyReadHandler('on', async function () {
  return currentOnValue;
});

thing.setPropertyReadHandler('level', async function () {
  return currentLevelValue;
});

thing.setPropertyWriteHandler('on', async function (value) {
  currentOnValue = value;
  return;
});

thing.setPropertyWriteHandler('level', async function (value) {
  currentLevelValue = value;
  return;
});

thing.setActionHandler('fade', async function (input) {
  if (
    typeof input.level !== 'number' ||
    !Number.isFinite(input.level) ||
    input.level < 0 ||
    input.level > 100 ||
    typeof input.duration !== 'number' ||
    !Number.isFinite(input.duration) ||
    input.duration < 0
  ) {
    throw new Error('BadRequest');
  }

  const startLevel = currentLevelValue;
  const targetLevel = input.level;
  const duration = input.duration;
  const startTime = performance.now();

  if (duration === 0) {
    currentLevelValue = targetLevel;
    return;
  }

  let elapsed = 0;
  while (elapsed < duration) {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(100, duration - elapsed)),
    );
    elapsed = Math.min(performance.now() - startTime, duration);
    currentLevelValue =
      startLevel + (targetLevel - startLevel) * (elapsed / duration);
  }

  currentLevelValue = targetLevel;
});

const server = new ThingServer(thing);

server.start(8080);
