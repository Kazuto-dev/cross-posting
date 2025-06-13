const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/create', async (req, res) => {
  const { content, accessToken, authorId } = req.body;

  try {
    const result = await axios.post(
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

    res.json({ message: 'Posted to LinkedIn', data: result.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to post to LinkedIn' });
  }
});

module.exports = router;
