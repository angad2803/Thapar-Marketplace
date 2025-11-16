import React from "react";

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded-md overflow-hidden">{children}</table>;
}

export function Thead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>;
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="border-b last:border-b-0">{children}</tr>;
}

export function Th({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200" {...props}>{children}</th>;
}

export function Td({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100" {...props}>{children}</td>;
}
