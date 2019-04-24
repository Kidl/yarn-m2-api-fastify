const magento = require('../lib/api/magento');
const cache = require('../lib/cache');

async function getProductsByType(productType, currentPage, discount) {
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

  // ensure attributes cached
  await getAttributes();

  let products = await magento.getProductsByType(attributeSetId, pageSize, currentPage);

  const getConfigurableProducts = products.map((product) => getConfigurableProductBySku(product.sku));
  const configurableProducts = await Promise.all(getConfigurableProducts);

  products = await structureProducts(productType, products, configurableProducts, discount);

  if (!cached && products) {
    cache.set(arguments, products);
  }

  return products;
}

async function structureProducts(productType, products, configurableProducts, discount) {
  const result = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productItems = configurableProducts[i];

    const structuredProduct = productType === 'yarn' ?
      await structureProductYarn(product, productItems, discount) : await structureProductNeedles(product, productItems, discount);

    result.push(structuredProduct);
  }

  return Promise.all(result);
}

async function structureProductYarn(product, productItems, discount) {
  return {
    'sku': product.sku,
    'enabled': (!!product.status).toString(),
    'name': product.name,
    'brand': await getAttributeValue('brand', getAttributeIdLocal('brand')),
    'weight': product.weight,
    'length': getAttributeIdLocal('length'),
    'gauge': await getAttributeValue('gauge', getAttributeIdLocal('gauge')),
    'gauge_stockinette': !!getAttributeIdLocal('gauge_stockinette'),
    'fiber_content': await getAttributeValueMultiple('fiber_content', getAttributeIdLocal('fiber_content')),
    'fabric_care': await getAttributeValueMultiple('fabric_care', getAttributeIdLocal('fabric_care', product)),
    'country': getAttributeIdLocal('country_of_manufacture'),
    'items': await structureProductItems(productItems),
  };

  async function structureProductItems(productItems) {
    productItems = productItems.map((productItem) => structureProductItem(productItem));

    return Promise.all(productItems);
  }

  async function structureProductItem(productItem) {
    discount = +discount || 0;

    return {
      'sku': productItem.sku,
      'enabled': (!!productItem.status).toString(),
      'name': productItem.name,
      'color_tint_code': getAttributeIdLocal('color_tint_code'),
      'color_tint': await getAttributeValue('color_tint', getAttributeIdLocal('color_tint')),
      'price': productItem.price,
      'price_merchant': productItem.price * (100 - discount) / 100,
      'image': {
        'swatch': getAttributeIdLocal('swatch_image'),
        'base': getAttributeIdLocal('image'),
      }
    };
  }

  function getAttributeIdLocal(attributeName, context) {
    context = context || productItems[0];

    return getAttributeId(attributeName, context);
  }
}

async function structureProductNeedles(product, productItems, discount) {
  return {
    'sku': product.sku,
    'enabled': (!!product.status).toString(),
    'name': product.name,
    'brand': await getAttributeValue('brand', getAttributeIdLocal('brand')),
    'weight': product.weight,
    'material': getAttributeIdLocal('material'),
    'color': getAttributeIdLocal('color'),
    'items': await structureProductItems(productItems),
  };

  async function structureProductItems(productItems) {
    productItems = productItems.map((productItem) => structureProductItem(productItem));

    return Promise.all(productItems);
  }

  async function structureProductItem(productItem) {
    discount = +discount || 0;

    return {
      'sku': productItem.sku,
      'enabled': (!!productItem.status).toString(),
      'name': productItem.name,
      'thickness': getAttributeIdLocal('thickness'),
      'length': getAttributeIdLocal('length'),
      'weight': getAttributeIdLocal('weight'),
      'price': productItem.price,
      'price_merchant': productItem.price * (100 - discount) / 100,
      'image': {
        'swatch': getAttributeIdLocal('thumbnail'),
        'base': getAttributeIdLocal('image'),
      }
    };
  }

  function getAttributeIdLocal(attributeName, context) {
    context = context || productItems[0];

    return getAttributeId(attributeName, context);
  }
}

function getAttributeId(attributeName, context) {
  const attributes = context.custom_attributes || [];

  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i];

    if (attribute.attribute_code === attributeName) {
      return attribute.value;
    }
  }
}

async function getConfigurableProductBySku(sku) {
  const cached = await cache.get(arguments);

  if (cached) {
    return cached;
  }

  const product = await magento.getConfigurableProductBySku(sku);

  if (!cached && product) {
    cache.set(arguments, product);
  }

  return product;
}

async function getAttributesByName(attributeName) {
  const cached = await cache.get(arguments);

  if (cached) {
    return cached;
  }

  let attributes = await getAttributes();
  attributes = attributes[attributeName];

  if (!cached && attributes) {
    cache.set(arguments, attributes);
  }

  return attributes || false;
}

async function getAttributes() {
  const cached = await cache.get(arguments);

  if (cached) {
    return cached;
  }

  const attributes = await magento.getAttributes();

  if (!cached && attributes) {
    cache.set(arguments, attributes);
  }

  return attributes;
}

async function getAttributeValue(attributeName, attributeId) {
  const cached = await cache.get(arguments);

  if (cached) {
    return cached;
  }

  const attributes = await getAttributesByName(attributeName);

  let attributeValue;

  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i];

    if (attribute.value === attributeId) {
      attributeValue = attribute.label;

      break;
    }
  }

  if (!cached && attributeValue) {
    cache.set(arguments, attributeValue);
  }

  return attributeValue || false;
}

async function getAttributeValueMultiple(attributeName, attributeIds) {
  if (typeof attributeIds === 'string') {
    attributeIds = attributeIds.split(',');
  }

  attributeIds = attributeIds || [];

  const cached = await cache.get(arguments);

  if (cached) {
    return cached;
  }

  const attributes = await getAttributesByName(attributeName);

  let result = [];

  for (let k = 0; k < attributeIds.length; k++) {
    const attributeId = attributeIds[k];

    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];

      if (attribute.value === attributeId) {
        result.push(attribute.label);

        break;
      }
    }
  }

  if (!cached && result) {
    cache.set(arguments, result);
  }

  return result;
}

module.exports = {
  getProductsByType,
  getConfigurableProductBySku,
  getAttributeValue,
};
