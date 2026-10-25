# Feira de Empreendedorismo: soluções de Sistemas de Informação

Soluções digitais desenvolvidas para a **Feira de Empreendedorismo** de **03/11, das 20h às 22h30, no pátio da faculdade**. Atividade de Sistemas de Informação e Engenharia de Software, em integração com os grupos de Gestão.

🌐 **Site publicado:** https://nstigert.github.io/feira-empreendedorismo/

> ⚠️ **Dados ilustrativos.** O desenvolvimento foi feito sem acesso às empresas, então preços, receitas, vendas e informações das bancas são simulados. As duas soluções foram pensadas para que os dados reais sejam inseridos sem mexer no código.

## As soluções

### 🍪 Demanda 1A: Mini-ERP de Feira (solução para as empresas)

Sistema de gestão simples para microempreendedores que produzem e vendem no mesmo evento:

- **ficha técnica** com custo real por produto e preço sugerido pela margem;
- **produção e estoque**, com alerta de produto acabando;
- **caixa no celular**, com cálculo de troco e **QR Code Pix com o valor exato**;
- **relatório** de faturamento, lucro, mais vendidos, horário de pico e sobras.

**Problema que resolve:** falta de controle de custos, precificação "de olho" e produção desalinhada com a demanda. Esse é o caso da **MOKI Cookies**, usada na demonstração.

- **Acessar:** [mini-erp/](https://nstigert.github.io/feira-empreendedorismo/mini-erp/). Na tela de entrada, escolha uma empresa de demonstração; a senha é `1234`.
- **Documentação completa:** [mini-erp/README.md](mini-erp/README.md)

### 🗺️ Demanda 1B: Passaporte da Feira (solução para a própria feira)

Passaporte digital com **carimbos por QR Code** em cada banca. Conforme visita as bancas, o visitante desbloqueia selos em estágios:

| Carimbos | Selo |
|---|---|
| 1 | 🎟️ Primeira Parada |
| 3 | 🧭 Visitante Curioso |
| 5 | 🎖️ Explorador da Feira (libera a votação da melhor banca) |
| Todas | 🏆 Lenda da Feira |

**Problema que resolve:**
- **divulgação** de todas as bancas, não só das mais visíveis;
- **organização** do fluxo no intervalo, com o público circulando pelo pátio inteiro;
- **comunicação** com o visitante;
- **feedback**, pela votação da melhor banca.

- **Acessar:** [passaporte/](https://nstigert.github.io/feira-empreendedorismo/passaporte/)
- **Modo demonstração:** [passaporte/?demo=1](https://nstigert.github.io/feira-empreendedorismo/passaporte/?demo=1), em que dá para carimbar sem celular.
- **Cartazes com QR Codes para imprimir:** [passaporte/qrcodes.html](https://nstigert.github.io/feira-empreendedorismo/passaporte/qrcodes.html)
- **Documentação completa:** [passaporte/README.md](passaporte/README.md)

## Tecnologias

- **Linguagens:** HTML, CSS e JavaScript puro, sem framework e sem etapa de build.
- **Dados:** ficam no próprio navegador (`localStorage`), sem servidor nem banco de dados.
- **Hospedagem:** gratuita no GitHub Pages.
- **Instalação:** nenhuma. Funciona no celular e no computador.

## Estrutura

```
index.html      página inicial com os links das duas soluções
mini-erp/       Demanda 1A: Mini-ERP de Feira
passaporte/     Demanda 1B: Passaporte da Feira
```

## Como rodar localmente

Baixe o repositório e abra o `index.html` no navegador. O mini-ERP e o passaporte funcionam sem internet. Só a página de cartazes do passaporte precisa de conexão, para carregar a biblioteca de QR Code.

## Autoria e contato

**Nathalia Stigert**, Sistemas de Informação. GitHub: [@nstigert](https://github.com/nstigert)

Contato para suporte, esclarecimentos ou continuidade da assessoria aos grupos de Gestão interessados nas soluções.
