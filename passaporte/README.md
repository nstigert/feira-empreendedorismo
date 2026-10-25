# Passaporte da Feira

Solução para a **Demanda 1B** (solução para a própria Feira de Empreendedorismo, 03/11, 20h às 22h30).

O visitante abre o passaporte no celular pelo QR Code da entrada e ganha um carimbo digital em cada banca que visita, escaneando o QR Code da mesa. Conforme junta carimbos, desbloqueia selos em estágios, o que incentiva a visita a **todas** as bancas:

| Carimbos | Selo |
|---|---|
| 1 | 🎟️ Primeira Parada |
| 3 | 🧭 Visitante Curioso |
| 5 | 🎖️ Explorador da Feira (libera a votação da melhor banca) |
| Todas (7) | 🏆 Lenda da Feira (selo especial) |

> Os dados das bancas (descrições, destaques, mesas e códigos) são **ilustrativos**: o protótipo foi feito sem acesso às empresas.

## Resumo para a entrega

| Item | Resposta |
|---|---|
| **O que é** | Passaporte digital com carimbos por QR Code, gamificando a visita às bancas |
| **Para quem** | Visitantes da feira (alunos e familiares), grupos expositores e organização |
| **Problemas que ajuda a resolver** | **Divulgação:** todas as bancas aparecem no passaporte, não só as mais visíveis. **Organização:** o público é incentivado a circular pelo pátio inteiro, distribuindo o movimento do intervalo. **Comunicação:** informa data, horário, mesa e destaques de cada banca. **Atendimento/suporte:** carimbo também por código digitado, caso a câmera falhe. **Feedback:** a votação da melhor banca é liberada ao fim do passaporte. |
| **Como funciona** | QR da entrada → abre o passaporte. QR de cada mesa → `index.html?c=CODIGO` → carimbo salvo no próprio celular (`localStorage`). |
| **Como implementar** | 1) A organização preenche `dados.js` com as bancas reais e o link do formulário de votação. 2) Publica a pasta no GitHub Pages (gratuito). 3) Abre `qrcodes.html`, imprime os cartazes e coloca um em cada mesa e um na entrada. |
| **Tecnologia** | HTML, CSS e JavaScript puro. Sem servidor, banco de dados, login ou instalação de app. |
| **O que já foi desenvolvido** | Protótipo funcional: passaporte, carimbos via QR e via código, 4 selos em estágios, página de cartazes com QR Codes para impressão e modo de demonstração. |

## Arquivos

- `index.html`, `app.js`, `estilo.css`: o passaporte.
- `dados.js`: dados da feira, das bancas e dos selos. **É o único arquivo que precisa ser editado.** Para o evento real, use `mostrarLinksApresentacao: false` para esconder do público os links de demonstração e de cartazes do rodapé.
- `qrcodes.html`: gera os cartazes com QR Code (entrada + uma por banca) para imprimir.

## Como testar

- Basta abrir `index.html` no navegador.
- **Modo apresentação:** `index.html?demo=1`. Ao tocar numa banca aparece o botão "Simular carimbo", útil para apresentar no notebook.
- **Simular a leitura de um QR:** `index.html?c=MK7P` (carimbo da MOKI Cookies).
- **Zerar:** botão "Reiniciar passaporte" no rodapé.

## Como publicar (GitHub Pages)

1. Crie um repositório no GitHub e envie o conteúdo da pasta `passaporte/`.
2. No repositório, vá em **Settings → Pages**, escolha a branch `main` e a pasta `/ (root)`, e salve.
3. O site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
4. Abra `qrcodes.html` **no site publicado** (assim os QR Codes já apontam para o endereço certo) e imprima.

Alternativa: arrastar a pasta em https://app.netlify.com/drop.

## Próximas versões

- **"Feira Wrapped":** resumo da visita em imagem para compartilhar nos stories.
- **Roleta de cupons** ao completar o passaporte, com promoções oferecidas pelas bancas.
- **Painel da organização** com o total de visitas por banca (exigiria um backend simples, como Google Sheets ou Firebase).
- **Sorteio** entre quem completar o passaporte.
