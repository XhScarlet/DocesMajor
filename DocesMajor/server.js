/**
 * @fileoverview Servidor Node.js para gerenciamento de persistência de dados.
 * @author Gabriela
 * 
 * TODO: Extrair rotas e lógica de manipulação para controllers e repositórios separados.
 * Atualmente o arquivo viola o Single Responsibility Principle (SRP) ao misturar rotas, lógica de negócio e infraestrutura.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
const BINS = {
    receitas: "6a3715a2f5f4af5e291627ab",
    kits: "6a371548f5f4af5e29162645",
    caixas: "6a371523f5f4af5e291625cf"
};

/**
 * Busca os dados de um Bin específico na nuvem.
 * @param {string} binId O ID do Bin no JSONBin.io
 * @returns {Promise<Array>} Retorna um array com os registros, ou um array vazio em caso de falha.
 */
async function getFromBin(binId) {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            method: 'GET',
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data.record) ? data.record : [];
    } catch (e) {
        console.error("Erro GET JSONBin", e);
        return [];
    }
}

/**
 * Atualiza um Bin inteiro na nuvem com novos dados.
 * @param {string} binId O ID do Bin no JSONBin.io
 * @param {Array} data O array completo de dados a ser salvo.
 * @throws {Error} Lança um erro se a requisição PUT falhar.
 */
async function putToBin(binId, data) {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao salvar no JSONBin');
}

/**
 * Instância principal do servidor HTTP.
 * Atua como um gateway simples para lidar com as requisições do front-end e persistir via JSONBin.
 */
const server = http.createServer(async (req, res) => {
    // Tratamento de CORS para permitir requisições do front-end rodando local ou remotamente
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Intercepta a requisição de Preflight do navegador para CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/receitas' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        
        req.on('end', async () => {
            try {
                const novaReceita = JSON.parse(body);
                let receitas = await getFromBin(BINS.receitas);
                
                if (!novaReceita.id) {
                    novaReceita.id = Date.now().toString();
                    receitas.push(novaReceita);
                } else {
                    const index = receitas.findIndex(r => r.id === novaReceita.id);
                    if (index !== -1) {
                        receitas[index] = novaReceita;
                    } else {
                        receitas.push(novaReceita);
                    }
                }
                
                await putToBin(BINS.receitas, receitas);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: true, message: 'Receita salva com sucesso!', id: novaReceita.id}));
            } catch (e) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Erro ao processar/salvar receita na nuvem'}));
            }
        });
    } else if (req.url === '/receitas' && req.method === 'GET') {
        const receitas = await getFromBin(BINS.receitas);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(receitas));
    } else if (req.url.startsWith('/receitas') && req.method === 'DELETE') {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const idToDelete = urlParams.get('id');
        
        try {
            let receitas = await getFromBin(BINS.receitas);
            receitas = receitas.filter(r => r.id !== idToDelete);
            await putToBin(BINS.receitas, receitas);
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true, message: 'Receita deletada com sucesso!'}));
        } catch(e) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Erro ao deletar receita'}));
        }
    } else if (req.url === '/kits' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        
        req.on('end', async () => {
            try {
                const novoKit = JSON.parse(body);
                let kits = await getFromBin(BINS.kits);
                
                if (!novoKit.id) {
                    novoKit.id = Date.now().toString();
                    kits.push(novoKit);
                } else {
                    const index = kits.findIndex(k => k.id === novoKit.id);
                    if (index !== -1) {
                        kits[index] = novoKit;
                    } else {
                        kits.push(novoKit);
                    }
                }
                
                await putToBin(BINS.kits, kits);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: true, message: 'Embalagem salva com sucesso!', id: novoKit.id}));
            } catch (e) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Erro ao processar/salvar embalagem na nuvem'}));
            }
        });
    } else if (req.url === '/kits' && req.method === 'GET') {
        const kits = await getFromBin(BINS.kits);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(kits));
    } else if (req.url.startsWith('/kits') && req.method === 'DELETE') {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const idToDelete = urlParams.get('id');
        
        try {
            let kits = await getFromBin(BINS.kits);
            kits = kits.filter(k => k.id !== idToDelete);
            await putToBin(BINS.kits, kits);
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true, message: 'Embalagem deletada com sucesso!'}));
        } catch(e) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Erro ao deletar embalagem'}));
        }
    } else if (req.url === '/caixas' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        
        req.on('end', async () => {
            try {
                const novaCaixa = JSON.parse(body);
                let caixas = await getFromBin(BINS.caixas);
                
                if (!novaCaixa.id) {
                    novaCaixa.id = Date.now().toString();
                    caixas.push(novaCaixa);
                } else {
                    const index = caixas.findIndex(c => c.id === novaCaixa.id);
                    if (index !== -1) {
                        caixas[index] = novaCaixa;
                    } else {
                        caixas.push(novaCaixa);
                    }
                }
                
                await putToBin(BINS.caixas, caixas);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: true, message: 'Caixa salva com sucesso!', id: novaCaixa.id}));
            } catch (e) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Erro ao processar/salvar caixa na nuvem'}));
            }
        });
    } else if (req.url === '/caixas' && req.method === 'GET') {
        const caixas = await getFromBin(BINS.caixas);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(caixas));
    } else if (req.url.startsWith('/caixas') && req.method === 'DELETE') {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const idToDelete = urlParams.get('id');
        
        try {
            let caixas = await getFromBin(BINS.caixas);
            caixas = caixas.filter(c => c.id !== idToDelete);
            await putToBin(BINS.caixas, caixas);
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true, message: 'Caixa deletada com sucesso!'}));
        } catch(e) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Erro ao deletar caixa'}));
        }
    } else if (req.url === '/limpar-tudo' && req.method === 'DELETE') {
        try {
            await Promise.all([
                putToBin(BINS.receitas, []),
                putToBin(BINS.kits, []),
                putToBin(BINS.caixas, [])
            ]);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true, message: 'Todos os dados foram apagados na nuvem.'}));
        } catch(e) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Erro ao limpar dados.'}));
        }
    } else if (req.method === 'GET') {
        // Servidor de arquivos estáticos
        let filePath = req.url;
        if (filePath === '/') {
            filePath = '/view/receita.html';
        } else if (filePath.endsWith('.html') && !filePath.startsWith('/view/')) {
            filePath = '/view' + filePath;
        }
        
        // Remove query parameters e impede path traversal
        filePath = filePath.split('?')[0];
        filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
        
        const extname = String(path.extname(filePath)).toLowerCase();
        let contentType = 'text/html';
        switch (extname) {
            case '.js': contentType = 'text/javascript'; break;
            case '.css': contentType = 'text/css'; break;
            case '.json': contentType = 'application/json'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg': contentType = 'image/jpg'; break;
            case '.svg': contentType = 'image/svg+xml'; break;
            case '.ico': contentType = 'image/x-icon'; break;
        }

        const absolutePath = path.join(__dirname, filePath);
        
        fs.readFile(absolutePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('404 - Not Found');
                } else {
                    res.writeHead(500);
                    res.end('500 - Server Error');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}.`);
    console.log(`Pode acessar o frontend e salvar os dados via JSONBin!`);
});
