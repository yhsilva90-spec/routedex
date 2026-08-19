import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
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
      await run('pnpm', ['test', '--', '--run']);
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
      await run('pnpm', ['test', '--', '--run']);
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

async function main() {
  const input = process.argv[2] ?? 'help';
  if (input === 'help' || input === '--help') {
    console.log(Object.entries(agentCommands).map(([name, command]) => `  ${name.padEnd(16)} ${command.description}`).join('\n'));
    return;
  }
  const command = agentCommands[input === 'prepare-update' ? 'prepareUpdate' : input];
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
