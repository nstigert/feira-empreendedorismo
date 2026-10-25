# Mini-ERP de Feira 🧾

Sistema de gestão simples para pequenos negócios de comida que vendem em feiras e eventos: doces, cookies, salgados e bebidas. Reúne num só lugar o **custo de cada produto**, o **caixa com Pix**, o **controle de produção e estoque** e um **relatório de resultados**. Funciona no navegador do celular ou do computador, sem instalação e sem internet.

> ⚠️ **Dados ilustrativos.** Os números das empresas de demonstração (preços, receitas, vendas) são simulados e não representam dados reais.

## O que é o sistema

Um ERP (*Enterprise Resource Planning*) organiza as informações de um negócio para que as decisões saiam de dados, não de estimativa. Sistemas desse tipo costumam ser caros e complexos demais para quem vende numa banca. O **Mini-ERP de Feira** traz só o essencial dessa ideia para o empreendedor que produz e vende no mesmo dia:

1. **Antes de vender:** cadastra a receita (ficha técnica) de cada produto e descobre quanto ele realmente custa e por quanto deve ser vendido.
2. **Na preparação:** registra o que foi produzido e vê quais ingredientes e quanto dinheiro cada lote exige.
3. **Durante a venda:** usa o celular como caixa: toca nos produtos, recebe em dinheiro (com troco calculado) ou Pix (QR Code com o valor exato), e o estoque é atualizado sozinho.
4. **Depois da venda:** confere faturamento, custo, lucro real, produtos campeões, horários de pico e o que sobrou, com uma sugestão do que produzir na próxima vez.

Cada negócio tem login próprio e seus dados ficam separados, então o mesmo sistema atende várias empresas.

## Problemas que resolve

| Problema comum do pequeno empreendedor | Como o sistema ajuda |
|---|---|
| **Não saber quanto cada produto custa.** O preço é definido "de olho" ou copiando o concorrente, e o lucro real é desconhecido. | A **ficha técnica** transforma o preço de cada embalagem de ingrediente em custo por grama, ml ou unidade e calcula o custo exato por produto, incluindo embalagem e gás/energia. |
| **Preço sem margem definida.** Vender barato demais dá prejuízo; caro demais espanta o cliente. | O sistema **sugere o preço pela margem desejada** e mostra o lucro por unidade no preço escolhido. Dá para testar um preço acessível sem perder o controle do lucro. |
| **Falta de padronização.** Cada fornada sai com tamanho, sabor e custo diferentes. | A receita fica registrada com quantidades e rendimento fixos: todos produzem do mesmo jeito, e o custo deixa de variar. |
| **Produção desalinhada com a demanda.** Faltam produtos no horário de maior movimento ou sobram no fim, gerando desperdício. | O relatório mostra **vendas por horário**, o que **esgotou** e o que **sobrou**, com a sugestão **produzir mais / manter / reduzir** por produto. Os alertas de estoque avisam quando um item está acabando. |
| **Fila e erro no troco na hora do pico.** | Caixa por toque, **total automático**, cálculo de troco e **QR Code Pix com o valor já preenchido**: o cliente só escaneia e paga. |
| **Não saber se o dia deu lucro.** Mistura de dinheiro e Pix, sem registro do que foi vendido. | Cada venda fica registrada com forma de pagamento e custo, e o relatório mostra **faturamento, custo, lucro real, margem e ticket médio** do dia ou do período. |
| **Ferramentas caras ou complicadas.** | É gratuito, abre direto no navegador, funciona offline e pode ser publicado na internet sem custo. |

## Para quem serve

- **Encaixe ideal:** negócios que **produzem e vendem alimentos**, como cookies, brigadeiros, bolos, pastéis e salgados. Aproveitam todos os módulos.
- **Também atende:** bebidas e itens **feitos na hora**, como café e caldo de cana (custo pela ficha técnica, sem controle de estoque), e produtos de **revenda**, como água, refrigerante e salgados comprados prontos.
- **Atende parcialmente:** lojas de mercadorias com muitos modelos e tamanhos, ou que vendem principalmente online e no cartão parcelado. O controle de custo, estoque e caixa funciona, mas faltam recursos como catálogo, variações e pagamento com cartão (veja **Próximas versões**).

## O que o app faz

| Módulo | Para quê |
|---|---|
| **Login e empresas** | Cada empresa entra com usuário e senha e vê só os próprios dados. Dá para cadastrar novas empresas na tela de entrada. |
| **Produtos e ficha técnica** | Cadastra ingredientes (preço da embalagem → custo por g/ml/un) e produtos com receita e rendimento. Calcula o custo por unidade e sugere o preço pela margem desejada. Para revenda, basta informar o custo de compra. Itens preparados no pedido (café, caldo de cana) podem ser marcados como **feitos na hora**, sem controle de estoque. |
| **Caixa (PDV)** | Toque nos produtos para montar o pedido. Pagamento em **dinheiro** (com troco) ou **Pix**: o QR Code com o valor exato é gerado no próprio navegador, no padrão BR Code do Banco Central (EMV + CRC16). Cada venda dá baixa no estoque e pode ser cancelada. |
| **Relatório** | Faturamento, custo, lucro real, margem, ticket médio, Pix x dinheiro, produtos mais vendidos, **vendas por horário** (mostra o horário de pico) e sobras com sugestão para a próxima feira (produzir mais / manter / reduzir). |
| **Produção e estoque** | Registra lotes produzidos (mostra custo do lote e ingredientes necessários), exibe o estoque atual e alerta quando um produto está acabando. |

## Empresas de demonstração

Na tela de entrada, toque numa empresa de demonstração para preencher o login e clique em **Entrar**. A senha de todas é `1234`.

| Empresa | Usuário | O que a demonstração mostra |
|---|---|---|
| 🍪 MOKI Cookies | `moki` | ficha técnica por fornada (20 cookies), 5 sabores + água de revenda |
| 🍫 Loja de Brigadeiro | `brigadeiro` | receita por panela (25 un), caixinha com 4 sortidos, vendas que crescem no fim da feira |
| 🥟 Pastel S&A | `pastel` | pastéis montados à tarde e fritos na hora, óleo rateado no custo, caldo de cana feito na hora |
| ☕ Grupo de Cafés | `cafe` | bebidas feitas na hora (sem estoque), salgados de revenda, movimento forte na chegada |

## Como usar

1. Abra o arquivo `index.html` no navegador (duplo clique). Não precisa instalar nada nem ter internet.
2. Na tela de entrada, escolha uma empresa de demonstração e clique em **Entrar**.
3. Percorra o ciclo completo:
   - **Produtos**: veja a ficha técnica de cada item, o custo por unidade e o preço sugerido;
   - **Produção**: veja o lote da tarde da feira e registre um novo lote;
   - **Caixa**: toque em alguns produtos → **Cobrar** → **Pix** → mostre o QR Code → confirme;
   - **Relatório**: veja o lucro, o pico de vendas e as sobras.
4. Clique em **Sair** (no topo) e entre em outra empresa: os dados são separados.
5. Para uma empresa nova: **Cadastrar empresa** na tela de entrada. Ela começa vazia; cadastre ingredientes e produtos ou carregue uma demonstração em **Ajustes**.

Em **Ajustes**, os botões **Carregar dados de demonstração** e **Limpar dados desta empresa** afetam **só a empresa logada**. A chave Pix de cada demonstração é fictícia: troque pela real antes de cobrar clientes.

Tudo fica salvo só no navegador do aparelho (`localStorage`). Use **Exportar backup** para levar os dados de uma empresa a outro aparelho. O app funciona **100% offline**: a biblioteca do QR Code está em `js/lib/`, então dá para usar direto de um pendrive.

> 🔒 **Sobre o login:** é um login didático, para separar as empresas na demonstração. As senhas são guardadas com hash, mas não há servidor: quem tiver acesso ao navegador consegue ver os dados. Um login seguro de verdade está nas próximas versões.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `mini-erp-feira`).
2. Envie o conteúdo desta pasta (`index.html`, `css/`, `js/`, `README.md`) para a raiz do repositório, pelo botão **Add file → Upload files** ou com:
   ```bash
   git init && git add . && git commit -m "Mini-ERP de Feira" && git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/mini-erp-feira.git && git push -u origin main
   ```
3. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, escolha `main` e a pasta `/ (root)` e clique em **Save**.
4. Em cerca de 1 minuto o app estará em `https://SEU-USUARIO.github.io/mini-erp-feira/`. Abra no celular e use **Adicionar à tela inicial**.

## Tecnologias

HTML, CSS e JavaScript puros, sem framework e sem etapa de build. Persistência em `localStorage` (uma área de dados por empresa). QR Code com [qrcodejs](https://github.com/davidshimjs/qrcodejs) 1.0.0 (licença MIT), copiado para `js/lib/` para funcionar sem internet.

```
mini-erp/
├── index.html
├── css/style.css
└── js/
    ├── lib/qrcode.min.js  # gerador de QR Code (qrcodejs, MIT)
    ├── pix.js    # payload BR Code (EMV) + CRC16
    ├── demo.js   # dados simulados das 4 empresas
    └── app.js    # login, caixa, produtos, produção, relatório, ajustes
```

## Próximas versões

### Funcionalidades

- Pagamento com cartão (débito/crédito/parcelado) e descontos no caixa
- Encomendas e pré-venda com data de entrega
- Busca, categorias e variações de produto (tamanho, sabor, adicionais)
- Controle de estoque de ingredientes e lista de compras
- Exportação do relatório em PDF/planilha
- Emissão de nota fiscal (NFC-e)
- Confirmação automática do Pix via API do banco (Pix dinâmico com webhook)

### Arquitetura e tecnologia

A versão atual não usa framework de propósito: é um protótipo leve, que funciona offline e pode ser hospedado de graça como site estático. Quando o sistema precisar de contas reais, vários usuários e sincronização, a evolução natural é uma arquitetura cliente-servidor. As regras de negócio atuais (ficha técnica, cálculo de preço, geração do Pix, relatório) servem de base para essa versão.

| Necessidade futura | Evolução proposta | Tecnologias possíveis |
|---|---|---|
| Mais telas e regras, código mais fácil de manter e testar | Frontend organizado em componentes, com tipagem | React ou Vue com TypeScript |
| Login seguro, com senhas protegidas no servidor | Backend com autenticação | ASP.NET Core (.NET) ou Node.js |
| Dados que não se perdem e sincronizam entre aparelhos | Banco de dados no servidor | PostgreSQL, ou serviços como Firebase e Supabase |
| Vários vendedores da mesma empresa ao mesmo tempo (multiusuário) | API com controle de acesso por perfil (dono, vendedor) | ASP.NET Core ou Node.js + banco de dados |
| Pix confirmado automaticamente e nota fiscal | Integração com APIs de bancos e da Sefaz, feita pelo servidor | Backend .NET ou Node.js |
| Uso como aplicativo no celular, inclusive offline | App instalável | PWA, Flutter ou React Native |
