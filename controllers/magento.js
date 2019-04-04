const magento = require('../lib/api/magento');

async function getProducts(productType, currentPage) {
  const allowedProductTypes = ['yarn','needles'];
  const productTypesMap = {'needles': 'pinner'};

  const pageSize = process.env.PRODUCTS_PAGE_SIZE;

  if (!allowedProductTypes || allowedProductTypes.indexOf(productType) === -1) {
    return new Error('Invalid query');
  }

  const attributeSetName = productTypesMap && productTypesMap[productType] || productType;

  const attributeSetId = await magento.getAttributeSetId(attributeSetName);

  return await magento.getProducts(attributeSetId, pageSize, currentPage);
}

module.exports = {
  getProducts
};
