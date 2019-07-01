function getIdByName(attributeName) {
  if (!process.env.ATTRIBUTE_SETS) {
    throw new Error('Environment variables must have value: ATTRIBUTE_SETS');
  }

  const ATTRIBUTE_SETS = JSON.parse(process.env.ATTRIBUTE_SETS);

  const attributeSetId = Object.entries(ATTRIBUTE_SETS).filter((entry) => entry[1] === attributeName)[0];

  if (attributeSetId) {
    return attributeSetId;
  }

  throw new Error('Invalid attribute set');
}

function getNameById(id) {
  if (!process.env.ATTRIBUTE_SETS) {
    throw new Error('Environment variables must have value: ATTRIBUTE_SETS');
  }

  const ATTRIBUTE_SETS = JSON.parse(process.env.ATTRIBUTE_SETS);

  const attributeSetType = ATTRIBUTE_SETS[id];

  if (attributeSetType) {
    return attributeSetType;
  }

  throw new Error('Unexpected error with ATTRIBUTE_SETS');
}


module.exports = {
  getIdByName,
  getNameById,
};
