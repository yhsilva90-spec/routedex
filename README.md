# RouteDex BD/SP

Checklist web local para acompanhar capturas por rota, área, horário e versão de Pokémon Brilliant Diamond / Shining Pearl.

## Executar

```bash
pnpm install
pnpm dev
```

Abra o endereço local mostrado pelo Vite.

## Atualizar dados da planilha

```bash
python scripts/import_workbook.py "C:\\caminho\\Cópia de BDSP Pokedex Worklist Sharable.xlsx"
```

O script gera `src/data/gameData.ts`, normaliza localidades e tenta enriquecer os horários com as condições de encontro da PokéAPI. Registros sem horário confirmado permanecem marcados como desconhecidos.

## Verificação

```bash
pnpm test
pnpm build
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie este projeto para a branch `main`.
2. Em `Settings > Pages`, selecione `GitHub Actions` como origem da publicação.
3. O workflow `.github/workflows/deploy.yml` instalará as dependências, executará `pnpm agent:check` e publicará o site.

O endereço público ficará parecido com `https://seu-usuario.github.io/nome-do-repositorio/`.

## Persistência do progresso

O progresso é salvo automaticamente no armazenamento persistente do navegador, usando a chave `routedex-progress-v2`. A aplicação também migra a chave anterior `routedex-progress-v1`.

`localhost` e a URL do GitHub Pages são origens diferentes. Portanto, para levar o progresso local para a publicação, use `Exportar` no localhost e `Importar` na página publicada. O backup JSON continua sendo a proteção principal contra limpeza de dados, troca de navegador ou uso de janela anônima.
