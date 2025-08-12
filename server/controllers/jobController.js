const { Job, User, Notification } = require('../models');
const { 
  createJobNotification, 
  createSystemNotification, 
  createNearbyQuery, 
  createPagination,
  createJobFilters,
  updateJobStats,
  updateUserStats,
  validateCoordinates,
  formatLocation
} = require('../utils');
const { jobValidationRules, handleValidationErrors } = require('../utils/validation');

/**
 * Create a new job
 * @route POST /api/jobs
 */
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      budget,
      location,
      preferredDate,
      preferredTime,
      requirements,
      images
    } = req.body;

    // Validate location coordinates
    if (location && location.coordinates) {
      if (!validateCoordinates(location.coordinates)) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Location coordinates must be valid [longitude, latitude]'
        });
      }
    }

    // Create new job
    const job = new Job({
      creator: req.user._id,
      title,
      description,
      category,
      budget,
      location: location || {
        type: 'Point',
        coordinates: [0, 0],
        address: {}
      },
      preferredDate,
      preferredTime,
      requirements: requirements || [],
      images: images || [],
      status: 'open'
    });

    await job.save();

    // Update user stats
    await updateUserStats(req.user._id, 'jobsPosted', 1);

    // Send notification to nearby helpers
    await notifyNearbyHelpers(job);

    res.status(201).json({
      success: true,
      data: job,
      message: 'Job posted successfully'
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      error: 'Failed to create job',
      message: 'Internal server error'
    });
  }
};

/**
 * Get all jobs with filtering and pagination
 * @route GET /api/jobs
 */
const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      minBudget,
      maxBudget,
      distance,
      latitude,
      longitude,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query filters
    const filters = createJobFilters({
      category,
      status,
      minBudget,
      maxBudget,
      search
    });

    // Add location-based filtering if coordinates provided
    if (latitude && longitude && distance) {
      const coordinates = [parseFloat(longitude), parseFloat(latitude)];
      if (validateCoordinates(parseFloat(latitude), parseFloat(longitude))) {
        Object.assign(filters, createNearbyQuery(coordinates, parseFloat(distance)));
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const { data: jobs, pagination } = await createPagination(
      Job,
      filters,
      sort,
      page,
      limit,
      [
        { path: 'creator', select: 'firstName lastName profileImage rating' },
        { path: 'assignedTo', select: 'firstName lastName profileImage rating' }
      ]
    );

    res.json({
      success: true,
      data: jobs,
      pagination
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      error: 'Failed to get jobs',
      message: 'Internal server error'
    });
  }
};

/**
 * Get a single job by ID
 * @route GET /api/jobs/:id
 */
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('creator', 'firstName lastName profileImage rating')
      .populate('assignedTo', 'firstName lastName profileImage rating');

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'The requested job does not exist'
      });
    }

    // Increment view count
    await job.incrementViews();

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      error: 'Failed to get job',
      message: 'Internal server error'
    });
  }
};

/**
 * Update a job
 * @route PUT /api/jobs/:id
 */
const updateJob = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      budget,
      location,
      preferredDate,
      preferredTime,
      requirements,
      images
    } = req.body;

    // Validate location coordinates if provided
    if (location && location.coordinates) {
      if (!validateCoordinates(location.coordinates)) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Location coordinates must be valid [longitude, latitude]'
        });
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (budget) updateData.budget = budget;
    if (location) updateData.location = location;
    if (preferredDate) updateData.preferredDate = preferredDate;
    if (preferredTime) updateData.preferredTime = preferredTime;
    if (requirements) updateData.requirements = requirements;
    if (images) updateData.images = images;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('creator', 'firstName lastName profileImage');

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'The requested job does not exist'
      });
    }

    res.json({
      success: true,
      data: job,
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      error: 'Failed to update job',
      message: 'Internal server error'
    });
  }
};

/**
 * Delete a job
 * @route DELETE /api/jobs/:id
 */
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'The requested job does not exist'
      });
    }

    // Check if job can be deleted (not in progress or completed)
    if (job.status === 'in_progress' || job.status === 'completed') {
      return res.status(400).json({
        error: 'Cannot delete job',
        message: 'Cannot delete a job that is in progress or completed'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    // Update user stats
    await updateUserStats(req.user._id, 'jobsPosted', -1);

    // Notify assigned helper if any
    if (job.assignedTo) {
      await createJobNotification(
        job.assignedTo,
        req.user._id,
        'job_cancelled',
        'Job Cancelled',
        `The job "${job.title}" has been cancelled by the client.`
      );
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      error: 'Failed to delete job',
      message: 'Internal server error'
    });
  }
};

/**
 * Accept a job
 * @route POST /api/jobs/:id/accept
 */
const acceptJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'The requested job does not exist'
      });
    }

    // Check if job is available
    if (!job.isAvailable()) {
      return res.status(400).json({
        error: 'Job not available',
        message: 'This job is no longer available for acceptance'
      });
    }

    // Accept the job
    await job.acceptJob(req.user._id);

    // Update user stats
    await updateUserStats(req.user._id, 'jobsAccepted', 1);
    await updateUserStats(job.creator, 'jobsAssigned', 1);

    // Notify job creator
    await createJobNotification(
      job.creator,
      req.user._id,
      'job_accepted',
      'Job Accepted',
      `Your job "${job.title}" has been accepted by ${req.user.firstName} ${req.user.lastName}.`
    );

    res.json({
      success: true,
      data: job,
      message: 'Job accepted successfully'
    });
  } catch (error) {
    console.error('Accept job error:', error);
    res.status(500).json({
      error: 'Failed to accept job',
      message: 'Internal server error'
    });
  }
};

/**
 * Complete a job
 * @route POST /api/jobs/:id/complete
 */
const completeJob = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'The requested job does not exist'
      });
    }

    // Check if user can complete the job
    const canComplete = job.creator.toString() === req.user._id.toString() ||
                       job.assignedTo?.toString() === req.user._id.toString();

    if (!canComplete) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only complete jobs you created or were assigned to'
      });
    }

    // Complete the job
    await job.completeJob();

    // Update user stats
    if (job.assignedTo) {
      await updateUserStats(job.assignedTo, 'jobsCompleted', 1);
    }
    await updateUserStats(job.creator, 'jobsCompleted', 1);

    // Add rating and review if provided
    if (rating && review) {
      const targetUser = job.creator.toString() === req.user._id.toString() 
        ? job.assignedTo 
        : job.creator;

      if (targetUser) {
        await addJobReview(targetUser, req.user._id, rating, review, job._id);
      }
    }

    // Notify both parties
    const otherUser = job.creator.toString() === req.user._id.toString() 
      ? job.assignedTo 
      : job.creator;

    if (otherUser) {
      await createJobNotification(
        otherUser,
        req.user._id,
        'job_completed',
        'Job Completed',
        `The job "${job.title}" has been marked as completed.`
      );
    }

    res.json({
      success: true,
      data: job,
      message: 'Job completed successfully'
    });
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({
      error: 'Failed to complete job',
      message: 'Internal server error'
    });
  }
};

/**
 * Cancel a job
 * @route POST /api/jobs/:id/cancel
 */
const cancelJob = async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'The requested job does not exist'
      });
    }

    // Check if user can cancel the job
    const canCancel = job.creator.toString() === req.user._id.toString() ||
                     job.assignedTo?.toString() === req.user._id.toString();

    if (!canCancel) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only cancel jobs you created or were assigned to'
      });
    }

    // Cancel the job
    await job.cancelJob();

    // Notify the other party
    const otherUser = job.creator.toString() === req.user._id.toString() 
      ? job.assignedTo 
      : job.creator;

    if (otherUser) {
      await createJobNotification(
        otherUser,
        req.user._id,
        'job_cancelled',
        'Job Cancelled',
        `The job "${job.title}" has been cancelled.${reason ? ` Reason: ${reason}` : ''}`
      );
    }

    res.json({
      success: true,
      data: job,
      message: 'Job cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel job error:', error);
    res.status(500).json({
      error: 'Failed to cancel job',
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's posted jobs
 * @route GET /api/jobs/my-jobs
 */
const getMyJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filters = { creator: req.user._id };
    if (status) filters.status = status;

    const { data: jobs, pagination } = await createPagination(
      Job,
      filters,
      { createdAt: -1 },
      page,
      limit,
      [
        { path: 'assignedTo', select: 'firstName lastName profileImage rating' }
      ]
    );

    res.json({
      success: true,
      data: jobs,
      pagination
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      error: 'Failed to get your jobs',
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's accepted jobs
 * @route GET /api/jobs/accepted-jobs
 */
const getAcceptedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filters = { assignedTo: req.user._id };
    if (status) filters.status = status;

    const { data: jobs, pagination } = await createPagination(
      Job,
      filters,
      { createdAt: -1 },
      page,
      limit,
      [
        { path: 'creator', select: 'firstName lastName profileImage rating' }
      ]
    );

    res.json({
      success: true,
      data: jobs,
      pagination
    });
  } catch (error) {
    console.error('Get accepted jobs error:', error);
    res.status(500).json({
      error: 'Failed to get accepted jobs',
      message: 'Internal server error'
    });
  }
};

/**
 * Save/unsave a job
 * @route POST /api/jobs/:id/save
 */
const toggleJobSave = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'The requested job does not exist'
      });
    }

    const user = await User.findById(req.user._id);
    const savedIndex = user.savedJobs.indexOf(job._id);

    if (savedIndex > -1) {
      // Remove from saved jobs
      user.savedJobs.splice(savedIndex, 1);
      await job.updateStats('savedBy', -1);
    } else {
      // Add to saved jobs
      user.savedJobs.push(job._id);
      await job.updateStats('savedBy', 1);
    }

    await user.save();

    res.json({
      success: true,
      data: {
        isSaved: savedIndex === -1,
        savedJobs: user.savedJobs
      },
      message: savedIndex > -1 ? 'Job removed from saved' : 'Job saved successfully'
    });
  } catch (error) {
    console.error('Toggle job save error:', error);
    res.status(500).json({
      error: 'Failed to save job',
      message: 'Internal server error'
    });
  }
};

/**
 * Get saved jobs
 * @route GET /api/jobs/saved
 */
const getSavedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.user._id).populate('savedJobs');
    const savedJobIds = user.savedJobs.map(job => job._id);

    const { data: jobs, pagination } = await createPagination(
      Job,
      { _id: { $in: savedJobIds } },
      { createdAt: -1 },
      page,
      limit,
      [
        { path: 'creator', select: 'firstName lastName profileImage rating' },
        { path: 'assignedTo', select: 'firstName lastName profileImage rating' }
      ]
    );

    res.json({
      success: true,
      data: jobs,
      pagination
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      error: 'Failed to get saved jobs',
      message: 'Internal server error'
    });
  }
};

/**
 * Helper function to notify nearby helpers about new job
 */
const notifyNearbyHelpers = async (job) => {
  try {
    const nearbyHelpers = await User.find({
      accountType: { $in: ['helper', 'both'] },
      isActive: true,
      ...createNearbyQuery(job.location.coordinates, 50)
    }).select('_id').limit(50);

    if (nearbyHelpers.length) {
      const notifications = nearbyHelpers.map(h => ({
        recipient: h._id,
        type: 'job_posted',
        title: 'New Job Available',
        message: `A new ${job.category} job has been posted near you: "${job.title}"`,
        jobId: job._id
      }));
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Notify nearby helpers error:', error);
  }
};

/**
 * Helper function to add job review
 */
const addJobReview = async (targetUserId, reviewerId, rating, review, jobId) => {
  try {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return;

    const newReview = {
      reviewer: reviewerId,
      rating,
      review,
      jobId,
      createdAt: new Date()
    };

    targetUser.rating.reviews.push(newReview);
    targetUser.rating.totalReviews += 1;
    targetUser.rating.averageRating = targetUser.calculateAverageRating();

    await targetUser.save();
  } catch (error) {
    console.error('Add job review error:', error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  acceptJob,
  completeJob,
  cancelJob,
  getMyJobs,
  getAcceptedJobs,
  toggleJobSave,
  getSavedJobs
}; 