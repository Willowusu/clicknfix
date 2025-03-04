# ClickNFix

A comprehensive service booking and management platform that connects service providers with clients through an efficient booking system.

## Features

- 🔐 Multi-role authentication system
- 📅 Smart booking management
- 💬 Real-time chat functionality
- 📊 Advanced analytics and reporting
- 📱 Multi-channel notifications
- 🌐 White-label support
- 💳 Secure payment processing
- 📍 Location-based service matching

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Caching**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Notifications**:
  - Email (Nodemailer)
  - SMS (Twilio)
  - Push (Firebase)

## Prerequisites

- Node.js >= 14.0.0
- MongoDB
- Redis
- SMTP Server
- Twilio Account
- Firebase Project

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/clicknfix.git
cd clicknfix
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

- MongoDB connection string
- Redis URL
- JWT secret
- SMTP settings
- Twilio credentials
- Firebase configuration

5. Start the development server:

```bash
npm run dev
```

## API Documentation

### Authentication

- POST /api/login - User login
- POST /api/register - User registration

### Bookings

- POST /api/bookings - Create booking
- GET /api/bookings/:id - Get booking details
- PUT /api/bookings/:id - Update booking
- DELETE /api/bookings/:id - Delete booking

### Services

- POST /api/services - Create service
- GET /api/services/:id - Get service details
- PUT /api/services/:id - Update service
- DELETE /api/services/:id - Delete service

### Chat

- POST /api/chats - Create chat
- GET /api/chats/:id - Get chat details
- POST /api/chats/:id/messages - Send message
- PUT /api/chats/:id/read - Mark as read

### Analytics

- GET /api/analytics - Get general analytics
- GET /api/analytics/revenue - Get revenue insights
- GET /api/analytics/performance - Get performance metrics

### Notifications

- POST /api/notifications - Create notification
- GET /api/notifications/user/:userId - Get user notifications
- PUT /api/notifications/:id/read - Mark notification as read

### Service Categories

- POST /api/categories - Create service category
- GET /api/categories - List all service categories
- GET /api/categories/:id - Get category details
- PUT /api/categories/:id - Update category
- DELETE /api/categories/:id - Delete category
- PUT /api/categories/:id/metadata - Update category metadata

### Notification Templates

- POST /api/templates - Create notification template
- GET /api/templates - List all templates
- GET /api/templates/:id - Get template details
- PUT /api/templates/:id - Update template
- DELETE /api/templates/:id - Delete template
- GET /api/templates/:id/preview - Preview compiled template
- GET /api/templates/:id/stats - Get template usage statistics

### System Settings

- GET /api/settings - Get all system settings
- PUT /api/settings - Update system settings
- GET /api/settings/:category - Get settings by category
- PUT /api/settings/booking - Update booking settings
- PUT /api/settings/notification - Update notification settings
- PUT /api/settings/payment - Update payment settings
- PUT /api/settings/security - Update security settings
- PUT /api/settings/maintenance - Toggle maintenance mode

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/clicknfix

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# Redis Configuration
REDIS_URL=redis://localhost:6379

# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

## Project Structure

```
clicknfix/
├── api/
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── templates/     # Email templates
├── config/           # Configuration files
├── tests/           # Test files
└── server.js        # Application entry point
```

## Security Features

- JWT authentication
- Request validation
- Rate limiting
- Data encryption
- Secure password hashing
- XSS protection
- CORS configuration

## Testing

Run the test suite:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@clicknfix.com or join our Slack channel.
