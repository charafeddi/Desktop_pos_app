# POS System Backend

This is the backend for the Point of Sale (POS) system, built with Node.js, Express, and SQLite.

## Features

- User authentication (register, login, logout)
- User profile management
- Product management
- Category management
- Supplier management
- Customer management
- Sales management
- Returns management

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

The application uses SQLite as its database. The database file will be automatically created in the `data` directory when you first run the application.

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon, which automatically restarts when you make changes to the code.

### Production Mode

```bash
npm start
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Update user password

## Database Schema

The application uses the following tables:

- users
- categories
- product_types
- product_units
- suppliers
- products
- customers
- sales
- sale_items
- returns
- return_items

## Error Handling

The application includes error handling middleware that will catch and format errors appropriately. All API responses follow this format:

```json
{
  "success": true/false,
  "message": "Error message or success message",
  "data": {} // Optional data object
}
```

## Security

- Passwords are hashed using bcrypt
- JWT is used for authentication
- CORS is enabled for cross-origin requests
- Input validation is performed on all requests

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 