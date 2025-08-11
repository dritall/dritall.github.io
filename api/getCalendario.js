// File: /api/getCalendario.js

export default async function handler(request, response) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  // Recuperiamo la giornata dalla richiesta URL (es. ?round=Regular%20Season%20-%201)
  const { round } = request.query;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key non configurata.' });
  }
  if (!round) {
    return response.status(400).json({ error: 'Parametro "round" mancante.' });
  }

  const leagueId = 135;
  const season = 2023; // Per test

  const apiUrl = `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}&round=${round}`;

  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': apiKey,
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`API-Football ha risposto con un errore: ${apiResponse.status} - ${errorText}`);
    }

    const data = await apiResponse.json();
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache di 1 ora
    return response.status(200).json({ fixtures: data.response });

  } catch (error) {
    console.error("Errore serverless in getCalendario:", error);
    return response.status(500).json({ error: error.message });
  }
}
