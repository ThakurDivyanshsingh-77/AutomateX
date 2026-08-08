export const DISCORD_CHANNEL_TYPES = {
  TEXT: 0,
  VOICE: 2,
  CATEGORY: 4,
};

export const DISCORD_CHANNEL_TYPE_OPTIONS = [
  { label: 'Text Channel', value: 0, key: 'text' },
  { label: 'Voice Channel', value: 2, key: 'voice' },
  { label: 'Category', value: 4, key: 'category' },
];

export const DISCORD_CHANNEL_LIMITS = {
  NAME_MIN: 1,
  NAME_MAX: 100,
  TOPIC_MAX: 1024,
  SLOWMODE_MIN: 0,
  SLOWMODE_MAX: 21600,
  BITRATE_MIN: 8000,
  BITRATE_MAX: 384000,
  USER_LIMIT_MIN: 0,
  USER_LIMIT_MAX: 99,
};
