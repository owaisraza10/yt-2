const express = require('express');
const { spawn } = require('child_process');
const app = express();

// Fake web endpoint so Render knows the app is "healthy"
app.get('/', (req, res) => res.send('Stream is live!'));
app.listen(10000, () => console.log('Web server listening on port 10000'));

// The background stream pipeline with auto-proxy rotation
async function startStream() {
    try {
        console.log("Fetching fresh rotating proxy list...");
        // Pull the live list of HTTP proxies
        const response = await fetch('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=2000&anonymity=elite');
        const text = await response.text();
        
        // Clean the text data into an array of IP:PORT strings
        const proxies = text.split('\r\n').filter(p => p.trim() !== '');
        
        if (proxies.length === 0) {
            throw new Error("Proxy list is empty.");
        }

        // Pick a random proxy from the list
        const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
        console.log(`Starting stream with proxy: http://${randomProxy}`);

        // Spawn the stream using the dynamically injected proxy and optimized audio filters
        const stream = spawn('bash', ['-c', `yt-dlp -4 --proxy "http://${randomProxy}" --cookies cookies.txt --extractor-args "youtube:client=android" --remote-components ejs:github -o - "https://www.youtube.com/watch?v=Rs7St51oDDc" | ffmpeg -i pipe:0 -c:v copy -c:a aac -ac 1 -ar 22050 -b:a 48k -af "aecho=0.8:0.9:1000:0.3,asetrate=41624,aresample=22050,atempo=1.0594" -f flv rtmp://a.rtmp.youtube.com/live2/k2bw-rtyc-h8hd-9hhp-6tt3`]);

        stream.stdout.on('data', (data) => console.log(`Data: ${data}`));
        stream.stderr.on('data', (data) => console.error(`Log: ${data}`));

        stream.on('close', (code) => {
            console.log(`Stream stopped (Code ${code}). Auto-restarting with a new proxy in 5 seconds...`);
            setTimeout(startStream, 5000);
        });

    } catch (err) {
        console.error("Failed to fetch proxies or start stream. Retrying in 10 seconds...", err);
        setTimeout(startStream, 10000);
    }
}

startStream();
