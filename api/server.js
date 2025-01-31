require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api')


//express app
const app = express();

//middleware
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})



//routes
app.use('/api/', apiRoutes)

//connect to db
mongoose.connect(process.env.MONGO_URI).then(() => {
    //listen for request
    app.listen(process.env.PORT, () => {
        console.log('connected to db & Listening on port 4000')
    })
}).catch((error) => {
    console.log(error)
})

