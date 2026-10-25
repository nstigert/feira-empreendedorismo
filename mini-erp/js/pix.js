/*
 * Geração do "Pix Copia e Cola" (BR Code estático) no padrão EMV QRCPS-MPM
 * definido pelo Banco Central, com CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF).
 * Tudo acontece no navegador: nenhum dado é enviado para servidor.
 */
const Pix = (() => {
  // Campo EMV: ID (2 dígitos) + tamanho (2 dígitos) + valor
  const campo = (id, valor) => id + String(valor.length).padStart(2, '0') + valor;

  // Nome e cidade: sem acentos, maiúsculas, só caracteres seguros, tamanho limitado
  const limpar = (texto, max) => String(texto || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase().trim().slice(0, max);

  // Deixa a chave no formato que o Bacen espera
  function normalizarChave(chave) {
    const c = String(chave || '').trim();
    if (c.includes('@')) return c.toLowerCase();                 // e-mail
    if (c.startsWith('+')) return '+' + c.replace(/\D/g, '');    // telefone +55...
    if (/^[\d.\-\/\s]+$/.test(c)) return c.replace(/\D/g, '');   // CPF / CNPJ
    return c.toLowerCase();                                       // chave aleatória
  }

  function crc16(texto) {
    let crc = 0xFFFF;
    for (let i = 0; i < texto.length; i++) {
      crc ^= texto.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  function gerarPayload({ chave, nome, cidade, valor, txid = '***' }) {
    const contaPix = campo('00', 'br.gov.bcb.pix') + campo('01', normalizarChave(chave));
    let p = campo('00', '01')               // versão do payload
      + campo('26', contaPix)               // conta do recebedor (Pix)
      + campo('52', '0000')                 // categoria do comerciante
      + campo('53', '986');                 // moeda: real
    if (valor > 0) p += campo('54', valor.toFixed(2));
    p += campo('58', 'BR')
      + campo('59', limpar(nome, 25) || 'RECEBEDOR')
      + campo('60', limpar(cidade, 15) || 'BRASIL')
      + campo('62', campo('05', limpar(txid, 25).replace(/ /g, '') || '***'));
    p += '6304';                            // CRC entra calculado sobre tudo, inclusive "6304"
    return p + crc16(p);
  }

  return { gerarPayload, crc16, normalizarChave };
})();
