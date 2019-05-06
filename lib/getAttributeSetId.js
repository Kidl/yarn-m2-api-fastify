function getAttributeSetId(variable) {
  if (!process.env.ATTRIBUTE_SETS) {
    throw new Error(`Environment variables must have value: ATTRIBUTE_SETS`);
  }

  const ATTRIBUTE_SETS = JSON.parse(process.env.ATTRIBUTE_SETS);
  const attributeSetId = Object.entries(ATTRIBUTE_SETS).filter(entry => entry[1] === variable)[0];

  if (attributeSetId) {
    return attributeSetId;
  } else {
    throw new Error(`Environment variables must have value: ATTRIBUTE_SETS`);
  }
}

module.exports = getAttributeSetId;
