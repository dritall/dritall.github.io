// File: /api/getClassifica.js
export default async function handler(request, response) {
  const apiKey = process.env.THESPORTSDB_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key non configurata sul server.' });
  }

  // ID Lega Serie A = 4332, Stagione = 2025-2026
  const leagueId = 4332;
  const season = '2025-2026';

  const apiUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}/lookuptable.php?l=${leagueId}&s=${season}`;

  try {
    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`TheSportsDB ha risposto con un errore: ${apiResponse.status} - ${errorText}`);
    }

    const data = await apiResponse.json();

    // TheSportsDB potrebbe non avere un campo 'errors' standard, quindi controlliamo se la risposta contiene dati validi.
    // La risposta attesa per la classifica è un oggetto con una chiave "table".
    if (!data.table) {
      console.error("Dati non validi o struttura inattesa da TheSportsDB:", data);
      throw new Error('La risposta dell\'API non contiene la tabella della classifica.');
    }

    // Imposta una cache di 24 ore (86400 secondi)
    response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    
    return response.status(200).json({
      standings: data.table, // La tabella della classifica è direttamente sotto la chiave 'table'
    });

  } catch (error) {
    console.error("Errore nella funzione serverless 'getClassifica':", error);
    return response.status(500).json({ error: `Errore nel contattare l'API di TheSportsDB: ${error.message}` });
  }
}
