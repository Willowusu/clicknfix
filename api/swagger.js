const swaggerAutogen = require('swagger-autogen')();
require ('dotenv').config()

const doc = {
    info: {
        title: 'ClicknFix API',
        description: 'Description'
    },
    host: 'localhost:4000/api/v1'
};

const outputFile = './swagger-output.json';
const routes = ['./routes/api.js',];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);