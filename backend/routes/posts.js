const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

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

    res.status(200).json({
      message: '✅ LinkedIn post successful!',
      postId: response.data,
    });
  } catch (error) {
    console.error('❌ LinkedIn API error (full):');
    console.error('Status:', error.response?.status || 'unknown');
    console.error('Data:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to post to LinkedIn',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
// This code defines a route for creating posts on LinkedIn using the LinkedIn API.