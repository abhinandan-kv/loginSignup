import React, { useEffect, useState } from "react";
import { decryptData, getDecryptedItem } from "../../utils/Encryption/EncryptDecrypt";
import NormalLayout from "@/Layout/NormalLayout";
import DashboardArea from "@/Components/DashboardArea";
import { useUserStore } from "@/Store/useUserStore";
import axiosInstance from "@/utils/AxiosApi/AxiosInstance";
import AdminSection from "./Sections/AdminSection";
import SharedWidgets from "./Sections/SharedWidgets";
import EditorSection from "./Sections/EditorSection";
import ViewerSection from "./Sections/ViewerSection";
import { PermissionGate } from "./components/PermissionGate";
import { Button } from "@/Components/ui/button";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  const { user, roles, permissions, loadUser } = useUserStore();
  console.log(user, roles, permissions);

  // useEffect(() => {
  // change this to use central state/store directlye
  // async function getDataFromLocalStroage() {
  //   const data = await getDecryptedItem("userdata");
  //   console.log(data);
  // }
  // getDataFromLocalStroage();
  // }, []);

  useEffect(() => {
    (async () => {
      await loadUser();
      setLoading(false);
    })();
  }, []);

  const sectionsMap = {
    admin: <AdminSection />,
    manager: <EditorSection />,
    user: <ViewerSection />,
  };

  // const isAdmin = roles.includes("admin");
  // const isEditor = roles.includes("editor");
  // const isViewer = roles.includes("viewer");

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <NormalLayout>
      {/* <DashboardArea /> */}

      <div className="space-y-6 p-6">
        <div className="">
          <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">Role: {roles.join(", ")}</p>
          <p className="text-muted-foreground">Permissions: {permissions.join(",")}</p>
        </div>
        <SharedWidgets />

        {roles.map((role) => sectionsMap[role] || <NoPermission />)}
        {/* this gate can be used to render specific part of the crud ops components */}
        <PermissionGate permission={"create"}>
          <Button variant="outline" className={"cursor-pointer"}>
            PermissionGate Button
          </Button>
        </PermissionGate>
      </div>
    </NormalLayout>
  );
};

export default Dashboard;

const NoPermission = () => {
  return (
    <div>
      <p>No PERMISSIONS! HOW COME?</p>
    </div>
  );
};
