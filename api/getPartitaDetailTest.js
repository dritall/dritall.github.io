// File: /api/getPartitaDetailTest.js
export default async function handler(request, response) {
    const apiKey = process.env.FOOTBALL_DATA_API_TOKEN;
    const { id } = request.query;

    if (!apiKey) {
        return response.status(500).json({ error: 'API Key not configured on the server.' });
    }

    if (!id) {
        return response.status(400).json({ error: 'Match ID is required.' });
    }

    const apiUrl = `https://api.football-data.org/v4/matches/${id}`;

    try {
        const apiResponse = await fetch(apiUrl, {
            headers: {
                'X-Auth-Token': apiKey,
            },
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`football-data.org API responded with an error: ${apiResponse.status} - ${errorText}`);
        }

        const data = await apiResponse.json();

        // Set cache for 1 hour (3600 seconds) for match details
        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        return response.status(200).json(data);

    } catch (error) {
        console.error(`Error in serverless function 'getPartitaDetailTest' for match ID ${id}:`, error);
        return response.status(500).json({ error: `Error contacting the football-data.org API: ${error.message}` });
    }
}
