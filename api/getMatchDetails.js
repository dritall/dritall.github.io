// File: /api/getMatchDetails.js
export default async function handler(request, response) {
  const { matchId } = request.query;
  const apiKey = process.env.FOOTBALL_DATA_API_TOKEN;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key not configured on the server.' });
  }

  if (!matchId) {
    return response.status(400).json({ error: 'Match ID parameter is required.' });
  }

  const apiUrl = `https://api.football-data.org/v4/matches/${matchId}`;

  try {
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Football-data API error for matchId ${matchId}: ${errorText}`);
      throw new Error(`The API responded with status ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    // Set a longer cache for finished matches, shorter for live/scheduled ones
    const cacheSeconds = data.status === 'FINISHED' ? 86400 : 60; // 24 hours for finished, 1 minute for others
    response.setHeader('Cache-Control', `s-maxage=${cacheSeconds}, stale-while-revalidate`);

    // Per instructions, return the entire match object
    return response.status(200).json(data);

  } catch (error) {
    console.error(`Error in getMatchDetails for matchId ${matchId}:`, error.message);
    return response.status(500).json({ error: `Failed to fetch match details: ${error.message}` });
  }
}
