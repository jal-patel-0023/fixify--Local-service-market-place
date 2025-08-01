const { User } = require('../models');

/**
 * Verify Clerk session token
 * @param {string} sessionToken - Clerk session token
 * @returns {Object} Session data from Clerk
 */
const verifySessionToken = async (sessionToken) => {
  try {
    const response = await fetch('https://api.clerk.dev/v1/sessions/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_token: sessionToken
      })
    });

    if (!response.ok) {
      throw new Error('Invalid session token');
    }

    return await response.json();
  } catch (error) {
    console.error('Clerk session verification error:', error);
    throw new Error('Session verification failed');
  }
};

/**
 * Get user data from Clerk
 * @param {string} userId - Clerk user ID
 * @returns {Object} User data from Clerk
 */
const getClerkUser = async (userId) => {
  try {
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('User not found');
    }

    return await response.json();
  } catch (error) {
    console.error('Clerk user fetch error:', error);
    throw new Error('Failed to fetch user data');
  }
};

/**
 * Update user in Clerk
 * @param {string} userId - Clerk user ID
 * @param {Object} userData - User data to update
 * @returns {Object} Updated user data
 */
const updateClerkUser = async (userId, userData) => {
  try {
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return await response.json();
  } catch (error) {
    console.error('Clerk user update error:', error);
    throw new Error('Failed to update user data');
  }
};

/**
 * Delete user from Clerk
 * @param {string} userId - Clerk user ID
 * @returns {boolean} Success status
 */
const deleteClerkUser = async (userId) => {
  try {
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return true;
  } catch (error) {
    console.error('Clerk user deletion error:', error);
    throw new Error('Failed to delete user');
  }
};

/**
 * Create organization in Clerk
 * @param {Object} orgData - Organization data
 * @returns {Object} Created organization
 */
const createClerkOrganization = async (orgData) => {
  try {
    const response = await fetch('https://api.clerk.dev/v1/organizations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orgData)
    });

    if (!response.ok) {
      throw new Error('Failed to create organization');
    }

    return await response.json();
  } catch (error) {
    console.error('Clerk organization creation error:', error);
    throw new Error('Failed to create organization');
  }
};

/**
 * Get user's organizations from Clerk
 * @param {string} userId - Clerk user ID
 * @returns {Array} User's organizations
 */
const getUserOrganizations = async (userId) => {
  try {
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}/organization_memberships`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }

    return await response.json();
  } catch (error) {
    console.error('Clerk organizations fetch error:', error);
    throw new Error('Failed to fetch user organizations');
  }
};

/**
 * Sync user data between Clerk and our database
 * @param {Object} clerkUser - User data from Clerk
 * @returns {Object} Synced user from our database
 */
const syncUserData = async (clerkUser) => {
  try {
    let user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      // Create new user
      user = new User({
        clerkId: clerkUser.id,
        firstName: clerkUser.first_name || '',
        lastName: clerkUser.last_name || '',
        email: clerkUser.email_addresses[0]?.email_address || '',
        profileImage: clerkUser.image_url || null,
        location: {
          type: 'Point',
          coordinates: [0, 0],
          address: {}
        }
      });
    } else {
      // Update existing user with latest Clerk data
      user.firstName = clerkUser.first_name || user.firstName;
      user.lastName = clerkUser.last_name || user.lastName;
      user.email = clerkUser.email_addresses[0]?.email_address || user.email;
      user.profileImage = clerkUser.image_url || user.profileImage;
    }
    
    await user.save();
    return user;
  } catch (error) {
    console.error('User sync error:', error);
    throw new Error('Failed to sync user data');
  }
};

/**
 * Handle Clerk webhook events
 * @param {Object} event - Webhook event from Clerk
 * @returns {Object} Processing result
 */
const handleClerkWebhook = async (event) => {
  try {
    switch (event.type) {
      case 'user.created':
        await syncUserData(event.data);
        break;
        
      case 'user.updated':
        await syncUserData(event.data);
        break;
        
      case 'user.deleted':
        await User.findOneAndUpdate(
          { clerkId: event.data.id },
          { isActive: false }
        );
        break;
        
      case 'session.created':
        // Handle session creation if needed
        break;
        
      case 'session.revoked':
        // Handle session revocation if needed
        break;
        
      default:
        console.log('Unhandled Clerk webhook event:', event.type);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Clerk webhook handling error:', error);
    throw new Error('Failed to process webhook event');
  }
};

/**
 * Verify webhook signature from Clerk
 * @param {string} payload - Raw request body
 * @param {string} signature - Webhook signature
 * @returns {boolean} Signature validity
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.CLERK_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
};

module.exports = {
  verifySessionToken,
  getClerkUser,
  updateClerkUser,
  deleteClerkUser,
  createClerkOrganization,
  getUserOrganizations,
  syncUserData,
  handleClerkWebhook,
  verifyWebhookSignature
}; 