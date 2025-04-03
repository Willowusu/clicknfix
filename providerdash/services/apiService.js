let axios = require('axios');
require('dotenv').config();


exports.apiService = async (url, method, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${process.env.BASE_URL}/api/v1${url}`,
      headers,
      data,
    };

    // Remove `data` if the method doesn't support a request body
    if (['GET', 'DELETE'].includes(method.toUpperCase())) {
      delete config.data;
    }

    const response = await axios(config);


    return response.data;

  } catch (error) {
    console.error('API Service Error:', error.response ? error.response.data : error.message);
    return {
      status: 'error',
      message: error.response ? error.response.data : 'An error occurred while processing the request.',
      data: null,
    };
  }
};

