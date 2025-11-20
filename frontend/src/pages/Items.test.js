import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Items from './Items';
import { useData } from '../state/DataContext';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the useData hook
jest.mock('../state/DataContext', () => ({
  useData: jest.fn(),
}));

// Mock react-window FixedSizeList
jest.mock('react-window', () => ({
    List: ({ children, itemCount, itemSize, height, width }) => {
      const Child = children;
      return (
        <div data-testid="fixed-size-list" style={{ height, width }}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <Child key={index} index={index} style={{ height: itemSize, width: '100%' }} />
          ))}
        </div>
      );
    },
}));

const mockItems = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
];

describe('Items Component', () => {
  beforeEach(() => {
    useData.mockReset();
  });

  it('should display loading state initially', () => {
    useData.mockReturnValue({
      items: [],
      totalItems: 0,
      fetchItems: jest.fn(() => new Promise(() => {})), // Never resolve to keep it in loading
    });

    render(
        <Router>
            <Items />
        </Router>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display items after fetching', async () => {
    useData.mockReturnValue({
      items: mockItems,
      totalItems: mockItems.length,
      fetchItems: jest.fn(() => Promise.resolve()),
    });

    render(
        <Router>
            <Items />
        </Router>
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should handle search input', async () => {
    const fetchItemsMock = jest.fn(() => Promise.resolve());
    useData.mockReturnValue({
      items: mockItems,
      totalItems: mockItems.length,
      fetchItems: fetchItemsMock,
    });

    render(
        <Router>
            <Items />
        </Router>
    );

    const searchInput = screen.getByPlaceholderText('Search items...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Expect fetchItems to be called with the search query after debounce
    await waitFor(() => {
      expect(fetchItemsMock).toHaveBeenCalledWith(expect.any(Object), 1, 10, 'test');
    }, { timeout: 1000 }); // Adjust timeout if debounce time changes
  });

  it('should handle pagination buttons', async () => {
    const fetchItemsMock = jest.fn();
    useData.mockReturnValue({
      items: mockItems,
      totalItems: 30, // Simulate more items for pagination
      fetchItems: fetchItemsMock,
    });

    render(
        <Router>
            <Items />
        </Router>
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    const nextPageButton = screen.getByText('Next Page');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(fetchItemsMock).toHaveBeenCalledWith(expect.any(Object), 2, 10, '');
    });

    const prevPageButton = screen.getByText('Previous Page');
    fireEvent.click(prevPageButton);

    await waitFor(() => {
        expect(fetchItemsMock).toHaveBeenCalledWith(expect.any(Object), 1, 10, '');
      });
  });

  it('should display empty state when no items are found', async () => {
    useData.mockReturnValue({
      items: [],
      totalItems: 0,
      fetchItems: jest.fn(() => Promise.resolve()),
    });

    render(
        <Router>
            <Items />
        </Router>
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    expect(screen.getByText('No items found.')).toBeInTheDocument();
  });
});
