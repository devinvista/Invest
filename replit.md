# replit.md

## Visão Geral

OrçaFácil é uma aplicação abrangente de gestão financeira pessoal desenvolvida para usuários brasileiros. Seu principal objetivo é fornecer ferramentas para gestão de orçamento usando o método 50/30/20, acompanhamento de despesas, gestão de carteira de investimentos, definição de metas e relatórios financeiros. O projeto visa oferecer uma experiência de usuário moderna e profissional, combinando recursos financeiros robustos com uma interface intuitiva.

## Preferências do Usuário

Estilo de comunicação preferido: Linguagem simples e cotidiana.
Identidade Visual: Diretrizes da marca Pharos Capital aplicadas.

## Mudanças Recentes

- **4 de Agosto de 2025**: Implementação completa de design responsivo para dispositivos móveis
  - Sistema de grid responsivo com classes CSS customizadas (responsive-grid-1 a responsive-grid-4)
  - Melhorias no Dashboard com gráficos adaptativos e cards otimizados para mobile
  - Componente de Investimentos totalmente responsivo com visualizações adaptáveis
  - ModernCard component aprimorado com tipografia e espaçamento responsivos
  - Classes utilitárias de texto responsivo (text-responsive-xs a text-responsive-xl)
  - Containers de gráficos adaptativos (chart-container e chart-container-small)
  - Todas as interfaces adaptadas para telas pequenas (320px+) até monitores ultrawide
  - Sistema de breakpoints expandido incluindo xs (475px) e 3xl (1600px)
  - Header e Sidebar com navegação móvel colapsável e menu hamburger
  - Tooltips e legendas de gráficos otimizados para telas de toque

- **6 de Agosto de 2025**: Migração para ambiente Replit concluída com sucesso e pequenos ajustes de UI
  - Removido texto do eixo Y no gráfico de evolução de investimentos para layout mais limpo
  - Aplicação funcionando perfeitamente no ambiente Replit padrão

- **4 de Agosto de 2025**: Migração para ambiente Replit concluída com sucesso
  - Migração bem-sucedida do OrçaFácil do Replit Agent para ambiente Replit padrão
  - Instalação de todos os pacotes Node.js e dependências necessárias
  - Correção da execução TypeScript com runtime tsx
  - Verificação de todas as funcionalidades principais funcionando: autenticação, dashboard, transações e conexões de banco de dados
  - Mantida conexão segura PostgreSQL com integração Neon serverless
  - Todos os workflows configurados adequadamente e executando na porta 5000

- **4 de Agosto de 2025**: Suíte abrangente de simuladores financeiros implementada
  - Simulador de juros compostos aprimorado com gráfico de área interativo "Evolução do Investimento"
  - Adicionada Calculadora de Reserva de Emergência com análise de situação de emprego e acompanhamento de progresso
  - Implementada Calculadora de Metas para planejamento personalizado de objetivos financeiros com requisitos de contribuição mensal
  - Criada Calculadora de Aposentadoria com avaliação de adequação e projeções de renda futura
  - Construída Calculadora de Financiamento com metodologia PRICE para análise de financiamentos
  - Adicionada ferramenta de Comparação de Investimentos para análise lado a lado de diferentes opções de investimento
  - Todos os simuladores apresentam design responsivo, resultados codificados por cores profissionais e dicas educacionais
  - Tooltips interativos com formatação adequada de moeda em todas as ferramentas

- **3 de Agosto de 2025**: Migração para ambiente Replit concluída com sucesso
  - Corrigido comportamento de exclusão de transações pendentes - usuários agora podem deletar transações pendentes sem recriação automática
  - Mantidas práticas robustas de segurança com proteção de ambiente para conexões de banco de dados
  - Verificadas todas as funcionalidades funcionando corretamente incluindo metodologia de orçamento 50/30/20, acompanhamento de transações e gestão de carteira de investimentos
  - Arquitetura cliente/servidor adequadamente separada com backend Express.js e frontend React
  - Conexão de banco de dados PostgreSQL protegida com integração Neon serverless
  - **ATUALIZADO**: Lógica de exclusão revisada para transações pendentes com recorrências ativas - ao deletar uma transação pendente de uma recorrência ativa (para sempre ou parcelamentos), ela é deletada e a próxima parcela é criada automaticamente mantendo a data de vencimento original

- **1º de Agosto de 2025**: Grande melhoria arquitetural - Corrigida lógica de pagamento de cartão de crédito
  - **MUDANÇA SIGNIFICATIVA**: Cartões de crédito agora funcionam como contas virtuais para rastreamento financeiro adequado
  - **Despesas do cartão de crédito**: Registradas diretamente no cartão de crédito (aumenta dívida/valorUtilizado)
  - **Pagamentos do cartão de crédito**: Criados como transferências da conta bancária para o cartão de crédito (reduz dívida)
  - **Eliminadas despesas duplicadas**: Não cria mais despesa ao pagar fatura + despesa ao comprar
  - **Novo endpoint**: `/api/credit-cards/:cardId/payment` para pagamentos adequados de faturas
  - **Lógica de transação aprimorada**: Distingue entre compras (despesa no cartão) e pagamentos (transferência)
  - **Rastreamento preciso de dívida**: valorUtilizado do cartão de crédito reflete adequadamente o saldo real da dívida

- **1º de Agosto de 2025**: Estilização aprimorada da navegação da barra lateral para tema claro
  - Itens de menu ativos agora exibem fundo azul (hsl(218, 78%, 42%)) e texto branco no tema claro
  - Melhor contraste visual e experiência do usuário para identificação da página atual
  - Aplicadas declarações !important para garantir estilização consistente em diferentes estados

- **1º de Agosto de 2025**: Adicionadas funcionalidades de edição e exclusão para transações pendentes
  - Usuários agora podem editar transações pendentes através de interface de diálogo abrangente
  - Funcionalidade de exclusão com confirmação para transações pendentes
  - Apenas transações pendentes podem ser editadas/excluídas, transações confirmadas permanecem protegidas
  - Adicionado tratamento adequado de erros e feedback do usuário para todas as operações
  - Novo componente `EditPendingTransactionDialog` com validação completa de formulário
  - Endpoints de API backend: PUT `/api/transactions/:id` e validação DELETE aprimorada
  - Corrigida criação de recorrência: primeira transação pendente agora usa data de início em vez de próxima data de execução
  - Lógica de exclusão aprimorada: ao excluir transações pendentes de recorrências "para sempre", cria automaticamente próxima transação pendente
  - Corrigido cálculo de data de recorrência: lógica simplificada para contar transações totais para numeração progressiva de período
  - Corrigida criação automática de transação para manter progressão sequencial (próximo período = total de transações + 1)

- **1º de Agosto de 2025**: Implementada lógica de data de confirmação para transações pendentes
  - Quando uma transação pendente é confirmada, sua data é automaticamente atualizada para a data de confirmação (data/hora atual)
  - Aplica-se aos métodos `confirmTransactionWithAccount` e `updateTransactionStatus`
  - Garante registros financeiros precisos mostrando quando as transações realmente ocorreram
  - Adicionado logging detalhado para mudanças de data durante processo de confirmação

- **31 de Janeiro de 2025**: Implementado gerenciamento automático de transações pendentes para recorrências "para sempre"
  - Recorrências "para sempre" (sem data final) criam automaticamente a primeira transação pendente quando criadas
  - Quando uma transação de recorrência é confirmada, a próxima transação pendente é automaticamente criada
  - Sistema mantém exatamente uma transação pendente visível para cada recorrência ativa para sempre
  - Lógica inteligente de atualização de recorrência: apenas transações pendentes são modificadas enquanto transações confirmadas permanecem inalteradas
  - Criado método especializado `updateRecurrenceAndPendingTransactions` que mapeia mudanças de recorrência para transações pendentes relacionadas
  - Corrigidos problemas de validação de data em atualizações de recorrência com `updateRecurrenceSchema` dedicado e transformação adequada de string ISO para Date
  - Resposta backend aprimorada para mostrar quantas transações pendentes foram atualizadas e fornece feedback claro ao usuário
  - Preserva integridade financeira mantendo histórico de transações confirmadas intacto

## Arquitetura do Sistema

### Arquitetura Frontend
- **Framework**: React com TypeScript
- **Ferramenta de Build**: Vite
- **Biblioteca de UI**: Componentes Radix UI com Tailwind CSS para estilização, complementada por Shadcn/ui para estilização consistente.
- **Gerenciamento de Estado**: TanStack Query (React Query) para estado do servidor.
- **Roteamento**: Wouter para roteamento do lado do cliente.
- **Manipulação de Formulários**: React Hook Form com validação Zod.
- **Design UI/UX**: Enfatiza uma interface bancária profissional com tema claro (fundo branco limpo, acentos cinza claro sutis, gradiente azul Pharos Capital para cabeçalhos) e tema escuro moderno (azul-cinza escuro profundo). Inclui design responsivo, localização brasileira (formatação de moeda, idioma português) e recursos de acessibilidade. Elementos visuais incluem tipografia profissional, estilização aprimorada de cards e badges codificados por cores para indicadores financeiros. Gráficos de investimento apresentam designs profissionais de barras e rosca com filtragem por categoria.

### Arquitetura Backend
- **Runtime**: Node.js com TypeScript
- **Framework**: Express.js com design de API RESTful.
- **Banco de Dados**: PostgreSQL com conexão Neon serverless.
- **ORM**: Drizzle ORM para operações de banco de dados type-safe.
- **Autenticação**: Autenticação baseada em JWT com hash de senha bcrypt e connect-pg-simple para gerenciamento de sessão.

### Principais Funcionalidades e Implementações Técnicas
- **Gestão de Orçamento**: Implementa a metodologia 50/30/20, permitindo orçamentos padrão (todos os meses) ou meses específicos, e alocação personalizada de categorias. Cálculo de renda é automático baseado em categorias de receita.
- **Rastreamento de Transações**: Acompanhamento abrangente de receitas, despesas e transferências com categorização. Inclui funcionalidades como descrição automática de parcelamento, confirmação de transações pendentes com seleção de conta, e diálogos de transações em tela cheia com filtragem e ordenação.
- **Carteira de Investimentos**: Rastreamento de ativos com atualizações de preços em tempo real, busca integrada de ativos (incluindo ações brasileiras como B3) e criação manual de ativos. Apresenta gráficos de evolução de carteira e distribuição de ativos.
- **Definição de Metas**: Permite definição de metas financeiras e acompanhamento de progresso.
- **Gestão de Cartão de Crédito**: Apresenta rastreamento de limite e uso, registro direto de despesas e gravação de pagamento de faturas.
- **Gestão de Contas**: Suporta atualização de informações de conta, transferências entre contas e exclusão de conta com verificação de saldo.
- **Categorias Padrão**: Sistema abrangente de categorias padrão baseado na metodologia 50/30/20 é automaticamente criado para novos usuários.

## Dependências Externas

- **@neondatabase/serverless**: Para conexões PostgreSQL.
- **drizzle-orm**: Para interações com banco de dados.
- **@tanstack/react-query**: Para gerenciamento de estado do servidor.
- **@radix-ui/***: Para componentes de UI acessíveis.
- **react-hook-form**: Para manipulação de formulários.
- **@hookform/resolvers**: Para integração Zod com formulários.
- **bcrypt**: Para hash de senhas.
- **jsonwebtoken**: Para gerenciamento de tokens JWT.
- **tailwindcss**: Para estilização.
- **class-variance-authority**: Para variantes de componentes.
- **clsx**: Para nomes de classes condicionais.
- **lucide-react**: Para ícones.
- **recharts**: Para gráficos e visualização de dados.
- **Alpha Vantage API**: Para dados financeiros em tempo real e busca de ativos.
- **CoinGecko API**: Para dados de criptomoedas.