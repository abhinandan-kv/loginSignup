import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PermissionGate } from "../components/PermissionGate";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/AxiosApi/AxiosInstance";
import Loader from "@/Components/ui/Loader";
import { filterDataByDays } from "@/utils/filterDataByDays";

const AdminSection = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState(null);
  const [monthlyUserCount, setMonthlyUserCount] = useState(null);
  const [userMonthCount, setUserMonthCount] = useState(null);
  const [filteredData, setFilteredData] = useState([]); // chart data
  const [activeRange, setActiveRange] = useState(7);

  // monthlyUserCount res data:-
  // =====================================
  // userCountMonthly.data.userCount
  // {
  //     "direction": "up",
  //     "percentage": "200.00",
  //     "prev": 1,
  //     "curr": 3
  // }
  // userCountMonthly.data.userMonth
  // [
  //   {
  //     month: "2025-11-13",
  //     value: 1,
  //   },
  //   {
  //     month: "2025-11-14",
  //     value: 3,
  //   },
  // ];
  useEffect(() => {
    async function fetchUserCount() {
      setLoading(true);
      const userCount = await axiosInstance.post("/user/usercount", { verified: true });
      const userCountMonthly = await axiosInstance.post("/user/monthly/count", { verified: true });
      // console.log("userCount ->", userCount);
      console.log("userCountMonthly ->", userCountMonthly);
      setUsers(userCount.data.userCount);
      setMonthlyUserCount(userCountMonthly.data.userCount);
      setUserMonthCount(userCountMonthly.data.userMonth);
      setLoading(false);
    }

    fetchUserCount();
  }, []);

  useEffect(() => {
    if (userMonthCount) {
      handleRange(activeRange);
    }
  }, [userMonthCount]);

  function handleRange(days) {
    if (!userMonthCount) return null;
    setLoading(true);

    setActiveRange(days);
    const results = filterDataByDays(userMonthCount, days);
    console.log("results->>", results);
    setFilteredData(results);
    setLoading(false);
  }

  const getButtonClasses = (range) => {
    const isActive = activeRange === range;

    if (isActive) {
      return "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200";
    }

    return "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600";
  };

  // console.log(users);
  // console.log(monthlyUserCount);
  // console.log(userMonthCount);
  // console.log(filteredData);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 p-6">
        {/* Stats grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title="Verified Users"
            value={users}
            change={monthlyUserCount?.percentage + "%"} //making a controller to find the user found per month
            trend={monthlyUserCount?.direction}
            desc1="Trending up this month"
            desc2="All time visitors"
          />
          <StatCard title="New Customers" value="1,234" change="-20%" trend="down" desc1="Down 20% this period" desc2="Acquisition needs attention" />
          <StatCard
            title="Active Accounts"
            value="45,678"
            change="+12.5%"
            trend="up"
            desc1="Strong user retention"
            desc2="Engagement exceed targets"
          />
          <StatCard title="Growth Rate" value="4.5%" change="+4.5%" trend="up" desc1="Steady performance increase" desc2="Meets growth projections" />
        </div>

        {/* Visitors chart */}
        <Card className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>Total for the last 7 days</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => handleRange(90)} size="sm" variant="secondary" className={getButtonClasses(90)}>
                Last 3 months
              </Button>
              <Button onClick={() => handleRange(30)} size="sm" variant="secondary" className={getButtonClasses(30)}>
                Last 30 days
              </Button>
              <Button onClick={() => handleRange(7)} size="sm" className={getButtonClasses(7)}>
                Last 7 days
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer className="outline-0 focus:outline-0" width="100%" height="100%">
                <AreaChart className="focus:outline-none" data={filteredData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "none",
                      color: "#fff",
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorVisitors)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <section className="rounded-lg border p-4 shadow-sm bg-card">
        <h2 className="text-xl font-semibold mb-3">Admin Tools</h2>

        <PermissionGate permission="create">
          <button className="btn btn-primary">Create New User</button>
        </PermissionGate>

        <PermissionGate permission="delete">
          <button className="btn btn-destructive mt-2">Delete Account</button>
        </PermissionGate>
      </section>
    </>
  );
};

export default AdminSection;

function StatCard({ title, value, change, trend, desc1, desc2 }) {
  const isUp = trend === "up";
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const trendColor = isUp ? "text-green-500" : "text-red-500";

  return (
    <Card className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {title}
          <span className={`text-xs ${trendColor} flex items-center gap-1`}>
            <TrendIcon size={14} /> {change}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">{desc1}</div>
        <div className="text-xs text-neutral-600 dark:text-neutral-500">{desc2}</div>
      </CardContent>
    </Card>
  );
}
