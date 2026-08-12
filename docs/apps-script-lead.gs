/**
 * Recebe as aplicações do formulário MFV, salva na planilha e avisa por e-mail.
 *
 * Como usar:
 * 1. Crie uma planilha no Google Sheets.
 * 2. Menu Extensões > Apps Script. Apague o conteúdo e cole este arquivo.
 * 3. Ajuste EMAIL_TO abaixo (pode ser mais de um, separado por vírgula).
 * 4. Implantar > Nova implantação > tipo "App da Web":
 *      - Executar como: Eu
 *      - Quem pode acessar: Qualquer pessoa
 *    Autorize o acesso e copie a URL do App da Web.
 * 5. Cole essa URL em LEAD_ENDPOINT no arquivo src/main.js do site.
 */

const EMAIL_TO = 'email-da-samantha@exemplo.com'; // <-- troque pelo e-mail da mentora

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // cria o cabeçalho na primeira execução
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Recebido em', 'Nome', 'WhatsApp', 'Instagram', 'Tempo de atuação',
      'Maior desafio', 'Colaboradores', 'Meta 6 meses', 'Faturamento atual',
      'Investimento/mês', 'Comprometimento', 'Motivação', 'Origem'
    ]);
  }

  sheet.appendRow([
    new Date(), data.nome, data.whatsapp, data.instagram, data.tempo_atuacao,
    data.desafio, data.colaboradores, data.meta, data.faturamento_atual,
    data.investimento, data.comprometimento, data.motivacao, data.origem
  ]);

  MailApp.sendEmail({
    to: EMAIL_TO,
    subject: '🎯 Novo lead — Sessão Estratégica MFV: ' + (data.nome || 'sem nome'),
    body:
      'Chegou uma nova aplicação:\n\n' +
      'Nome: ' + (data.nome || '-') + '\n' +
      'WhatsApp: ' + (data.whatsapp || '-') + '\n' +
      'Instagram: ' + (data.instagram || '-') + '\n' +
      'Tempo de atuação: ' + (data.tempo_atuacao || '-') + '\n' +
      'Maior desafio: ' + (data.desafio || '-') + '\n' +
      'Colaboradores: ' + (data.colaboradores || '-') + '\n' +
      'Meta (6 meses): ' + (data.meta || '-') + '\n' +
      'Faturamento atual: ' + (data.faturamento_atual || '-') + '\n' +
      'Investimento/mês: ' + (data.investimento || '-') + '\n' +
      'Comprometimento: ' + (data.comprometimento || '-') + '\n\n' +
      'Motivação:\n' + (data.motivacao || '-')
  });

  return ContentService.createTextOutput('ok');
}
