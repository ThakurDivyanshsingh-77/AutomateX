import fs from 'fs';
import { BaseParser } from '../parser/BaseParser.js';
import { BaseExecutor } from './BaseExecutor.js';
import { fileStorageService } from '../../services/FileStorageService.js';
import { documentParserService } from '../parser/DocumentParserService.js';
import { FileModel } from '../../models/File.js';

export class DocumentExtractContentExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    
    // 1. Resolve file ID (interpolating Mustache variables if present)
    let rawFileId = config.fileId || config.file?.id || config.file;
    if (typeof rawFileId === 'string' && rawFileId.includes('{{')) {
      rawFileId = this.interpolate(rawFileId, context);
    }

    if (!rawFileId) {
      const error = new Error('Document file ID is missing in configuration.');
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // Clean resolved file ID string if nested object was stringified
    let fileId = String(rawFileId).trim();
    if (fileId.startsWith('{') && fileId.includes('"id"')) {
      try {
        const parsedObj = JSON.parse(fileId);
        fileId = parsedObj.id || parsedObj.file?.id || fileId;
      } catch (e) {
        // Fallback
      }
    }

    // 2. Resolve owner ID from context if present
    const ownerId = context?.user?._id || context?.user?.id || context?.ownerId;

    // 3. Fetch File Record & Ownership Verification
    let fileDoc = null;
    try {
      fileDoc = await FileModel.findOne({ id: fileId });
    } catch (err) {
      console.warn(`[DocumentExtractContentExecutor] Error querying database for file ${fileId}:`, err.message);
    }

    if (!fileDoc) {
      const error = new Error(`Document file with ID '${fileId}' could not be found.`);
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (ownerId && fileDoc.ownerId && fileDoc.ownerId.toString() !== ownerId.toString()) {
      const error = new Error('You do not have permission to access this document.');
      error.code = 'ACCESS_DENIED';
      error.status = 403;
      throw error;
    }

    // 4. Read File Buffer from Disk
    if (!fs.existsSync(fileDoc.storagePath)) {
      const error = new Error('Physical document file is missing on storage path.');
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const fileBuffer = await fs.promises.readFile(fileDoc.storagePath);

    // 5. Parse Document Content
    const parsed = await documentParserService.parseDocument(fileBuffer, fileDoc);

    // 6. Extraction Mode Filtering
    const mode = (config.extractionMode || 'full').toLowerCase();
    let finalContent = {
      text: parsed.text,
      paragraphs: parsed.paragraphs,
      headings: parsed.headings,
      tables: parsed.tables,
      blocks: parsed.blocks,
    };

    if (mode === 'textonly') {
      finalContent = {
        text: parsed.text,
        paragraphs: parsed.paragraphs,
        headings: parsed.headings,
        tables: [],
        blocks: parsed.blocks.filter((b) => b.type !== 'table'),
      };
    } else if (mode === 'tablesonly') {
      finalContent = {
        text: '',
        paragraphs: [],
        headings: [],
        tables: parsed.tables,
        blocks: parsed.blocks.filter((b) => b.type === 'table'),
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
    console.log(`  File: ${fileDoc.originalName} (${fileDoc.extension})`);
    console.log(`  Stats: ${stats.characters} chars, ${stats.paragraphs} paras, ${stats.tables} tables, ${stats.blocks} blocks`);

    return {
      success: true,
      file: {
        id: fileDoc.id,
        name: fileDoc.originalName,
        mimeType: fileDoc.mimeType,
        size: fileDoc.size,
        extension: fileDoc.extension,
      },
      content: finalContent,
      stats,
    };
  }
}
