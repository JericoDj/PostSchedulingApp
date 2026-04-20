import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { API_BASE_URL, authHeaders, getAuthToken } from '../utils/api';
import { uploadToFirebase } from '../utils/firebase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [workflows, setWorkflows] = useState([
    { id: '1', name: 'Auto-Welcome Campaign', active: true, triggers: ['New Follower'], actions: ['Send DM', 'Add to List'] },
    { id: '2', name: 'Weekend Engagement', active: false, triggers: ['Time: Saturday 10AM'], actions: ['Post Story'] },
  ]);

  // Decode userId from JWT token for Firebase path
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id || payload.sub || null);
      } catch (_) {
        setCurrentUserId(null);
      }
    }
  }, []);

  const normalizeScheduledPost = (post) => {
    const content = post.content || {};

    return {
      id: post.id,
      content: content.message || content.description || content.title || '',
      platforms: [post.platform],
      scheduledFor: post.scheduled_at,
      status: post.status === 'posted' ? 'completed' : post.status || 'scheduled',
      type: content.media_url || content.mediaUrl ? (content.media_type === 'video' ? 'video' : 'image') : 'text',
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
    const { content, platforms, scheduledLocal, scheduleTimezone, rawFile, formatCategory } = post;
    const userId = currentUserId;

    const requests = platforms.map(async (platform) => {
      let mediaUrl = null;
      let mediaType = null;

      // If a raw file was provided, upload to Firebase first
      if (rawFile && userId) {
        mediaUrl = await uploadToFirebase(rawFile, platform, userId);
        mediaType = rawFile.type.startsWith('video/') ? 'video' : 'image';
      }

      return fetch(`${API_BASE_URL}/api/schedule`, {
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
            media_url: mediaUrl,
            media_type: mediaType,
            format_category: formatCategory || null,
            schedule_timezone: scheduleTimezone,
            scheduled_local: scheduledLocal,
          },
        }),
      });
    });

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
  }, [refreshScheduledPosts, currentUserId]);

  /**
   * Immediately publish to a platform (no schedule).
   * Currently supports: facebook
   */
  const publishNow = useCallback(async (post) => {
    const { content, platforms, rawFile, formatCategory } = post;
    const userId = currentUserId;

    // For now we handle facebook; other platforms can be added
    const facebookPlatforms = platforms.filter(p => p === 'facebook');
    if (facebookPlatforms.length === 0) {
      throw new Error('Post Now is currently supported for Facebook only');
    }

    let mediaUrl = null;
    let mediaType = null;

    if (rawFile && userId) {
      mediaUrl = await uploadToFirebase(rawFile, 'facebook', userId);
      mediaType = rawFile.type.startsWith('video/') ? 'video' : 'image';
    }

    const response = await fetch(`${API_BASE_URL}/api/facebook-posts/publish-now`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({
        message: content,
        media_url: mediaUrl,
        media_type: mediaType,
        format_category: formatCategory || null,
      }),
    });

    if (!response.ok) {
      let message = 'Failed to post to Facebook';
      try {
        const payload = await response.json();
        if (payload?.error) message = payload.error;
        else if (payload?.message) message = payload.message;
      } catch (_) {}
      throw new Error(message);
    }

    return response.json();
  }, [currentUserId]);

  const updatePost = useCallback(async (id, postData) => {
    const { content, scheduledLocal, scheduleTimezone } = postData;
    
    const response = await fetch(`${API_BASE_URL}/api/schedule/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({
        scheduled_local: scheduledLocal || null,
        schedule_timezone: scheduleTimezone || null,
        content: {
          message: content,
          description: content,
          schedule_timezone: scheduleTimezone,
          scheduled_local: scheduledLocal,
        },
      }),
    });

    if (!response.ok) {
      let message = 'Failed to update post';
      try {
        const payload = await response.json();
        if (payload?.message) message = payload.message;
      } catch (_) {}
      throw new Error(message);
    }
    
    await refreshScheduledPosts();
  }, [refreshScheduledPosts]);

  const deletePost = useCallback(async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/${id}`, {
      method: 'DELETE',
      headers: {
        ...authHeaders(),
      },
    });

    if (!response.ok) {
      let message = 'Failed to delete post';
      try {
        const payload = await response.json();
        if (payload?.message) message = payload.message;
      } catch (_) {}
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
      value={{ scheduledPosts, workflows, addPost, publishNow, updatePost, deletePost, addWorkflow, refreshScheduledPosts }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
