const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000; // You can change the port number if needed

const SPOTIFY_CLIENT_ID = '4f6c07201a5d4f5a85a74bf27b6327e1'; // Your Spotify Client ID
const SPOTIFY_CLIENT_SECRET = 'c926a754b51843ed94e69e2205528608'; // Your Spotify Client Secret

let accessToken = '';

// Function to get Spotify access token
async function getSpotifyAccessToken() {
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
      },
    }
  );

  return response.data.access_token;
}

// Middleware to fetch Spotify access token
async function fetchAccessToken(req, res, next) {
  if (!accessToken) {
    try {
      accessToken = await getSpotifyAccessToken();
    } catch (error) {
      console.error('Error fetching Spotify access token:', error.message);
      return res.status(500).json({ error: 'Failed to get Spotify access token' });
    }
  }
  next();
}

// Endpoint to search for music and return a Spotify link
app.get('/sing', fetchAccessToken, async (req, res) => {
  const { query } = req.query; // Extract the search query from request parameters

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Make a request to the Spotify API to search for tracks
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: 'track',
        limit: 1, // Limit to one result
      },
    });

    const track = response.data.tracks.items[0]; // Get the first track result

    if (track) {
      // Send back the Spotify track URL
      res.json({ url: track.external_urls.spotify, title: track.name, artist: track.artists[0].name });
    } else {
      res.status(404).json({ error: 'No track found for the provided query.' });
    }
  } catch (error) {
    console.error('Error fetching data from Spotify API:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching data from Spotify API' });
  }
});

app.listen(PORT, () => {
  console.log(`Music API is running on http://localhost:${PORT}`);
});
