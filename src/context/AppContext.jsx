import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { API_BASE_URL, authHeaders } from '../utils/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [scheduledPosts, setScheduledPosts] = useState([]);

  const [workflows, setWorkflows] = useState([
    { id: '1', name: 'Auto-Welcome Campaign', active: true, triggers: ['New Follower'], actions: ['Send DM', 'Add to List'] },
    { id: '2', name: 'Weekend Engagement', active: false, triggers: ['Time: Saturday 10AM'], actions: ['Post Story'] },
  ]);

  const normalizeScheduledPost = (post) => {
    const content = post.content || {};

    return {
      id: post.id,
      content: content.message || content.description || content.title || '',
      platforms: [post.platform],
      scheduledFor: post.scheduled_at,
      status: post.status || 'scheduled',
      type: content.media_url || content.mediaUrl ? 'image' : 'text',
      media: content.media_url || content.mediaUrl || null,
      timezone: content.schedule_timezone || 'UTC',
      scheduledLocal: content.scheduled_local || null,
    };
  };

  const refreshScheduledPosts = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/api/schedule`, {
      headers: {
        ...authHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load scheduled posts');
    }

    const data = await response.json();
    const normalized = Array.isArray(data) ? data.map(normalizeScheduledPost) : [];
    setScheduledPosts(normalized);
    return normalized;
  }, []);

  const addPost = useCallback(async (post) => {
    const { content, platforms, scheduledLocal, scheduleTimezone, media } = post;

    const requests = platforms.map((platform) =>
      fetch(`${API_BASE_URL}/api/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          platform,
          scheduled_local: scheduledLocal,
          schedule_timezone: scheduleTimezone,
          content: {
            message: content,
            description: content,
            media_url: media || null,
            schedule_timezone: scheduleTimezone,
            scheduled_local: scheduledLocal,
          },
        }),
      })
    );

    const results = await Promise.all(requests);

    const failed = results.find((result) => !result.ok);
    if (failed) {
      let message = 'Failed to schedule post';
      try {
        const payload = await failed.json();
        if (payload?.message) {
          message = payload.message;
        }
      } catch (_) {
        // Ignore parse errors and use fallback.
      }
      throw new Error(message);
    }

    await refreshScheduledPosts();
  }, [refreshScheduledPosts]);

  const addWorkflow = useCallback((workflow) => {
    setWorkflows([...workflows, { ...workflow, id: Date.now().toString() }]);
  }, [workflows]);

  useEffect(() => {
    if (!authHeaders().Authorization) {
      return;
    }

    refreshScheduledPosts().catch(() => {
      // Keep app usable even when schedule API is temporarily unavailable.
    });
  }, [refreshScheduledPosts]);

  return (
    <AppContext.Provider
      value={{ scheduledPosts, workflows, addPost, addWorkflow, refreshScheduledPosts }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
