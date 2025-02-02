import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import SortableHeader from "@/components/data-table/SortableHeader";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaUserDoctor } from "react-icons/fa6";
import { days } from "@/constants";

const data = [
  {
    name: "Ronald Richards",
    phone: "209 555-0104",
    email: "R.Richards@avicena.com",
    specialty: "Dentist",
    working_days: ["S", "M", "W", "F", "S"],
    assigned_treatment: "Dental service",
    type: "PART-TIME",
  },
  {
    name: "Drg Jerald O’Hara",
    phone: "302 555-0107",
    email: "Jerald@avicena.com",
    specialty: "Orthodontics",
    working_days: ["T", "W", "T", "F", "S"],
    assigned_treatment: "Oral Disease service",
    type: "FULL-TIME",
  },
  {
    name: "Putri Larasati",
    phone: "629 555-0129",
    email: "Larasati@avicena.com",
    specialty: "Pediatric Dentistry",
    working_days: ["M", "T", "W", "T", "F"],
    assigned_treatment: "Dental service",
    type: "FULL-TIME",
  },
  {
    name: "Drg Soap Mactavish",
    phone: "303 555-0105",
    email: "Soap@avicena.com",
    specialty: "Dentist",
    working_days: ["S", "M", "T", "W", "T"],
    assigned_treatment: "Oral Disease service",
    type: "PART-TIME",
  },
  {
    name: "Devon Lane",
    phone: "603 555-0123",
    email: "Devon@avicena.com",
    specialty: "Endodontics",
    working_days: ["M", "W", "T", "F", "S"],
    assigned_treatment: "Dental service",
    type: "FULL-TIME",
  },
  {
    name: "Jacob Jones",
    phone: "704 555-0127",
    email: "Jacobjones@avicena.com",
    specialty: "Pediatric Dentistry",
    working_days: ["S", "M", "W", "F", "S"],
    assigned_treatment: "Oral Disease service",
    type: "PART-TIME",
  },
  {
    name: "Marvin McKinney",
    phone: "907 555-0101",
    email: "Marvinmckinney@avicena.com",
    specialty: "Pediatric Dentistry",
    working_days: ["M", "T", "W", "T", "F"],
    assigned_treatment: "Dental service",
    type: "PART-TIME",
  },
  {
    name: "Dianne Russell",
    phone: "406 555-0120",
    email: "Diannerussell@avicena.com",
    specialty: "Orthodontics",
    working_days: ["S", "T", "W", "T", "F"],
    assigned_treatment: "Dental service",
    type: "FULL-TIME",
  },
];

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
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
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="capitalize font-semibold text-black/80">{row.getValue("name")}</div>
          <div className="text-sm text-muted-foreground">{row.original.assigned_treatment}</div>
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
    accessorKey: "working_days",
    header: ({ column }) => {
      return <Button variant="ghost">Working Days</Button>;
    },
    cell: ({ row }) => {
      return (
        <div className="flex gap-1">
          {days.map(day => (
            <div
              key={day.name}
              className={`rounded-full text-xs leading-3 select-none size-6 flex items-center justify-center  ${
                row.original.working_days.includes(day.value)
                  ? "bg-blue-400 text-white"
                  : "bg-slate-300"
              }`}
            >
              {day.value}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortableHeader column={column} title="Type" />,
    cell: ({ row }) => (
      <div
        className={`uppercase inline-block px-2 py-1 rounded-lg text-xs font-semibold ${row.getValue("type").toLowerCase() === "full-time" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const List = () => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="text-2xl font-medium text-black/70">
          <FaUserDoctor className="inline-block size-10 mr-2 text-blue-500" />
          {data?.length} Doctors
        </div>
        <Button variant="primary">
          <PlusIcon />
          Add Doctor
        </Button>
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
  );
};

export default List;
