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

A base atual é uma camada inicial normalizada a partir da planilha de trabalho e de dados estruturados de encontros. Ela ainda não deve ser tratada como uma fonte definitiva: existem divergências que serão revisadas antes de uma nova versão da base.

Um exemplo conhecido é a ausência de Bibarel na Route 210 na base atual, embora a Wiki registre esse encontro. Esse tipo de diferença será auditado por localização, versão, método, horário e chance antes de ser incorporado.

O próximo passo de dados é criar uma base própria, com:

1. identificadores estáveis para localidades, Pokémon e encontros;
2. fonte e data de validação em cada registro;
3. separação entre dado confirmado, divergência e revisão pendente;
4. importação reproduzível sem sobrescrever alterações manuais;
5. testes para detectar localidades ou encontros ausentes.

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

Antes de qualquer atualização de dados, a alteração deve passar por auditoria, testes, build e revisão visual.
