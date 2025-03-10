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
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible mb-1"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <Link to={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="bg-[#C9DDF6] hover:bg-[#C9DDF6] data-[state=open]:hover:bg-[#C9DDF6] data-[active=true]:bg-[#C9DDF6]"
                  >
                    {item.icon && <img src={item.icon} alt="" className="max-h-4" />}
                    <span>{item.title}</span>
                    <ChevronRight
                      className={`ml-auto ${item.isExpandable && "transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"}`}
                    />
                  </SidebarMenuButton>
                </Link>
              </CollapsibleTrigger>
              {item.isExpandable && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map(subItem => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={subItem.url}>
                            <span>{subItem.title}</span>
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
