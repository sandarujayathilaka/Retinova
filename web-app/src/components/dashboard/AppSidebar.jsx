import * as React from "react";
import { AudioWaveform, Command, GalleryVerticalEnd, LayoutDashboard } from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import dashboard from "@/assets/icons/dashboard.svg";
import doctors from "@/assets/icons/doctors.svg";
import diseases from "@/assets/icons/diseases.svg";

// This is sample data.
const data = {
  user: {
    name: "Anil Kumar",
    email: "anilkumar@ihsl.com",
    avatar: "https://github.com/shadcn.png",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: dashboard,
      isActive: true,
      isExpandable: true,
      items: [
        {
          title: "DR",
          url: "#",
        },
        {
          title: "AMD",
          url: "#",
        },
        {
          title: "Glaucoma",
          url: "#",
        },
        {
          title: "RVO",
          url: "#",
        },
      ],
    },
    {
      title: "Doctors",
      url: "/doctors",
      icon: doctors,
      isExpandable: false,
    },
    {
      title: "Diseases",
      url: "#",
      icon: diseases,
      isExpandable: true,
      items: [
        {
          title: "DR",
          url: "/diagnose/dr",
        },
        {
          title: "AMD",
          url: "/diagnose/amd",
        },
        {
          title: "Glaucoma",
          url: "/diagnose/glaucoma",
        },
        {
          title: "RVO",
          url: "/diagnose/rvo",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props} className="p-1 bg-white">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-[#F4F4F6]">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="bg-[#F4F4F6]">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
