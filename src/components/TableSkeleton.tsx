'use client';

import React from 'react';

export interface TableSkeletonCol {
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'badge' | 'avatar' | 'checkbox' | 'actions' | 'number';
  stickyRight?: boolean;
}

interface TableSkeletonProps {
  rows?: number;
  columns?: TableSkeletonCol[];
  colCount?: number;
}

export function TableSkeletonRows({
  rows = 7,
  columns,
  colCount = 6,
}: TableSkeletonProps) {
  const rowList = Array.from({ length: rows });

  // Default column widths if specific columns aren't provided
  const defaultCols: TableSkeletonCol[] = [
    { type: 'number', align: 'center', width: 'w-8' },
    { type: 'text', width: 'w-24' },
    { type: 'text', width: 'w-48' },
    { type: 'badge', align: 'center', width: 'w-16' },
    { type: 'badge', align: 'center', width: 'w-16' },
    { type: 'actions', align: 'right', stickyRight: true, width: 'w-20' },
  ];
  const cols: TableSkeletonCol[] = columns || defaultCols.slice(0, colCount);

  return (
    <>
      {rowList.map((_, rowIdx) => (
        <tr
          key={rowIdx}
          className="animate-pulse hover:bg-gray-50/20 dark:hover:bg-gray-800/20 transition-colors"
        >
          {cols.map((col, colIdx) => {
            const isLast = colIdx === cols.length - 1;
            const alignCls =
              col.align === 'center'
                ? 'text-center'
                : col.align === 'right'
                  ? 'text-right'
                  : 'text-left';

            const stickyCls = col.stickyRight
              ? 'sticky right-0 bg-white dark:bg-gray-900 z-10 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]'
              : '';

            return (
              <td
                key={colIdx}
                className={`px-3 py-2.5 align-middle border-b ${
                  !isLast ? 'border-r' : ''
                } border-gray-200 dark:border-gray-800 ${alignCls} ${stickyCls}`}
              >
                {col.type === 'checkbox' && (
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
                )}

                {col.type === 'number' && (
                  <div className="w-6 h-3.5 bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
                )}

                {col.type === 'avatar' && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-800 shrink-0" />
                    <div className="space-y-1">
                      <div className="w-20 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                      <div className="w-14 h-2 bg-gray-100 dark:bg-gray-850 rounded" />
                    </div>
                  </div>
                )}

                {col.type === 'badge' && (
                  <div
                    className={`${
                      col.width || 'w-14'
                    } h-4 bg-gray-200 dark:bg-gray-800 rounded mx-auto`}
                  />
                )}

                {col.type === 'actions' && (
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="w-12 h-5 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                )}

                {(!col.type || col.type === 'text') && (
                  <div className="space-y-1">
                    <div
                      className={`${
                        col.width || 'w-32'
                      } h-3.5 bg-gray-200 dark:bg-gray-800 rounded`}
                    />
                  </div>
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

export default TableSkeletonRows;
