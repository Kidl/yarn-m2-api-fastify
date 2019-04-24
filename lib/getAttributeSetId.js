function getAttributeSetId(variable) {
  if (!process.env.ATTRIBUTE_SETS) {
    throw new Error('Environment variables is empty');
  }

  const keys = Object.keys(JSON.parse(process.env.ATTRIBUTE_SETS));
  const index = keys.indexOf(variable);

  if (index < 0) {
    throw new Error(`Environment variables must have value: ${keys.join(', ')}`);
  } else {
    return Object.values(JSON.parse(process.env.ATTRIBUTE_SETS))[index];
  }
}

module.exports = getAttributeSetId;
