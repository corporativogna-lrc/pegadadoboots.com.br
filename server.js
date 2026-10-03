const http = require('http');
const url = require('url');

// ==========================================
// BANCO DE DADOS EM MEMÓRIA (Estrutura Base)
// ==========================================

let produtos = [
    { id: 1, sku: "BOOT-TRK-01", nome: "Bota Trekking Alpha", categoria: "Trekking", descricao: "Couro Legítimo - Impermeável", preco: 389.90, estoque: 10, tamanhos: [38, 39, 40, 41, 42], imagem: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80" },
    { id: 2, sku: "BOOT-URB-02", nome: "Coturno Urban X", categoria: "Coturno", descricao: "Sola Tratorada - Streetwear", preco: 299.90, estoque: 15, tamanhos: [37, 38, 39, 40, 41, 42, 43], imagem: "https://images.unsplash.com/photo-1603808033192-082d6939d3e1?auto=format&fit=crop&w=600&q=80" },
    { id: 3, sku: "BOOT-CHS-03", nome: "Bota Chelsea Classic", categoria: "Chelsea", descricao: "Camurça Premium - Casual", preco: 297.50, estoque: 8, tamanhos: [39, 40, 41, 42], imagem: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80" }
];

let pedidos = [];
let clientes = [
    { id: 1, nome: "Rodrigo Costa", email: "rodrigo@chronnusrelojoaria.com.br", cpf: "000.000.000-00", telefone: "11999999999", totalGasto: 689.80, nivelCRM: "VIP" }
];

let cupons = [
    { codigo: "PEGADA10", descontoPorcentagem: 10, ativo: true },
    { codigo: "FRETEGRATIS", descontoFixo: 20, ativo: true }
];

let banners = [
    { id: 1, titulo: "Domine as Ruas", subtitulo: "Nova Coleção de Botas em Couro", imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1920&q=80", link: "/#catalogo" }
];

let cmsPaginas = {
    "sobre-nos": "A Pegada Boots é referência em calçados de couro de alta durabilidade e estilo urbano.",
    "politica-troca": "Troca grátis em até 30 dias após o recebimento do produto."
};

const SENHA_ADMIN = "admin123";

// Helper para ler o corpo da requisição JSON
const readJSONBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); }
            catch (e) { reject(e); }
        });
    });
};

// ==========================================
// SERVIDOR HTTP & ROTAS DA API
// ==========================================

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const caminho = parsedUrl.pathname;
    const metodo = req.method;

    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (metodo === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const sendJSON = (statusCode, data) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
    };

    try {
        // ----------------------------------------------------
        // TÓPICO 1: GESTÃO DE PRODUTOS E ESTOQUE
        // ----------------------------------------------------
        if (caminho === '/api/produtos' && metodo === 'GET') {
            return sendJSON(200, produtos);
        }

        if (caminho === '/api/produtos' && metodo === 'POST') {
            const body = await readJSONBody(req);
            if (body.senha !== SENHA_ADMIN) return sendJSON(401, { sucesso: false, mensagem: 'Não autorizado.' });

            const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
            const novoProduto = {
                id: novoId,
                sku: body.sku || `BOOT-${novoId}`,
                nome: body.nome,
                categoria: body.categoria,
                descricao: body.descricao,
                preco: parseFloat(body.preco),
                estoque: parseInt(body.estoque),
                tamanhos: body.tamanhos || [38, 39, 40, 41, 42],
                imagem: body.imagem || "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80"
            };
            produtos.push(novoProduto);
            return sendJSON(201, { sucesso: true, mensagem: 'Produto cadastrado com sucesso!', produto: novoProduto });
        }

        if (caminho.startsWith('/api/produtos/') && metodo === 'DELETE') {
            const id = parseInt(caminho.split('/')[3]);
            const body = await readJSONBody(req);
            if (body.senha !== SENHA_ADMIN) return sendJSON(401, { sucesso: false, mensagem: 'Não autorizado.' });

            produtos = produtos.filter(p => p.id !== id);
            return sendJSON(200, { sucesso: true, mensagem: 'Produto removido.' });
        }

        // ----------------------------------------------------
        // TÓPICO 2: PEDIDOS & CHECKOUT
        // ----------------------------------------------------
        if (caminho === '/api/checkout' && metodo === 'POST') {
            const body = await readJSONBody(req);
            const { cliente, itens, cupomCodigo } = body;

            if (!itens || itens.length === 0) {
                return sendJSON(400, { sucesso: false, mensagem: 'Carrinho vazio.' });
            }

            let subtotal = 0;
            let erroEstoque = null;

            itens.forEach(item => {
                const prod = produtos.find(p => p.id === item.id);
                if (!prod || prod.estoque < item.qtd) {
                    erroEstoque = `Estoque insuficiente para o item: ${item.nome}`;
                } else {
                    subtotal += prod.preco * item.qtd;
                }
            });

            if (erroEstoque) return sendJSON(400, { sucesso: false, mensagem: erroEstoque });

            // Aplicação de cupom
            let desconto = 0;
            if (cupomCodigo) {
                const cupom = cupons.find(c => c.codigo.toUpperCase() === cupomCodigo.toUpperCase() && c.ativo);
                if (cupom) {
                    desconto = cupom.descontoPorcentagem ? (subtotal * cupom.descontoPorcentagem) / 100 : (cupom.descontoFixo || 0);
                }
            }

            const total = Math.max(0, subtotal - desconto);

            // Atualiza estoque
            itens.forEach(item => {
                const prod = produtos.find(p => p.id === item.id);
                if (prod) prod.estoque -= item.qtd;
            });

            const novoPedido = {
                id: pedidos.length + 1001,
                data: new Date().toISOString(),
                cliente: cliente || { nome: "Cliente Visitante" },
                itens,
                subtotal,
                desconto,
                total,
                status: "Realizado"
            };

            pedidos.push(novoPedido);
            return sendJSON(201, { sucesso: true, mensagem: 'Pedido realizado com sucesso!', pedido: novoPedido });
        }

        if (caminho === '/api/pedidos' && metodo === 'GET') {
            return sendJSON(200, pedidos);
        }

        // ----------------------------------------------------
        // TÓPICO 3: CLIENTES & CRM
        // ----------------------------------------------------
        if (caminho === '/api/clientes' && metodo === 'GET') {
            return sendJSON(200, clientes);
        }

        if (caminho === '/api/clientes/registro' && metodo === 'POST') {
            const body = await readJSONBody(req);
            const novoCliente = {
                id: clientes.length + 1,
                nome: body.nome,
                email: body.email,
                cpf: body.cpf,
                telefone: body.telefone,
                totalGasto: 0,
                nivelCRM: "Novo"
            };
            clientes.push(novoCliente);
            return sendJSON(201, { sucesso: true, mensagem: 'Cliente cadastrado!', cliente: novoCliente });
        }

        // ----------------------------------------------------
        // TÓPICO 4: BANNERS & CUPONS DE PROMOÇÃO
        // ----------------------------------------------------
        if (caminho === '/api/banners' && metodo === 'GET') {
            return sendJSON(200, banners);
        }

        if (caminho === '/api/cupons/validar' && metodo === 'POST') {
            const body = await readJSONBody(req);
            const cupom = cupons.find(c => c.codigo.toUpperCase() === (body.codigo || '').toUpperCase() && c.ativo);
            if (!cupom) return sendJSON(404, { sucesso: false, mensagem: 'Cupom inválido ou expirado.' });
            return sendJSON(200, { sucesso: true, cupom });
        }

        // ----------------------------------------------------
        // TÓPICO 5: CMS & INTEGRAÇÃO WHATSAPP
        // ----------------------------------------------------
        if (caminho.startsWith('/api/cms/') && metodo === 'GET') {
            const slug = caminho.split('/')[3];
            const conteudo = cmsPaginas[slug];
            if (!conteudo) return sendJSON(404, { sucesso: false, mensagem: 'Página não encontrada.' });
            return sendJSON(200, { slug, conteudo });
        }

        if (caminho === '/api/whatsapp/link' && metodo === 'GET') {
            const produtoNome = parsedUrl.query.produto || "Produtos";
            const tamanho = parsedUrl.query.tamanho || "";
            const texto = encodeURIComponent(`Olá! Tenho interesse no produto ${produtoNome} ${tamanho ? 'tamanho ' + tamanho : ''}. Poderiam me atender?`);
            const urlWhatsApp = `https://wa.me/5511999999999?text=${texto}`;
            return sendJSON(200, { url: urlWhatsApp });
        }

        // Rota padrão (API Root)
        return sendJSON(200, { sistema: "Pegada Boots API", status: "Online", versao: "2.0.0" });

    } catch (e) {
        return sendJSON(500, { sucesso: false, mensagem: 'Erro interno no servidor API.' });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[API Pegada Boots] Servidor rodando na porta ${PORT}`);
});
