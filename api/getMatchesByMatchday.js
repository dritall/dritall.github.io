// File: /api/getMatchesByMatchday.js
export default async function handler(request, response) {
  const { matchday } = request.query;
  const apiKey = process.env.FOOTBALL_DATA_API_TOKEN;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key not configured on the server.' });
  }

  if (!matchday) {
    return response.status(400).json({ error: 'Matchday parameter is required.' });
  }

  const apiUrl = `https://api.football-data.org/v4/competitions/SA/matches?season=2024&matchday=${matchday}`;

  try {
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Football-data API error for matchday ${matchday}: ${errorText}`);
      throw new Error(`The API responded with status ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    if (!data.matches) {
        console.error("API response did not contain a 'matches' array for matchday", matchday);
        throw new Error("Invalid data structure from API.");
    }

    // Set cache for 1 hour for match lists
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    // Per instructions, return the list of matches directly
    return response.status(200).json(data.matches);

  } catch (error) {
    console.error(`Error in getMatchesByMatchday for matchday ${matchday}:`, error.message);
    return response.status(500).json({ error: `Failed to fetch match data: ${error.message}` });
  }
}
