import React from "react";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, total, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;
  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">Total: {total}</div>
      <div className="flex gap-2">
        {pageNumbers.map(num => (
          <button
            key={num}
            className={`px-3 py-1 rounded ${num === page ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"}`}
            onClick={() => onPageChange(num)}
            disabled={num === page}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
