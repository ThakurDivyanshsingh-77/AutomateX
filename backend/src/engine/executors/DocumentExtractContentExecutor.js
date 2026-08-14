import { BaseExecutor } from './BaseExecutor.js';
import { storageService } from '../../services/StorageService.js';
import { documentParserService } from '../parser/DocumentParserService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';
import { normalizeFileId } from '../../utils/fileUtils.js';

export class DocumentExtractContentExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};

    // 1. Raw variable expression
    const rawVariableExpression =
      node.rawConfig?.fileId ||
      node.data?.rawConfig?.fileId ||
      config.fileId ||
      config.file?.id ||
      config.file ||
      '';

    if (!rawVariableExpression && rawVariableExpression !== 0) {
      const error = new Error('Document file ID is missing in configuration.');
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // 2. Resolved variable value
    let resolvedVariableValue = rawVariableExpression;
    if (typeof rawVariableExpression === 'string' && rawVariableExpression.includes('{{')) {
      resolvedVariableValue = ExpressionEngine.resolve(rawVariableExpression, context);
    } else {
      resolvedVariableValue = config.fileId || config.file?.id || config.file || rawVariableExpression;
    }

    // 3. Document Extract received value
    const documentExtractReceivedValue = config.fileId || config.file?.id || config.file || resolvedVariableValue;

    // 4. Normalized file ID using single canonical normalization function
    const normalizedFileId = normalizeFileId(documentExtractReceivedValue || resolvedVariableValue || rawVariableExpression);

    // 5. Final file lookup ID
    const finalFileLookupId = normalizedFileId;

    if (!finalFileLookupId || finalFileLookupId.includes('{{')) {
      const error = new Error(`File variable path could not be resolved: '${rawVariableExpression}'. Ensure previous step executed successfully.`);
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // Resolve owner ID from context if present
    const ownerId = context?.user?._id || context?.user?.id || context?.ownerId;

    // 6. Retrieve Physical Buffer & Metadata via Unified StorageService
    let storageResult = null;
    try {
      storageResult = await storageService.getBuffer(finalFileLookupId, ownerId);
    } catch (err) {
      console.warn(`[DocumentExtractContentExecutor] StorageService.getBuffer error for file ${finalFileLookupId}:`, err.message);
      const error = new Error(`Physical document file is missing on storage path.`);
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const { buffer: fileBuffer, fileDoc, storagePath: resolvedStorageLocation, storageExists } = storageResult;

    // Output required debug logs
    console.log(`[DOCUMENT_EXTRACT]`);
    console.log(`fileId=${finalFileLookupId}`);
    console.log(`resolvedStorageLocation=${resolvedStorageLocation}`);
    console.log(`storageExists=${Boolean(storageExists)}`);
    console.log(`fileSize=${fileDoc.size || fileBuffer.length}`);
    console.log(`mimeType=${fileDoc.mimeType}`);

    if (!fileBuffer || fileBuffer.length === 0) {
      const error = new Error('Physical document file is missing or empty.');
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // 7. Parse Document Content using DocumentParserService
    const parsed = await documentParserService.parseDocument(fileBuffer, fileDoc);

    // 8. Extraction Mode Filtering
    const mode = (config.extractionMode || 'full').toLowerCase();
    let finalContent = {
      text: parsed.text || '',
      paragraphs: parsed.paragraphs || [],
      headings: parsed.headings || [],
      tables: parsed.tables || [],
      blocks: parsed.blocks || [],
    };

    if (mode === 'textonly' || mode === 'text_only') {
      finalContent = {
        text: parsed.text || '',
        paragraphs: parsed.paragraphs || [],
        headings: parsed.headings || [],
        tables: [],
        blocks: (parsed.blocks || []).filter((b) => b.type !== 'table'),
      };
    } else if (mode === 'tablesonly' || mode === 'tables_only') {
      finalContent = {
        text: '',
        paragraphs: [],
        headings: [],
        tables: parsed.tables || [],
        blocks: (parsed.blocks || []).filter((b) => b.type === 'table'),
      };
    }

    const stats = {
      characters: (finalContent.text || '').length,
      paragraphs: (finalContent.paragraphs || []).length,
      headings: (finalContent.headings || []).length,
      tables: (finalContent.tables || []).length,
      blocks: (finalContent.blocks || []).length,
    };

    console.log(`[DocumentExtractContentExecutor] Successfully extracted document content for node "${node.id}":`);
    console.log(`  File: ${fileDoc.originalName || fileDoc.name} (${fileDoc.extension})`);
    console.log(`  Stats: ${stats.characters} chars, ${stats.paragraphs} paras, ${stats.tables} tables, ${stats.blocks} blocks`);

    return {
      success: true,
      file: {
        id: fileDoc.id,
        name: fileDoc.originalName || fileDoc.name,
        mimeType: fileDoc.mimeType,
        size: fileDoc.size || fileBuffer.length,
        extension: fileDoc.extension,
      },
      content: finalContent,
      stats,
    };
  }
}
