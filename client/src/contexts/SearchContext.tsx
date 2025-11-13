/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface SearchContextType {
  searchRoom: any | null;
  setSearchRoom: React.Dispatch<React.SetStateAction<any | null>>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {

  const [searchRoom, setSearchRoom] = React.useState<any | null>({});

  const value: SearchContextType = {
    searchRoom,
    setSearchRoom
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
export default SearchContext;