export class DiscordEmbedValidators {
  static parseColor(color) {
    if (color === undefined || color === null || color === '') return undefined;
    if (typeof color === 'number') {
      return color >= 0 && color <= 0xffffff ? color : undefined;
    }
    const cleanHex = String(color).trim().replace(/^#/, '');
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      return undefined;
    }
    return parseInt(cleanHex, 16);
  }

  static isValidUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return false;
    const trimmed = urlStr.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  }

  static validateEmbedInput(input) {
    const errors = [];

    if (!input.credentialId) {
      errors.push('Discord Credential selection is required.');
    }
    if (!input.guildId) {
      errors.push('Discord Guild (Server) selection is required.');
    }
    if (!input.channelId) {
      errors.push('Discord Channel selection is required.');
    }

    const title = (input.title || '').trim();
    const description = (input.description || '').trim();
    const authorName = (input.authorName || '').trim();
    const footerText = (input.footerText || '').trim();
    const fields = input.fields || [];

    const hasContent = Boolean(title || description || authorName || footerText || fields.length > 0 || input.imageUrl || input.thumbnailUrl);
    if (!hasContent) {
      errors.push('Embed must contain at least one of Title, Description, Author, Footer, Image, Thumbnail, or Fields.');
    }

    if (title.length > 256) {
      errors.push(`Embed Title exceeds maximum limit of 256 characters (Current: ${title.length}).`);
    }
    if (description.length > 4096) {
      errors.push(`Embed Description exceeds maximum limit of 4096 characters (Current: ${description.length}).`);
    }
    if (authorName.length > 256) {
      errors.push(`Author Name exceeds maximum limit of 256 characters (Current: ${authorName.length}).`);
    }
    if (footerText.length > 2048) {
      errors.push(`Footer Text exceeds maximum limit of 2048 characters (Current: ${footerText.length}).`);
    }

    if (input.url && !this.isValidUrl(input.url)) {
      errors.push('Embed URL must be a valid HTTP or HTTPS URL.');
    }
    if (input.authorUrl && !this.isValidUrl(input.authorUrl)) {
      errors.push('Author URL must be a valid HTTP or HTTPS URL.');
    }
    if (input.authorIconUrl && !this.isValidUrl(input.authorIconUrl)) {
      errors.push('Author Icon URL must be a valid HTTP or HTTPS URL.');
    }
    if (input.thumbnailUrl && !this.isValidUrl(input.thumbnailUrl)) {
      errors.push('Thumbnail URL must be a valid HTTP or HTTPS URL.');
    }
    if (input.imageUrl && !this.isValidUrl(input.imageUrl)) {
      errors.push('Image URL must be a valid HTTP or HTTPS URL.');
    }
    if (input.footerIconUrl && !this.isValidUrl(input.footerIconUrl)) {
      errors.push('Footer Icon URL must be a valid HTTP or HTTPS URL.');
    }

    let parsedColor;
    if (input.color !== undefined && input.color !== null && input.color !== '') {
      parsedColor = this.parseColor(input.color);
      if (parsedColor === undefined) {
        errors.push(`Invalid Hex Color format: "${input.color}". Must be a valid 6-digit hex code (e.g. #5865F2 or 5865F2).`);
      }
    }

    if (fields.length > 25) {
      errors.push(`Maximum 25 Embed Fields allowed (Current: ${fields.length}).`);
    }

    const formattedFields = [];
    fields.forEach((f, idx) => {
      const name = (f.name || '').trim();
      const value = (f.value || '').trim();

      if (!name) {
        errors.push(`Field #${idx + 1} Name cannot be empty.`);
      } else if (name.length > 256) {
        errors.push(`Field #${idx + 1} Name exceeds maximum limit of 256 characters (Current: ${name.length}).`);
      }

      if (!value) {
        errors.push(`Field #${idx + 1} Value cannot be empty.`);
      } else if (value.length > 1024) {
        errors.push(`Field #${idx + 1} Value exceeds maximum limit of 1024 characters (Current: ${value.length}).`);
      }

      formattedFields.push({
        name,
        value,
        inline: Boolean(f.inline),
      });
    });

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const formattedEmbed = {};

    if (title) formattedEmbed.title = title;
    if (description) formattedEmbed.description = description;
    if (input.url) formattedEmbed.url = input.url.trim();
    if (parsedColor !== undefined) formattedEmbed.color = parsedColor;

    if (authorName) {
      formattedEmbed.author = {
        name: authorName,
        ...(input.authorUrl ? { url: input.authorUrl.trim() } : {}),
        ...(input.authorIconUrl ? { icon_url: input.authorIconUrl.trim() } : {}),
      };
    }

    if (input.thumbnailUrl) {
      formattedEmbed.thumbnail = { url: input.thumbnailUrl.trim() };
    }

    if (input.imageUrl) {
      formattedEmbed.image = { url: input.imageUrl.trim() };
    }

    if (footerText) {
      formattedEmbed.footer = {
        text: footerText,
        ...(input.footerIconUrl ? { icon_url: input.footerIconUrl.trim() } : {}),
      };
    }

    if (formattedFields.length > 0) {
      formattedEmbed.fields = formattedFields;
    }

    if (input.timestamp) {
      formattedEmbed.timestamp = typeof input.timestamp === 'string' ? input.timestamp : new Date().toISOString();
    }

    return {
      isValid: true,
      errors: [],
      formattedEmbed,
    };
  }
}
