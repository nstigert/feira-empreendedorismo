// Dados da feira e das bancas.
// ATENÇÃO: descrições, produtos, mesas e códigos são ILUSTRATIVOS (simulados).
// Para usar de verdade, a organização só precisa editar este arquivo.
window.FEIRA = {
  nome: "Feira de Empreendedorismo",
  data: "03/11",
  horario: "20h às 22h30",
  local: "Pátio da faculdade",

  // Selos desbloqueados conforme o número de carimbos.
  // carimbos: "todas" = visitar todas as bancas. liberaVotacao: mostra o link da votação.
  selos: [
    { carimbos: 1, emoji: "🎟️", nome: "Primeira Parada", descricao: "Você começou sua jornada pela feira." },
    { carimbos: 3, emoji: "🧭", nome: "Visitante Curioso", descricao: "Já conhece boa parte das bancas." },
    { carimbos: 5, emoji: "🎖️", nome: "Explorador da Feira", descricao: "Agora você pode votar na melhor banca!", liberaVotacao: true },
    { carimbos: "todas", emoji: "🏆", nome: "Lenda da Feira", descricao: "Visitou todas as bancas. Selo especial!", especial: true }
  ],

  // Mostra no rodapé os links do modo demonstração e dos cartazes (útil no protótipo).
  mostrarLinksApresentacao: true,

  // Link do formulário de votação/feedback (ex.: Google Forms). Vazio = "divulgado no dia".
  linkVotacao: "",

  // codigo: vai no QR Code da banca e pode ser digitado se a câmera falhar.
  bancas: [
    {
      id: "dolce-vita",
      codigo: "DV3K",
      nome: "Dolce Vita",
      emoji: "🧁",
      cor: "#e8508f",
      mesa: 1,
      resumo: "Doces variados com identidade visual jovem e atendimento próximo.",
      destaques: ["Brownie recheado", "Brigadeiro de colher", "Bolo no pote"]
    },
    {
      id: "moki-cookies",
      codigo: "MK7P",
      nome: "MOKI Cookies",
      emoji: "🍪",
      cor: "#b5651d",
      mesa: 2,
      resumo: "Cookies artesanais, acessíveis e atrativos, com variedade de sabores.",
      destaques: ["Cookie tradicional", "Cookie red velvet", "Cookie de Nutella"]
    },
    {
      id: "loja-brigadeiro",
      codigo: "BR9T",
      nome: "Loja de Brigadeiro",
      emoji: "🍫",
      cor: "#6b3e26",
      mesa: 3,
      resumo: "Brigadeiros gourmet com preço acessível.",
      destaques: ["Brigadeiro belga", "Pistache", "Ninho com Nutella"]
    },
    {
      id: "music-cookies",
      codigo: "MC4S",
      nome: "Music Cookies",
      emoji: "🎵",
      cor: "#1db954",
      mesa: 4,
      resumo: "Cookies para presentear: cada embalagem traz uma música do Spotify.",
      destaques: ["Caixa-presente com 3 cookies", "Escolha a música da embalagem"]
    },
    {
      id: "solitarium-pratas",
      codigo: "SP2X",
      nome: "Solitarium Pratas",
      emoji: "💍",
      cor: "#7a8ca3",
      mesa: 5,
      resumo: "Joias em prata pensadas para as mulheres da Geração Z.",
      destaques: ["Colares minimalistas", "Brincos", "Anéis ajustáveis"]
    },
    {
      id: "pastel-sa",
      codigo: "PA8L",
      nome: "Pastel S&A",
      emoji: "🥟",
      cor: "#e0a100",
      mesa: 6,
      resumo: "Pastéis na hora: alimentação rápida para o intervalo.",
      destaques: ["Carne", "Queijo", "Frango com catupiry"]
    },
    {
      id: "grupo-cafes",
      codigo: "CF5M",
      nome: "Grupo de Cafés",
      emoji: "☕",
      cor: "#5a3a2e",
      mesa: 7,
      resumo: "Cafés para quem está circulando pela feira.",
      destaques: ["Espresso", "Cappuccino", "Café gelado"]
    }
  ]
};
