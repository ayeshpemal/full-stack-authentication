import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";

const Dashboard = async () => {
  const session = await getSession();
  if (!session || !session.user) redirect("/auth/signin");
  console.log("Dashboard session", session);

  return <div>Dashboard</div>;
};

export default Dashboard;