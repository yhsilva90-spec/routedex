export declare const agentCommands: {
  dev: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  check: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  audit: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  prepareUpdate: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
};
