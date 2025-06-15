const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// Step 1: Redirect to LinkedIn login
router.get('/login', (req, res) => {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}&scope=openid%20profile%20w_member_social`;
  res.redirect(authUrl);
});

// Step 2: Callback from LinkedIn
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({ error: 'Authorization denied by user', details: error });
  }

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange code for access token
    const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      },
    });

    const accessToken = tokenRes.data.access_token;

    // Use the correct endpoint for openid/profile scope
    const userInfoRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const linkedinId = userInfoRes.data.sub;
    const authorUrn = `urn:li:person:${linkedinId}`;

    res.json({
      accessToken,
      authorUrn,
    });
  } catch (err) {
    console.error('OAuth callback failed:', err.response?.data || err.message);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

module.exports = router;
