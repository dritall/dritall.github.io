// File: /api/getCalendario.js
export default async function handler(request, response) {
  const apiKey = process.env.THESPORTSDB_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key non configurata sul server.' });
  }

  // ID Lega Serie A = 4332, Stagione = 2025-2026
  const leagueId = 4332;
  const season = '2025-2026';

  const apiUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsseason.php?id=${leagueId}&s=${season}`;

  try {
    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`TheSportsDB ha risposto con un errore: ${apiResponse.status} - ${errorText}`);
    }

    const data = await apiResponse.json();

    // La risposta attesa per il calendario è un oggetto con una chiave "events".
    if (!data.events) {
      console.error("Dati non validi o struttura inattesa da TheSportsDB:", data);
      throw new Error('La risposta dell\'API non contiene il calendario degli eventi.');
    }

    // Imposta una cache di 24 ore (86400 secondi)
    response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    return response.status(200).json({
      fixtures: data.events, // Il calendario è direttamente sotto la chiave 'events'
    });

  } catch (error) {
    console.error("Errore nella funzione serverless 'getCalendario':", error);
    return response.status(500).json({ error: `Errore nel contattare l'API di TheSportsDB: ${error.message}` });
  }
}
