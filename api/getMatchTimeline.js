// File: /api/getMatchTimeline.js
export default async function handler(request, response) {
  const apiKey = process.env.THESPORTSDB_API_KEY;
  const { id } = request.query;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key non configurata sul server.' });
  }

  if (!id) {
    return response.status(400).json({ error: 'ID evento mancante.' });
  }

  const apiUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}/lookuptimeline.php?id=${id}`;

  try {
    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`TheSportsDB ha risposto con un errore: ${apiResponse.status} - ${errorText}`);
    }

    const data = await apiResponse.json();

    if (!data.timeline) {
      console.error("Dati non validi o struttura inattesa da TheSportsDB:", data);
      throw new Error('La risposta dell\'API non contiene la cronaca dell\'evento.');
    }

    response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    return response.status(200).json({
      timeline: data.timeline,
    });

  } catch (error) {
    console.error("Errore nella funzione serverless 'getMatchTimeline':", error);
    return response.status(500).json({ error: `Errore nel contattare l'API di TheSportsDB: ${error.message}` });
  }
}
