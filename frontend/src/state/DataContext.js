import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async (signal, page = 1, limit = 10, q = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (q) {
      params.append('q', q);
    }
    const res = await fetch(`http://localhost:3001/api/items?${params.toString()}`);
    const json = await res.json();
    setItems(json.items);
    setTotalItems(json.total);
  }, []);

  return (
    <DataContext.Provider value={{ items, totalItems, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
