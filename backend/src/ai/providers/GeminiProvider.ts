import { GeminiProvider as JSGeminiProvider } from './GeminiProvider.js';
import { IAIProviderGenerateOptions, IAIProviderResult } from './AIProvider.js';

export class GeminiProvider {
  private jsProvider = new JSGeminiProvider();

  async generateText(options: IAIProviderGenerateOptions): Promise<IAIProviderResult> {
    return await this.jsProvider.generateText(options);
  }
}
