import React, { useEffect, useState, useRef, useCallback } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import { getScrollbarSize, List, Grid } from "react-window";

const PAGE_SIZE = 10; // Define a page size

function Items() {
  const { items, totalItems, fetchItems } = useData();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [size] = useState(getScrollbarSize);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q);
    }, 500); // 500ms debounce
    return () => {
      clearTimeout(handler);
    };
  }, [q]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchItems(controller.signal, page, PAGE_SIZE, debouncedQ)
      .finally(() => setLoading(false))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      });
    return () => {
      controller.abort();
    };
  }, [fetchItems, page, debouncedQ]);

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  function RowComponent({ index, addresses, style }) {
    const address = items[index];

    return (
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #ccc",
          padding: "8px 0",
        }}
      >
        <div style={{ width: "10%", padding: "0 8px" }}>{address.id}</div>
        <div style={{ width: "40%", padding: "0 8px" }}>{address.name}</div>
        <div style={{ width: "30%", padding: "0 8px" }}>{address.category}</div>
        <div style={{ width: "30%", padding: "0 8px" }}>{address.price}</div>
      </div>
    );
  }

  return (
    <div>
      <h1>Items</h1>
      <input
        type="text"
        width="50%"
        placeholder="Search items by Name..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {loading && <p>Loading...</p>}
      {!loading && items.length === 0 && <p>No items found.</p>}
      {!loading && items.length > 0 && (
        <>
        
          <div
            style={{
              display: "flex",
              fontWeight: "bold",
              borderBottom: "2px solid #ccc",
              padding: "8px 0",
              backgroundColor: "#77daf0ff",
              borderRadius: "4px",
              marginTop: "8px",
              padding: "8px",
            }}
          >
            <div style={{ width: "10%" }}>ID</div>

            <div style={{ width: "40%", padding: "0 8px" }}>Name</div>
            <div style={{ width: "30%", padding: "0 8px" }}>Category</div>
            <div style={{ width: "30%", padding: "0 8px" }}>Price</div>
          </div>

          <List
            rowComponent={RowComponent}
            rowCount={items.length}
            rowHeight={5}
            rowProps={{ items }}
          />

          <div>
            <button onClick={handlePrevPage} disabled={page === 1}>
              Previous Page
            </button>
            <span>
              {" "}
              Page {page} of {totalPages}{" "}
            </span>
            <button onClick={handleNextPage} disabled={page === totalPages}>
              Next Page
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Items;
