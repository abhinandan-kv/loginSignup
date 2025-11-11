import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const data = [
  { date: "Jun 24", visitors: 2400 },
  { date: "Jun 25", visitors: 1398 },
  { date: "Jun 26", visitors: 9800 },
  { date: "Jun 27", visitors: 3908 },
  { date: "Jun 28", visitors: 4800 },
  { date: "Jun 29", visitors: 3800 },
  { date: "Jun 30", visitors: 4300 },
];

export default function DashboardArea() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-1">
      {/* Stats grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Revenue"
          value="$1,250.00"
          change="+12.5%"
          trend="up"
          desc1="Trending up this month"
          desc2="Visitors for the last 6 months"
        />
        <StatCard
          title="New Customers"
          value="1,234"
          change="-20%"
          trend="down"
          desc1="Down 20% this period"
          desc2="Acquisition needs attention"
        />
        <StatCard
          title="Active Accounts"
          value="45,678"
          change="+12.5%"
          trend="up"
          desc1="Strong user retention"
          desc2="Engagement exceed targets"
        />
        <StatCard
          title="Growth Rate"
          value="4.5%"
          change="+4.5%"
          trend="up"
          desc1="Steady performance increase"
          desc2="Meets growth projections"
        />
      </div>

      {/* Visitors chart */}
      <Card className="bg-neutral-900 border-neutral-800 text-gray-100">
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Total Visitors</CardTitle>
            <CardDescription>Total for the last 3 months</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="secondary" className="bg-neutral-800 text-gray-200 hover:bg-neutral-700">
              Last 3 months
            </Button>
            <Button size="sm" variant="secondary" className="bg-neutral-800 text-gray-200 hover:bg-neutral-700">
              Last 30 days
            </Button>
            <Button size="sm" className="bg-gray-100 text-gray-900 hover:bg-gray-200">
              Last 7 days
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorVisitors)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, change, trend, desc1, desc2 }) {
  const isUp = trend === "up";
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const trendColor = isUp ? "text-green-800" : "text-red-500";

  return (
    <Card className="bg-neutral-900 border-neutral-800 text-gray-100">
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
        <div className="text-sm text-gray-400">{desc1}</div>
        <div className="text-xs text-gray-500">{desc2}</div>
      </CardContent>
    </Card>
  );
}
