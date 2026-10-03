# 👢 PEGADA BOOTS
### E-commerce + CRM + Gestão Empresarial

Bem-vindo ao repositório oficial do projeto **Pegada Boots**, uma plataforma de e-commerce moderna, robusta e escalável, desenvolvida com foco em alta conversão visual, experiência do usuário, gestão completa de retaguarda (Back-end/ERP básico) e inteligência de relacionamento com o cliente (CRM).

---

## 🏗️ 17. Arquitetura do Sistema

A arquitetura foi projetada para garantir desacoplamento, escalabilidade e facilidade de evolução futura:

```text
PEGADA BOOTS
│
├── FRONT-END (React / CSS / UI Moderna)
│   ├── Loja & Home
│   ├── Catálogo & Filtros
│   ├── Página de Produto (Zoom/3D)
│   ├── Carrinho & Checkout
│   └── Área do Cliente
│
├── API / BACK-END (C# / Java / Node.js)
│   ├── Autenticação & Permissões
│   ├── Gestão de Produtos & Estoque
│   ├── Gestão de Pedidos & Faturamento
│   ├── Módulo CRM & Cupons
│   └── Administração & Dashboard
│
├── BANCO DE DADOS (MySQL)
│
└── SERVIÇOS EXTERNOS
    ├── WhatsApp (Comunicação Direta)
    ├── Gateways de Pagamento (PIX, Cartão, Boleto)
    ├── Emissão Fiscal / NF-e
    ├── Frete & Transportadoras
    └── Rastreamento de Entregas
```

---

## 🎨 1. Home Page
- **Visual:** Moderno, agressivo, comercial e limpo.
- **Estrutura:** Header com logotipo, barra de busca inteligente, menu de navegação, ícones de cliente/carrinho, botão flutuante do WhatsApp.
- **Destaques:** Grande slider promocional dinâmico, produtos em destaque, categorias, ofertas, lançamentos, banners promocionais, seção de benefícios e rodapé completo.
- **Gestão de Banners:** Os slides não são estáticos; o painel administrativo permite cadastrar, editar, excluir, programar períodos, alterar mídias, títulos, descrições, links e status de promoção.

---

## 📦 2. Catálogo de Produtos
Preparado para grandes volumes com paginação otimizada (ex: `1 2 3 4 5 ... 20 →`) e carregamento performático.
- **Filtros Avançados:** Categoria, modelo, cor, tamanho, faixa de preço, disponibilidade, promoções e novidades.

---

## 🔍 3. Página Individual do Produto
Foco total na apresentação visual e conversão:
- **Mídia:** Suporte a até 6 imagens por item (Alta resolução, vista frontal, lateral, traseira, detalhe e foto adicional).
- **Recursos Visuais:** Estrutura preparada para zoom/lupa, ampliação, galeria em tela cheia e futura integração de modelo 3D/360°.
- **Informações Técnicas:** Nome, SKU, marca, modelo, descrição, material, cor, tamanhos, estoque, preço normal/promocional, condições de pagamento, prazos de entrega e produtos relacionados.

---

## 🛒 4. Carrinho e Checkout
- Adição, alteração de quantidade, seleção de tamanhos e remoção de itens.
- Subtotal, aplicação de cupons de desconto, cálculo de frete e revisão de pedido.
- Estrutura pronta para integração com gateways de pagamento (PIX, cartão, boleto), sistemas fiscais e transportadoras.

---

## 👤 5. Área do Cliente
Painel completamente separado do ambiente administrativo:
- **Minha Conta:** Dados pessoais, endereços, dados fiscais e alteração de senha.
- **Meus Pedidos:** Acompanhamento de status (*Realizado → Pagamento → Separação → Enviado → Em trânsito → Entregue*).
- **Cupons:** Cupons disponíveis, utilizados e validades.
- **Relacionamento:** Ofertas personalizadas, novidades e promoções direcionadas.
- **Entrega:** Códigos de rastreamento e status em tempo real.

---

## 📝 6. Cadastro do Cliente
- Realizado pelo próprio usuário com campos obrigatórios validados para emissão de notas fiscais (Nome, CPF, Data de Nascimento, Telefone, E-mail, CEP e Endereço completo).
- Rigoroso tratamento de dados sensíveis para conformidade e segurança.

---

## 📊 7. Back-end Administrativo & Dashboard
Painel de controle central da empresa:
- **Indicadores Rápidos:** Vendas de hoje, do mês, total de pedidos, clientes cadastrados, produtos ativos, estoque crítico e ticket médio.
- **Gráficos Analíticos:** Vendas por dia/mês, produtos mais vendidos, faturamento, novos clientes e evolução geral das vendas.

---

## 🏷️ 8. Gestão de Produtos & 9. Gestão de Pedidos
- **Produtos:** Cadastro completo de SKU, características, preços, estoque mínimo, peso, dimensões, fotos múltiplas, status de destaque e ativação de promoções.
- **Pedidos:** Linha do tempo completa do ciclo de vida do pedido com histórico detalhado de alterações de status.

---

## 📈 10. CRM (Gestão de Relacionamento)
- Acompanhamento de clientes novos, recorrentes, última compra, frequência de compra, valor total gasto e histórico de produtos.
- **Segmentação Avançada:** Criação de campanhas direcionadas para VIPs, inativos ou interessados em modelos específicos.

---

## 💬 11. WhatsApp Integrado
- Botão flutuante global "Fale Conosco".
- Botões contextualizados nas páginas de produtos que geram mensagens automáticas pré-preenchidas (ex: *"Olá, tenho interesse no produto XXXXX, tamanho 42"*).

---

## 🏢 12. Cadastro da Empresa
- Armazenamento de dados corporativos fiscais e financeiros (Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual/Municipal, endereços, contatos e configurações fiscais/bancárias).

---

## 📄 13. Conteúdo Institucional (CMS)
Painel administrativo para gestão autônoma de páginas informativas sem necessidade de alterações no código-fonte:
- Sobre Nós, Institucional, Política de Vendas, Política de Privacidade, Política de Troca/Reembolso, Termos de Uso, Entregas e FAQ.

---

## 🔒 14. Segurança e Infraestrutura
- **Segurança de Credenciais:** Dados sensíveis, senhas de banco de dados, chaves de API e tokens **nunca** são expostos no repositório. Uso estrito de variáveis de ambiente (`.env` e `.env.example`).
- **Práticas de Blindagem:** Autenticação robusta, hash seguro de senhas, controle de sessões/tokens, proteção contra SQL Injection, validação rigorosa de entradas, logs administrativos e rotinas de backup.

---

## 👥 15. Estrutura de Permissões (RBAC)
Hierarquia de acessos granulares:
- **SUPER ADMIN:** Acesso absoluto.
- **Perfis Futuros:** Gerente, Vendas, Estoque, Financeiro, Marketing e Atendimento.

---

## 🗄️ 16. Estrutura do Banco de Dados (MySQL)
Esquema relacional otimizado para crescimento escalável:
`usuarios`, `clientes`, `enderecos`, `empresas`, `produtos`, `categorias`, `modelos`, `cores`, `tamanhos`, `produto_imagens`, `estoques`, `pedidos`, `pedido_itens`, `pagamentos`, `cupons`, `cupom_uso`, `entregas`, `rastreios`, `banners`, `paginas`, `configuracoes`, `logs`.

---

## 📱 18 & 19. Identidade Visual & Responsividade
- **Identidade:** Conceito *Força + Estilo + Confiança*, cores vibrantes com contraste forte, tipografia moderna e cards limpos centralizados em variáveis de tema.
- **Responsividade:** Layout fluido e adaptado para Desktop, Tablet e Celular, com menus mobile otimizados e experiência de checkout simplificada.

---

## 🚀 20. Fases de Desenvolvimento

- **FASE 1 — Fundação:** Identidade visual, Home, Catálogo, Produto, Carrinho, Cliente, Login, Banco de Dados, API e Administração Básica.
- **FASE 2 — Operação:** Pedidos, Estoque, Cupons, CRM, Dashboard, WhatsApp, Banners, CMS e Gestão Empresarial.
- **FASE 3 — Integrações:** Gateways de pagamento, Emissão Fiscal, Frete, Rastreamento, Automações e Visualizador 3D/360°.

---
*Desenvolvido para **Pegada Boots**.*