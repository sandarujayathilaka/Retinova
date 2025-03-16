"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher({ teams }) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:bg-indigo-600 text-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-white/20">
                <activeTeam.logo className="size-5 text-white" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">{activeTeam.name}</span>
                <span className="truncate text-xs text-gray-200">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-white" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-xl p-2 bg-white shadow-lg border border-gray-100"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-sm font-medium text-gray-800">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="hover:bg-indigo-50 rounded-md p-2 transition-colors duration-200"
              >
                <div className="flex size-6 items-center justify-center rounded-md bg-gray-100">
                  <team.logo className="size-4 text-gray-600" />
                </div>
                <span className="ml-2 text-gray-700">{team.name}</span>
                <DropdownMenuShortcut className="text-gray-500">⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem className="hover:bg-indigo-50 rounded-md p-2 transition-colors duration-200">
              <div className="flex size-6 items-center justify-center rounded-md bg-gray-100">
                <Plus className="size-4 text-gray-600" />
              </div>
              <span className="ml-2 font-medium text-gray-700">Add team</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
