function str2obj(str) {
    return str
        .split(',')
        .map(keyVal => keyVal
            .split(':')
            .map(_ => _.trim()))
        .reduce((accumulator, currentValue) => {
            accumulator[currentValue[0]] = currentValue[1];
            return accumulator;
        }, {});
}


function getId(variable) {
    if (!process.env.ATTRIBUTE_SETS) {
        throw new Error('Environment variables must have value: ATTRIBUTE_SETS');
    }

    const ATTRIBUTE_SETS = str2obj(process.env.ATTRIBUTE_SETS);
    const attributeSetId = Object.entries(ATTRIBUTE_SETS)
        .filter(entry => entry[0].toString() === variable.toString())[0][1];

    if (attributeSetId) {
        return attributeSetId;
    }
    throw new Error('Unexpected error with ATTRIBUTE_SETS');
}

function getType(id) {
    if (!process.env.ATTRIBUTE_SETS) {
        throw new Error('Environment variables must have value: ATTRIBUTE_SETS');
    }

    const ATTRIBUTE_SETS = str2obj(process.env.ATTRIBUTE_SETS);
    const attributeSetType = Object.entries(ATTRIBUTE_SETS)
        .filter(entry => entry[1].toString() === id.toString())[0][0];

    if (attributeSetType) {
        return attributeSetType;
    }
    throw new Error('Unexpected error with ATTRIBUTE_SETS');
}


module.exports = {
    str2obj,
    getId,
    getType,
};
