const http = require('http');
const url = require('url');

let produtos = [
    { id: 1, nome: "Bota Trekking Alpha", categoria: "Trekking", descricao: "Couro Legítimo - Impermeável", preco: 389.90, estoque: 10, imagem: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80" },
    { id: 2, nome: "Coturno Urban X", categoria: "Coturno", descricao: "Sola Tratorada - Streetwear", preco: 299.90, estoque: 15, imagem: "https://images.unsplash.com/photo-1603808033192-082d6939d3e1?auto=format&fit=crop&w=600&q=80" },
    { id: 3, nome: "Bota Chelsea Classic", categoria: "Chelsea", descricao: "Camurça Premium - Casual", preco: 297.50, estoque: 8, imagem: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80" },
    { id: 4, nome: "Coturno Heavy Metal", categoria: "Coturno", descricao: "Fivelas Reforçadas - Atitude", preco: 420.00, estoque: 5, imagem: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80" },
    { id: 5, nome: "Trekking Explorer Pro", categoria: "Trekking", descricao: "Solado Antiderrapante", preco: 450.00, estoque: 12, imagem: "https://images.unsplash.com/photo-1512374382146-233842b6a83b?auto=format&fit=crop&w=600&q=80" },
    { id: 6, nome: "Chelsea Minimalist", categoria: "Chelsea", descricao: "Couro Confort - Dia a Dia", preco: 270.00, estoque: 20, imagem: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80" }
];

const SENHA_ADMIN = "admin123";

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const caminho = parsedUrl.pathname;
    const metodo = req.method;

    // CORS permissivo para interagir com o GitHub Pages
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (metodo === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (caminho === '/api/produtos' && metodo === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(produtos));
        return;
    }

    if (caminho === '/api/produtos' && metodo === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const dados = JSON.parse(body);
                if (dados.senha !== SENHA_ADMIN) {
                    res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ sucesso: false, mensagem: 'Palavra-passe de administrador incorreta!' }));
                    return;
                }

                const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
                const novoProduto = {
                    id: novoId,
                    nome: dados.nome,
                    categoria: dados.categoria,
                    descricao: dados.descricao,
                    preco: parseFloat(dados.preco),
                    estoque: parseInt(dados.estoque),
                    imagem: dados.imagem || "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80"
                };

                produtos.push(novoProduto);
                res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ sucesso: true, mensagem: 'Produto cadastrado com sucesso!' }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ sucesso: false, mensagem: 'Erro ao cadastrar produto.' }));
            }
        });
        return;
    }

    if (caminho.startsWith('/api/produtos/') && metodo === 'DELETE') {
        const idParaApagar = parseInt(caminho.split('/')[3]);
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const dados = JSON.parse(body || '{}');
                if (dados.senha !== SENHA_ADMIN) {
                    res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ sucesso: false, mensagem: 'Palavra-passe incorreta!' }));
                    return;
                }

                const tamanhoAntes = produtos.length;
                produtos = produtos.filter(p => p.id !== idParaApagar);

                if (produtos.length < tamanhoAntes) {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ sucesso: true, mensagem: 'Produto removido com sucesso!' }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ sucesso: false, mensagem: 'Produto não encontrado.' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ sucesso: false, mensagem: 'Erro ao apagar produto.' }));
            }
        });
        return;
    }

    if (caminho === '/api/checkout' && metodo === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const dados = JSON.parse(body);
                const itens = dados.itens || [];
                let erroEstoque = null;

                itens.forEach(itemCarrinho => {
                    const prod = produtos.find(p => p.id === itemCarrinho.id);
                    if (prod) {
                        if (prod.estoque >= itemCarrinho.qtd) {
                            prod.estoque -= itemCarrinho.qtd;
                        } else {
                            erroEstoque = `Stock insuficiente para o produto: ${prod.nome}`;
                        }
                    }
                });

                if (erroEstoque) {
                    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ sucesso: false, mensagem: erroEstoque }));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ sucesso: true, mensagem: 'Compra efetuada com sucesso! Stock atualizado.' }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ sucesso: false, mensagem: 'Erro ao processar checkout.' }));
            }
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('API Pegada do Boots Ativa');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[Servidor API] A escutar na porta ${PORT}`);
});
