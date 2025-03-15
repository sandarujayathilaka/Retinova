import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Loader2, MoreHorizontal } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDeleteAdmin, useGetAdmins } from "@/services/admin.service";
import toast from "react-hot-toast";
import { FaUserDoctor } from "react-icons/fa6";
import DoctorForm from "./DoctorForm";
import ViewDoctor from "./ViewDoctor";
import { format } from "date-fns";
import AdminForm from "./AdminForm";

const AdminList = () => {
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
        <div className="flex gap-2 items-center">
          <Avatar className="size-8">
            <AvatarImage src={row.original.image?.Location} alt="@shadcn" />
            <AvatarFallback className="bg-gray-300">
              {row.original.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="capitalize font-semibold text-black/80">{row.getValue("name")}</div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => <SortableHeader column={column} title="Email" />,

      cell: ({ row }) => (
        <div className="lowercase text-sm text-blue-700">{row.getValue("email")}</div>
      ),
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
                  setAdminIdToView(row.original.id);
                  setIsViewDialogOpen(true);
                }}
              >
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setAdminIdToEdit(row.original.id);
                  setIsEditDialogOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setAdminIdToDelete(row.original.id);
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
  const [adminIdToDelete, setAdminIdToDelete] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [adminIdToEdit, setAdminIdToEdit] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminIdToView, setAdminIdToView] = useState(null);

  const { data: admins, isLoading } = useGetAdmins();
  const { mutate: deleteAdminMutation } = useDeleteAdmin();

  console.log(admins);

  const table = useReactTable({
    data: admins,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      return (
        row.original.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        row.original.email.toLowerCase().includes(filterValue.toLowerCase())
      );
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

  const handleDelete = adminId => {
    deleteAdminMutation(adminId, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setAdminIdToDelete(null);
        toast.success("Admin deleted successfully.");
      },
      onError: error => {
        console.error(error);
        toast.error("An error occurred while deleting the admin.");
      },
    });
  };

  if (isLoading) {
    return <Loader2 className="animate-spin size-8 mt-4" />;
  }

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <div className="text-2xl font-medium text-black/70">
            <FaUserDoctor className="inline-block size-10 mr-2 text-blue-500" />
            {admins?.length} Admins
          </div>
          <AdminForm mode="add" />
        </div>
        <div className="flex items-center py-4">
          <Input
            placeholder="Search by name or email"
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
      <AdminForm
        mode="edit"
        adminId={adminIdToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <ConfirmDialog
        onSuccess={() => handleDelete(adminIdToDelete)}
        title="admin"
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
      <ViewDoctor
        adminId={adminIdToView}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        trigger={"View"}
      />
    </>
  );
};

export default AdminList;
