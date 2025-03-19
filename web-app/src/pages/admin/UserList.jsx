import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Loader2, MoreHorizontal, Search, Users } from "lucide-react";
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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import { useGetAllUsers, useToggleUserStatus } from "@/services/auth.service";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorForm from "./DoctorForm";
import TablePagination from "@/components/data-table/TablePagination";

const UserList = () => {
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
            <AvatarFallback className="bg-primary/10 text-primary">
              {row.original.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="capitalize font-medium text-black/80">{row.getValue("name")}</div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => <SortableHeader column={column} title="Email" />,
      cell: ({ row }) => <div className="text-sm text-blue-600">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role", // admin, doctor, patient, nurse
      header: ({ column }) => <SortableHeader column={column} title="Role" />,
      cell: ({ row }) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeVariant(row.getValue("role"))}`}
        >
          {row.getValue("role")}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.getValue("isActive") ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </span>
      ),
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
                onClick={() => handleStatusChange(row.original.id, row.original.isActive)}
                className={row.original?.isActive ? "text-red-600" : "text-green-600"}
              >
                {row.original?.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Function to determine role badge variant with custom styling
  const getRoleBadgeVariant = role => {
    // Using custom inline styling for badges instead of predefined variants
    const roleStyles = {
      admin: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      doctor: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
      nurse: "bg-violet-100 text-violet-800 hover:bg-violet-200",
      patient: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      default: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    };

    return roleStyles[role?.toLowerCase()] || roleStyles.default;
  };

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: users, isLoading } = useGetAllUsers();
  const { mutate: toggleStatusMutation } = useToggleUserStatus();

  const table = useReactTable({
    data: users || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchableValues = [row.original.name, row.original.email, row.original.role].filter(
        Boolean,
      );

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

  const handleStatusChange = (userId, isActive) => {
    toggleStatusMutation(
      { userId, isActive: !isActive },
      {
        onSuccess: () => {
          toast.success(`User ${!isActive ? "activated" : "deactivated"} successfully`);
        },
        onError: error => {
          console.error(error);
          toast.error("An error occurred. Please try again.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  // Get role statistics
  const roleStats = users?.reduce((acc, user) => {
    const role = user.role?.toLowerCase() || "unknown";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <Users className="h-6 w-6 mr-2" />
            User Management
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {roleStats &&
            Object.entries(roleStats).map(([role, count]) => (
              <div
                key={role}
                className={`rounded-lg p-3 flex flex-col shadow-sm ${getRoleCardColor(role)}`}
              >
                <span className="text-xs capitalize">{role}s</span>
                <span className="text-2xl font-bold">{count}</span>
              </div>
            ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  Role <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => table.getColumn("role")?.setFilterValue("")}>
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => table.getColumn("role")?.setFilterValue("admin")}>
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => table.getColumn("role")?.setFilterValue("doctor")}>
                  Doctor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => table.getColumn("role")?.setFilterValue("nurse")}>
                  Nurse
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => table.getColumn("role")?.setFilterValue("patient")}
                >
                  Patient
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  Status <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => table.getColumn("isActive")?.setFilterValue("")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => table.getColumn("isActive")?.setFilterValue(true)}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => table.getColumn("isActive")?.setFilterValue(false)}
                >
                  Inactive
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
                    console.log(column);
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
                      <Users className="h-8 w-8 mb-2 opacity-50" />
                      <p>No users found</p>
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
    </Card>
  );
};

// Helper function for role card colors with a more harmonious color scheme
const getRoleCardColor = role => {
  switch (role) {
    case "admin":
      return "bg-blue-50 text-blue-800 border border-blue-200";
    case "doctor":
      return "bg-emerald-50 text-emerald-800 border border-emerald-200";
    case "nurse":
      return "bg-violet-50 text-violet-800 border border-violet-200";
    case "patient":
      return "bg-amber-50 text-amber-800 border border-amber-200";
    default:
      return "bg-gray-50 text-gray-800 border border-gray-200";
  }
};

export default UserList;
