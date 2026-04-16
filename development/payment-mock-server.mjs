#!/usr/bin/env node
import http from 'http';

const PORT = process.env.PORT || 3030;

function respondJson(res, status, obj) {
    const str = JSON.stringify(obj);
    res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(str) });
    res.end(str);
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/api/health') {
        return respondJson(res, 200, { ok: true, ts: new Date().toISOString() });
    }

    if (req.method === 'POST' && req.url === '/api/pay') {
        let body = '';
        for await (const chunk of req) body += chunk;
        try {
            const data = JSON.parse(body || '{}');
            const transactionId = 'mock-txn-' + Date.now();
            // In a real integration, validate amount and create payment intent with provider
            return respondJson(res, 200, { success: true, transactionId });
        } catch (e) {
            return respondJson(res, 400, { error: 'invalid_json' });
        }
    }

    respondJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, () => {
    console.log(`Mock payment server listening on http://localhost:${PORT}`);
});
