export declare const agentCommands: {
  dev: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  check: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  audit: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  prepareUpdate: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  qaData: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  qaInteraction: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  qaVisual: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  qaSource: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  reconcileSource: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  qa: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
  qaFix: { description: string; mutatesFiles: boolean; run: () => Promise<void> };
};
