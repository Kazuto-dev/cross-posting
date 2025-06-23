const express = require('express');
const axios = require('axios');
const router = express.Router();
const Post = require('../models/post');
require('dotenv').config();

// Interceptor for debugging all LinkedIn responses
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

// ✅ Create a LinkedIn post and save to MongoDB
router.post('/create', async (req, res) => {
  const { content } = req.body;
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorId = process.env.LINKEDIN_AUTHOR_ID;

  if (!content || !accessToken || !authorId) {
    return res.status(400).json({ error: 'Missing post content or LinkedIn credentials' });
  }

  try {
    const response = await axios.post(
      'https://api.linkedin.com/rest/posts',
      {
        author: `urn:li:person:${authorId}`,
        commentary: content,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'LinkedIn-Version': '202306',
          'Content-Type': 'application/json',
        },
      }
    );

    // Log full response to understand structure (remove in prod)
    console.dir(response.data, { depth: null });

    // Attempt to extract URN, but do not fail if not present
    let urn = response.data?.id;

    if (!urn) {
      console.warn('⚠️ LinkedIn post created but no URN returned. Response:', response.data);
      urn = null; // Optional: or use `urn:li:share:UNKNOWN`
    }

    // ✅ Save to DB even if URN is null
    const savedPost = await Post.create({ content, postId: urn });

    res.status(200).json({
      message: '✅ LinkedIn post successful!',
      savedPost,
    });

  } catch (error) {
    const status = error.response?.status || 500;
    const details = error.response?.data || error.message;

    if (status === 422 && details?.message?.includes('duplicate')) {
      return res.status(422).json({
        error: '❌ Duplicate content: LinkedIn already has this post.',
        duplicateOf: details.message,
      });
    }

    res.status(status).json({
      error: '❌ Failed to post to LinkedIn',
      details,
    });
  }
});


// ✅ Fetch all posts from MongoDB
router.delete('/:id', async (req, res) => {
  const postIdToDelete = req.params.id;

  try {
    // 1. Find post in MongoDB
    const post = await Post.findById(postIdToDelete);
    if (!post) {
      return res.status(404).json({ error: 'Post not found in the database' });
    }

    const urn = post.postId;
    const token = process.env.LINKEDIN_ACCESS_TOKEN;

    // 2. Attempt LinkedIn post deletion (only if URN looks valid)
    if (urn && urn.startsWith('urn:li:share:')) {
      try {
        console.log('🧩 Deleting LinkedIn post:', urn);

        const response = await axios.delete(
          `https://api.linkedin.com/rest/posts/${encodeURIComponent(urn)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'LinkedIn-Version': '202306',
              'X-Restli-Protocol-Version': '2.0.0',
              'X-RestLi-Method': 'DELETE',
            },
          }
        );

        if (response.status === 204) {
          console.log('✅ LinkedIn post deleted successfully.');
        } else {
          console.warn('⚠️ Unexpected LinkedIn status:', response.status);
        }
      } catch (linkedinErr) {
        const status = linkedinErr.response?.status || 500;
        const details = linkedinErr.response?.data || linkedinErr.message;

        console.error('❌ LinkedIn delete error:', details);

        return res.status(status).json({
          error: 'Failed to delete from LinkedIn',
          details,
        });
      }
    } else {
      console.warn('⚠️ No valid LinkedIn URN found, skipping LinkedIn deletion');
    }

    // 3. Delete from MongoDB
    await Post.findByIdAndDelete(postIdToDelete);

    res.json({ message: '🗑️ Post deleted from LinkedIn and database' });
  } catch (err) {
    console.error('❌ Server error during deletion:', err.message);
    res.status(500).json({
      error: 'Server error during deletion',
      details: err.message,
    });
  }
});


module.exports = router;
