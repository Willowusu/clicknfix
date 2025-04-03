const express = require('express');
const mongoose = require('mongoose');
const authenticateToken = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const clientAdminRoutes = require('./routes/client-admin');
const clientRoutes = require('./routes/client');
const providerRoutes = require('./routes/provider');
const superAdminRoutes = require('./routes/super-admin');

require('dotenv').config()

//express app
const app = express();

//middleware
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

//public routes
app.use('/api/v1/auth', authRoutes);

//protected routes
app.use('/api/v1/booking', authenticateToken, bookingRoutes);
app.use('/api/v1/client-admin', authenticateToken, clientAdminRoutes);
app.use('/api/v1/client', authenticateToken, clientRoutes);
app.use('/api/v1/provider', authenticateToken, providerRoutes);
app.use('/api/v1/super-admin', authenticateToken, superAdminRoutes);

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
