import { AppSidebar } from "@/Components/AppSidebar";
import { CommandMenu } from "@/Components/CommandMenu";
import { Sidebar, SidebarProvider, SidebarTrigger } from "@/Components/ui/Sidebar";
import React from "react";

const NormalLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <main className="flex-1 flex flex-col bg-[#0a0a0a]">
          <div className="flex items-center justify-between p-2.5 border-b">
            <SidebarTrigger />
            <CommandMenu />
          </div>

          <div className="flex-1 p-3">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};
export default NormalLayout;
