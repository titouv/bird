import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';
import type { CliContext } from '../src/cli/shared.js';
import { registerBookmarksCommand } from '../src/commands/bookmarks.js';

describe('bookmarks command', () => {
  it('requires --all when --max-pages is provided', async () => {
    const program = new Command();
    const ctx = {
      resolveTimeoutFromOptions: () => undefined,
      resolveCredentialsFromOptions: async () => ({
        cookies: { authToken: 'auth', ct0: 'ct0', cookieHeader: 'auth=auth; ct0=ct0' },
        warnings: [],
      }),
      p: () => '',
      printTweets: () => undefined,
    } as unknown as CliContext;

    registerBookmarksCommand(program, ctx);
    const command = program.commands.find((cmd) => cmd.name() === 'bookmarks');
    if (!command) {
      throw new Error('bookmarks command not registered');
    }

    const action = (command as { _actionHandler: (opts: Record<string, string>) => Promise<void> })._actionHandler;
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code?: number) => {
        throw new Error(`exit ${code}`);
      }) as never);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      await expect(action({ maxPages: '2' })).rejects.toThrow('exit 1');
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('--max-pages requires --all'));
    } finally {
      exitSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });
});
