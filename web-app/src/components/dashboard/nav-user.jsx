"use client";

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({ user }) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu className="bg-white rounded-lg shadow-md">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:bg-blue-100 data-[state=open]:bg-blue-200 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg"
            >
              <Avatar className="h-10 w-10 rounded-xl border-2 border-white">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-xl bg-indigo-200 text-indigo-800 font-bold">
                  {user.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-gray-900">{user.name}</span>
                <span className="truncate text-xs text-gray-600">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-gray-600" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-xl p-2 bg-white shadow-lg border border-gray-100"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-2 text-sm font-medium text-gray-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-xl">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-xl bg-indigo-200 text-indigo-800 font-bold">
                    {user.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="block text-xs text-gray-500">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="hover:bg-indigo-50 rounded-md p-2">
                <Sparkles className="mr-2 h-4 w-4 text-indigo-600" />
                <span className="text-gray-700">Upgrade to Pro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="hover:bg-indigo-50 rounded-md p-2">
                <BadgeCheck className="mr-2 h-4 w-4 text-green-600" />
                <span className="text-gray-700">Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-indigo-50 rounded-md p-2">
                <CreditCard className="mr-2 h-4 w-4 text-blue-600" />
                <span className="text-gray-700">Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-indigo-50 rounded-md p-2">
                <Bell className="mr-2 h-4 w-4 text-yellow-600" />
                <span className="text-gray-700">Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem className="hover:bg-red-50 rounded-md p-2 text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
