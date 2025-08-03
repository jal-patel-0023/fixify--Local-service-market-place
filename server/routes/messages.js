const express = require('express');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');
const { authenticateUser } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  searchMessages
} = require('../controllers/messageController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

// Get user's conversations
router.get('/conversations', getConversations);

// Get messages for a specific conversation
router.get('/conversations/:conversationId', [
  param('conversationId').notEmpty().withMessage('Conversation ID is required'),
  handleValidationErrors
], getMessages);

// Send a message
router.post('/send', [
  body('recipientId').notEmpty().withMessage('Recipient ID is required'),
  body('content').notEmpty().withMessage('Message content is required')
    .isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('type').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type'),
  body('jobId').optional().isMongoId().withMessage('Invalid job ID'),
  handleValidationErrors
], sendMessage);

// Mark messages as read
router.put('/conversations/:conversationId/read', [
  param('conversationId').notEmpty().withMessage('Conversation ID is required'),
  handleValidationErrors
], markAsRead);

// Delete a message
router.delete('/:messageId', [
  param('messageId').isMongoId().withMessage('Invalid message ID'),
  handleValidationErrors
], deleteMessage);

// Get unread message count
router.get('/unread/count', getUnreadCount);

// Search messages
router.get('/search', [
  query('query').notEmpty().withMessage('Search query is required')
    .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
  handleValidationErrors
], searchMessages);

module.exports = router; 