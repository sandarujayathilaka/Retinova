"use client";

import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

export function NavMain({ items }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm font-semibold text-gray-700 bg-gray-100 p-2 rounded-t-md">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible mb-2"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <Link to={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="bg-white hover:bg-blue-50 data-[state=open]:bg-blue-100 data-[active=true]:bg-blue-200 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {item.icon && <img src={item.icon} alt="" className="max-h-5" />}
                    <span className="text-gray-800 font-medium">{item.title}</span>
                    {item.isExpandable && (
                      <ChevronRight className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 text-gray-600" />
                    )}
                  </SidebarMenuButton>
                </Link>
              </CollapsibleTrigger>
              {item.isExpandable && (
                <CollapsibleContent className="pl-6">
                  <SidebarMenuSub>
                    {item.items?.map(subItem => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild className="hover:bg-indigo-50 rounded-md">
                          <Link to={subItem.url} className="text-gray-700 hover:text-indigo-600">
                            {subItem.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
