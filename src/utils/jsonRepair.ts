/**
 * Robust JSON Parser & Repair Utility for AI LLM outputs.
 * Handles unescaped LaTeX backslashes (\frac, \times, \sqrt, \pm, \Delta, etc.)
 * and raw control characters that cause "Bad escaped character in JSON".
 */
export function cleanAndParseJson<T = any>(rawText: string): T {
  if (!rawText) {
    throw new Error('Không nhận được dữ liệu phản hồi từ AI.');
  }

  // 1. Extract JSON payload between markdown code fences if present
  let cleaned = rawText.trim();
  if (cleaned.includes('```json')) {
    cleaned = cleaned.split('```json')[1].split('```')[0].trim();
  } else if (cleaned.includes('```')) {
    cleaned = cleaned.split('```')[1].split('```')[0].trim();
  } else {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  // 2. Attempt clean direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // Continue to repair step
  }

  // 3. Robust Character-by-Character Scanner & Repair
  let repaired = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        // Check if the character following backslash is a valid JSON escape
        // Valid JSON escapes: ", \, /, b, f, n, r, t, u
        const rest = cleaned.substring(i);
        // Common LaTeX commands that start with b, f, n, r, t
        const isLatexWord = /^(rac|dfrac|imes|eta|ight|ho|ext|hi|heta|au|i|e|m|sqrt|pm|div|cdot|leq?|geq?|neq|approx|Delta|alpha|beta|pi|infty|int|sum|vec|angle|left|right|begin|end)/.test(rest);
        const isValidJsonEscape = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'].includes(char);

        if (!isValidJsonEscape || isLatexWord) {
          // Double up the backslash so JSON.parse keeps it as a literal backslash
          repaired += '\\' + char;
        } else {
          repaired += char;
        }
      } else if (char === '\\') {
        isEscaped = true;
        repaired += '\\';
      } else if (char === '"') {
        inString = false;
        repaired += '"';
      } else {
        // Handle unescaped newlines/tabs inside string literals
        if (char === '\n') repaired += '\\n';
        else if (char === '\r') repaired += '\\r';
        else if (char === '\t') repaired += '\\t';
        else repaired += char;
      }
    } else {
      if (char === '"') {
        inString = true;
        repaired += '"';
      } else {
        repaired += char;
      }
    }
  }

  if (isEscaped) {
    repaired += '\\';
  }

  try {
    return JSON.parse(repaired);
  } catch (repairedErr: any) {
    // 4. Aggressive Fallback Regex Escape
    try {
      const fallback = cleaned
        .replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
        .replace(/[\u0000-\u001F]+/g, (match) => {
          if (match === '\n') return '\\n';
          if (match === '\r') return '\\r';
          if (match === '\t') return '\\t';
          return '';
        });
      return JSON.parse(fallback);
    } catch (fallbackErr: any) {
      throw new Error(`Lỗi định dạng JSON từ AI: ${repairedErr.message || fallbackErr.message}`);
    }
  }
}
