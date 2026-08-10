import { AiGenerateTextService as JSAiGenerateTextService } from './AiGenerateTextService.js';
import { IAiGenerateTextInput, IAiGenerateTextResult } from '../types/AiGenerateTextTypes.js';

export class AiGenerateTextService {
  static async generateText(
    ownerId: string,
    credentialId: string,
    rawConfig: IAiGenerateTextInput
  ): Promise<IAiGenerateTextResult> {
    return await JSAiGenerateTextService.generateText(ownerId, credentialId, rawConfig);
  }
}
