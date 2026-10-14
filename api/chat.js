export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode tidak diizinkan. Gunakan POST.' });
    }

    const { messages, model } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'OPENROUTER_API_KEY belum dikonfigurasi di Environment Variables Vercel.' });
    }

    try {
        // Menambahkan System Prompt khusus untuk Pabbura-AI (Fokus Medis)
        const systemPrompt = {
            role: 'system',
            content: 'Anda adalah Pabbura-AI (Pabbura dalam bahasa Bugis berarti Pengobatan/Penyembuh). Anda adalah asisten virtual medis dan kesehatan yang ahli, ramah, dan empatik. Berikan jawaban yang akurat terkait kesehatan, gejala penyakit, dan saran medis umum. Selalu ingatkan pengguna di akhir respons yang serius bahwa Anda adalah AI dan menyarankan mereka untuk berkonsultasi dengan dokter profesional atau mengunjungi rumah sakit terdekat untuk diagnosis yang pasti.'
        };

        const apiMessages = [systemPrompt, ...messages];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://pabbura-ai.vercel.app', 
                'X-Title': 'Pabbura-AI'
            },
            body: JSON.stringify({
                model: model || 'openrouter/free',
                messages: apiMessages
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error fetching to OpenRouter:', error);
        return res.status(500).json({ error: 'Gagal mengambil respons dari OpenRouter. Coba model lain atau periksa koneksi.' });
    }
}
