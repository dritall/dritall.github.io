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

  // Chiamiamo l'endpoint per gli eventi della partita
  const eventsUrl = `https://v3.football.api-sports.io/fixtures/events?fixture=${id}`;

  try {
    const apiResponse = await fetch(eventsUrl, {
        method: 'GET',
        headers: { 
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': apiKey 
        }
    });
    
    if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Errore da API-Football (events): ${errorText}`);
    }

    const eventsData = await apiResponse.json();
    
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache di 1 ora
    return response.status(200).json({ 
        events: eventsData.response
    });

  } catch (error) {
    console.error("Errore serverless in getPartita:", error);
    return response.status(500).json({ error: error.message });
  }
}

