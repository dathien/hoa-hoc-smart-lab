import React, { createContext, useContext } from 'react';
import { HelpCircle } from 'lucide-react';

export interface GuideContextValue {
  isGuideOpen: boolean;
  activeChapterId: string | null;
  openGuide: (chapterId?: string, originLabel?: string) => void;
  closeGuide: () => void;
}

const GuideContext = createContext<GuideContextValue>({
  isGuideOpen: false,
  activeChapterId: null,
  openGuide: () => {},
  closeGuide: () => {},
});

export const GuideProvider: React.FC<{
  value: GuideContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>;
};

export function useGuide(): GuideContextValue {
  return useContext(GuideContext);
}

interface ContextualGuideButtonProps {
  chapterId: string;
  originLabel?: string;
  label?: string;
  compact?: boolean;
  className?: string;
}

export const ContextualGuideButton: React.FC<ContextualGuideButtonProps> = ({
  chapterId,
  originLabel,
  label = 'Hướng dẫn',
  compact = false,
  className = '',
}) => {
  const { openGuide } = useGuide();

  return (
    <button
      type="button"
      onClick={() => openGuide(chapterId, originLabel)}
      title="Mở hướng dẫn sử dụng chi tiết cho chức năng này"
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg border border-teal-200 bg-teal-50/80 hover:bg-teal-100 text-teal-800 transition-colors whitespace-nowrap shrink-0 ${
        compact ? 'px-2.5 py-1.5 text-xs min-h-[36px]' : 'px-3 py-2 text-xs sm:text-sm min-h-[40px]'
      } ${className}`}
    >
      <HelpCircle className="w-4 h-4 text-teal-700 shrink-0" />
      <span>{label}</span>
    </button>
  );
};
