# Fixify - Local Service Marketplace

A full-stack MERN web application where users can post job requests (like plumbing, electrical, or home repairs), and nearby individuals with relevant skills can accept those jobs for a minimal fee.

## 🚀 Tech Stack

- **Frontend**: React.js with Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk.dev
- **UI Library**: Tailwind CSS + shadcn/ui
- **Map Integration**: Google Maps API
- **Image Upload**: Cloudinary

## 📁 Project Structure

```
fixify/
├── client/          # React frontend
├── server/          # Node.js backend
└── README.md        # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup
1. Navigate to server directory: `cd server`
2. Install dependencies: `npm install`
3. Copy environment file: `cp env.example .env`
4. Update `.env` with your configuration
5. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to client directory: `cd client`
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env`
4. Update `.env` with your configuration
5. Start the development server: `npm run dev`

## 🎯 Key Features

- **User Roles**: Both job posters (clients) and job takers (helpers)
- **Job Posting**: Create jobs with location, budget, and requirements
- **Job Browsing**: Filter and search for nearby jobs
- **Job Acceptance**: Helpers can accept available jobs
- **Messaging**: Communication between users
- **Ratings & Reviews**: User feedback system
- **Geolocation**: Map-based job discovery
- **Real-time Updates**: Live status updates

## 🔧 Development Status

- [x] Backend server setup
- [ ] Database models
- [ ] Authentication integration
- [ ] Job posting functionality
- [ ] Job browsing and filtering
- [ ] Frontend setup
- [ ] UI components
- [ ] Map integration
- [ ] Messaging system
- [ ] Rating system

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fixify
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GOOGLE_MAPS_API_KEY=your-google-maps-key
CLERK_SECRET_KEY=your-clerk-secret
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## 🤝 Contributing

This project is being developed module by module. Each module will be completed before moving to the next one.

## 📄 License

This project is licensed under the ISC License. 