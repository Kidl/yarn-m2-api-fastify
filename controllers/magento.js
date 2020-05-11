const magento = require('../lib/api/magento');
const cache = require('../lib/cache');
const attributeSet = require('../lib/attributeSet');

async function getProductsByType(productType, currentPage) {
  const cached = await cache.get(arguments);

  if (cached) {
    return cached;
  }

  const attributeSetId = attributeSet.getId(productType);

  // ensure attributes cached
  await getAttributes();

  let products = await magento.getProductsByType(attributeSetId, process.env.PRODUCTS_PAGE_SIZE, currentPage);
  products = products.products;

  const getConfigurableProducts = products.map(product => getConfigurableProductBySku(product.sku));
  const configurableProducts = await Promise.all(getConfigurableProducts);

  products = await structureProducts(productType, products, configurableProducts);

  if (!cached && products) {
    cache.set(arguments, products);
  }

  return products;
}

async function structureProducts(productType, products, configurableProducts) {
  const result = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productItems = configurableProducts[i];

    const structuredProduct = productType === 'yarn'
      ? structureProductYarn(product, productItems) : structureProductNeedles(product, productItems);

    result.push(structuredProduct);
  }

  return Promise.all(result);
}

async function structureProductYarn(product, productItems) {
  return {
    sku: product.sku,
    enabled: product.status === 1,
    name: product.name,
    brand: await getAttributeValue('brand', getAttributeIdLocal('brand')),
    weight: product.weight,
    length: getAttributeIdLocal('length'),
    gauge: await getAttributeValue('gauge', getAttributeIdLocal('gauge')),
    gauge_stockinette: !!getAttributeIdLocal('gauge_stockinette'),
    fiber_content: await getAttributeValueMultiple('fiber_content', getAttributeIdLocal('fiber_content')),
    fabric_care: await getAttributeValueMultiple('fabric_care', getAttributeIdLocal('fabric_care', product)),
    country: getAttributeIdLocal('country_of_manufacture', product),
    items: productItems ? await structureProductItems(productItems) : [],
  };

  async function structureProductItems(productItems) {
    if (productItems) {
      productItems = productItems.map(productItem => structureProductItem(productItem));

      return Promise.all(productItems);
    }

    return [];
  }

  async function structureProductItem(productItem) {
    return {
      sku: productItem.sku,
      enabled: productItem.status === 1,
      name: productItem.name,
      color_tint_code: getAttributeIdLocal('color_tint_code', productItem),
      color_tint: await getAttributeValue('color_tint', getAttributeIdLocal('color_tint', productItem)),
      price: productItem.price,
      price_merchant: productItem.price,
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

async function structureProductNeedles(product, productItems) {
  return {
    sku: product.sku,
    enabled: product.status === 1,
    name: product.name,
    brand: await getAttributeValue('brand', getAttributeIdLocal('brand')),
    weight: product.weight,
    material: await getAttributeValue('material', getAttributeIdLocal('material')),
    color: await getAttributeValue('color', getAttributeIdLocal('color')),
    items: productItems ? await structureProductItems(productItems) : [],
  };

  async function structureProductItems(productItems) {
    if (productItems) {
      productItems = productItems.map(productItem => structureProductItem(productItem));
      return Promise.all(productItems);
    }

    return [];
  }

  async function structureProductItem(productItem) {
    return {
      sku: productItem.sku,
      enabled: productItem.status === 1,
      name: productItem.name,
      thickness: await getAttributeValue('thickness', getAttributeIdLocal('thickness', productItem)),
      length: await getAttributeValue('needle_length', getAttributeIdLocal('needle_length', productItem)),
      weight: getAttributeIdLocal('weight', productItem),
      price: productItem.price,
      price_merchant: productItem.price,
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
  const attributes = context ? context.custom_attributes : [];

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

async function getProductBySku(sku) {
  const cached = await cache.get(arguments);

  if (cached) {
    return cached;
  }

  const product = await magento.getProductBySku(sku);

  let productChildren;

  if (product.type_id === 'simple') {
    productChildren = [product];
  } else {
    productChildren = await getConfigurableProductBySku(product.sku);
  }

  let structuredProduct = await structureProducts(
    attributeSet.getType(product.attribute_set_id),
    [product],
    [productChildren],
  );

  structuredProduct = structuredProduct[0];

  if (product.type_id === 'simple') {
    structuredProduct = Object.assign(structuredProduct, structuredProduct.items[0]);

    delete structuredProduct.items;
  }

  if (!cached && structuredProduct) {
    cache.set(arguments, structuredProduct);
  }

  return structuredProduct;
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

function addDiscount(products, discount) {
  discount = discount || 0;

  if (Array.isArray(products) === false) {
    products = [products];
  }

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    if (product && product.price) {
      product.price_merchant = product.price * (100 - discount) / 100;
    }

    if (product && product.items) {
      product.items = addDiscount(product.items, discount);
    }
  }

  return products.length === 1 ? products[0] : products;
}

module.exports = {
  getProductsByType,
  getProductBySku,
  getConfigurableProductBySku,
  getAttributeValue,
  addDiscount,
};
