const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const YOUTUBE_API_KEY = 'AIzaSyDBV2IhZJgJ2OIYqn1sfiHGmdXUXhWNc_M'; // Replace with your YouTube API key

// Endpoint to search for music on YouTube
app.get('/music', async (req, res) => {
    try {
        const query = req.query.query;

        // Validate if the query parameter exists
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Make a request to YouTube Data API
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                q: query,
                type: 'video',
                videoCategoryId: '10', // Category for music
                key: YOUTUBE_API_KEY,
                maxResults: 1 // Limit to 1 result
            }
        });

        // Check if any music videos were found
        if (response.data.items.length === 0) {
            return res.status(404).json({ message: 'No music videos found' });
        }

        // Return the first music video link
        const video = response.data.items[0];
        return res.json({
            track_name: video.snippet.title,
            artist: video.snippet.channelTitle,
            video_link: `https://www.youtube.com/watch?v=${video.id.videoId}` // YouTube video link
        });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
