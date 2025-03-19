import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Loader2, MoreHorizontal, Search } from "lucide-react";
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
import toast from "react-hot-toast";
import { useDeleteNurse, useGetNurses } from "@/services/nurse.service";
import { FaUserNurse } from "react-icons/fa";
import NurseForm from "./NurseForm";
import ViewNurse from "./ViewNurse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TablePagination from "@/components/data-table/TablePagination";

const NurseList = () => {
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
            <AvatarImage src={row.original.image?.Location} alt={row.original.name} />
            <AvatarFallback className="bg-violet-100 text-violet-800">
              {row.original.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="capitalize font-medium text-black/80">{row.getValue("name")}</div>
            <div className="text-xs text-slate-500">{row.original.specialty}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => <SortableHeader column={column} title="Contact" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="font-medium text-slate-700 text-sm">{row.original.phone}</div>
          <div className="text-sm text-blue-600">{row.getValue("email")}</div>
        </div>
      ),
    },
    {
      accessorKey: "workingHours",
      header: ({ column }) => <SortableHeader column={column} title="Working Days" />,
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
                    enabled ? "bg-violet-500 text-white shadow-sm" : "bg-slate-200 text-slate-500"
                  }`}
                  title={`${day}: ${enabled ? "Working" : "Off"}`}
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
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.getValue("type").toLowerCase() === "full time"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {row.getValue("type")}
        </span>
      ),
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
                  setNurseIdToView(row.original._id);
                  setIsViewDialogOpen(true);
                }}
              >
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setNurseIdToEdit(row.original._id);
                  setIsEditDialogOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setNurseIdToDelete(row.original._id);
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
  const [nurseIdToDelete, setNurseIdToDelete] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [nurseIdToEdit, setNurseIdToEdit] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [nurseIdToView, setNurseIdToView] = useState(null);

  const { data: nurses, isLoading } = useGetNurses();
  const { mutate: deleteNurseMutation } = useDeleteNurse();

  const table = useReactTable({
    data: nurses || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchableValues = [
        row.original.name,
        row.original.email,
        row.original.specialty,
        row.original.type,
      ].filter(Boolean);

      return searchableValues.some(value =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
      );
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

  const handleDelete = nurseId => {
    deleteNurseMutation(nurseId, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setNurseIdToDelete(null);
        toast.success("Nurse deleted successfully.");
      },
      onError: error => {
        console.error(error);
        toast.error("An error occurred while deleting the nurse.");
      },
    });
  };

  // Get nurse statistics
  const getNurseStats = () => {
    if (!nurses?.length) return {};

    const fullTime = nurses.filter(nurse => nurse.type?.toLowerCase() === "full time").length;

    const partTime = nurses.filter(nurse => nurse.type?.toLowerCase() === "part time").length;

    return { fullTime, partTime };
  };

  const nurseStats = getNurseStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-violet-600" />
        <span className="ml-2 text-gray-600">Loading nurses...</span>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-violet-700 flex items-center">
            <FaUserNurse className="h-6 w-6 mr-2" />
            Nurse Management
          </CardTitle>
          <NurseForm mode="add" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4 flex items-center border border-slate-200 shadow-sm">
            <FaUserNurse className="h-10 w-10 text-violet-600 mr-3" />
            <div>
              <div className="text-sm text-slate-600">Total Nurses</div>
              <div className="text-2xl font-bold text-slate-800">{nurses?.length || 0}</div>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 flex items-center border border-emerald-200 shadow-sm">
            {/* <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3">
              FT
            </div> */}
            <div>
              <div className="text-sm text-emerald-700">Full Time</div>
              <div className="text-2xl font-bold text-emerald-800">{nurseStats.fullTime || 0}</div>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 flex items-center border border-amber-200 shadow-sm">
            {/* <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mr-3">
              PT
            </div> */}
            <div>
              <div className="text-sm text-amber-700">Part Time</div>
              <div className="text-2xl font-bold text-amber-800">{nurseStats.partTime || 0}</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search nurses..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  Type <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => table.getColumn("type")?.setFilterValue("")}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => table.getColumn("type")?.setFilterValue("Full Time")}
                >
                  Full Time
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => table.getColumn("type")?.setFilterValue("Part Time")}
                >
                  Part Time
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
                      <FaUserNurse className="h-8 w-8 mb-2 opacity-50" />
                      <p>No nurses found</p>
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
      <NurseForm
        mode="edit"
        nurseId={nurseIdToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <ConfirmDialog
        onSuccess={() => handleDelete(nurseIdToDelete)}
        title="nurse"
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
      <ViewNurse
        nurseId={nurseIdToView}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        trigger={"View"}
      />
    </Card>
  );
};

export default NurseList;
