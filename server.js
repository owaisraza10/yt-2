const express = require('express');
const { spawn } = require('child_process');
const app = express();

// Fake web endpoint so Render knows the app is "healthy"
app.get('/', (req, res) => res.send('Stream is live!'));
app.listen(10000, () => console.log('Web server listening on port 10000'));

// The background stream pipeline
function startStream() {
    console.log("Starting stream...");
    // Replace YOUR_STREAM_KEY below
    const stream = spawn('bash', ['-c', 'yt-dlp -4 --proxy "http://5.181.178.46:8080" --cookies cookies.txt --extractor-args "youtube:client=android" --remote-components ejs:github -o - "https://www.youtube.com/watch?v=Rs7St51oDDc" | ffmpeg -i pipe:0 -c:v copy -c:a aac -af "asetrate=41624,aresample=44100,atempo=1.0594" -f flv rtmp://a.rtmp.youtube.com/live2/k2bw-rtyc-h8hd-9hhp-6tt3']);

    stream.stdout.on('data', (data) => console.log(`Data: ${data}`));
    stream.stderr.on('data', (data) => console.error(`Log: ${data}`));

    stream.on('close', (code) => {
        console.log(`Stream stopped (Code ${code}). Auto-restarting in 5 seconds...`);
        setTimeout(startStream, 5000);
    });
}

startStream();
