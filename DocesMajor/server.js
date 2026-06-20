/**
 * @fileoverview Servidor Node.js para gerenciamento de persistência de dados (Receitas, Kits e Caixas).
 * @author Gabriela
 * 
 * TODO: Extrair rotas e lógica de manipulação de arquivos (fs) para controllers e repositórios separados.
 * Atualmente o arquivo viola o Single Responsibility Principle (SRP) ao misturar rotas, lógica de negócio e infraestrutura.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data', 'dadosReceita.json');
const dataKitFile = path.join(__dirname, 'data', 'dadosKit.json');
const dataCaixasFile = path.join(__dirname, 'data', 'dadosCaixas.json');

/**
 * Garante a integridade da infraestrutura de dados local.
 * Cria o diretório e os arquivos JSON iniciais caso não existam no sistema de arquivos.
 */
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
[dataFile, dataKitFile, dataCaixasFile].forEach(file => {
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
});

/**
 * Instância principal do servidor HTTP.
 * Atua como um gateway simples para lidar com as requisições do front-end.
 */
const server = http.createServer((req, res) => {
    // Tratamento de CORS para permitir requisições do front-end rodando em file:// ou outras portas locais
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
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const novaReceita = JSON.parse(body);
                
                fs.readFile(dataFile, 'utf8', (err, data) => {
                    let receitas = [];
                    if (!err && data) {
                        try {
                            receitas = JSON.parse(data);
                        } catch (e) {
                            console.error('Erro ao ler JSON existente', e);
                        }
                    }
                    
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
                    
                    fs.writeFile(dataFile, JSON.stringify(receitas, null, 2), (err) => {
                        if (err) {
                            res.writeHead(500, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({error: 'Erro ao salvar receita'}));
                        } else {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({success: true, message: 'Receita salva com sucesso!', id: novaReceita.id}));
                        }
                    });
                });
            } catch (e) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'JSON inválido'}));
            }
        });
    } else if (req.url === '/receitas' && req.method === 'GET') {
        fs.readFile(dataFile, 'utf8', (err, data) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            if (!err && data) {
                res.end(data);
            } else {
                res.end('[]');
            }
        });
    } else if (req.url.startsWith('/receitas') && req.method === 'DELETE') {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const idToDelete = urlParams.get('id');
        
        fs.readFile(dataFile, 'utf8', (err, data) => {
            let receitas = [];
            if (!err && data) {
                try {
                    receitas = JSON.parse(data);
                } catch (e) {
                    console.error('Erro ao ler JSON existente', e);
                }
            }
            
            receitas = receitas.filter(r => r.id !== idToDelete);
            
            fs.writeFile(dataFile, JSON.stringify(receitas, null, 2), (err) => {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({error: 'Erro ao deletar receita'}));
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: true, message: 'Receita deletada com sucesso!'}));
                }
            });
        });
    } else if (req.url === '/kits' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const novoKit = JSON.parse(body);
                
                fs.readFile(dataKitFile, 'utf8', (err, data) => {
                    let kits = [];
                    if (!err && data) {
                        try {
                            kits = JSON.parse(data);
                        } catch (e) {
                            console.error('Erro ao ler JSON existente', e);
                        }
                    }
                    
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
                    
                    fs.writeFile(dataKitFile, JSON.stringify(kits, null, 2), (err) => {
                        if (err) {
                            res.writeHead(500, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({error: 'Erro ao salvar embalagem'}));
                        } else {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({success: true, message: 'Embalagem salva com sucesso!', id: novoKit.id}));
                        }
                    });
                });
            } catch (e) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'JSON inválido'}));
            }
        });
    } else if (req.url === '/kits' && req.method === 'GET') {
        fs.readFile(dataKitFile, 'utf8', (err, data) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            if (!err && data) {
                res.end(data);
            } else {
                res.end('[]');
            }
        });
    } else if (req.url.startsWith('/kits') && req.method === 'DELETE') {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const idToDelete = urlParams.get('id');
        
        fs.readFile(dataKitFile, 'utf8', (err, data) => {
            let kits = [];
            if (!err && data) {
                try {
                    kits = JSON.parse(data);
                } catch (e) {
                    console.error('Erro ao ler JSON existente', e);
                }
            }
            
            kits = kits.filter(k => k.id !== idToDelete);
            
            fs.writeFile(dataKitFile, JSON.stringify(kits, null, 2), (err) => {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({error: 'Erro ao deletar embalagem'}));
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: true, message: 'Embalagem deletada com sucesso!'}));
                }
            });
        });
    } else if (req.url === '/caixas' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const novaCaixa = JSON.parse(body);
                
                fs.readFile(dataCaixasFile, 'utf8', (err, data) => {
                    let caixas = [];
                    if (!err && data) {
                        try {
                            caixas = JSON.parse(data);
                        } catch (e) {
                            console.error('Erro ao ler JSON existente', e);
                        }
                    }
                    
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
                    
                    fs.writeFile(dataCaixasFile, JSON.stringify(caixas, null, 2), (err) => {
                        if (err) {
                            res.writeHead(500, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({error: 'Erro ao salvar caixa'}));
                        } else {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({success: true, message: 'Caixa salva com sucesso!', id: novaCaixa.id}));
                        }
                    });
                });
            } catch (e) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'JSON inválido'}));
            }
        });
    } else if (req.url === '/caixas' && req.method === 'GET') {
        fs.readFile(dataCaixasFile, 'utf8', (err, data) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            if (!err && data) {
                res.end(data);
            } else {
                res.end('[]');
            }
        });
    } else if (req.url.startsWith('/caixas') && req.method === 'DELETE') {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const idToDelete = urlParams.get('id');
        
        fs.readFile(dataCaixasFile, 'utf8', (err, data) => {
            let caixas = [];
            if (!err && data) {
                try {
                    caixas = JSON.parse(data);
                } catch (e) {
                    console.error('Erro ao ler JSON existente', e);
                }
            }
            
            caixas = caixas.filter(c => c.id !== idToDelete);
            
            fs.writeFile(dataCaixasFile, JSON.stringify(caixas, null, 2), (err) => {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({error: 'Erro ao deletar caixa'}));
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: true, message: 'Caixa deletada com sucesso!'}));
                }
            });
        });
    } else if (req.url === '/limpar-tudo' && req.method === 'DELETE') {
        const resetData = '[]';
        let successCount = 0;
        let errorCount = 0;
        const totalFiles = 3;
        
        const checkDone = () => {
            if (successCount + errorCount === totalFiles) {
                if (errorCount === 0) {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: true, message: 'Todos os dados foram apagados.'}));
                } else {
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({error: 'Erro ao apagar alguns arquivos.'}));
                }
            }
        };

        fs.writeFile(dataFile, resetData, err => { if(err) errorCount++; else successCount++; checkDone(); });
        fs.writeFile(dataKitFile, resetData, err => { if(err) errorCount++; else successCount++; checkDone(); });
        fs.writeFile(dataCaixasFile, resetData, err => { if(err) errorCount++; else successCount++; checkDone(); });

    } else {
        res.writeHead(404);
        res.end();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}.`);
    console.log(`Pode acessar o frontend e salvar as receitas!`);
});
