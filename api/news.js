import fetch from 'node-fetch';

export default async function handler(req, res) {
  const apiKey = process.env.NEWS_API_KEY;

  // The client will now send a 'type' parameter
  const { category, q, type, from, to } = req.query;

  let endpoint;

  if (type === 'trends') {
    // Handle trend chart requests
    endpoint = `https://newsapi.org/v2/everything?q=${q}&from=${from}&to=${to}&language=en&pageSize=100&apiKey=${apiKey}`;
  } else if (q) {
    // Handle search queries
    endpoint = `https://newsapi.org/v2/everything?q=${q}&language=en&apiKey=${apiKey}`;
  } else {
    // Handle top headlines by category
    endpoint = `https://newsapi.org/v2/top-headlines?country=us&category=${category || 'general'}&apiKey=${apiKey}`;
  }

  try {
    const apiResponse = await fetch(endpoint);
    const data = await apiResponse.json();

    res.status(apiResponse.status).json(data);
  } catch (error) {
    console.error("Error fetching from News API:", error);
    res.status(500).json({ error: 'Failed to fetch news from the external API' });
  }
}