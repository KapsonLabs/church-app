import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  ColumnSizingState,
  ColumnResizeMode,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Settings, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  stickyColumns?: string[];
  maxVisibleColumns?: number;
  enableHorizontalScroll?: boolean;
  showColumnVisibility?: boolean;
  showAllColumns?: boolean;
  className?: string;
  getRowClassName?: (row: TData) => string;
}

export function AdvancedTable<TData>({
  data,
  columns,
  stickyColumns = [],
  maxVisibleColumns = 4,
  enableHorizontalScroll = false,
  showColumnVisibility = true,
  showAllColumns = false,
  className,
  getRowClassName,
}: AdvancedTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [currentColumnPage, setCurrentColumnPage] = useState(0);
  const [globalFilter, setGlobalFilter] = useState('');
  const [keyboardFocus, setKeyboardFocus] = useState<{
    row: number;
    column: string;
  } | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const tableRef = React.useRef<HTMLDivElement>(null);

  // Calculate which columns to show based on pagination or horizontal scroll
  const visibleColumns = useMemo(() => {
    const allColumns = columns.filter(col => {
      const id = typeof col.id === 'string' ? col.id : '';
      return columnVisibility[id] !== false;
    });

    if (enableHorizontalScroll || showAllColumns) {
      // For horizontal scroll or showAllColumns, show all columns
      return allColumns;
    }

    // For column pagination (original logic)
    const sticky = allColumns.filter(col => {
      const id = typeof col.id === 'string' ? col.id : '';
      return stickyColumns.includes(id);
    });

    const nonSticky = allColumns.filter(col => {
      const id = typeof col.id === 'string' ? col.id : '';
      return !stickyColumns.includes(id);
    });

    const maxNonSticky = Math.max(0, maxVisibleColumns - sticky.length);
    const startIndex = currentColumnPage * maxNonSticky;
    const paginatedNonSticky = nonSticky.slice(startIndex, startIndex + maxNonSticky);

    return [...sticky, ...paginatedNonSticky];
  }, [columns, columnVisibility, currentColumnPage, maxVisibleColumns, stickyColumns, enableHorizontalScroll, showAllColumns]);

  const table = useReactTable({
    data,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode,
    state: {
      columnVisibility,
      globalFilter,
      columnSizing,
    },
    onGlobalFilterChange: setGlobalFilter,
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 50,
      maxSize: 500,
    },
  });

  // Calculate total column pages (only for pagination mode)
  const nonStickyColumns = columns.filter(col => {
    const id = typeof col.id === 'string' ? col.id : '';
    return !stickyColumns.includes(id) && columnVisibility[id] !== false;
  });
  const maxNonStickyPerPage = Math.max(0, maxVisibleColumns - stickyColumns.length);
  const totalColumnPages = (enableHorizontalScroll || showAllColumns) ? 0 : Math.ceil(nonStickyColumns.length / maxNonStickyPerPage);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!keyboardFocus) return;

    const { row, column } = keyboardFocus;
    const visibleColumnIds = table.getVisibleFlatColumns().map(col => col.id);
    const currentColIndex = visibleColumnIds.indexOf(column);

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (row > 0) {
          setKeyboardFocus({ row: row - 1, column });
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (row < data.length - 1) {
          setKeyboardFocus({ row: row + 1, column });
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (currentColIndex > 0) {
          setKeyboardFocus({ row, column: visibleColumnIds[currentColIndex - 1] });
        } else if (!enableHorizontalScroll && currentColumnPage > 0) {
          setCurrentColumnPage(prev => prev - 1);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (currentColIndex < visibleColumnIds.length - 1) {
          setKeyboardFocus({ row, column: visibleColumnIds[currentColIndex + 1] });
        } else if (!enableHorizontalScroll && currentColumnPage < totalColumnPages - 1) {
          setCurrentColumnPage(prev => prev + 1);
        }
        break;
      case 'PageUp':
        event.preventDefault();
        if (!enableHorizontalScroll && currentColumnPage > 0) {
          setCurrentColumnPage(prev => prev - 1);
        }
        break;
      case 'PageDown':
        event.preventDefault();
        if (!enableHorizontalScroll && currentColumnPage < totalColumnPages - 1) {
          setCurrentColumnPage(prev => prev + 1);
        }
        break;
    }
  }, [keyboardFocus, table, data.length, currentColumnPage, totalColumnPages, enableHorizontalScroll]);

  // Horizontal scroll functions
  const scrollLeft = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (tableRef.current) {
      setScrollPosition(tableRef.current.scrollLeft);
    }
  };

  // Check if we can scroll further
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = tableRef.current ? 
    tableRef.current.scrollLeft < (tableRef.current.scrollWidth - tableRef.current.clientWidth) : 
    false;

  // Add scroll event listener
  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement && enableHorizontalScroll) {
      tableElement.addEventListener('scroll', handleScroll);
      return () => tableElement.removeEventListener('scroll', handleScroll);
    }
  }, [enableHorizontalScroll]);

  // Update scroll state on mount
  useEffect(() => {
    if (tableRef.current && enableHorizontalScroll) {
      handleScroll();
    }
  }, [enableHorizontalScroll]);

  return (
    <div className={cn('space-y-4 w-full', className)}>
      {/* Table Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Find anything..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8 w-full md:w-80"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Column Pagination - only show when not using horizontal scroll */}
          {!enableHorizontalScroll && totalColumnPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentColumnPage(prev => Math.max(0, prev - 1))}
                disabled={currentColumnPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentColumnPage + 1} / {totalColumnPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentColumnPage(prev => Math.min(totalColumnPages - 1, prev + 1))}
                disabled={currentColumnPage === totalColumnPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Horizontal Scroll Controls */}
          {enableHorizontalScroll && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Scroll
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollRight}
                disabled={!canScrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Column Visibility */}
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {columns.map((column) => {
                  const id = typeof column.id === 'string' ? column.id : '';
                  const header = typeof column.header === 'string' ? column.header : id;
                  
                  return (
                    <DropdownMenuCheckboxItem
                      key={id}
                      className="capitalize"
                      checked={columnVisibility[id] !== false}
                      onCheckedChange={(value) =>
                        setColumnVisibility(prev => ({ ...prev, [id]: value }))
                      }
                      disabled={stickyColumns.includes(id)}
                    >
                      {header}
                      {stickyColumns.includes(id) && (
                        <span className="ml-2 text-xs text-muted-foreground">(pinned)</span>
                      )}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div 
        ref={tableRef}
        className={cn(
          "rounded-md border bg-card overflow-auto max-w-full",
          enableHorizontalScroll && "table-scroll-container"
        )} 
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        tabIndex={0}
      >
        <table className={cn(
          "w-full table-auto",
          !enableHorizontalScroll && "max-w-full"
        )}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-table-header">
                {headerGroup.headers.map((header, index) => {
                  const isSticky = stickyColumns.includes(header.id);
                  const stickyIndex = stickyColumns.indexOf(header.id);
                  
                  // Calculate left position based on previous sticky columns
                  let leftPosition = 0;
                  if (isSticky && stickyIndex > 0) {
                    for (let i = 0; i < stickyIndex; i++) {
                      const prevStickyId = stickyColumns[i];
                      const prevHeader = headerGroup.headers.find(h => h.id === prevStickyId);
                      leftPosition += prevHeader?.getSize() || 80;
                    }
                  }
                  
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'h-10 px-3 text-left align-middle font-medium text-muted-foreground relative',
                        isSticky && 'sticky-header'
                      )}
                      style={{
                        ...(isSticky ? { 
                          left: `${leftPosition}px`,
                        } : {}),
                        width: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      
                      {/* Column Resize Handle */}
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary/50',
                          header.column.getIsResizing() && 'bg-primary opacity-100'
                        )}
                        style={{
                          transform: header.column.getIsResizing()
                            ? `translateX(${table.getState().columnSizingInfo.deltaOffset}px)`
                            : '',
                        }}
                      />
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'border-b transition-colors hover:bg-table-row-hover data-[state=selected]:bg-table-row-selected',
                    keyboardFocus?.row === rowIndex && 'ring-1 ring-ring',
                    getRowClassName && getRowClassName(row.original)
                  )}
                  onClick={() => setKeyboardFocus({ row: rowIndex, column: table.getVisibleFlatColumns()[0].id })}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isSticky = stickyColumns.includes(cell.column.id);
                    const stickyIndex = stickyColumns.indexOf(cell.column.id);
                    
                    // Calculate left position based on previous sticky columns
                    let leftPosition = 0;
                    if (isSticky && stickyIndex > 0) {
                      for (let i = 0; i < stickyIndex; i++) {
                        const prevStickyId = stickyColumns[i];
                        const prevCell = row.getVisibleCells().find(c => c.column.id === prevStickyId);
                        leftPosition += prevCell?.column.getSize() || 80;
                      }
                    }
                    
                    const isFocused = keyboardFocus?.row === rowIndex && keyboardFocus?.column === cell.column.id;
                    
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          'px-1 py-1 align-middle',
                          isSticky && 'sticky-column',
                          isFocused && 'ring-2 ring-ring ring-inset'
                        )}
                        style={{
                          ...(isSticky ? { 
                            left: `${leftPosition}px`,
                          } : {}),
                          width: cell.column.getSize(),
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setKeyboardFocus({ row: rowIndex, column: cell.column.id });
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleColumns.length} className="h-16 px-3 py-2 text-center">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {table.getRowModel().rows.length} of {data.length} transactions
        </div>
        <div className="flex items-center space-x-4">
          <div>
            Columns: {table.getVisibleFlatColumns().length} of {columns.length} visible
            {enableHorizontalScroll && " (scroll horizontally to see more)"}
          </div>
          {!enableHorizontalScroll && totalColumnPages > 1 && (
            <div>
              Column page: {currentColumnPage + 1} of {totalColumnPages}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}