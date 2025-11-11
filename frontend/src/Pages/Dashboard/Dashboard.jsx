import React, { useEffect, useState } from "react";
import { decryptData, getDecryptedItem } from "../../utils/Encryption/EncryptDecrypt";
import NormalLayout from "@/Layout/NormalLayout";
import DashboardArea from "@/Components/DashboardArea";
import { useUserStore } from "@/Store/useUserStore";

const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  // useEffect(() => {
  // change this to use central state/store directlye
  // async function getDataFromLocalStroage() {
  //   const data = await getDecryptedItem("userdata");
  //   console.log(data);
  // }
  // getDataFromLocalStroage();
  // }, []);

  console.log(user);
  return (
    <NormalLayout>
      <DashboardArea />
    </NormalLayout>
  );
};

export default Dashboard;
