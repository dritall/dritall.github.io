// File: /api/getPartita.js

export default async function handler(request, response) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const { id } = request.query; // ID della partita

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key non configurata.' });
  }
  if (!id) {
    return response.status(400).json({ error: 'Parametro "id" mancante.' });
  }

  // Dobbiamo fare due chiamate: una per i dati generali, una per gli eventi
  const fixtureUrl = `https://v3.football.api-sports.io/fixtures?id=${id}`;
  const eventsUrl = `https://v3.football.api-sports.io/fixtures/events?fixture=${id}`;

  try {
    // Eseguiamo le chiamate in parallelo per essere più veloci
    const [fixtureRes, eventsRes] = await Promise.all([
      fetch(fixtureUrl, { headers: { 'x-rapidapi-key': apiKey } }),
      fetch(eventsUrl, { headers: { 'x-rapidapi-key': apiKey } })
    ]);

    if (!fixtureRes.ok || !eventsRes.ok) {
        throw new Error(`Errore da API-Football`);
    }

    const fixtureData = await fixtureRes.json();
    const eventsData = await eventsRes.json();
    
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return response.status(200).json({ 
        fixture: fixtureData.response[0],
        events: eventsData.response
    });

  } catch (error) {
    console.error("Errore serverless:", error);
    return response.status(500).json({ error: error.message });
  }
}
