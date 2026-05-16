export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem tudo.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    let report = this.getHeader(reportType, user);
    const filteredItems = this.filterItemsByRole(user, items);
    const { content, total } = this.formatItems(reportType, user, filteredItems);

    report += content;
    report += this.getFooter(reportType, total);

    return report.trim();
  }

  /**
   * Gera o cabeçalho do relatório baseado no tipo
   */
  getHeader(reportType, user) {
    if (reportType === 'CSV') {
      return 'ID,NOME,VALOR,USUARIO\n';
    }

    if (reportType === 'HTML') {
      return (
        '<html><body>\n' +
        '<h1>Relatório</h1>\n' +
        `<h2>Usuário: ${user.name}</h2>\n` +
        '<table>\n' +
        '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n'
      );
    }

    return '';
  }

  /**
   * Filtra itens baseado no role do usuário
   */
  filterItemsByRole(user, items) {
    if (user.role === 'ADMIN') {
      return items;
    }

    if (user.role === 'USER') {
      return items.filter((item) => item.value <= 500);
    }

    return [];
  }

  /**
   * Formata os itens para o tipo de relatório especificado
   */
  formatItems(reportType, user, items) {
    const formattedLines = items.map((item) =>
      this.formatItem(reportType, user, item),
    );

    const content = formattedLines.join('');
    const total = items.reduce((sum, item) => sum + item.value, 0);

    return { content, total };
  }

  /**
   * Marca itens prioritários para admins
   */
  markAdminPriority(user, item) {
    if (user.role === 'ADMIN' && item.value > 1000) {
      item.priority = true;
    }
  }

  /**
   * Formata um item individual para o tipo de relatório
   */
  formatItem(reportType, user, item) {
    this.markAdminPriority(user, item);

    if (reportType === 'CSV') {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    }

    return this.formatItemAsHtml(item);
  }

  /**
   * Formata um item como HTML
   */
  formatItemAsHtml(item) {
    const style = item.priority ? 'style="font-weight:bold;"' : '';
    return style
      ? `<tr ${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`
      : `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  /**
   * Gera o rodapé do relatório baseado no tipo
   */
  getFooter(reportType, total) {
    if (reportType === 'CSV') {
      return '\nTotal,,\n' + `${total},,\n`;
    }

    if (reportType === 'HTML') {
      return '</table>\n' + `<h3>Total: ${total}</h3>\n` + '</body></html>\n';
    }

    return '';
  }
}