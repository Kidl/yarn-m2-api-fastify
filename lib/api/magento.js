const axios = require('axios').create({
  baseURL: process.env.MAGENTO_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.MAGENTO_ACCESS_TOKEN}`
  }
});

const PRODUCTS_ENDPOINT_URL = process.env.PRODUCTS_ENDPOINT_URL;
const ATTRIBUTE_SET_ENDPOINT_URL = process.env.ATTRIBUTE_SET_ENDPOINT_URL;

async function getProducts(params) {
  let products;

  try {
    products = await axios.get(PRODUCTS_ENDPOINT_URL, {
      params,
      paramsSerializer: params => toQueryString(params)
    });
  } catch (err) {
    if (err.response) {
      err.status = err.response.status;

      if (err.response.data && err.response.data.message) {
        err.message = err.response.data.message;
      }
    }

    throw err;
  }

  products = products && products.data && products.data.items;

  return products;
}

async function getProductsByType(attributeSetId, pageSize, currentPage) {
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
      currentPage: currentPage,
    },
    fields: 'items[id,sku,name,status,custom_attributes]'
  };

  return await getProducts(params);
}

async function getProductsBySku(sku) {
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

  await getProducts(params);
}

async function getAttributeSetId(attributeSetName) {
  const attributeSetNameFilter = {
    field: 'attribute_set_name',
    value: `%${attributeSetName}%`,
    condition_type: 'like'
  };

  const attributeSetNameParams = {
    searchCriteria: {
      filter_groups: [
        {
          filters: [attributeSetNameFilter]
        }
      ]
    },
    fields: 'items[attribute_set_id,attribute_set_name]'
  };

  let attributeSet = await axios.get(ATTRIBUTE_SET_ENDPOINT_URL, {
    params: attributeSetNameParams,
    paramsSerializer: (params) => toQueryString(params)
  });

  attributeSet = attributeSet && attributeSet.data && attributeSet.data.items[0];

  return attributeSet['attribute_set_name'].toLowerCase() === attributeSetName.toLowerCase()
    ? attributeSet['attribute_set_id'] : false;
}

function toQueryString(params = {}, prefix) {
  const query = Object.keys(params).map((item, index) => {
    let value = params[item];

    if (!value && (value === null || isNaN(value))) {
      value = '';
    }

    switch (params.constructor) {
      case Array:
        item = `${prefix}[${index}]`;

        break;

      case Object:
        item = (prefix ? `${prefix}[${item}]` : item);

        break;

      default:
        // do nothing
    }

    if (typeof value === 'object') {
      return toQueryString(value, item);
    }

    return value !== '' ? `${item}=${encodeURIComponent(value)}` : `${item}`;
  });

  return query.join('&');
}

module.exports = {
  getProducts,
  getProductsByType,
  getProductsBySku,
  getAttributeSetId,
};
