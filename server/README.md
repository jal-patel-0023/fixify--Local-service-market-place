# Fixify Server

Backend server for Fixify - a local service marketplace built with Node.js, Express, and MongoDB.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `env.example` to `.env`
   - Update the environment variables with your actual values

3. **Database Setup**
   - Ensure MongoDB is running locally or update `MONGODB_URI` in `.env`
   - The database will be created automatically on first connection

4. **Run the Server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

- `GET /` - Basic API info
- `GET /api/health` - Health check endpoint

## Project Structure

```
server/
├── controllers/     # Request handlers
├── models/         # MongoDB schemas
├── routes/         # API routes
├── middleware/     # Custom middleware
├── utils/          # Utility functions
├── server.js       # Main server file
├── package.json    # Dependencies
└── env.example     # Environment variables template
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `CLIENT_URL` - Frontend URL for CORS
- `JWT_SECRET` - Secret for JWT tokens
- `CLOUDINARY_*` - Cloudinary configuration for image uploads
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `CLERK_*` - Clerk authentication configuration 