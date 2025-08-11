// File: /api/getClassifica.js

export default async function handler(request, response) {
  // Prende la chiave API segreta dalle Environment Variables di Vercel
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key non configurata sul server.' });
  }

  // ID Lega Serie A = 135
  // Per la stagione, usiamo 2024 per avere dati di test. 
  // Quando inizierà la nuova stagione, basterà cambiare questo in 2025.
  const leagueId = 135;
  const season = 2024; 

  const apiUrl = `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`;

  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': apiKey,
      },
    });

    const data = await apiResponse.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      throw new Error(JSON.stringify(data.errors));
    }

    // Imposta una cache di 1 ora per non sprecare chiamate API
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    return response.status(200).json({
      standings: data.response[0]?.league?.standings,
    });

  } catch (error) {
    console.error("Errore nella funzione serverless:", error);
    return response.status(500).json({ error: `Errore nel contattare l'API di Football: ${error.message}` });
  }
}
