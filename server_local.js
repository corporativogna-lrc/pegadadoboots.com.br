const http = require('http');
const url = require('url');

// Base de dados local em memória no Node.js
let produtos = [
    { id: 1, nome: "Bota Trekking Alpha", categoria: "Trekking", descricao: "Couro Legítimo - Impermeável", preco: 389.90, estoque: 10, imagem: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80" },
    { id: 2, nome: "Coturno Urban X", categoria: "Coturno", descricao: "Sola Tratorada - Streetwear", preco: 299.90, estoque: 15, imagem: "https://images.unsplash.com/photo-1603808033192-082d6939d3e1?auto=format&fit=crop&w=600&q=80" },
    { id: 3, nome: "Bota Chelsea Classic", categoria: "Chelsea", descricao: "Camurça Premium - Casual", preco: 297.50, estoque: 8, imagem: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80" },
    { id: 4, nome: "Coturno Heavy Metal", categoria: "Coturno", descricao: "Fivelas Reforçadas - Atitude", preco: 420.00, estoque: 5, imagem: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80" },
    { id: 5, nome: "Trekking Explorer Pro", categoria: "Trekking", descricao: "Solado Antiderrapante", preco: 450.00, estoque: 12, imagem: "https://images.unsplash.com/photo-1512374382146-233842b6a83b?auto=format&fit=crop&w=600&q=80" },
    { id: 6, nome: "Chelsea Minimalist", categoria: "Chelsea", descricao: "Couro Confort - Dia a Dia", preco: 270.00, estoque: 20, imagem: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80" }
];

const SENHA_ADMIN = "admin123"; // Palavra-passe de acesso ao painel administrativo

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const caminho = parsedUrl.pathname;
    const metodo = req.method;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (metodo === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API: Listar Produtos
    if (caminho === '/api/produtos' && metodo === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(produtos));
        return;
    }

    // API: Adicionar Novo Produto (Admin)
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

    // API: Apagar Produto (Admin)
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

    // API: Checkout e Atualização de Stock
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

    // Rota Front-end: Loja Oficial (/)
    if (caminho === '/' || caminho === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html lang="pt-BR" class="scroll-smooth">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pegada do Boots - Loja Oficial</title>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;800;900&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <script src="https://cdn.tailwindcss.com"></script>
                <script>
                    tailwind.config = {
                        theme: {
                            extend: {
                                fontFamily: { sans: ['Montserrat', 'sans-serif'] },
                                colors: { brand: { black: '#0a0a0a', dark: '#1a1a1a', gray: '#333333', neon: '#FF4500', neonHover: '#e03e00' } }
                            }
                        }
                    }
                </script>
                <style>.product-card:hover .product-img { transform: scale(1.05); }</style>
            </head>
            <body class="bg-brand-black text-white font-sans antialiased">
                <div class="bg-brand-neon text-white text-xs font-bold text-center py-2 uppercase tracking-wider">
                    Frete grátis para todo o Brasil nas compras acima de R$ 299!
                </div>
                <header class="sticky top-0 z-50 bg-brand-dark/95 backdrop-blur-md border-b border-brand-gray shadow-lg">
                    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
                        <a href="/" class="text-2xl md:text-3xl font-black italic tracking-tighter text-white flex items-center gap-2">
                            <i class="fa-solid fa-shoe-prints text-brand-neon"></i> PEGADA DO BOOTS
                        </a>
                        <div class="hidden md:flex flex-1 max-w-xl mx-8 relative">
                            <input type="text" id="searchInput" placeholder="Buscar por modelos, cores ou categorias..." oninput="filtrarProdutos()"
                                   class="w-full bg-brand-black border border-brand-gray rounded-full py-2 px-6 text-sm text-white focus:outline-none focus:border-brand-neon">
                            <button class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"><i class="fa-solid fa-search"></i></button>
                        </div>
                        <div class="flex items-center gap-6">
                            <a href="/admin" class="text-xs uppercase bg-brand-gray hover:bg-brand-neon text-white px-3 py-2 rounded-lg font-bold transition flex items-center gap-1">
                                <i class="fa-solid fa-lock"><b>Admin</b></i>
                            </a>
                            <div class="text-gray-300 hover:text-brand-neon transition flex flex-col items-center cursor-pointer relative">
                                <i class="fa-solid fa-cart-shopping text-xl"></i>
                                <span id="cart-count" class="absolute -top-2 -right-2 bg-brand-neon text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
                                <span class="text-[10px] uppercase mt-1 font-semibold hidden md:block">Carrinho</span>
                            </div>
                        </div>
                    </div>
                </header>

                <section class="relative w-full h-[40vh] bg-brand-dark flex items-center justify-center border-b border-brand-gray overflow-hidden">
                    <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1920&q=80')] opacity-20 bg-cover bg-center"></div>
                    <div class="container mx-auto px-4 text-center relative z-10">
                        <span class="text-brand-neon font-bold tracking-widest uppercase text-sm mb-2 block">Lançamento Exclusivo</span>
                        <h1 class="text-4xl md:text-6xl font-black mb-4 uppercase text-white">Domine as Ruas</h1>
                        <p class="text-gray-300 mb-6 max-w-xl mx-auto">A nova coleção de botas chegou. Design arrojado e durabilidade extrema.</p>
                    </div>
                </section>

                <main class="container mx-auto px-4 py-12">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div class="lg:col-span-3">
                            <div class="flex justify-between items-center mb-6"><p class="text-gray-400 text-sm">Catálogo Oficial Disponível</p></div>
                            <div id="produtosGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"></div>
                        </div>
                        <div class="lg:col-span-1">
                            <div class="bg-brand-dark border border-brand-gray rounded-2xl p-6 sticky top-28 shadow-xl">
                                <h3 class="text-lg font-bold text-brand-neon mb-4 border-b border-brand-gray pb-2 flex items-center gap-2">
                                    <i class="fa-solid fa-cart-shopping"></i> Seu Carrinho
                                </h3>
                                <div id="lista-carrinho" class="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1"><p class="text-gray-500 text-sm">Carrinho vazio.</p></div>
                                <div class="border-t border-brand-gray pt-4 mb-6 flex justify-between items-center font-bold text-lg">
                                    <span>Total:</span><span class="text-brand-neon">R$ <span id="valor-total">0.00</span></span>
                                </div>
                                <button onclick="checkout()" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition shadow-lg cursor-pointer">
                                    Finalizar Compra
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <footer class="bg-black pt-12 pb-8 border-t border-brand-gray mt-16 text-center text-xs text-gray-500">
                    <p>&copy; 2026 Pegada do Boots. Todos os direitos reservados.</p>
                </footer>

                <script>
                    let produtosData = [];
                    let cart = [];

                    async function carregarProdutos() {
                        const res = await fetch('/api/produtos');
                        produtosData = await res.json();
                        renderProdutos(produtosData);
                    }

                    function renderProdutos(prods) {
                        const grid = document.getElementById('produtosGrid');
                        if (prods.length === 0) {
                            grid.innerHTML = '<p class="text-gray-400 col-span-full text-center py-12">Nenhum produto encontrado.</p>';
                            return;
                        }
                        grid.innerHTML = prods.map(p => \`
                            <div class="product-card bg-brand-dark border border-brand-gray rounded-2xl overflow-hidden flex flex-col justify-between hover:border-brand-neon transition duration-300 group">
                                <div>
                                    <div class="h-48 bg-brand-black overflow-hidden relative flex items-center justify-center">
                                        <img src="\${p.imagem}" alt="\${p.nome}" class="product-img w-full h-full object-cover transition-transform duration-500">
                                    </div>
                                    <div class="p-5">
                                        <h3 class="font-bold text-white text-lg mb-1 truncate">\${p.nome}</h3>
                                        <p class="text-xs text-gray-400 mb-1">\${p.descricao}</p>
                                        <p class="text-xs text-gray-500 mb-2">Stock: \${p.estoque} un.</p>
                                    </div>
                                </div>
                                <div class="p-5 pt-0">
                                    <div class="text-xl font-black text-brand-neon mb-4">R$ \${p.preco.toFixed(2)}</div>
                                    <button onclick="addCart(\${p.id})" class="w-full border-2 border-brand-neon text-brand-neon hover:bg-brand-neon hover:text-white font-bold py-2 rounded-xl uppercase text-xs tracking-wider transition cursor-pointer">
                                        Adicionar ao Carrinho
                                    </button>
                                </div>
                            </div>
                        \`).join('');
                    }

                    function filtrarProdutos() {
                        const termo = document.getElementById('searchInput').value.toLowerCase();
                        const filtrados = produtosData.filter(p => 
                            p.nome.toLowerCase().includes(termo) || p.categoria.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo)
                        );
                        renderProdutos(filtrados);
                    }

                    function addCart(id) {
                        const p = produtosData.find(item => item.id === id);
                        const item = cart.find(i => i.id === id);
                        if (item) {
                            if (item.qtd < p.estoque) item.qtd++;
                            else { alert('Limite de stock atingido!'); return; }
                        } else {
                            if (p.estoque <= 0) { alert('Produto esgotado!'); return; }
                            cart.push({ id: p.id, nome: p.nome, preco: p.preco, qtd: 1, estoqueMax: p.estoque });
                        }
                        renderCart();
                    }

                    function alterarQtd(id, delta) {
                        let item = cart.find(i => i.id === id);
                        if (item) {
                            item.qtd += delta;
                            if (item.qtd > item.estoqueMax && delta > 0) item.qtd = item.estoqueMax;
                            if (item.qtd <= 0) cart = cart.filter(i => i.id !== id);
                        }
                        renderCart();
                    }

                    function renderCart() {
                        const container = document.getElementById('lista-carrinho');
                        const totalEl = document.getElementById('valor-total');
                        const countEl = document.getElementById('cart-count');
                        const totalItens = cart.reduce((sum, i) => sum + i.qtd, 0);
                        countEl.innerText = totalItens;

                        if (cart.length === 0) {
                            container.innerHTML = '<p class="text-gray-500 text-sm">Carrinho vazio.</p>';
                            totalEl.innerText = '0.00';
                            return;
                        }

                        let html = '';
                        let total = 0;
                        cart.forEach(i => {
                            total += i.preco * i.qtd;
                            html += \`
                                <div class="flex justify-between items-center text-sm border-b border-brand-gray/50 pb-3">
                                    <div>
                                        <div class="font-semibold text-white">\${i.nome}</div>
                                        <div class="text-xs text-brand-neon">R$ \${(i.preco * i.qtd).toFixed(2)}</div>
                                        <div class="flex items-center gap-2 mt-1">
                                            <button onclick="alterarQtd(\${i.id}, -1)" class="w-5 h-5 bg-brand-gray rounded text-xs font-bold hover:bg-brand-neon transition cursor-pointer">-</button>
                                            <span class="text-xs font-bold">\${i.qtd}</span>
                                            <button onclick="alterarQtd(\${i.id}, 1)" class="w-5 h-5 bg-brand-gray rounded text-xs font-bold hover:bg-brand-neon transition cursor-pointer">+</button>
                                        </div>
                                    </div>
                                    <button onclick="alterarQtd(\${i.id}, -\${i.qtd})" class="text-gray-500 hover:text-brand-neon text-xs cursor-pointer"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            \`;
                        });
                        container.innerHTML = html;
                        totalEl.innerText = total.toFixed(2);
                    }

                    async function checkout() {
                        if (cart.length === 0) { alert('Adicione itens ao carrinho primeiro!'); return; }
                        const res = await fetch('/api/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ itens: cart })
                        });
                        const data = await res.json();
                        alert(data.mensagem);
                        if (data.sucesso) { cart = []; renderCart(); carregarProdutos(); }
                    }

                    carregarProdutos();
                </script>
            </body>
            </html>
        `);
        return;
    }

    // Rota Front-end: Painel Administrativo (/admin)
    if (caminho === '/admin') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Painel Administrativo - Pegada do Boots</title>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;800&display=swap" rel="stylesheet">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-zinc-950 text-white font-sans antialiased p-6">
                <div class="max-w-4xl mx-auto">
                    <div class="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                        <h1 class="text-2xl font-black text-orange-500">PAINEL ADMINISTRATIVO</h1>
                        <a href="/" class="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg font-bold">Ver Loja</a>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                            <h2 class="text-lg font-bold text-orange-500 mb-4">Adicionar Novo Produto</h2>
                            <form id="formProduto" onsubmit="cadastrarProduto(event)" class="space-y-4">
                                <div>
                                    <label class="text-xs text-zinc-400">Nome do Produto</label>
                                    <input type="text" id="nome" required class="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-sm">
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="text-xs text-zinc-400">Categoria</label>
                                        <input type="text" id="categoria" required class="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-sm">
                                    </div>
                                    <div>
                                        <label class="text-xs text-zinc-400">Preço (R$)</label>
                                        <input type="number" step="0.01" id="preco" required class="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-sm">
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="text-xs text-zinc-400">Stock Inicial</label>
                                        <input type="number" id="estoque" required class="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-sm">
                                    </div>
                                    <div>
                                        <label class="text-xs text-zinc-400">URL da Imagem</label>
                                        <input type="text" id="imagem" placeholder="https://..." class="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-sm">
                                    </div>
                                </div>
                                <div>
                                    <label class="text-xs text-zinc-400">Descrição</label>
                                    <input type="text" id="descricao" class="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-sm">
                                </div>
                                <div>
                                    <label class="text-xs text-zinc-400 font-bold text-orange-400">Palavra-passe de Admin</label>
                                    <input type="password" id="senha" required class="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-sm">
                                </div>
                                <button type="submit" class="w-full bg-orange-600 hover:bg-orange-500 font-bold py-2 rounded-lg text-sm uppercase transition cursor-pointer">Cadastrar Produto</button>
                            </form>
                        </div>

                        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col">
                            <h2 class="text-lg font-bold text-orange-500 mb-4">Stock Atual na Loja</h2>
                            <div id="listaAdmin" class="space-y-3 overflow-y-auto max-h-[400px] pr-2 flex-1"></div>
                        </div>
                    </div>
                </div>

                <script>
                    async function carregarAdmin() {
                        const res = await fetch('/api/produtos');
                        const prods = await res.json();
                        const container = document.getElementById('listaAdmin');
                        container.innerHTML = prods.map(p => \`
                            <div class="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-sm">
                                <div>
                                    <div class="font-bold">\${p.nome}</div>
                                    <div class="text-xs text-zinc-400">Stock: \${p.estoque} | R$ \${p.preco.toFixed(2)}</div>
                                </div>
                                <button onclick="removerProduto(\${p.id})" class="text-red-500 hover:text-red-400 text-xs font-bold px-2 py-1 bg-zinc-900 rounded">Apagar</button>
                            </div>
                        \`).join('');
                    }

                    async function cadastrarProduto(e) {
                        e.preventDefault();
                        const dados = {
                            nome: document.getElementById('nome').value,
                            categoria: document.getElementById('categoria').value,
                            preco: document.getElementById('preco').value,
                            estoque: document.getElementById('estoque').value,
                            descricao: document.getElementById('descricao').value,
                            imagem: document.getElementById('imagem').value,
                            senha: document.getElementById('senha').value
                        };

                        const res = await fetch('/api/produtos', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(dados)
                        });
                        const r = await res.json();
                        alert(r.mensagem);
                        if (r.sucesso) {
                            document.getElementById('formProduto').reset();
                            carregarAdmin();
                        }
                    }

                    async function removerProduto(id) {
                        const senha = prompt("Insira a palavra-passe de administrador para confirmar:");
                        if (!senha) return;

                        const res = await fetch('/api/produtos/' + id, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ senha })
                        });
                        const r = await res.json();
                        alert(r.mensagem);
                        if (r.sucesso) carregarAdmin();
                    }

                    carregarAdmin();
                </script>
            </body>
            </html>
        `);
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Rota não encontrada');
});

server.listen(3000, '127.0.0.1', () => {
    console.log('[Servidor Node.js] Completo e autónomo na porta 3000');
});
