import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Loader2, MoreHorizontal, TestTube } from "lucide-react";
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
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="capitalize font-semibold text-black/80">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "isEnabled",
      header: ({ column }) => <SortableHeader column={column} title="Active" />,
      cell: ({ row }) => {
        const isEnabled = row.getValue("isEnabled");

        return (
          <div
            className={`w-fit px-2 py-1 rounded-md text-sm font-medium ${
              isEnabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isEnabled ? "Active" : "Inactive"}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader column={column} title="Date Added" />,
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        return (
          <div className="uppercase text-xs font-semibold text-gray-600">
            {date ? format(new Date(date), "MMM d, yyyy hh:mm a") : "N/A"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                onClick={() => handleStatusChange(row.original._id, row.original.isEnabled)}
              >
                {row.original?.isEnabled ? "Disable" : "Enable"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTestIdToDelete(row.original.id);
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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testIdToDelete, setTestIdToDelete] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [testIdToEdit, setTestIdToEdit] = useState(null);

  const { data: tests, isLoading } = useGetTests();
  const { mutate: deleteTestMutation } = useDeleteTest();
  const { mutate: updateTestMutation } = useUpdateTest();

  console.log(tests);

  const table = useReactTable({
    data: tests,
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
    },
  });

  const handleDelete = testId => {
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
          toast.success("Test status updated successfully.");
        },
        onError: error => {
          console.error(error);
          toast.error("Failed to update test status. Please try again.");
        },
      },
    );
  };

  if (isLoading) {
    return <Loader2 className="animate-spin size-8 mt-4" />;
  }

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <div className="text-2xl font-medium text-black/70">
            <TestTube className="inline-block size-8 mr-2 text-blue-500" />
            {tests?.length} Tests
          </div>
          <TestForm mode="add" />
        </div>
        <div className="flex items-center py-4">
          <Input
            placeholder="Search by name"
            value={table.getState().globalFilter ?? ""}
            onChange={event => table.setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id}>
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
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
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
    </>
  );
};

export default TestList;
