const magento = require('../lib/api/magento');
const cache = require('../lib/cache');

async function getProductsByType(productType, currentPage) {
  const cached = await cache.get(arguments);

  if (cached) {
    return cached;
  }

  const allowedProductTypes = ['yarn','needles'];
  const productTypesMap = {'needles': 'pinner'};

  const pageSize = process.env.PRODUCTS_PAGE_SIZE;

  if (!allowedProductTypes || allowedProductTypes.indexOf(productType) === -1) {
    return new Error('Invalid productType');
  }

  const attributeSetName = productTypesMap && productTypesMap[productType] || productType;

  const attributeSetId = await magento.getAttributeSetId(attributeSetName);

  if (!attributeSetId) {
    return;
  }

  const products = await magento.getProductsByType(attributeSetId, pageSize, currentPage);

  if (!cached && products) {
    cache.set(arguments, products);
  }

  return products;
}

async function getProductBySku(sku) {
  const cached = await cache.get(arguments);

  if (cached) {
    return cached;
  }

  const products = await magento.getProductsBySku(sku);
  const product = products[0];

  if (!cached && product) {
    cache.set(arguments, product);
  }

  return product;
}

module.exports = {
  getProductsByType,
  getProductBySku,
};
