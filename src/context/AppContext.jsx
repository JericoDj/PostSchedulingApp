import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [scheduledPosts, setScheduledPosts] = useState([
    { id: '1', content: 'Exciting news coming soon! 🚀', platforms: ['facebook', 'instagram'], scheduledFor: '2026-03-27T10:00:00', status: 'scheduled', type: 'text' },
    { id: '2', content: 'Check out our new summer collection.', platforms: ['instagram', 'tiktok'], scheduledFor: '2026-03-28T14:30:00', status: 'scheduled', type: 'image', media: 'https://picsum.photos/seed/fashion/800/600' },
  ]);

  const [workflows, setWorkflows] = useState([
    { id: '1', name: 'Auto-Welcome Campaign', active: true, triggers: ['New Follower'], actions: ['Send DM', 'Add to List'] },
    { id: '2', name: 'Weekend Engagement', active: false, triggers: ['Time: Saturday 10AM'], actions: ['Post Story'] },
  ]);

  const addPost = (post) => {
    setScheduledPosts([...scheduledPosts, { ...post, id: Date.now().toString(), status: 'scheduled' }]);
  };

  const addWorkflow = (workflow) => {
    setWorkflows([...workflows, { ...workflow, id: Date.now().toString() }]);
  };

  return (
    <AppContext.Provider value={{ scheduledPosts, workflows, addPost, addWorkflow }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
