const magento = require('../lib/api/magento');
const cache = require('../lib/cache');
const getAttributeSetId = require('../lib/getAttributeSetId');

async function getProductsByType(productType, currentPage, discount) {
  const cached = await cache.get(arguments);

  console.log('productType', productType);
  console.log('attributeSetId', getAttributeSetId(productType));

  if (cached) {
    return cached;
  }


    const attributeSetId = getAttributeSetId(productType);

  // ensure attributes cached
  await getAttributes();

  const res = await magento.getProductsByType(attributeSetId, process.env.PRODUCTS_PAGE_SIZE, currentPage);

  const getConfigurableProducts = res.products.map(product => getConfigurableProductBySku(product.sku));
  const configurableProducts = await Promise.all(getConfigurableProducts);

  products = await structureProducts(productType, res.products, configurableProducts, discount);

  res.products = products;

  if (!cached && res) {
    cache.set(arguments, res);
  }

  return res;
}

async function structureProducts(productType, products, configurableProducts, discount) {
  const result = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productItems = configurableProducts[i];

    const structuredProduct = productType === 'yarn'
      ? await structureProductYarn(product, productItems, discount) : await structureProductNeedles(product, productItems, discount);

    result.push(structuredProduct);
  }

  return Promise.all(result);
}

async function structureProductYarn(product, productItems, discount) {
  return {
    sku: product.sku,
    enabled: !!product.status,
    name: product.name,
    brand: await getAttributeValue('brand', getAttributeIdLocal('brand')),
    weight: product.weight,
    length: getAttributeIdLocal('length'),
    gauge: await getAttributeValue('gauge', getAttributeIdLocal('gauge')),
    gauge_stockinette: !!getAttributeIdLocal('gauge_stockinette'),
    fiber_content: await getAttributeValueMultiple('fiber_content', getAttributeIdLocal('fiber_content')),
    fabric_care: await getAttributeValueMultiple('fabric_care', getAttributeIdLocal('fabric_care', product)),
    country: getAttributeIdLocal('country_of_manufacture'),
    items: await structureProductItems(productItems),
  };

  async function structureProductItems(productItems) {
    productItems = productItems.map(productItem => structureProductItem(productItem));

    return Promise.all(productItems);
  }

  async function structureProductItem(productItem) {
    discount = +discount || 0;

    return {
      sku: productItem.sku,
      enabled: !!productItem.status,
      name: productItem.name,
      color_tint_code: getAttributeIdLocal('color_tint_code'),
      color_tint: await getAttributeValue('color_tint', getAttributeIdLocal('color_tint')),
      price: productItem.price,
      price_merchant: productItem.price * (100 - discount) / 100,
      image: {
        swatch: process.env.MEDIA_URL + getAttributeIdLocal('swatch_image', productItem),
        base: process.env.MEDIA_URL + getAttributeIdLocal('image', productItem),
      },
    };
  }

  function getAttributeIdLocal(attributeName, context) {
    context = context || productItems[0];

    return getAttributeId(attributeName, context);
  }
}

async function structureProductNeedles(product, productItems, discount) {

  return {
    sku: product.sku,
    enabled: !!product.status,
    name: product.name,
    brand: await getAttributeValue('brand', getAttributeIdLocal('brand')),
    weight: product.weight,
    material: await getAttributeValue('material', getAttributeIdLocal('material')),
    color: await getAttributeValue('color', getAttributeIdLocal('color')),
    items: await structureProductItems(productItems),
  };

  async function structureProductItems(productItems) {
    productItems = productItems.map(productItem => structureProductItem(productItem));

    return Promise.all(productItems);
  }

  async function structureProductItem(productItem) {
    discount = +discount || 0;

    return {
      sku: productItem.sku,
      enabled: !!productItem.status,
      name: productItem.name,
      thickness: await getAttributeValue('thickness', getAttributeIdLocal('thickness', productItem)),
      length: await getAttributeValue('needle_length', getAttributeIdLocal('needle_length', productItem)),
      weight: getAttributeIdLocal('weight', productItem),
      price: productItem.price,
      price_merchant: productItem.price * (100 - discount) / 100,
      image: {
        swatch: process.env.MEDIA_URL + getAttributeIdLocal('thumbnail', productItem),
        base: process.env.MEDIA_URL + getAttributeIdLocal('image', productItem),
      },
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

  const result = [];

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
