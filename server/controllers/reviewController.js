const Review = require('../models/Review');
const User = require('../models/User');
const Job = require('../models/Job');
const { createSystemNotification } = require('../utils/database');

// Create a new review
const createReview = async (req, res) => {
  try {
    const { jobId, revieweeId, rating, title, content, categories } = req.body;
    const reviewerId = req.user.clerkId;

    // Validate job exists and is completed
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only review completed jobs'
      });
    }

    // Check if user is part of this job
    if (job.creator !== reviewerId && job.assignedTo !== reviewerId) {
      return res.status(403).json({
        success: false,
        error: 'You can only review jobs you were involved in'
      });
    }

    // Check if user is reviewing themselves
    if (reviewerId === revieweeId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot review yourself'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      job: jobId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this job'
      });
    }

    // Validate reviewee exists
    const reviewee = await User.findOne({ clerkId: revieweeId });
    if (!reviewee) {
      return res.status(404).json({
        success: false,
        error: 'User being reviewed not found'
      });
    }

    // Create review
    const review = new Review({
      reviewer: reviewerId,
      reviewee: revieweeId,
      job: jobId,
      rating,
      title,
      content,
      categories: categories || {
        communication: rating,
        quality: rating,
        timeliness: rating,
        professionalism: rating,
        value: rating
      }
    });

    await review.save();

    // Populate reviewer and reviewee info
    await review.populate('reviewer', 'clerkId firstName lastName profileImage');
    await review.populate('reviewee', 'clerkId firstName lastName profileImage');

    // Update user rating statistics
    await updateUserRatingStats(revieweeId);

    // Create notification for reviewee
    await createSystemNotification({
      recipient: revieweeId,
      sender: reviewerId,
      type: 'review',
      title: 'New Review Received',
      message: `You received a ${rating}-star review for your work on "${job.title}"`,
      relatedJob: jobId
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create review'
    });
  }
};

// Get reviews for a user
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status = 'approved' } = req.query;

    const skip = (page - 1) * limit;

    const query = { reviewee: userId };
    if (status !== 'all') {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .populate('reviewer', 'clerkId firstName lastName profileImage')
      .populate('job', 'title category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user reviews'
    });
  }
};

// Get review statistics for a user
const getUserReviewStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const [averageRating, categoryAverages] = await Promise.all([
      Review.getAverageRating(userId),
      Review.getCategoryAverages(userId)
    ]);

    res.json({
      success: true,
      data: {
        ...averageRating,
        categories: categoryAverages
      }
    });
  } catch (error) {
    console.error('Error getting user review stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user review statistics'
    });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, content, categories } = req.body;
    const userId = req.user.clerkId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Only reviewer can update their review
    if (review.reviewer !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this review'
      });
    }

    // Update review
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (content) review.content = content;
    if (categories) review.categories = categories;

    await review.save();

    // Update user rating statistics
    await updateUserRatingStats(review.reviewee);

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review'
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.clerkId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Only reviewer can delete their review
    if (review.reviewer !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    // Update user rating statistics
    await updateUserRatingStats(review.reviewee);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
};

// Mark review as helpful
const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isHelpful } = req.body;
    const userId = req.user.clerkId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    await review.markHelpful(userId, isHelpful);

    res.json({
      success: true,
      data: {
        helpfulVotes: review.helpfulVotes,
        helpfulBy: review.helpfulBy
      }
    });
  } catch (error) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark review helpful'
    });
  }
};

// Flag a review
const flagReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const userId = req.user.clerkId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    await review.flagReview(userId, reason);

    res.json({
      success: true,
      message: 'Review flagged successfully'
    });
  } catch (error) {
    console.error('Error flagging review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to flag review'
    });
  }
};

// Respond to a review
const respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;
    const userId = req.user.clerkId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Only the reviewed user can respond
    if (review.reviewee !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to respond to this review'
      });
    }

    await review.addResponse(content);

    res.json({
      success: true,
      data: review.response
    });
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to respond to review'
    });
  }
};

// Get reviews for a job
const getJobReviews = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ job: jobId, status: 'approved' })
      .populate('reviewer', 'clerkId firstName lastName profileImage')
      .populate('reviewee', 'clerkId firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ job: jobId, status: 'approved' });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting job reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get job reviews'
    });
  }
};

// Helper function to update user rating statistics
const updateUserRatingStats = async (userId) => {
  try {
    const [averageRating, categoryAverages] = await Promise.all([
      Review.getAverageRating(userId),
      Review.getCategoryAverages(userId)
    ]);

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        'rating.average': averageRating.averageRating,
        'rating.totalReviews': averageRating.totalReviews,
        'rating.distribution': averageRating.ratingDistribution,
        'rating.categories': categoryAverages
      }
    );
  } catch (error) {
    console.error('Error updating user rating stats:', error);
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getUserReviewStats,
  updateReview,
  deleteReview,
  markReviewHelpful,
  flagReview,
  respondToReview,
  getJobReviews
}; 