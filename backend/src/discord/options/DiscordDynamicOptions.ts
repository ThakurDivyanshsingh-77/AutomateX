/**
 * Discord Dynamic Options Stub
 * Will handle dropdown options (Guilds, Channels, Roles) in subsequent steps.
 */
export class DiscordDynamicOptions {
  public static async getGuilds(): Promise<Array<{ label: string; value: string }>> {
    throw new Error('Guild dynamic options will be implemented in Step 2');
  }

  public static async getChannels(): Promise<Array<{ label: string; value: string }>> {
    throw new Error('Channel dynamic options will be implemented in Step 3');
  }
}
