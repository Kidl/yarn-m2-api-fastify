const Redis = require('ioredis');
const redis = new Redis({ host: process.env.REDIS_HOST, keyPrefix: process.env.REDIS_KEY_PREFIX });

async function get(arguments) {
  const key = arguments.callee.name + JSON.stringify(arguments);

  const cache = await redis.get(key);

  if (cache) {
    try {
      return JSON.parse(cache);
    } catch (err) {
      return cache;
    }
  }
}

async function set(arguments, data) {
  const key = arguments.callee.name + JSON.stringify(arguments);

  await redis.set(key, JSON.stringify(data));
}

async function del(arguments, key) {
  key = key || arguments.callee.name + JSON.stringify(arguments);

  return await redis.del(key);
}

async function deleteAll() {
  const keys = await redis.keys(`${process.env.REDIS_KEY_PREFIX}*`);

  const tasks = keys.map((key) => {
    key = key.replace(process.env.REDIS_KEY_PREFIX, '');

    return redis.del(key);
  });

  await Promise.all(tasks);

  return keys;
}

function getKey(target, arguments) {
  arguments = Array.isArray(arguments) === true
    ? { ...arguments } : arguments;

  return target.name + JSON.stringify(arguments);
}

module.exports = {
  get,
  set,
  del,
  deleteAll,
  getKey,
};
