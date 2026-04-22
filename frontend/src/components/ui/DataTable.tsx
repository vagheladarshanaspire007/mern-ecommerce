import { ReactNode } from 'react';

type Column<T> = {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  caption?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  skeletonRows?: number;
};

export function DataTable<T>({
  columns,
  data,
  caption,
  emptyMessage = 'No data available.',
  isLoading = false,
  skeletonRows = 4,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-700 bg-gray-800 shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-gray-900/70">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-indigo-300 ${column.className ?? ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                  {columns.map((column, columnIndex) => (
                    <td
                      key={`${String(column.key)}-${columnIndex}`}
                      className={`px-6 py-4 align-middle ${column.className ?? ''}`}
                    >
                      <div className="h-5 rounded-full bg-gray-700" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="transition hover:bg-gray-700/40">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 align-middle text-sm text-gray-200 ${column.className ?? ''}`}
                    >
                      {column.render
                        ? column.render(row)
                        : String(row[column.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-sm text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type { Column };
