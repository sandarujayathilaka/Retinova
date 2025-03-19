import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Loader2, MoreHorizontal, Search, TestTube, Beaker } from "lucide-react";
import { useState } from "react";

import SortableHeader from "@/components/data-table/SortableHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ConfirmDialog from "@/components/dialogs/ConfirmDialog";
import { useDeleteTest, useGetTests, useUpdateTest } from "@/services/test.service";
import toast from "react-hot-toast";
import TestForm from "./TestForm";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TablePagination from "@/components/data-table/TablePagination";

const TestList = () => {
  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Test Name" />,
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700">
            <Beaker className="h-4 w-4" />
          </div>
          <div className="capitalize font-medium text-slate-800">{row.getValue("name")}</div>
        </div>
      ),
    },
    {
      accessorKey: "isEnabled",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const isEnabled = row.getValue("isEnabled");

        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isEnabled ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            }`}
          >
            {isEnabled ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader column={column} title="Date Added" />,
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        return (
          <div className="text-xs text-gray-600">
            {date ? format(new Date(date), "MMM d, yyyy hh:mm a") : "N/A"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setTestIdToEdit(row.original._id);
                  setIsEditDialogOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className={row.original?.isEnabled ? "text-amber-600" : "text-emerald-600"}
                onClick={() => handleStatusChange(row.original._id, row.original.isEnabled)}
              >
                {row.original?.isEnabled ? "Disable" : "Enable"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setTestIdToDelete(row.original._id);
                  setIsDeleteDialogOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testIdToDelete, setTestIdToDelete] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [testIdToEdit, setTestIdToEdit] = useState(null);

  const { data: tests, isLoading } = useGetTests();
  const { mutate: deleteTestMutation } = useDeleteTest();
  const { mutate: updateTestMutation } = useUpdateTest();

  const table = useReactTable({
    data: tests || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      return row.original.name.toLowerCase().includes(filterValue.toLowerCase());
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const handleDelete = testId => {
    console.log("Deleting test with ID:", testId);
    deleteTestMutation(testId, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setTestIdToDelete(null);
        toast.success("Test deleted successfully.");
      },
      onError: error => {
        console.error(error);
        toast.error("An error occurred while deleting the test.");
      },
    });
  };

  const handleStatusChange = (testId, isEnabled) => {
    // Update test status
    updateTestMutation(
      { id: testId, data: { isEnabled: !isEnabled } },
      {
        onSuccess: () => {
          toast.success(`Test ${isEnabled ? "disabled" : "enabled"} successfully.`);
        },
        onError: error => {
          console.error(error);
          toast.error("Failed to update test status. Please try again.");
        },
      },
    );
  };

  // Get test statistics
  const getTestStats = () => {
    if (!tests?.length) return { total: 0, active: 0, inactive: 0 };

    const total = tests.length;
    const active = tests.filter(test => test.isEnabled).length;
    const inactive = total - active;

    return { total, active, inactive };
  };

  const testStats = getTestStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-cyan-600" />
        <span className="ml-2 text-gray-600">Loading tests...</span>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-cyan-700 flex items-center">
            <TestTube className="h-6 w-6 mr-2" />
            Test Management
          </CardTitle>
          <TestForm mode="add" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4 flex items-center border border-slate-200 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center mr-3">
              <TestTube className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Total Tests</div>
              <div className="text-2xl font-bold text-slate-800">{testStats.total}</div>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 flex items-center border border-emerald-200 shadow-sm">
            {/* <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3">
              <span className="text-sm font-bold">A</span>
            </div> */}
            <div>
              <div className="text-sm text-emerald-700">Active Tests</div>
              <div className="text-2xl font-bold text-emerald-800">{testStats.active}</div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 flex items-center border border-red-200 shadow-sm">
            {/* <div className="h-10 w-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mr-3">
              <span className="text-sm font-bold">I</span>
            </div> */}
            <div>
              <div className="text-sm text-red-700">Inactive Tests</div>
              <div className="text-2xl font-bold text-red-800">{testStats.inactive}</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tests..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  Status <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => table.getColumn("isEnabled")?.setFilterValue(undefined)}
                >
                  All Tests
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => table.getColumn("isEnabled")?.setFilterValue(true)}
                >
                  Active Tests
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => table.getColumn("isEnabled")?.setFilterValue(false)}
                >
                  Inactive Tests
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  Columns <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={value => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id} className="font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <TestTube className="h-8 w-8 mb-2 opacity-50" />
                      <p>No tests found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <TablePagination table={table} />
      </CardContent>

      {/* Dialogs */}
      <TestForm
        mode="edit"
        testId={testIdToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <ConfirmDialog
        onSuccess={() => handleDelete(testIdToDelete)}
        title="test"
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </Card>
  );
};

export default TestList;
