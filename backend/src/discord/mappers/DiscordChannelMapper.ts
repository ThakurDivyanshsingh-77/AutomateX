import {
  IDiscordRawChannel,
  IDiscordChannelDto,
  DiscordChannelTypeName,
  DiscordChannelTypeEnum,
} from '../types/DiscordChannelTypes.js';

export class DiscordChannelMapper {
  /**
   * Check if Discord Channel type is supported for sending messages.
   * Supported: GUILD_TEXT (0), GUILD_ANNOUNCEMENT (5), GUILD_FORUM (15)
   */
  public static isSupportedChannelType(typeId: number): boolean {
    return (
      typeId === DiscordChannelTypeEnum.GUILD_TEXT ||
      typeId === DiscordChannelTypeEnum.GUILD_ANNOUNCEMENT ||
      typeId === DiscordChannelTypeEnum.GUILD_FORUM
    );
  }

  /**
   * Resolve string representation of Discord Channel type.
   */
  public static getTypeName(typeId: number): DiscordChannelTypeName {
    switch (typeId) {
      case DiscordChannelTypeEnum.GUILD_ANNOUNCEMENT:
        return 'GUILD_ANNOUNCEMENT';
      case DiscordChannelTypeEnum.GUILD_FORUM:
        return 'GUILD_FORUM';
      case DiscordChannelTypeEnum.GUILD_TEXT:
      default:
        return 'GUILD_TEXT';
    }
  }

  /**
   * Map raw Discord REST API channel object into clean IDiscordChannelDto.
   */
  public static mapToDto(raw: IDiscordRawChannel): IDiscordChannelDto {
    return {
      id: raw.id,
      name: raw.name,
      type: this.getTypeName(raw.type),
      typeId: raw.type,
      parentId: raw.parent_id || null,
      position: raw.position ?? 0,
      topic: raw.topic || null,
    };
  }

  /**
   * Filter and map a list of raw Discord channels into supported DTOs.
   * Only includes GUILD_TEXT, GUILD_ANNOUNCEMENT, and GUILD_FORUM.
   */
  public static mapManyToDto(rawChannels: IDiscordRawChannel[]): IDiscordChannelDto[] {
    if (!Array.isArray(rawChannels)) return [];

    return rawChannels
      .filter((raw) => this.isSupportedChannelType(raw.type))
      .map((raw) => this.mapToDto(raw))
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }
}
