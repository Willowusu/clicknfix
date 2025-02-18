const dotenv = require('dotenv')
const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api')

// Determine environment (default to development)
// const env = process.env.NODE_ENV || "development";
// dotenv.config({ path: `.env.${env}` });
dotenv.config()

const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output.json')


//express app
const app = express();

//middleware
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})


//routes
app.use('/api/v1', apiRoutes)
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))


// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err); // Log error in console
    res.status(err.status || 500).json({
        error: err || "Internal Server Error",
    });
});


//connect to db
mongoose.connect(process.env.MONGO_URL).then(() => {
    //listen for request
    app.listen(process.env.PORT, () => {
        console.log(`connected to db & Listening on port ${process.env.PORT}`)
    })
}).catch((error) => {
    console.log(error)
})

