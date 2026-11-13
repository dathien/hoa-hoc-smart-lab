import React, { useMemo } from 'react';
import { renderMixedOrRichHtml } from '../../utils/chemSyntax';

interface ChemFormulaProps {
  formula: string;
  isBlock?: boolean;
  className?: string;
}

/**
 * ChemFormula & RichChemContent renders chemical formulas, reactions, math equations,
 * 2D organic structures, and rich HTML nodes safely using KaTeX + SVG hydration.
 */
export const ChemFormula: React.FC<ChemFormulaProps> = ({
  formula,
  isBlock = false,
  className = '',
}) => {
  const renderedHtml = useMemo(() => {
    return renderMixedOrRichHtml(formula, isBlock);
  }, [formula, isBlock]);

  if (isBlock) {
    return (
      <div
        className={`chem-rich-display overflow-x-auto py-1 text-slate-900 ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return (
    <span
      className={`chem-rich-display inline ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
