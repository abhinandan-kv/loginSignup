import { AppSidebar } from "@/Components/AppSidebar";
import { CommandMenu } from "@/Components/CommandMenu";
import { Sidebar, SidebarProvider, SidebarTrigger } from "@/Components/ui/Sidebar";
import React from "react";

const NormalLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <main className="flex-1 flex flex-col bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
          <div className="flex items-center justify-between p-2.5 border-b border-neutral-200 dark:border-neutral-700">
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
