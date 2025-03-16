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

// Sample data
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
        { title: "DR", url: "#" },
        { title: "AMD", url: "#" },
        { title: "Glaucoma", url: "#" },
        { title: "RVO", url: "#" },
      ],
    },
    {
      title: "Doctors",
      url: "/doctors",
      icon: doctors,
      isExpandable: false,
    },
    {
      title: "Nurses",
      url: "/nurses",
      icon: doctors,
      isExpandable: false,
    },
    {
      title: "Patients",
      icon: doctors,
      isExpandable: true,
      items: [
        { title: "Review", url: "/review-patients" },
        { title: "Monitoring", url: "/monitorpatients" },
        { title: "Pre-Monitoring", url: "/pre-monitoring-patients" },
        { title: "Completed", url: "/completed-patients" },
      ],
    },
    {
      title: "Diseases",
      url: "#",
      icon: diseases,
      isExpandable: true,
      items: [
        { title: "DR", url: "/diagnose/dr" },
        { title: "AMD", url: "/diagnose/amd" },
        { title: "Glaucoma", url: "/diagnose/glaucoma" },
        { title: "RVO", url: "/diagnose/rvo" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="p-2 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 shadow-xl transition-all duration-300 hover:shadow-2xl"
    >
      <SidebarHeader className="p-4 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-lg shadow-md">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="p-2 bg-white/90 backdrop-blur-sm">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="p-2 bg-gradient-to-t from-gray-100 to-white rounded-lg shadow-inner">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail className="bg-gradient-to-r from-blue-100 to-indigo-100" />
    </Sidebar>
  );
}
