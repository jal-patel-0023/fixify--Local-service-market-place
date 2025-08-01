const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Clerk authentication ID
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Basic profile information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  
  // Location information
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'US'
      }
    }
  },
  
  // Skills and expertise
  skills: [{
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'carpentry', 'cleaning', 'gardening', 'painting', 'moving', 'repair', 'other'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'intermediate'
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Rating and reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    reviews: [{
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true,
        maxlength: 500
      },
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // User preferences and settings
  preferences: {
    maxDistance: {
      type: Number,
      default: 25, // miles
      min: 1,
      max: 100
    },
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    availability: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String }
    }
  },
  
  // Account status and verification
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  accountType: {
    type: String,
    enum: ['client', 'helper', 'both'],
    default: 'client'
  },
  
  // Statistics
  stats: {
    jobsPosted: {
      type: Number,
      default: 0
    },
    jobsCompleted: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    memberSince: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ skills: 1 });
userSchema.index({ 'rating.average': -1 });
userSchema.index({ isActive: 1, accountType: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for location string
userSchema.virtual('locationString').get(function() {
  if (this.location.address) {
    const addr = this.location.address;
    return `${addr.city}, ${addr.state}`;
  }
  return 'Location not set';
});

// Method to calculate average rating
userSchema.methods.calculateAverageRating = function() {
  if (this.rating.reviews.length === 0) return 0;
  
  const totalRating = this.rating.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((totalRating / this.rating.reviews.length) * 10) / 10;
};

// Method to add a review
userSchema.methods.addReview = function(reviewData) {
  this.rating.reviews.push(reviewData);
  this.rating.totalReviews = this.rating.reviews.length;
  this.rating.average = this.calculateAverageRating();
  return this.save();
};

// Pre-save middleware to update average rating
userSchema.pre('save', function(next) {
  if (this.rating.reviews.length > 0) {
    this.rating.average = this.calculateAverageRating();
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 