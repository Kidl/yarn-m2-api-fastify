const Redis = require('ioredis');
let redis;
if(process.env.REDIS_URL){
  redis = new Redis(process.env.REDIS_URL, {keyPrefix: process.env.REDIS_KEY_PREFIX });
}else{
  redis = new Redis({ host: process.env.REDIS_HOST, keyPrefix: process.env.REDIS_KEY_PREFIX });
}

async function get(_arguments) {
  if (process.env.CACHE !== 'true') {
    return false;
  }

  const key = getKey(_arguments.callee, _arguments);

  const cache = await redis.get(key);

  if (cache) {
    try {
      return JSON.parse(cache);
    } catch (err) {
      console.log('Cache.error');
      return cache;
    }
  }
}

async function set(_arguments, data, EX) {
  if (process.env.CACHE === 'true') {
    const key = getKey(_arguments.callee, _arguments);

    await redis.set(key, JSON.stringify(data), 'EX', EX);
  }
}

async function del(_arguments, key) {
  key = key || getKey(_arguments.callee, _arguments);

  const exists = await redis.del(key);

  return exists ? [key] : [];
}

async function deleteAll() {
  let keys = await redis.keys(`${process.env.REDIS_KEY_PREFIX}*`);

  const tasks = keys.map((key) => {
    key = key.replace(process.env.REDIS_KEY_PREFIX, '');

    return redis.del(key);
  });

  await Promise.all(tasks);

  keys = keys.map(key => key.replace(process.env.REDIS_KEY_PREFIX, ''));

  return keys;
}

function getKey(target, _arguments) {
  _arguments = Array.isArray(_arguments) === true
    ? _arguments : [..._arguments];

  return target.name + JSON.stringify(_arguments);
}

module.exports = {
  get,
  set,
  del,
  deleteAll,
  getKey,
};
