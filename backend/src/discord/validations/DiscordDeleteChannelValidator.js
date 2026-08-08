export class DiscordDeleteChannelValidator {
  /**
   * Validate Discord Delete Channel request inputs.
   */
  static validate(input) {
    const errors = [];
    const config = input || {};

    const credentialId = config.credentialId || config.credential;
    if (!credentialId) {
      errors.push('Discord Credential selection is required.');
    }

    const channelId = String(config.channelId || config.channel || '').trim();
    if (!channelId) {
      errors.push('Discord Channel selection or dynamic Channel ID is required.');
    }

    const confirmDelete = Boolean(
      config.confirmDelete === true || config.confirmDelete === 'true'
    );

    if (!confirmDelete) {
      errors.push('Confirmation is required. You must check "I understand this channel will be permanently deleted" before executing.');
    }

    return {
      isValid: errors.length === 0,
      credentialId,
      channelId,
      confirmDelete,
      errors,
    };
  }
}
