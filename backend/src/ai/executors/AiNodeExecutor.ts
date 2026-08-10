import { AiNodeExecutor as JSAiNodeExecutor } from './AiNodeExecutor.js';

export class AiNodeExecutor {
  private jsExecutor = new JSAiNodeExecutor();

  async execute(nodeData: any, context: any): Promise<any> {
    return await this.jsExecutor.execute(nodeData, context);
  }
}
