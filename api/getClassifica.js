// File: /api/getClassifica.js

export default async function handler(request, response) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key non configurata sul server.' });
  }

  // ID Lega Serie A = 135
  // MODIFICA DEFINITIVA: Usiamo la stagione 2023 come suggerito dall'errore dell'API
  // per avere dati di test validi.
  const leagueId = 135;
  const season = 2023; 

  const apiUrl = `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`;

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

    if (data.errors && Object.keys(data.errors).length > 0) {
      let errorMessage = "Errore dall'API: ";
      if(typeof data.errors === 'object' && data.errors !== null) {
          errorMessage += Object.values(data.errors).join(', ');
      } else {
          errorMessage += JSON.stringify(data.errors);
      }
      throw new Error(errorMessage);
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
