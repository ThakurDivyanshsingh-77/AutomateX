import { BaseExecutor } from './BaseExecutor.js';
import { GeminiProvider } from '../../ai/providers/GeminiProvider.js';
import { credentialService } from '../../credentials/credentialService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class GeminiStructureProductsExecutor extends BaseExecutor {
  /**
   * System Prompt strictly defining boundary detection and multi-product JSON schema.
   */
  static getSystemPrompt() {
    return `You are an expert document-to-structured-data parser.
Your task is to analyze the provided raw document text, detect all distinct chemical/product records, and output them as a clean, standardized JSON array of product objects.

STRICT RULES:
1. One document may contain MULTIPLE products. Detect the boundaries of every product automatically (e.g. headings with product names, CAS numbers, URLs, SEO sections, etc.).
2. Output valid JSON ONLY. Do NOT wrap your output in markdown backticks or commentary. Output pure JSON starting with { and ending with }.
3. EXACT SCHEMA TO FOLLOW:
{
  "products": [
    {
      "name": "string (Required: Exact product or chemical name)",
      "casNumber": "string or null (e.g. '106-22-9')",
      "urlSlug": "string or null (e.g. 'https://www.example.com/beta-citronellol' or 'beta-citronellol')",
      "primaryKeyword": "string or null",
      "titleTag": "string or null",
      "metaDescription": "string or null",
      "h1": "string or null",
      "description": "string or null (Preserve original description text accurately)",
      "sections": [
        {
          "heading": "string",
          "level": "H2 or H3",
          "content": "string"
        }
      ],
      "applications": ["string"],
      "benefits": ["string"],
      "safetyInformation": ["string"],
      "packagingInformation": ["string"],
      "faqs": [
        {
          "question": "string",
          "answer": "string"
        }
      ],
      "schemaMarkup": "string or null"
    }
  ]
}
4. PRESERVE ORIGINAL CONTENT:
   - Do NOT rewrite or modify product names, CAS numbers, SEO titles, descriptions, FAQs, or values.
   - Do NOT invent or hallucinate missing data. If a property is not present in the document text, use null for string fields, and an empty array [] for list fields.
5. Every item in the "products" array MUST have at least a non-empty "name".`;
  }

  /**
   * Sanitizes and parses LLM text into JSON
   */
  static parseAndValidateJson(rawResponseText) {
    if (!rawResponseText || typeof rawResponseText !== 'string') {
      throw new Error('Received empty response from AI.');
    }

    let cleaned = rawResponseText.trim();
    // Remove markdown code fences if LLM accidentally added them
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
    }

    // Locate the first { or [ and last } or ]
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error(`JSON parsing failed: ${e.message}`);
    }

    // Support both { products: [...] } and direct array [...]
    let products = [];
    if (Array.isArray(parsed)) {
      products = parsed;
    } else if (parsed && Array.isArray(parsed.products)) {
      products = parsed.products;
    } else if (parsed && typeof parsed === 'object') {
      // Single product object fallback
      products = [parsed];
    } else {
      throw new Error('Invalid schema: "products" must be an array.');
    }

    // Normalize each product record
    const validatedProducts = products.map((p, idx) => {
      const name = (p.name || p.productName || p.title || '').trim();
      if (!name) {
        throw new Error(`Product at index ${idx} is missing required "name" field.`);
      }

      return {
        name,
        casNumber: p.casNumber || p.cas_number || p.cas || null,
        urlSlug: p.urlSlug || p.url_slug || p.slug || null,
        primaryKeyword: p.primaryKeyword || p.primary_keyword || null,
        titleTag: p.titleTag || p.title_tag || p.seoTitle || null,
        metaDescription: p.metaDescription || p.meta_description || p.seoDescription || null,
        h1: p.h1 || p.h1Tag || null,
        description: p.description || p.productDescription || null,
        sections: Array.isArray(p.sections) ? p.sections : [],
        applications: Array.isArray(p.applications) ? p.applications : [],
        benefits: Array.isArray(p.benefits) ? p.benefits : [],
        safetyInformation: Array.isArray(p.safetyInformation || p.safety_information || p.safety) ? (p.safetyInformation || p.safety_information || p.safety) : [],
        packagingInformation: Array.isArray(p.packagingInformation || p.packaging_information || p.packaging) ? (p.packagingInformation || p.packaging_information || p.packaging) : [],
        faqs: Array.isArray(p.faqs) ? p.faqs : [],
        schemaMarkup: p.schemaMarkup || p.schema_markup || p.schema || null,
      };
    });

    if (validatedProducts.length === 0) {
      throw new Error('No valid products detected in the extracted document text.');
    }

    return validatedProducts;
  }

  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const startTime = Date.now();

    // 1. Resolve raw document text from variable interpolation or inputData
    let documentText = config.documentText || config.text || '';
    if (typeof documentText === 'string' && documentText.includes('{{')) {
      documentText = ExpressionEngine.resolve(documentText, context);
    }

    // Fallback to previous step output (e.g. Document Extract)
    if (!documentText && context.currentData) {
      documentText =
        context.currentData?.content?.text ||
        context.currentData?.text ||
        (typeof context.currentData === 'string' ? context.currentData : '');
    }

    if (!documentText || !String(documentText).trim()) {
      throw new Error('No document content provided to Gemini → Structure Products. Please connect Document → Extract Content or provide documentText.');
    }

    // 2. Resolve AI Credential (or use global GEMINI_API_KEY from environment)
    const ownerId = context?.user?._id || context?.user?.id || context?.ownerId;
    let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    const credentialId = config.credentialId || config.credential;
    if (credentialId && ownerId) {
      try {
        const cred = await credentialService.getCredentialForExecution(credentialId, ownerId);
        if (cred && cred.secret) {
          apiKey = cred.secret;
        }
      } catch (err) {
        console.warn('[GeminiStructureProductsExecutor] Credential fetch warning:', err.message);
      }
    }

    const model = config.model || 'gemini-1.5-flash';
    const temperature = typeof config.temperature === 'number' ? config.temperature : 0.1; // Low temp for deterministic extraction

    let products = [];
    const fullPrompt = `${GeminiStructureProductsExecutor.getSystemPrompt()}\n\nDOCUMENT TEXT TO PARSE:\n"""\n${documentText}\n"""\n\nJSON Output:`;

    // 3. Execution: If API key is available, query Gemini Provider; otherwise fallback to intelligent heuristic parser (for offline tests/mocking)
    if (apiKey && apiKey !== 'mock_api_key' && !apiKey.startsWith('mock_')) {
      const geminiProvider = new GeminiProvider();
      let rawResponse = '';
      try {
        const res = await geminiProvider.generateText({
          apiKey,
          model,
          prompt: fullPrompt,
          temperature,
          maxTokens: 8192,
          autoSelectModel: true,
        });
        rawResponse = res.text || res.content || '';
      } catch (err) {
        console.warn('[GeminiStructureProductsExecutor] First AI attempt error:', err.message);
      }

      // Try parsing JSON
      try {
        products = GeminiStructureProductsExecutor.parseAndValidateJson(rawResponse);
      } catch (parseErr) {
        console.warn('[GeminiStructureProductsExecutor] Retrying with strict JSON repair prompt...');
        // Retry once with stricter prompt
        const repairPrompt = `Fix and format the following text into strictly valid JSON matching the schema with key "products":\n\n${rawResponse}\n\nStrict JSON:`;
        const retryRes = await geminiProvider.generateText({
          apiKey,
          model,
          prompt: repairPrompt,
          temperature: 0.0,
          maxTokens: 8192,
          autoSelectModel: true,
        });
        products = GeminiStructureProductsExecutor.parseAndValidateJson(retryRes.text || retryRes.content || '');
      }
    } else {
      // Mock / Offline Document Heuristic Boundary Parser for offline unit tests
      products = this.fallbackDocumentParser(documentText);
    }

    const durationMs = Date.now() - startTime;
    console.log(`[GeminiStructureProductsExecutor] ✓ Successfully structured ${products.length} product(s) in ${durationMs}ms:`);
    products.forEach((p, i) => console.log(`   ${i + 1}. ${p.name} (CAS: ${p.casNumber || 'N/A'})`));

    return {
      success: true,
      count: products.length,
      products,
      durationMs,
    };
  }

  /**
   * Deterministic local multi-product segmenter for offline execution and testing
   */
  fallbackDocumentParser(text) {
    if (!text || typeof text !== 'string') return [];

    const productBlocks = [];
    // Split by Markdown headers (e.g. # Product Name or ## Product Name)
    const lines = text.split('\n');
    let currentBlock = null;

    for (const line of lines) {
      const trimmed = line.trim();
      const lower = trimmed.toLowerCase();
      const isSubSection =
        lower.includes('what is') ||
        lower.includes('faq') ||
        lower.includes('frequently') ||
        lower.includes('application') ||
        lower.includes('benefit') ||
        lower.includes('safety') ||
        lower.includes('packaging') ||
        lower.includes('description') ||
        lower.includes('seo') ||
        lower.includes('keyword') ||
        lower.includes('meta') ||
        lower.includes('title tag') ||
        lower.includes('slug') ||
        lower.includes('tag');

      const isProductHeader = /^#\s+/.test(trimmed) && !isSubSection;

      if (isProductHeader) {
        if (currentBlock) productBlocks.push(currentBlock);
        currentBlock = { titleLine: trimmed.replace(/^#\s+/, ''), contentLines: [] };
      } else if (currentBlock) {
        currentBlock.contentLines.push(line);
      }
    }
    if (currentBlock) productBlocks.push(currentBlock);

    return productBlocks.map((block) => {
      const titleParts = block.titleLine.split('|').map((s) => s.trim());
      const name = titleParts[0] || 'Unknown Product';
      const casNumber = titleParts.length > 1 ? titleParts[1] : (block.contentLines.find((l) => /\b\d{2,7}-\d{2}-\d\b/.test(l))?.match(/\b\d{2,7}-\d{2}-\d\b/)?.[0] || null);

      const fullText = block.contentLines.join('\n');
      const urlMatch = fullText.match(/https?:\/\/[^\s\n]+/i);
      const urlSlug = urlMatch ? urlMatch[0] : null;

      const titleTagMatch = fullText.match(/Title\s*Tag[:\s]+([^\n]+)/i);
      const metaDescMatch = fullText.match(/Meta\s*Description[:\s]+([^\n]+)/i);
      const h1Match = fullText.match(/H1[:\s]+([^\n]+)/i);

      return {
        name,
        casNumber,
        urlSlug,
        primaryKeyword: name,
        titleTag: titleTagMatch ? titleTagMatch[1].trim() : null,
        metaDescription: metaDescMatch ? metaDescMatch[1].trim() : null,
        h1: h1Match ? h1Match[1].trim() : name,
        description: fullText.trim() || null,
        sections: [],
        applications: [],
        benefits: [],
        safetyInformation: [],
        packagingInformation: [],
        faqs: [],
        schemaMarkup: null,
      };
    });
  }
}
