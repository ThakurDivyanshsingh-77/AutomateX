export interface IAIProviderGenerateOptions {
  apiKey: string;
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IAITokenUsage {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
}

export interface IAIProviderResult {
  success: boolean;
  text: string;
  provider: string;
  model: string;
  usage: IAITokenUsage;
}

export abstract class AIProvider {
  abstract generateText(options: IAIProviderGenerateOptions): Promise<IAIProviderResult>;
}
