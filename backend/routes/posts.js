const express = require('express');
const axios = require('axios');
const router = express.Router();
const Post = require('../models/post');
require('dotenv').config();

// Axios interceptor for logging LinkedIn API traffic
axios.interceptors.response.use(
  (res) => {
    console.log('📦 LinkedIn Response:', {
      method: res.config.method,
      url: res.config.url,
      status: res.status,
      data: res.data,
    });
    return res;
  },
  (err) => {
    console.error('🛑 LinkedIn Error:', {
      method: err.config?.method,
      url: err.config?.url,
      status: err.response?.status,
      data: err.response?.data,
    });
    return Promise.reject(err);
  }
);

// GET all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
});

// CREATE a LinkedIn post
router.post('/create', async (req, res) => {
  const { content } = req.body;
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorId = process.env.LINKEDIN_AUTHOR_ID;

  if (!content || !accessToken || !authorId) {
    return res.status(400).json({ error: 'Missing post content or LinkedIn credentials' });
  }

  try {
    // 1. Create the post on LinkedIn
    const createRes = await axios.post(
      'https://api.linkedin.com/rest/posts',
      {
        author: `urn:li:person:${authorId}`,
        commentary: content,
        visibility: 'PUBLIC',
        distribution: { feedDistribution: 'MAIN_FEED' },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'LinkedIn-Version': '202306',
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      }
    );

    if (createRes.status >= 300) {
      return res.status(createRes.status).json({
        error: 'LinkedIn post creation failed',
        details: createRes.data,
      });
    }

    // 2. Extract share URN from response header
    const locationHeader = createRes.headers?.location;
    const shareUrn = locationHeader?.includes('urn%3Ali%3Ashare%3A')
      ? decodeURIComponent(locationHeader.split('/').pop())
      : null;

    if (!shareUrn) {
      return res.status(500).json({ error: 'Post created but share URN not found' });
    }

    // 3. Convert share URN to activity URN (inferred)
    const activityUrn = shareUrn.replace('share', 'activity');

    // 4. Save post data to MongoDB
    const savedPost = await Post.create({
      content,
      postId: shareUrn,
      activityUrn,
    });

    res.status(200).json({
      message: '✅ LinkedIn post created and saved!',
      savedPost,
    });

  } catch (error) {
    const status = error.response?.status || 500;
    const details = error.response?.data || error.message;
    res.status(status).json({ error: 'Failed to create LinkedIn post', details });
  }
});

// DELETE LinkedIn post and DB entry
router.delete('/:id', async (req, res) => {
  const mongoId = req.params.id;
  const token = process.env.LINKEDIN_ACCESS_TOKEN;

  try {
    const post = await Post.findById(mongoId);
    if (!post) return res.status(404).json({ error: 'Post not found in database' });

    const urn = post.activityUrn || post.postId;

    if (urn?.startsWith('urn:li:activity:')) {
      try {
        const deleteRes = await axios.delete(
          `https://api.linkedin.com/rest/posts/${encodeURIComponent(urn)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'LinkedIn-Version': '202306',
              'X-Restli-Protocol-Version': '2.0.0',
            },
          }
        );

        if (deleteRes.status === 204) {
          console.log(`✅ LinkedIn post ${urn} deleted`);
        } else {
          console.warn(`⚠️ Unexpected status ${deleteRes.status} when deleting post`);
        }
      } catch (err) {
        console.error('❌ LinkedIn deletion failed:', err.response?.data || err.message);
        return res.status(err.response?.status || 500).json({
          error: 'LinkedIn deletion failed',
          details: err.response?.data || err.message,
        });
      }
    } else {
      console.warn('⚠️ No valid activity URN, skipping LinkedIn deletion');
    }

    await post.deleteOne();
    res.json({ message: '🗑️ Post deleted from DB and LinkedIn (if applicable)' });

  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
