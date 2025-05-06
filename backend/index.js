const express = require('express');
const axios = require('axios');
const cors = require('cors');
const qs = require('qs');

const app = express();
app.use(cors());

// These should ideally come from environment variables
const CLIENT_ID = '4e60a43b-5b66-495f-b57e-d40ac72f723a_ede36ba3-d735-4f6a-8929-044785a5cdb0';
const CLIENT_SECRET = 'E5nvIK1/EdoVStXB/PrX93cwlzb6ORjXULw6NQX3wc0=';

let accessToken = null;
let tokenExpiration = null;  // Track token expiration

const getToken = async () => {
  try {
    const tokenUrl = 'https://icdaccessmanagement.who.int/connect/token';
    const data = qs.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: 'icdapi_access',
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    console.log('Fetching new access token...');
    const response = await axios.post(tokenUrl, data, { headers });
    accessToken = response.data.access_token;
    tokenExpiration = Date.now() + response.data.expires_in * 1000;
    console.log('New access token acquired');
  } catch (error) {
    console.error('Error fetching access token:', error.message);
    throw error;
  }
};

const getAccessToken = async () => {
  if (!accessToken || Date.now() > tokenExpiration) {
    await getToken();
  }
  return accessToken;
};

// Fetch disease data using search query
app.get('/api/diseases', async (req, res) => {
  const query = req.query.q || 'fever';
  try {
    const token = await getAccessToken();

    const result = await axios.get(
      `https://id.who.int/icd/entity/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': 'en',
          'API-Version': 'v2',
        },
      }
    );

    if (!result.data.destinationEntities) {
      return res.status(404).json({ error: 'No data found' });
    }

    res.json(result.data.destinationEntities || []);
  } catch (error) {
    console.error('Error fetching diseases:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch diseases', 
      details: error.message 
    });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});