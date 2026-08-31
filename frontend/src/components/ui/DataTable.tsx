import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  readonly columns: DataTableColumn<T>[];
  readonly data: T[];
  readonly loading?: boolean;
  readonly emptyMessage?: string;
  readonly getRowKey: (row: T) => string;
}

export function DataTable<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found.',
  getRowKey,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left text-sm font-medium"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr
                key={`loading-row-${rowIndex}`}
                className="border-b"
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border">
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-4 py-3 text-left text-sm font-medium"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={getRowKey(row)} className="border-b">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-4 py-4 text-sm"
                >
                  {column.render
                    ? column.render(row)
                    : String(row[column.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}