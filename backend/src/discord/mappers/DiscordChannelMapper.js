import { DiscordChannelTypeEnum } from '../types/DiscordChannelTypes.js';

export class DiscordChannelMapper {
  /**
   * Check if Discord Channel type is supported for sending messages.
   */
  static isSupportedChannelType(typeId) {
    return (
      typeId === DiscordChannelTypeEnum.GUILD_TEXT ||
      typeId === DiscordChannelTypeEnum.GUILD_ANNOUNCEMENT ||
      typeId === DiscordChannelTypeEnum.GUILD_FORUM
    );
  }

  /**
   * Resolve string representation of Discord Channel type.
   */
  static getTypeName(typeId) {
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
   * Map raw Discord REST API channel object into clean DTO.
   */
  static mapToDto(raw) {
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
   */
  static mapManyToDto(rawChannels) {
    if (!Array.isArray(rawChannels)) return [];

    return rawChannels
      .filter((raw) => this.isSupportedChannelType(raw.type))
      .map((raw) => this.mapToDto(raw))
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }
}
