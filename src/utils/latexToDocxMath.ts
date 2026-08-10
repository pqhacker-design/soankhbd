import {
  Math,
  MathRun,
  MathFraction,
  MathSuperScript,
  MathSubScript,
  MathSubSuperScript,
  MathRadical,
  MathRoundBrackets,
  MathSquareBrackets,
  MathCurlyBrackets,
  TextRun,
} from 'docx';

export interface DocxTextRunOptions {
  font?: string;
  size?: number; // half-points (e.g. 22 = 11pt, 24 = 12pt)
  color?: string;
  bold?: boolean;
  italics?: boolean;
}

// Replace common LaTeX symbols with Unicode math characters
function replaceLatexSymbols(text: string): string {
  return text
    .replace(/\\pm/g, '±')
    .replace(/\\mp/g, '∓')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\cdot/g, '·')
    .replace(/\\leq?/g, '≤')
    .replace(/\\geq?/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\infty/g, '∞')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\supset/g, '⊃')
    .replace(/\\cup/g, '∪')
    .replace(/\\cap/g, '∩')
    .replace(/\\emptyset/g, '∅')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\angle/g, '∠')
    .replace(/\\parallel/g, '∥')
    .replace(/\\perp/g, '⊥')
    .replace(/\\(?:to|rightarrow)/g, '→')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftrightarrow/g, '⇔')
    .replace(/\\sum/g, '∑')
    .replace(/\\int/g, '∫')
    .replace(/\\vec\{([^}]+)\}/g, '$1⃗')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1');
}

// Parse LaTeX tokens recursively into docx Math elements
export function parseLaTeXToDocxMathChildren(latex: string): any[] {
  const nodes: any[] = [];
  let idx = 0;
  const str = latex.trim();

  const getBracedContent = (startIdx: number): { content: string; nextIdx: number } => {
    let curr = startIdx;
    while (curr < str.length && str[curr] === ' ') curr++;
    if (str[curr] !== '{') {
      // Single character
      return { content: str[curr] || '', nextIdx: curr + 1 };
    }
    let depth = 1;
    curr++;
    const contentStart = curr;
    while (curr < str.length && depth > 0) {
      if (str[curr] === '{') depth++;
      else if (str[curr] === '}') depth--;
      curr++;
    }
    return { content: str.substring(contentStart, curr - 1), nextIdx: curr };
  };

  while (idx < str.length) {
    if (str.startsWith('\\frac', idx) || str.startsWith('\\dfrac', idx)) {
      const isDfrac = str.startsWith('\\dfrac', idx);
      idx += isDfrac ? 6 : 5;
      const numRes = getBracedContent(idx);
      idx = numRes.nextIdx;
      const denRes = getBracedContent(idx);
      idx = denRes.nextIdx;

      nodes.push(
        new MathFraction({
          numerator: parseLaTeXToDocxMathChildren(numRes.content),
          denominator: parseLaTeXToDocxMathChildren(denRes.content),
        })
      );
    } else if (str.startsWith('\\sqrt', idx)) {
      idx += 5;
      let degree: string | null = null;
      if (str[idx] === '[') {
        idx++;
        const degStart = idx;
        while (idx < str.length && str[idx] !== ']') idx++;
        degree = str.substring(degStart, idx);
        idx++;
      }
      const res = getBracedContent(idx);
      idx = res.nextIdx;

      nodes.push(
        new MathRadical({
          children: parseLaTeXToDocxMathChildren(res.content),
          ...(degree ? { degree: parseLaTeXToDocxMathChildren(degree) } : {}),
        })
      );
    } else if (str.startsWith('\\left(', idx)) {
      idx += 6;
      const start = idx;
      let depth = 1;
      while (idx < str.length && depth > 0) {
        if (str.startsWith('\\left(', idx)) depth++;
        else if (str.startsWith('\\right)', idx)) depth--;
        if (depth > 0) idx++;
      }
      const inner = str.substring(start, idx);
      if (str.startsWith('\\right)', idx)) idx += 7;

      nodes.push(
        new MathRoundBrackets({
          children: parseLaTeXToDocxMathChildren(inner),
        })
      );
    } else if (str.startsWith('\\left[', idx)) {
      idx += 6;
      const start = idx;
      let depth = 1;
      while (idx < str.length && depth > 0) {
        if (str.startsWith('\\left[', idx)) depth++;
        else if (str.startsWith('\\right]', idx)) depth--;
        if (depth > 0) idx++;
      }
      const inner = str.substring(start, idx);
      if (str.startsWith('\\right]', idx)) idx += 7;

      nodes.push(
        new MathSquareBrackets({
          children: parseLaTeXToDocxMathChildren(inner),
        })
      );
    } else if (str.startsWith('\\left\\{', idx)) {
      idx += 7;
      const start = idx;
      let depth = 1;
      while (idx < str.length && depth > 0) {
        if (str.startsWith('\\left\\{', idx)) depth++;
        else if (str.startsWith('\\right\\}', idx)) depth--;
        if (depth > 0) idx++;
      }
      const inner = str.substring(start, idx);
      if (str.startsWith('\\right\\}', idx)) idx += 8;

      nodes.push(
        new MathCurlyBrackets({
          children: parseLaTeXToDocxMathChildren(inner),
        })
      );
    } else if (str[idx] === '^' || str[idx] === '_') {
      const isSub = str[idx] === '_';
      idx++;
      const res = getBracedContent(idx);
      idx = res.nextIdx;

      const prev = nodes.pop() || new MathRun('');

      // Check if there is a following sub or super
      let secondIsSub: boolean | null = null;
      let secondContent: string | null = null;

      if (idx < str.length && (str[idx] === '^' || str[idx] === '_')) {
        secondIsSub = str[idx] === '_';
        idx++;
        const secondRes = getBracedContent(idx);
        idx = secondRes.nextIdx;
        secondContent = secondRes.content;
      }

      if (secondContent !== null) {
        const subContent = isSub ? res.content : secondContent;
        const superContent = isSub ? secondContent : res.content;
        nodes.push(
          new MathSubSuperScript({
            children: Array.isArray(prev) ? prev : [prev],
            subScript: parseLaTeXToDocxMathChildren(subContent),
            superScript: parseLaTeXToDocxMathChildren(superContent),
          })
        );
      } else if (isSub) {
        nodes.push(
          new MathSubScript({
            children: Array.isArray(prev) ? prev : [prev],
            subScript: parseLaTeXToDocxMathChildren(res.content),
          })
        );
      } else {
        nodes.push(
          new MathSuperScript({
            children: Array.isArray(prev) ? prev : [prev],
            superScript: parseLaTeXToDocxMathChildren(res.content),
          })
        );
      }
    } else {
      // Gather regular characters
      let seq = '';
      while (
        idx < str.length &&
        !str.startsWith('\\frac', idx) &&
        !str.startsWith('\\dfrac', idx) &&
        !str.startsWith('\\sqrt', idx) &&
        !str.startsWith('\\left', idx) &&
        str[idx] !== '^' &&
        str[idx] !== '_'
      ) {
        seq += str[idx];
        idx++;
      }

      if (seq) {
        const processed = replaceLatexSymbols(seq);
        nodes.push(new MathRun(processed));
      }
    }
  }

  return nodes.length > 0 ? nodes : [new MathRun('')];
}

export function parseLaTeXToDocxMath(latexStr: string): Math {
  const children = parseLaTeXToDocxMathChildren(latexStr);
  return new Math({ children });
}

// Convert a full string containing text and math ($...$, $$...$$, \(...\), \[...\], or raw LaTeX) into docx runs/Math objects
export function convertTextWithMathToDocxRuns(
  text: string = '',
  defaultOptions: DocxTextRunOptions = {}
): (TextRun | Math)[] {
  if (!text) return [];

  const font = defaultOptions.font || 'Times New Roman';
  const size = defaultOptions.size || 22;
  const color = defaultOptions.color;
  const bold = defaultOptions.bold;
  const italics = defaultOptions.italics;

  const result: (TextRun | Math)[] = [];

  // Match $$...$$, \[...\], $...$, \(...\)
  const mathRegex = /(\$\$.*?\$\$|\\\[.*?\\\]|\$.*?\$|\\\(.*?\\\))/gs;
  const parts = text.split(mathRegex);

  parts.forEach((part) => {
    if (!part) return;

    let isMath = false;
    let mathCode = '';

    if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
      isMath = true;
      mathCode = part.slice(2, -2).trim();
    } else if (part.startsWith('\\[') && part.endsWith('\\]') && part.length >= 4) {
      isMath = true;
      mathCode = part.slice(2, -2).trim();
    } else if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      isMath = true;
      mathCode = part.slice(1, -1).trim();
    } else if (part.startsWith('\\(') && part.endsWith('\\)') && part.length >= 4) {
      isMath = true;
      mathCode = part.slice(2, -2).trim();
    }

    if (isMath && mathCode) {
      try {
        result.push(parseLaTeXToDocxMath(mathCode));
      } catch (e) {
        result.push(new TextRun({ text: mathCode, font, size, color, bold, italics }));
      }
      return;
    }

    // Check if non-delimited text has raw LaTeX commands like \frac, \sqrt, \pm, \Delta, x^2
    const hasRawLatex = /\\(frac|dfrac|sqrt|pm|times|div|cdot|le|leq|ge|geq|neq|approx|Delta|alpha|beta|pi|infty|int|sum)/.test(part);

    if (hasRawLatex) {
      const latexSubRegex = /(\\(?:frac|dfrac|sqrt|pm|times|div|cdot|le|leq|ge|geq|neq|approx|Delta|alpha|beta|pi|infty|int|sum)(?:\{[^{}]*\}|\[[^[\]]*\]|[\w\d\+\-\*\/=])*(?:(?:\^|\_)(?:\{[^{}]*\}|[\w\d]))*)/g;
      const subParts = part.split(latexSubRegex);

      subParts.forEach((sub) => {
        if (!sub) return;
        if (/^\\(frac|dfrac|sqrt|pm|times|div|cdot|le|leq|ge|geq|neq|approx|Delta|alpha|beta|pi|infty|int|sum)/.test(sub)) {
          try {
            result.push(parseLaTeXToDocxMath(sub));
          } catch (e) {
            result.push(new TextRun({ text: sub, font, size, color, bold, italics }));
          }
        } else {
          result.push(new TextRun({ text: sub, font, size, color, bold, italics }));
        }
      });
    } else {
      result.push(new TextRun({ text: part, font, size, color, bold, italics }));
    }
  });

  return result;
}
