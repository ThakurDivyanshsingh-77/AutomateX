import { DiscordCreateChannelService as JSCreateChannelService } from './DiscordCreateChannelService.js';
import { IDiscordCreateChannelInput, IDiscordCreateChannelResult } from '../types/DiscordCreateChannelTypes.js';

export class DiscordCreateChannelService {
  static async createChannel(
    ownerId: string,
    credentialId: string,
    rawConfig: IDiscordCreateChannelInput
  ): Promise<IDiscordCreateChannelResult> {
    return await JSCreateChannelService.createChannel(ownerId, credentialId, rawConfig);
  }
}
