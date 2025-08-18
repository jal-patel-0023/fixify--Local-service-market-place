const Message = require('../models/Message');
const User = require('../models/User');
const Job = require('../models/Job');
const { createSystemNotification } = require('../utils/database');

// Get conversations for a user
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all conversations where user is either sender or recipient
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', userId] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $project: {
          conversationId: '$_id',
          otherUser: {
            _id: '$otherUser._id',
            firstName: '$otherUser.firstName',
            lastName: '$otherUser.lastName',
            profileImage: '$otherUser.profileImage',
            rating: '$otherUser.rating'
          },
          lastMessage: {
            content: '$lastMessage.content',
            type: '$lastMessage.type',
            createdAt: '$lastMessage.createdAt',
            sender: '$lastMessage.sender'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversations'
    });
  }
};

// Get messages for a specific conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of this conversation
    const conversation = await Message.findOne({
      $or: [
        { sender: userId, recipient: conversationId },
        { sender: conversationId, recipient: userId }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Get all messages in this conversation
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: conversationId },
        { sender: conversationId, recipient: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', '_id firstName lastName profileImage')
    .populate('recipient', '_id firstName lastName profileImage');

    // Mark messages as read
    await Message.updateMany(
      {
        sender: conversationId,
        recipient: userId,
        read: false
      },
      { read: true }
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get messages'
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    console.log('=== Send Message Request ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    const { recipientId, content, type = 'text', jobId = null } = req.body;
    const senderId = req.user._id;

    console.log('Sender ID:', senderId);
    console.log('Recipient ID:', recipientId);

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found'
      });
    }

    // Validate sender exists (should always exist since user is authenticated)
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        error: 'Sender not found'
      });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
      type,
      jobId,
      conversationId: [senderId, recipientId].sort().join('_')
    });

    await message.save();

    // Populate sender and recipient info
    await message.populate('sender', '_id firstName lastName profileImage');
    await message.populate('recipient', '_id firstName lastName profileImage');

    // Create notification for recipient (temporarily disabled)
    // await createSystemNotification(
    //   recipientId,
    //   'message',
    //   'New Message',
    //   `You have a new message from ${sender.firstName} ${sender.lastName}`
    // );

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      {
        sender: conversationId,
        recipient: userId,
        read: false
      },
      { read: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read'
    });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // Only sender can delete their own message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      recipient: userId,
      read: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
};

// Search messages
const searchMessages = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const messages = await Message.find({
      $and: [
        {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        },
        {
          content: { $regex: query, $options: 'i' }
        }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('sender', '_id firstName lastName profileImage')
    .populate('recipient', '_id firstName lastName profileImage');

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search messages'
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  searchMessages
}; 