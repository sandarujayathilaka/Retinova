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
import { useDeleteDoctor, useGetDoctors } from "@/services/doctor.service";
import toast from "react-hot-toast";
import { FaUserDoctor } from "react-icons/fa6";
import DoctorForm from "./DoctorForm";

const List = () => {
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
            <AvatarImage src={row.original.image.Location} alt="@shadcn" />
            <AvatarFallback className="bg-gray-300">
              {row.original.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="capitalize font-semibold text-black/80">{row.getValue("name")}</div>
            <div className="text-sm text-muted-foreground">{row.original.specialty}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => <SortableHeader column={column} title="Email" />,

      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="font-medium text-black/70">{row.original.phone}</div>
          <div className="lowercase text-sm text-blue-700">{row.getValue("email")}</div>
        </div>
      ),
    },
    {
      accessorKey: "workingHours",
      header: ({ column }) => {
        return <Button variant="ghost">Working Days</Button>;
      },

      cell: ({ row }) => {
        const workingDays = row.original.workingHours;

        return (
          <div className="flex gap-1">
            {Object.keys(workingDays).map((day, index) => {
              const { enabled } = workingDays[day];

              return (
                <div
                  key={index}
                  className={`rounded-full text-xs leading-3 select-none size-6 flex items-center justify-center ${
                    enabled ? "bg-blue-400 text-white" : "bg-slate-300"
                  }`}
                >
                  <span>{day?.charAt(0)?.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => <SortableHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <div
          className={`uppercase inline-block px-2 py-1 rounded-lg text-xs font-semibold ${row.getValue("type").toLowerCase() === "full time" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}
        >
          {row.getValue("type")}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
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
                  setDoctorIdToEdit(row.original._id);
                  setIsEditDialogOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDoctorIdToDelete(row.original._id);
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
  const [doctorIdToDelete, setDoctorIdToDelete] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [doctorIdToEdit, setDoctorIdToEdit] = useState(null);

  const { data: doctors, isLoading } = useGetDoctors();
  const { mutate: deleteDoctorMutation } = useDeleteDoctor();

  console.log(doctors);

  const table = useReactTable({
    data: doctors,
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

  const handleDelete = doctorId => {
    deleteDoctorMutation(doctorId, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setDoctorIdToDelete(null);
        toast.success("Doctor deleted successfully.");
      },
      onError: error => {
        console.error(error);
        toast.error("An error occurred while deleting the doctor.");
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
            {doctors?.length} Doctors
          </div>
          <DoctorForm mode="add" />
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
      <DoctorForm
        mode="edit"
        doctorId={doctorIdToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <ConfirmDialog
        onSuccess={() => handleDelete(doctorIdToDelete)}
        title="doctor"
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
};

export default List;
