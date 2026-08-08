import { DiscordDeleteChannelService as JSDeleteChannelService } from './DiscordDeleteChannelService.js';
import { IDiscordDeleteChannelInput, IDiscordDeleteChannelResult } from '../types/DiscordDeleteChannelTypes.js';

export class DiscordDeleteChannelService {
  static async deleteChannel(
    ownerId: string,
    credentialId: string,
    rawConfig: IDiscordDeleteChannelInput
  ): Promise<IDiscordDeleteChannelResult> {
    return await JSDeleteChannelService.deleteChannel(ownerId, credentialId, rawConfig);
  }
}
