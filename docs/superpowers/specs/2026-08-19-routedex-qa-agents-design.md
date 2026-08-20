# RouteDex QA Agents — Design Specification

## Goal

Criar um ciclo de retroalimentação verificável para o RouteDex: os agentes devem testar a integridade dos dados, exercitar as interações principais, avaliar a interface em diferentes tamanhos e gerar sugestões de melhoria com evidências antes de qualquer alteração automática.

## Context

O RouteDex é uma SPA React/Vite publicada no GitHub Pages. O projeto já possui testes unitários, build de produção, uma camada de dados gerada e um agente local de manutenção em `scripts/routedex-agent.mjs`. A aplicação também possui fluxos visuais importantes: expansão de rotas, grupos de encontros, filtros, menu lateral, Dex, Liga e persistência do progresso.

## Approved behavior

- O agente pode executar testes e abrir a aplicação para inspeção visual.
- O agente pode aplicar correções determinísticas, como duplicações, aliases conhecidos e registros canônicos confirmados.
- O agente não deve alterar CSS, layout ou regras de negócio automaticamente apenas por inferência visual.
- Mudanças visuais devem ser apresentadas como sugestões acompanhadas de screenshots e métricas de layout.
- A revisão visual interativa será orquestrada pelo Codex usando o navegador interno quando essa sessão estiver disponível.
- O navegador interno do Codex não será tratado como uma dependência que o script local precisa acessar diretamente.

## Architecture

### 1. Data QA agent

Responsabilidade: validar a base sem depender da interface.

Checks mínimos:

- nenhum Pokémon duplicado dentro da mesma localidade;
- nenhum alias inválido como `Route 22`, `Route 30` ou `Route 121`;
- todo encontro possui espécie, localidade, método, versão e horário coerentes;
- registros canônicos de BD/SP possuem fonte;
- encontros com horário desconhecido ficam listados para revisão;
- registros especiais ficam separados dos encontros selvagens comuns;
- diferenças entre a tabela canônica e a base local são classificadas como `missing`, `extra`, `conflict` ou `special-case`.

Saída: `artifacts/qa/data-report.json` e um resumo Markdown legível.

### 2. Interaction agent

Responsabilidade: testar o comportamento observável da aplicação em um navegador automatizado.

Fluxos obrigatórios:

- abrir e fechar uma rota;
- marcar e desmarcar um Pokémon clicando na linha inteira;
- confirmar que a captura compartilhada aparece em outra ocorrência da mesma espécie;
- alternar filtros de horário, método e versão;
- abrir e recolher o menu lateral;
- navegar entre Localizações, Sinnoh Dex, National Dex e Liga;
- marcar um Pokémon na National Dex usando a caixa inteira;
- marcar e desmarcar líder de ginásio e membro da Elite Four;
- exportar, limpar/recarregar e importar o progresso;
- recarregar a página e confirmar persistência local.

Saída: resultados de teste, screenshots dos casos críticos e mensagens de erro com seletor/elemento envolvido.

### 3. Visual agent

Responsabilidade: produzir evidência visual, sem tomar decisões irreversíveis de design.

Viewports mínimos:

- desktop: 1440×900;
- tablet: 1024×768;
- mobile: 390×844.

Checks objetivos:

- ausência de overflow horizontal;
- nenhum card ou sprite cortado;
- nenhum texto essencial fora do viewport;
- expansão e fechamento sem salto estrutural inesperado;
- colunas e divisórias presentes nos grupos;
- menu recolhido e expandido sem sobreposição indevida;
- botões de captura distinguíveis entre estado capturado e não capturado;
- contraste mínimo e legibilidade dos chips de tipo.

Saída: screenshots por viewport, métricas de bounding boxes e um relatório visual com sugestões priorizadas.

### 4. Codex interactive review

Quando a revisão exigir julgamento visual, o Codex iniciará o servidor local, abrirá a aplicação no navegador interno e executará uma sequência exploratória real: expandir rotas em posições diferentes, testar filtros combinados, recarregar a página e observar os estados de borda, espaçamento e animação.

Essa camada pode recomendar ajustes de layout e estilo, mas qualquer alteração será aplicada pelo fluxo normal de desenvolvimento, com teste e nova inspeção visual.

## Commands

O agente existente será estendido com comandos explícitos:

```text
pnpm agent:qa:data         # auditoria de dados sem mutação
pnpm agent:qa:interaction  # testes de navegador
pnpm agent:qa:visual       # screenshots e métricas
pnpm agent:qa              # executa todos os agentes e consolida o relatório
pnpm agent:qa:fix          # aplica apenas correções determinísticas aprovadas pelo código
```

`agent:qa` será somente leitura para o código da aplicação. Os artefatos de diagnóstico podem ser atualizados. `agent:qa:fix` será separado para impedir que uma execução de análise altere o projeto silenciosamente.

## CI integration

O workflow do GitHub Actions executará os checks de dados, interação e build. Screenshots e relatórios ficarão disponíveis como artefatos quando a execução falhar ou quando for solicitada manualmente. O CI não fará commits automáticos de correções.

## Correction policy

Correções automáticas permitidas:

- remoção de duplicação determinística;
- normalização de aliases já mapeados;
- inclusão de encontro confirmado pela fonte canônica;
- atualização de metadados derivados do mesmo registro fonte.

Correções que exigem revisão:

- mudança de agrupamento ou ordem visual;
- alteração de altura, grid, tipografia, cor ou animação;
- remoção de registro cuja ausência na fonte ainda não tenha sido confirmada;
- alteração de regra de captura ou persistência.

## Testing strategy

- testes unitários para regras de auditoria e classificação;
- testes de navegador para fluxos de captura, filtros, navegação e persistência;
- screenshots de referência somente depois de uma revisão visual explícita;
- `pnpm agent:check` continua sendo o gate de testes unitários e build;
- todo relatório deve indicar comando executado, resultado, artefatos e falhas.

## Acceptance criteria

- uma única execução produz relatório de dados, interação e visual;
- falhas de interação apontam o fluxo e o elemento afetado;
- o mesmo Pokémon marcado em uma rota continua marcado em todas as ocorrências;
- o estado permanece após recarregar a aplicação;
- a expansão de rotas é testada em pelo menos uma posição esquerda, central e direita;
- os três viewports são testados;
- nenhuma mudança visual automática é feita sem evidência e revisão;
- o agente consegue ser executado localmente e no GitHub Actions.

## Non-goals

- criar um agente autônomo que faça commits ou publique alterações sem aprovação;
- substituir React/Vite;
- treinar um modelo visual próprio;
- considerar screenshot pixel-perfect como única medida de qualidade;
- eliminar a revisão humana para decisões de design.
