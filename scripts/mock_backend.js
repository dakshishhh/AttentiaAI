const http = require('http');
const fs = require('fs');
const path = require('path');

let sessionState = {
  running: false,
  difficulty: 2,
  emotion: 0,
  distraction: 0,
  current_action_label: "do_nothing",
  updated_at: Date.now()
};

let simInterval = null;

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    try {
      res.end(fs.readFileSync(path.join(__dirname, '../frontend/index.html')));
    } catch (e) {
      res.end("Frontend not found");
    }
  } else if (req.url === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      session: sessionState,
      camera: { emotion_label: "neutral", source: "mock" },
      audio: { noise_level: 1, source: "mock" }
    }));
  } else if (req.url === '/api/preflight' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ready: true }));
  } else if (req.url === '/api/session/start' && req.method === 'POST') {
    sessionState.running = true;
    sessionState.updated_at = Date.now();
    startSimulation();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "started" }));
  } else if (req.url === '/api/session/stop' && req.method === 'POST') {
    sessionState.running = false;
    sessionState.updated_at = Date.now();
    clearInterval(simInterval);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "stopped" }));
  } else if (req.url === '/api/session/profile' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        if (data.difficulty !== undefined) sessionState.difficulty = data.difficulty;
        sessionState.updated_at = Date.now();
      } catch (e) {}
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: "updated" }));
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

function startSimulation() {
  clearInterval(simInterval);
  simInterval = setInterval(() => {
    // Randomly pick an intervention to showcase the UI
    const actions = ["show_animation", "play_music", "increase_difficulty", "decrease_difficulty", "do_nothing", "do_nothing"];
    const newAction = actions[Math.floor(Math.random() * actions.length)];
    
    if (newAction !== "do_nothing") {
        sessionState.current_action_label = newAction;
        sessionState.updated_at = Date.now();
        console.log(`[Mock Backend] Triggered simulated intervention: ${newAction}`);
    }
  }, 4000);
}

server.listen(8000, '127.0.0.1', () => {
  console.log('\n================================================');
  console.log('✅ MOCK SERVER RUNNING');
  console.log('🌍 Open http://127.0.0.1:8000 in your browser!');
  console.log('================================================\n');
});
