const axios = require('axios').create({
  baseURL: process.env.MAGENTO_API_URL,
  headers: {
    Authorization: `Bearer ${process.env.MAGENTO_ACCESS_TOKEN}`,
  },
});

async function getAttributes() {
  const uri = '/rest/V1/products/attributes?searchCriteria[filter_groups][0][filters][0][field]=attribute_code'
    + '&searchCriteria[filter_groups][0][filters][0][value]=brand,gauge,gauge_stockinette,fiber_content,fabric_care,color_tint,certificates,needle_length,thickness,color,material'
    + '&searchCriteria[filter_groups][0][filters][0][condition_type]=in&fields=items[attribute_code,options]';

  let attributes;

  try {
    attributes = await axios.get(uri);
    attributes = attributes && attributes.data && attributes.data.items;
  } catch (err) {
    if (err.response) {
      err.status = err.response.status;

      if (err.response.data && err.response.data.message) {
        err.message = err.response.data.message;
      }
    }

    throw err;
  }

  attributes = attributes.map((item) => {
    const attribute = {};

    attribute[item.attribute_code] = item.options;

    return attribute;
  });

  attributes = Object.assign({}, ...attributes);

  return attributes;
}

async function getProductsByType(attributeSetId, pageSize, currentPage) {
  let products;
  let count = 0;

  const uri = '/rest/V1/products?searchCriteria[filter_groups][0][filters][0][field]=attribute_set_id'
        + `&searchCriteria[filter_groups][0][filters][0][value]=${attributeSetId}`
        + '&searchCriteria[filter_groups][0][filters][0][condition_type]=eq'
        + '&searchCriteria[filter_groups][1][filters][0][field]=type_id'
        + '&searchCriteria[filter_groups][1][filters][0][value]=configurable'
        + '&searchCriteria[filter_groups][1][filters][0][condition_type]=eq'
        + '&searchCriteria[sortOrders][0][field]=id'
        + '&searchCriteria[sortOrders][0][direction]=ASC'
        + `&searchCriteria[pageSize]=${pageSize}`
        + `&searchCriteria[currentPage]=${currentPage}`
        + '&fields=items[id,sku,name,status,custom_attributes],total_count';

  try {
    products = await axios.get(uri);
  } catch (err) {
    if (err.response) {
      err.status = err.response.status;

      if (err.response.data && err.response.data.message) {
        err.message = err.response.data.message;
      }
    }

    throw err;
  }

  count = (products && products.data && products.data.total_count) ? products.data.total_count : count;

  if (currentPage > Math.ceil(count / pageSize)) {
    throw new Error('currentPage value is too large');
  }

  products = products && products.data && products.data.items;

  return {
    count,
    steps: Math.ceil(count / pageSize),
    step: currentPage,
    limits: pageSize,
    products,
  };
}

async function getConfigurableProductBySku(sku) {
  const uri = `/rest/V1/configurable-products/${encodeURIComponent(sku)}/children`;

  let product;

  try {
    product = await axios.get(uri);
  } catch (err) {
    if (err.response) {
      err.status = err.response.status;

      if (err.response.data && err.response.data.message) {
        err.message = err.response.data.message;
      }
    }

    throw err;
  }

  return product && product.data;
}

async function getProductBySku(sku) {
  const uri = `/rest/V1/products/${encodeURIComponent(sku)}`;

  let product;

  try {
    product = await axios.get(uri);
  } catch (err) {
    if (err.response) {
      err.status = err.response.status;

      if (err.response.data && err.response.data.message) {
        err.message = err.response.data.message;
      }
    }

    throw err;
  }

  return product && product.data;
}

module.exports = {
  getProductsByType,
  getAttributes,
  getProductBySku,
  getConfigurableProductBySku,
};
