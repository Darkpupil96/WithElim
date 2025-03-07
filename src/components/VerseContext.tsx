// VerseContext.tsx
import React, { createContext, useContext, useState } from "react";

interface Verse {
  version: string;
  b: number;
  c: number;
  v: number;
  t: string;
}

interface VerseContextType {
  selectedVerse: Verse | null;
  setSelectedVerse: (verse: Verse | null) => void;
  handleSearchResultSelect: (verse: Verse) => void;
}

interface VerseProviderProps {
  children: React.ReactNode;
  // 可选：父组件（比如 BibleApp）可以传入一个回调
  onSelectVerse?: (verse: Verse) => void;
}

const VerseContext = createContext<VerseContextType | undefined>(undefined);

export const VerseProvider: React.FC<VerseProviderProps> = ({
  children,
  onSelectVerse,
}) => {
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  // 内部的 handleSearchResultSelect
  const handleSearchResultSelect = (verse: Verse) => {
    // 1. 自己更新本地状态
    setSelectedVerse(verse);
    // 2. 如果父组件传了 onSelectVerse，就调用它
    if (onSelectVerse) {
      onSelectVerse(verse);
    }
  };

  return (
    <VerseContext.Provider
      value={{ selectedVerse, setSelectedVerse, handleSearchResultSelect }}
    >
      {children}
    </VerseContext.Provider>
  );
};

export const useVerseContext = (): VerseContextType => {
  const context = useContext(VerseContext);
  if (!context) {
    throw new Error("useVerseContext 必须在 VerseProvider 内使用");
  }
  return context;
};

