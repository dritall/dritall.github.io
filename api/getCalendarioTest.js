// File: /api/getCalendarioTest.js
export default async function handler(request, response) {
    const apiKey = process.env.FOOTBALL_DATA_API_TOKEN;
    const competition = 'SA'; // Serie A
    const season = '2024';
    const matchdays = [1, 2, 3, 4];

    if (!apiKey) {
        return response.status(500).json({ error: 'API Key not configured on the server.' });
    }

    const fetchMatchday = async (matchday) => {
        const apiUrl = `https://api.football-data.org/v4/competitions/${competition}/matches?season=${season}&matchday=${matchday}`;
        const apiResponse = await fetch(apiUrl, {
            headers: {
                'X-Auth-Token': apiKey,
            },
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`football-data.org API responded with an error: ${apiResponse.status} - ${errorText}`);
        }
        return apiResponse.json();
    };

    try {
        const allMatches = [];
        for (const matchday of matchdays) {
            const data = await fetchMatchday(matchday);
            if (data.matches) {
                allMatches.push(...data.matches);
            }
        }

        // Set cache for 24 hours (86400 seconds)
        response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

        return response.status(200).json({
            matches: allMatches,
        });

    } catch (error) {
        console.error("Error in serverless function 'getCalendarioTest':", error);
        return response.status(500).json({ error: `Error contacting the football-data.org API: ${error.message}` });
    }
}
