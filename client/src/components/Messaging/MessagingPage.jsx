import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { MessageCircle, Search, ArrowLeft } from 'lucide-react';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import socketService from '../../services/socket';

const MessagingPage = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Connect to socket when component mounts
  useEffect(() => {
    if (user) {
      socketService.connect(user.id);
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  // Filter conversations based on search query
  const filteredConversations = selectedConversation ? [selectedConversation] : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            Messages
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Connect with job posters and helpers
          </p>
        </div>

        {/* Mobile Layout */}
        {isMobile ? (
          <div className="h-[calc(100vh-200px)]">
            {selectedConversation ? (
              // Message View
              <div className="h-full flex flex-col">
                {/* Conversation Header */}
                <div className="flex items-center space-x-3 p-4 border-b border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToConversations}
                    className="p-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center space-x-3 flex-1">
                    {selectedConversation.otherUser.profileImage ? (
                      <img
                        src={selectedConversation.otherUser.profileImage}
                        alt={`${selectedConversation.otherUser.firstName} ${selectedConversation.otherUser.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center">
                        <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                          {selectedConversation.otherUser.firstName?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-secondary-900 dark:text-secondary-100">
                        {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
                      </h3>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {selectedConversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1">
                  <MessageList
                    conversationId={selectedConversation.conversationId}
                    otherUser={selectedConversation.otherUser}
                  />
                </div>
              </div>
            ) : (
              // Conversation List
              <div className="h-full">
                <ConversationList
                  selectedConversation={selectedConversation}
                  onSelectConversation={handleSelectConversation}
                />
              </div>
            )}
          </div>
        ) : (
          /* Desktop Layout */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Conversation List */}
            <div className="md:col-span-1">
              <Card className="h-full">
                <Card.Header>
                  <Card.Title>Conversations</Card.Title>
                  <Card.Description>
                    Your recent conversations
                  </Card.Description>
                </Card.Header>
                <Card.Content className="h-full overflow-y-auto">
                  <ConversationList
                    selectedConversation={selectedConversation}
                    onSelectConversation={handleSelectConversation}
                  />
                </Card.Content>
              </Card>
            </div>

            {/* Message List */}
            <div className="md:col-span-2">
              <Card className="h-full">
                {selectedConversation ? (
                  <>
                    <Card.Header>
                      <div className="flex items-center space-x-3">
                        {selectedConversation.otherUser.profileImage ? (
                          <img
                            src={selectedConversation.otherUser.profileImage}
                            alt={`${selectedConversation.otherUser.firstName} ${selectedConversation.otherUser.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center">
                            <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                              {selectedConversation.otherUser.firstName?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <Card.Title>
                            {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
                          </Card.Title>
                          <Card.Description>
                            {selectedConversation.lastMessage.content}
                          </Card.Description>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Content className="h-full p-0">
                      <MessageList
                        conversationId={selectedConversation.conversationId}
                        otherUser={selectedConversation.otherUser}
                      />
                    </Card.Content>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400">
                        Choose a conversation from the list to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage; 