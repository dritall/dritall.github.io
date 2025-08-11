// File: /api/getCurrentRound.js

export default async function handler(request, response) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key non configurata.' });
  }

  const leagueId = 135;
  const season = 2023; // Per test

  const apiUrl = `https://v3.football.api-sports.io/fixtures/rounds?league=${leagueId}&season=${season}`;

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
    
    // L'API ci restituisce tutte le giornate. Noi prendiamo l'ultima.
    const lastRound = data.response.pop();

    response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache di 1 giorno
    return response.status(200).json({ currentRound: lastRound });

  } catch (error) {
    console.error("Errore serverless in getCurrentRound:", error);
    return response.status(500).json({ error: error.message });
  }
}
