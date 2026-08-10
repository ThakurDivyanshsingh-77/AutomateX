import { OpenAIProvider as JSOpenAIProvider } from './OpenAIProvider.js';
import { IAIProviderGenerateOptions, IAIProviderResult } from './AIProvider.js';

export class OpenAIProvider {
  private jsProvider = new JSOpenAIProvider();

  async generateText(options: IAIProviderGenerateOptions): Promise<IAIProviderResult> {
    return await this.jsProvider.generateText(options);
  }
}
