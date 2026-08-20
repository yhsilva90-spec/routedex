# RouteDex BD/SP

O RouteDex é uma caderneta web para acompanhar a Pokédex de Pokémon Brilliant Diamond e Shining Pearl por rota, área, método de encontro, horário, versão, ginásios e Elite Four.

## Acesso

Use a versão publicada no GitHub Pages:

<https://yhsilva90-spec.github.io/routedex/>

A experiência oficial do projeto é web. O repositório funciona como fonte de publicação e manutenção do site, não como um aplicativo distribuído para instalação local.

## Recursos

- acompanhamento por localização, com progresso compartilhado entre ocorrências do mesmo Pokémon;
- separação entre grama, Surf, pesca, Poké Radar e Swarm;
- horários, níveis, métodos, versões e chances de encontro quando disponíveis;
- Sinnoh Dex e National Dex;
- checklist de líderes de ginásio e Elite Four;
- checklist de pós-jogo e Technical Machines;
- sprites, backup JSON e persistência automática no navegador.

## Persistência

O progresso é salvo automaticamente no armazenamento do navegador usando a chave versionada `routedex-progress-v2`. A aplicação também migra a chave anterior `routedex-progress-v1`.

O armazenamento é específico da origem. Se você trocar de navegador, usar uma janela anônima ou sair de `localhost` para a URL publicada, use `Exportar` na origem antiga e `Importar` na nova. O backup JSON é a proteção contra limpeza dos dados do navegador.

## Dados e fontes

A base de localidades combina a planilha de trabalho com as tabelas de encontros da geração 8 do [Pokémon Database](https://pokemondb.net/brilliant-diamond-shining-pearl). A tabela externa é usada para reconciliar encontros selvagens por local, método, versão, horário, nível e chance; registros especiais que não pertencem a uma tabela selvagem comum continuam preservados para revisão manual.

Essa reconciliação corrigiu, entre outros casos, a ausência de Bibarel na Route 210. A fonte confirma o encontro na seção norte da rota, na grama, em BD e SP, no nível 24 e com 20% de chance. A interface continua agrupando norte e sul sob o nome da rota para manter o acompanhamento por localização.

O próximo passo de dados é transformar essa base reconciliada em uma fonte própria versionada, com:

1. identificadores estáveis para localidades, Pokémon e encontros;
2. fonte e data de validação em cada registro;
3. separação entre dado confirmado, divergência e revisão pendente;
4. importação reproduzível sem sobrescrever alterações manuais;
5. testes para detectar localidades ou encontros ausentes;
6. revisão cruzada com Bulbapedia e Thonky para exceções, encontros estáticos e eventos.

## Publicação

O deploy é feito automaticamente pelo workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) quando há um push na `main`.

Para administrar o site no GitHub, deixe `Settings > Pages > Build and deployment > Source` configurado como `GitHub Actions`.

## Manutenção

Os comandos de manutenção ficam disponíveis para quem contribui com o projeto:

```bash
pnpm agent:check
pnpm agent:audit
pnpm agent:prepare-update
```

O ciclo de QA também pode ser executado localmente:

```bash
pnpm agent:qa:data
pnpm agent:qa:source
pnpm agent:reconcile:source
pnpm agent:qa:interaction
pnpm agent:qa:visual
pnpm agent:qa
```

Ele gera relatórios e screenshots em `artifacts/qa/`, valida os três tamanhos de tela principais e não altera o código automaticamente. O comando `agent:reconcile:source` é a exceção explícita: aplica na base apenas as correções de versão/horário confirmadas pelas fontes cacheadas. Consulte [`docs/routedex-qa-agents.md`](docs/routedex-qa-agents.md) para o escopo completo.

Antes de qualquer atualização de dados, a alteração deve passar por auditoria, testes, build e revisão visual.
