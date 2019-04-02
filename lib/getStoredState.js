'use strict';

exports.__esModule = true;
exports.default = getStoredState;

var _constants = require('./constants');

function getStoredState(config) {
  var transforms = config.transforms || [];
  var storageKey = '' + (config.keyPrefix !== undefined ? config.keyPrefix : _constants.KEY_PREFIX) + config.key;
  var storage = config.storage;
  var debug = config.debug;
  var deserialize = void 0;
  if (!config.deserialize) {
    deserialize = defaultDeserialize;
  } else if (typeof config.deserialize === 'function') {
    deserialize = config.deserialize;
  } else {
    deserialize = function deserialize(x) {
      return x;
    };
  }
  return storage.getItem(storageKey).then(function (serialized) {
    if (!serialized) return undefined;else {
      try {
        var state = {};
        var rawState = deserialize(serialized);
        Object.keys(rawState).forEach(function (key) {
          state[key] = transforms.reduceRight(function (subState, transformer) {
            return transformer.out(subState, key, rawState);
          }, deserialize(rawState[key]));
        });
        return state;
      } catch (err) {
        if (process.env.NODE_ENV !== 'production' && debug) console.log('redux-persist/getStoredState: Error restoring data ' + serialized, err);
        throw err;
      }
    }
  });
}

function defaultDeserialize(serial) {
  return JSON.parse(serial);
}