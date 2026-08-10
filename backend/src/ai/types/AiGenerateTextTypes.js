export interface IAiGenerateTextInput {
  credentialId: string;
  provider?: string;
  model?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IAiTokenUsage {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
}

export interface IAiGenerateTextResult {
  success: boolean;
  text: string;
  provider: string;
  model: string;
  usage: IAiTokenUsage;
}
