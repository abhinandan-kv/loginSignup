import React, { useEffect, useState } from "react";
import { decryptData, getDecryptedItem } from "../../utils/Encryption/EncryptDecrypt";
import NormalLayout from "@/Layout/NormalLayout";
import DashboardArea from "@/Components/DashboardArea";
import { useUserStore } from "@/Store/useUserStore";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  const loadUser = useUserStore((state) => state.loadUser);
  const user = useUserStore((state) => state.user);
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
  }, [loadUser]);

  console.log(user);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <NormalLayout>
      <DashboardArea />
    </NormalLayout>
  );
};

export default Dashboard;
