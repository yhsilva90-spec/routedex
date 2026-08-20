# Agentes de QA do RouteDex

O projeto possui um ciclo local de retroalimentação para validar dados, comportamento e responsividade. Ele não faz commits, não publica alterações e não aplica mudanças visuais por inferência.

## Comandos

```bash
pnpm agent:qa:data         # auditoria de dados e cobertura de fontes
pnpm agent:qa:source       # comparação factual com as tabelas BD/SP externas
pnpm agent:reconcile:source # aplica correções confirmadas de versão/horário
pnpm agent:qa:interaction  # captura, navegação, filtros e persistência
pnpm agent:qa:visual       # screenshots em desktop, tablet e mobile
pnpm agent:qa              # executa o ciclo completo
pnpm agent:qa:fix           # mostra o limite de correções automáticas
```

Os relatórios ficam em `artifacts/qa/`. Essa pasta é ignorada pelo Git, exceto pelo `.gitkeep`.

## Escopo

- A auditoria de dados lista duplicações, aliases de rota, metadados inválidos, horários desconhecidos e cobertura de fonte.
- A comparação de fonte consulta as URLs do Pokémon Database gravadas nos encontros, interpreta as tabelas de BD/SP e aponta conflitos de versão e horário sem alterar a base.
- A reconciliação reaproveita o cache dessas fontes, corrige somente detalhes com correspondência externa e recalcula as versões/horários agregados do encontro. Swarms, eventos, ovos, presentes e registros sem correspondência continuam preservados para revisão manual.
- Os testes de navegador usam seletores acessíveis e exercitam abertura/fechamento de rota, clique na linha inteira, sincronização de captura, recarga, menu lateral e navegação.
- A auditoria visual mede overflow horizontal e gera checkpoints em `1440×900`, `1024×768` e `390×844`.

## Revisão visual no Codex

Quando uma métrica ou screenshot indicar uma dúvida de layout, o Codex pode iniciar o servidor local e abrir o site no navegador interno para testar rotas à esquerda, no centro e à direita, filtros e estados de captura. A mudança de CSS, grid, tipografia ou animação só deve ser aplicada depois dessa revisão.

## Correções automáticas

`agent:qa:fix` é separado do diagnóstico. Aliases conhecidos, duplicações determinísticas e inclusões confirmadas por fonte podem ser preparados para revisão; nenhuma alteração é aplicada silenciosamente.
