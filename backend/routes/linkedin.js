const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// Step 1: Get auth URL
router.get('/login', (req, res) => {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}&scope=r_liteprofile%20w_member_social`;
  res.redirect(authUrl);
});

// Step 2: Callback with code
router.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
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

    // Get LinkedIn user URN
    const meRes = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.json({
      accessToken,
      authorUrn: meRes.data.id, // This is the ID for use in urn:li:person:<id>
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

module.exports = router;
