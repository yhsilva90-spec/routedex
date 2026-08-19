# RouteDex Maintainer

O RouteDex Maintainer é uma automação local e controlada para executar o projeto, verificar sua saúde e preparar futuras atualizações.

## Comandos

```bash
pnpm agent              # mostra os comandos disponíveis
pnpm agent:dev          # inicia o Vite localmente
pnpm agent:check        # executa testes e build
pnpm agent:audit        # verifica estrutura, testes e estado do Git
pnpm agent:prepare-update # imprime o fluxo seguro de atualização
```

## Limites da primeira versão

- Nenhum comando altera arquivos automaticamente.
- Nenhuma fonte externa é consultada ou incorporada sem revisão.
- `audit` é somente leitura e falha se a estrutura básica do projeto estiver incompleta.
- Uma futura atualização de dados deverá ser feita em branch separada, com origem registrada, testes e revisão visual.

## Evolução planejada

1. Adicionar um auditor de encontros para localizar localidades sem fonte, horário ou método confirmado.
2. Adicionar um relatório de qualidade visual com screenshots de rotas, Pokédex e Liga.
3. Criar um fluxo de importação de fonte externa que gere patch revisável, sem sobrescrever a base.
4. Adicionar uma etapa opcional de otimização de bundle depois de medir o impacto real.
