// File: /api/getClassifica.js

export default async function handler(request, response) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key non configurata sul server.' });
  }

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

    // NUOVO CONTROLLO DI DEBUG:
    // Prima di provare a leggere i dati come JSON, controlliamo se la chiamata è andata a buon fine.
    if (!apiResponse.ok) {
      // Se la risposta non è OK (es. errore 401, 403, 500), leggiamo l'errore come testo...
      const errorText = await apiResponse.text();
      // ...e lo lanciamo come un errore, così lo vedremo sulla pagina.
      throw new Error(`API-Football ha risposto con un errore: ${apiResponse.status} - ${errorText}`);
    }

    const data = await apiResponse.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      throw new Error(JSON.stringify(data.errors));
    }

    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    return response.status(200).json({
      standings: data.response[0]?.league?.standings,
    });

  } catch (error) {
    console.error("Errore nella funzione serverless:", error);
    return response.status(500).json({ error: `Errore nel contattare l'API di Football: ${error.message}` });
  }
}
