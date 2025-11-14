import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Calendar, Home, InboxIcon, Search, Settings } from "lucide-react";
import { NavUser } from "./ui/nav-user";
import { useUserStore } from "@/Store/useUserStore";
import avatar from "../assets/124599.jpg";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export function AppSidebar() {
  const user = useUserStore((state) => state.user);
  console.log("User", user);

  const [open, setOpen] = useState(false);

  const data = {
    user: {
      name: user?.name ?? "Username",
      email: user?.email ?? "username@email.com",
      avatar: avatar,
    },
  };
  const items = [
    {
      title: "Dashboard",
      url: "",
      icon: Home,
    },
    {
      title: "Inbox",
      url: "#",
      icon: InboxIcon,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ];

  function handleAccountClick() {
    setOpen(!open);
    console.log("opened", open);
  }

  return (
    <Sidebar>
      <SidebarHeader className="scroll-m-20 text-2xl font-semibold tracking-tight border-b">EXPRESSWAY</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="">
        <NavUser user={data.user} handleAccountClick={handleAccountClick} />
      </SidebarFooter>
    </Sidebar>
  );
}
