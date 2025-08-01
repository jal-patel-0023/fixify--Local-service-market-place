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

## Database Models

### User Model
- **clerkId**: Clerk authentication ID (unique)
- **firstName, lastName**: User's name
- **email**: Email address (unique)
- **phone**: Contact phone number
- **profileImage**: Profile picture URL
- **location**: Geospatial location with coordinates and address
- **skills**: Array of user skills with categories and experience levels
- **rating**: Average rating, total reviews, and review details
- **preferences**: User preferences for distance, notifications, availability
- **accountType**: 'client', 'helper', or 'both'
- **stats**: Job statistics and earnings

### Job Model
- **creator**: Reference to User who posted the job
- **title, description**: Job details
- **category**: Job category (plumbing, electrical, etc.)
- **budget**: Min/max budget with negotiability flag
- **location**: Geospatial location with coordinates and address
- **preferredDate, preferredTime**: Scheduling information
- **status**: Job status (open, accepted, in_progress, completed, cancelled)
- **assignedTo**: Reference to User assigned to the job
- **requirements**: Skills and experience requirements
- **images**: Array of job images
- **stats**: View count, applications, saved by users

### Message Model
- **sender, recipient**: Message participants
- **content**: Message text
- **messageType**: Type of message (text, image, file, system)
- **attachments**: Media attachments
- **jobId**: Related job (optional)
- **conversationId**: Unique conversation identifier
- **isRead**: Read status

### Notification Model
- **recipient**: Notification recipient
- **sender**: Notification sender (can be system)
- **type**: Notification type (job_posted, message_received, etc.)
- **title, message**: Notification content
- **jobId, messageId**: Related entities
- **priority**: Notification priority level
- **action**: Clickable action data
- **expiresAt**: Expiration date for temporary notifications

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