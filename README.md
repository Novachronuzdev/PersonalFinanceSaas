# FinControl - Software de Controle Financeiro Pessoal SaaS

Um software completo, moderno e profissional de **Controle Financeiro Pessoal**, desenvolvido com arquitetura fullstack de alta performance, persistência de dados em disco e interface inspirada nos melhores SaaS financeiros do mercado internacional.

---

## ✨ Funcionalidades Principais

### 1. 📊 Dashboard Principal
- **KPIs em Tempo Real**:
  - Total de Receitas do Mês (recebidas e a receber).
  - Total de Despesas do Mês (pagas, pendentes e em atraso).
  - Saldo Restante com cálculo de superávit ou déficit no período.
  - Percentual da renda já comprometida com barra visual e indicador de saúde financeira.
  - Total de despesas previstas a liquidar.
  - Comparativo entre receitas e despesas.
- **Gráficos Interativos**:
  - Evolução mensal de gastos, receitas e saldo ao longo dos 12 meses do ano selecionado.
  - Gráfico de rosca/donut interativo com distribuição de despesas por categoria.
  - Widget de contas a vencer com botão de 1 clique para pagar.

### 2. 📅 Organização por Meses e Anos
- Seletor de anos com navegação instantânea.
- **Grade dos 12 meses** (Janeiro a Dezembro), com controle financeiro individual por período.
- Possibilidade de **Adicionar Novos Anos** dinamicamente, mantendo o histórico intacto sem perda de dados.

### 3. 💳 Cadastro de Despesas
- Nome, valor em reais (`R$ 1.500,00`), categoria, vencimento, data de pagamento, mês e ano de referência, status e observações.
- Status automáticos: **Pago**, **Pendente** e **Atrasado** (calculado automaticamente com base na data de hoje).
- Ações rápidas de alternar status (1 clique), edição e exclusão.

### 4. 🔁 Despesas Recorrentes Inteligentes
- Gestão de despesas fixas (Aluguel, Netflix, Academia, Internet, etc.).
- Periodicidade: **Mensal**, **Anual** ou **Personalizada** (a cada X meses).
- Geração automática nos meses correspondentes sem duplicidade.
- Controle de escopo ao editar ou excluir:
  - *Apenas esta ocorrência*
  - *Esta e todas as futuras*
  - *Todas as ocorrências da série*

### 5. 💰 Controle de Receitas
- Cadastro de fontes de renda (Salário, Freelances, Renda extra, Investimentos, Outros).
- Acompanhamento de valores já recebidos na conta e valores previstos.

### 6. 🎯 Planejamento Financeiro Mensal (Orçamento / Budget)
- Definição de limites de gastos por categoria e teto global.
- Cálculo automático de planejado vs. realizado, diferença e saldo disponível.
- **Alertas visuais** automáticos quando atingir 80% ou ultrapassar 100% do orçamento.

### 7. 📈 Relatórios Anuais & Comparativo de Anos
- Total de receitas e despesas anuais, saldo acumulado e média mensal.
- Destaques automáticos: **Mês com maior gasto**, **Mês com menor gasto** e **Categoria mais consumida**.
- **Comparativo entre dois anos** (ex: 2025 vs 2026): gráficos lado a lado, tabela analítica e cálculo de variações percentuais.

### 8. 🔍 Histórico & Extrato Geral
- Filtros multifacetados por Ano, Mês, Categoria, Tipo e Status.
- Busca textual instantânea.
- Ordenação dinâmica por Data, Valor e Nome.
- **Exportação para CSV** e formatação pronta para **Impressão / PDF**.

### 9. 🎨 Interface & UX
- Design refinado em **Modo Escuro (Dark Mode)** e **Modo Claro (Light Mode)**.
- Notações monetárias rigorosamente brasileiras: `R$ 1.500,00`.
- Animações suaves e feedback com notificações Toast e celebração de metas com confetes.

### 10. 💾 Armazenamento & Persistência
- Banco de dados em disco com gravação atômica (`data/financial_db.json`).
- Download de **Backup JSON** completo e restauração com 1 clique.
- Botão de restauração de dados de demonstração ou zeramento de dados.

---

## 🚀 Como Executar o Projeto

### Pré-requisito
- Node.js instalado (v18+)

### Início Rápido no Windows:
Basta dar um duplo clique no arquivo:
```cmd
iniciar.bat
```
Ou executar no terminal:
```bash
npm start
```

A aplicação abrirá automaticamente em seu navegador no endereço:
**`http://localhost:3001`**

### Modo Desenvolvimento:
Para trabalhar com hot-reload ativo:
```bash
npm run dev
```
*(Backend na porta 3001 e Vite Frontend na porta 5173).*
