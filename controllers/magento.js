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
    return new Error('Invalid query');
  }

  const attributeSetName = productTypesMap && productTypesMap[productType] || productType;

  const attributeSetId = await magento.getAttributeSetId(attributeSetName);

  if (!attributeSetId) {
    return;
  }

  const params = {
    searchCriteria: {
      filter_groups: [
        {
          filters: [
            {
              field: 'attribute_set_id',
              value: attributeSetId,
              condition_type: 'eq'
            }
          ]
        },
        {
          filters: [
            {
              field: 'type_id',
              value: 'configurable',
              condition_type: 'eq'
            }
          ]
        }
      ],
      sortOrders: [
        {
          field: 'id',
          direction: 'ASC'
        }
      ],
      pageSize,
      currentPage
    },
    fields: 'items[id,sku,name,status,custom_attributes]'
  };

  const products = await magento.getProducts(params);

  if (!cached && products) {
    cache.set(arguments, products);
  }

  return products;
}

async function getProductsBySku(sku) {
  const cached = await cache.get(arguments);

  if (cached) {
    return cached;
  }

  const params = {
    searchCriteria: {
      filter_groups: [
        {
          filters: [
            {
              field: 'sku',
              value: sku,
              condition_type: 'eq'
            }
          ]
        },
      ],
    },
  };

  const product = await magento.getProducts(params);

  if (!cached && product) {
    cache.set(arguments, product);
  }

  return product;
}

module.exports = {
  getProductsByType,
  getProductsBySku,
};
