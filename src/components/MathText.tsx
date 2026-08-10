import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'li' | 'td' | 'th';
}

export const MathText: React.FC<MathTextProps> = ({ text = '', className = '', as = 'span' }) => {
  if (!text) return null;

  // Split text by block math $$...$$ or \[...\] and inline math $...$ or \(...\)
  const mathRegex = /(\$\$.*?\$\$|\\\[.*?\\\]|\$.*?\$|\\\(.*?\\\))/gs;

  const parts = text.split(mathRegex);

  const Component = as as any;

  // Helper to render KaTeX safely
  const renderKaTeX = (code: string, displayMode: boolean, key: string | number) => {
    try {
      const html = katex.renderToString(code, {
        displayMode,
        throwOnError: false,
      });
      return (
        <span
          key={key}
          className={displayMode ? 'block my-2 text-center overflow-x-auto py-1' : 'inline-block px-0.5 align-middle'}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch (err) {
      return <span key={key} className="font-mono text-amber-600">{code}</span>;
    }
  };

  // Helper to detect and render standalone LaTeX commands if missing $...$
  const renderTextSegment = (segment: string, baseKey: number) => {
    // If string has unformatted LaTeX like \frac{a}{b}, \sqrt{x}, \pm, \Delta, \alpha, etc.
    const hasLatexCmd = /\\(frac|dfrac|sqrt|pm|times|div|cdot|le|leq|ge|geq|neq|approx|Delta|alpha|beta|pi|infty|int|sum|vec|angle)/.test(segment);
    if (!hasLatexCmd) {
      return <React.Fragment key={baseKey}>{segment}</React.Fragment>;
    }

    // Attempt to match LaTeX expressions inside segment
    const latexExprRegex = /(\\(?:frac|dfrac|sqrt|pm|times|div|cdot|le|leq|ge|geq|neq|approx|Delta|alpha|beta|pi|infty|int|sum|vec|angle)(?:\{[^{}]*\}|\[[^[\]]*\]|[\w\d\+\-\*\/=])*(?:(?:\^|\_)(?:\{[^{}]*\}|[\w\d]))*)/g;

    const subParts = segment.split(latexExprRegex);
    return (
      <React.Fragment key={baseKey}>
        {subParts.map((sub, i) => {
          if (!sub) return null;
          if (/^\\(frac|dfrac|sqrt|pm|times|div|cdot|le|leq|ge|geq|neq|approx|Delta|alpha|beta|pi|infty|int|sum|vec|angle)/.test(sub)) {
            return renderKaTeX(sub, false, `${baseKey}-${i}`);
          }
          return <span key={`${baseKey}-${i}`}>{sub}</span>;
        })}
      </React.Fragment>
    );
  };

  return (
    <Component className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        let isBlockMath = false;
        let isInlineMath = false;
        let mathCode = '';

        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          isBlockMath = true;
          mathCode = part.slice(2, -2).trim();
        } else if (part.startsWith('\\[') && part.endsWith('\\]') && part.length >= 4) {
          isBlockMath = true;
          mathCode = part.slice(2, -2).trim();
        } else if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          isInlineMath = true;
          mathCode = part.slice(1, -1).trim();
        } else if (part.startsWith('\\(') && part.endsWith('\\)') && part.length >= 4) {
          isInlineMath = true;
          mathCode = part.slice(2, -2).trim();
        }

        if (isBlockMath || isInlineMath) {
          return renderKaTeX(mathCode, isBlockMath, index);
        }

        return renderTextSegment(part, index);
      })}
    </Component>
  );
};
