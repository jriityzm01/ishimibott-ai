export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-target-url');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Ambil target URL dari query (GET) atau header (POST)
    const targetUrl = req.query.url || req.headers['x-target-url'];

    if (!targetUrl) {
        return res.status(400).json({ error: 'URL target kosong, Bro!' });
    }

    try {
        let fetchOptions = {
            method: req.method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        };

        // Kalo POST (Fitur HD Video), copy form-data nya
        if (req.method === 'POST') {
            const contentType = req.headers['content-type'];
            if (contentType) fetchOptions.headers['Content-Type'] = contentType;
            
            // Vercel body parser kadang bikin form-data berantakan, ini trik nge-raw body nya
            let chunks = [];
            for await (const chunk of req) {
                chunks.push(chunk);
            }
            fetchOptions.body = Buffer.concat(chunks);
        }

        const response = await fetch(targetUrl, fetchOptions);
        
        // Pengecekan apakah responnya JSON atau Text
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return res.status(200).json(data);
        } else {
            const text = await response.text();
            return res.status(200).send(text);
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}