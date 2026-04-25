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
      title: content.title || content.youtube_title || null,
      content: content.message || content.description || '',
      platforms: [post.platform],
      scheduledFor: post.scheduled_at,
      status: post.status === 'posted' ? 'completed' : post.status || 'scheduled',
      type: content.media_url || content.mediaUrl ? (content.media_type === 'video' ? 'video' : 'image') : 'text',
      media: content.media_url || content.mediaUrl || null,
      timezone: content.schedule_timezone || 'UTC',
      scheduledLocal: content.scheduled_local || null,
      is_shorts: !!content.is_shorts,
      providerPostId: post.provider_post_id || null, // Include the API post ID
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
    const { content, platforms, scheduledLocal, scheduleTimezone, rawFile, formatCategory, linkedinOptions, extra_content } = post;
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
            ...(platform === 'linkedin' && linkedinOptions
              ? {
                  linkedin_author_type: linkedinOptions.authorType || 'personal',
                  linkedin_organization_id: linkedinOptions.organizationId || null,
                }
              : {}),
            ...(platform === 'youtube' && extra_content
              ? {
                  title: extra_content.title || 'Untitled Video',
                  is_shorts: extra_content.is_shorts || false,
                }
              : {}),
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
    const { content, platforms, rawFile, formatCategory, linkedinOptions, extra_content } = post;
    const userId = currentUserId;

    const requests = platforms.map(async (platform) => {
      let mediaUrl = null;
      let mediaType = null;

      if (rawFile && userId) {
        mediaUrl = await uploadToFirebase(rawFile, platform, userId);
        mediaType = rawFile.type.startsWith('video/') ? 'video' : 'image';
      }

      const response = await fetch(`${API_BASE_URL}/api/schedule/publish-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          platform,
          content: content,
          media_url: mediaUrl,
          media_type: mediaType,
          format_category: formatCategory || null,
          ...(platform === 'linkedin' && linkedinOptions
            ? {
                extra_content: {
                  linkedin_author_type: linkedinOptions.authorType || 'personal',
                  linkedin_organization_id: linkedinOptions.organizationId || null,
                },
              }
            : {}),
          ...(platform === 'youtube' && extra_content
            ? {
                extra_content: {
                  title: extra_content.title || 'Untitled Video',
                  is_shorts: extra_content.is_shorts || false,
                },
                is_shorts: extra_content.is_shorts || false,
              }
            : {}),
        }),
      });

      if (!response.ok) {
        let message = `Failed to post to ${platform}`;
        try {
          const payload = await response.json();
          if (payload?.error) message = payload.error;
          else if (payload?.message) message = payload.message;
        } catch (_) {}
        throw new Error(message);
      }

      return response.json();
    });

    await Promise.all(requests);
    await refreshScheduledPosts();
  }, [currentUserId, refreshScheduledPosts]);

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
