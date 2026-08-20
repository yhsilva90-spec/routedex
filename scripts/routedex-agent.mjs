import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

export const agentCommands = {
  dev: {
    description: 'inicia o RouteDex no servidor local',
    mutatesFiles: false,
    run: () => run('pnpm', ['dev', '--', '--host', '127.0.0.1']),
  },
  check: {
    description: 'executa testes e build de produção',
    mutatesFiles: false,
    run: async () => {
      await run('pnpm', ['test']);
      await run('pnpm', ['build']);
    },
  },
  audit: {
    description: 'faz uma auditoria local sem alterar o projeto',
    mutatesFiles: false,
    run: async () => {
      const required = ['package.json', 'src/App.tsx', 'src/data', 'src/domain', 'src/styles.css'];
      const missing = required.filter((path) => !existsSync(`${root}/${path}`));
      if (missing.length) throw new Error(`Estrutura incompleta: ${missing.join(', ')}`);
      await run('pnpm', ['test']);
      await run('git', ['status', '--short']);
      console.log('\nAuditoria concluída: nenhuma alteração automática foi feita.');
    },
  },
  prepareUpdate: {
    description: 'gera o roteiro seguro para uma futura atualização',
    mutatesFiles: false,
    run: async () => {
      console.log([
        'Roteiro de atualização do RouteDex:',
        '1. revisar fontes externas e registrar a origem dos dados;',
        '2. importar mudanças em uma branch separada;',
        '3. executar audit, testes e build;',
        '4. revisar visualmente no navegador;',
        '5. pedir aprovação antes de aplicar dados ou layout.',
      ].join('\n'));
    },
  },
  qaData: {
    description: 'audita a integridade e a cobertura da base de dados',
    mutatesFiles: false,
    run: () => run('pnpm', ['agent:qa:data']),
  },
  qaInteraction: {
    description: 'executa os testes de interação no navegador',
    mutatesFiles: false,
    run: () => run('pnpm', ['agent:qa:interaction']),
  },
  qaVisual: {
    description: 'gera checkpoints visuais e mede overflow responsivo',
    mutatesFiles: false,
    run: () => run('pnpm', ['agent:qa:visual']),
  },
  qaSource: {
    description: 'compara encontros locais com as tabelas externas por versão',
    mutatesFiles: false,
    run: () => run('pnpm', ['agent:qa:source']),
  },
  reconcileSource: {
    description: 'corrige versões e horários confirmados pela fonte externa',
    mutatesFiles: true,
    run: () => run('pnpm', ['agent:reconcile:source']),
  },
  qa: {
    description: 'executa o ciclo completo de QA do RouteDex',
    mutatesFiles: false,
    run: async () => {
      const checks = [
        ['data', ['agent:qa:data']],
        ['source', ['agent:qa:source']],
        ['interaction', ['agent:qa:interaction']],
        ['visual', ['agent:qa:visual']],
      ];
      const results = [];
      for (const [name, args] of checks) results.push({ name, code: await runResult('pnpm', args) });
      mkdirSync(`${root}/artifacts/qa`, { recursive: true });
      writeFileSync(`${root}/artifacts/qa/summary.md`, [
        '# RouteDex QA',
        '',
        `Gerado em: ${new Date().toISOString()}`,
        '',
        ...results.map((result) => `- ${result.name}: ${result.code === 0 ? 'PASS' : `FAIL (${result.code})`}`),
        '',
        '- Dados: `data-report.json` e `data-report.md`',
        '- Fonte externa: `source-report.json` e `source-report.md`',
        '- Interação: `interaction-report/` e `interaction/`',
        '- Visual: `visual-report.json` e `visual/`',
        '',
        'A execução é somente leitura para o código da aplicação. Correções visuais continuam sujeitas a revisão.',
        '',
      ].join('\n'), 'utf8');
      const failed = results.filter((result) => result.code !== 0);
      console.log(`\nQA concluído com ${failed.length} etapa(s) divergente(s). Nenhuma alteração automática foi feita.`);
      if (failed.length) process.exitCode = 1;
    },
  },
  qaFix: {
    description: 'mostra o limite seguro para correções automáticas',
    mutatesFiles: false,
    run: async () => {
      await run('node', ['scripts/qa-fix.mjs']);
    },
  },
};

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = process.platform === 'win32'
      ? spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', [command, ...args].join(' ')], { cwd: root, stdio: 'inherit' })
      : spawn(command, args, { cwd: root, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} terminou com código ${code}`)));
  });
}

function runResult(command, args) {
  return new Promise((resolve, reject) => {
    const child = process.platform === 'win32'
      ? spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', [command, ...args].join(' ')], { cwd: root, stdio: 'inherit' })
      : spawn(command, args, { cwd: root, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });
}

async function main() {
  const input = process.argv[2] ?? 'help';
  if (input === 'help' || input === '--help') {
    console.log(Object.entries(agentCommands).map(([name, command]) => `  ${name.padEnd(16)} ${command.description}`).join('\n'));
    return;
  }
  const command = agentCommands[input === 'prepare-update'
    ? 'prepareUpdate'
    : input === 'qa-data'
      ? 'qaData'
      : input === 'qa-interaction'
        ? 'qaInteraction'
        : input === 'qa-visual'
            ? 'qaVisual'
            : input === 'qa-source'
              ? 'qaSource'
              : input === 'reconcile-source'
                ? 'reconcileSource'
            : input === 'qa-fix'
            ? 'qaFix'
            : input];
  if (!command) {
    console.error(`Comando desconhecido: ${input}`);
    process.exitCode = 1;
    return;
  }
  await command.run();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
