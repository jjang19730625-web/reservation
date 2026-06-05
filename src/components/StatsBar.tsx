"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Clock, Users, TrendingUp } from "lucide-react";
import { getAppointments } from "@/lib/storage";

interface Props {
  refreshTrigger: number;
}

export default function StatsBar({ refreshTrigger }: Props) {
  const [stats, setStats] = useState({ total: 0, today: 0, confirmed: 0, cancelled: 0 });

  useEffect(() => {
    const apts = getAppointments();
    const today = new Date().toISOString().split("T")[0];
    setStats({
      total: apts.length,
      today: apts.filter((a) => a.date === today).length,
      confirmed: apts.filter((a) => a.status === "confirmed").length,
      cancelled: apts.filter((a) => a.status === "cancelled").length,
    });
  }, [refreshTrigger]);

  const items = [
    { label: "전체 예약", value: stats.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "오늘 예약", value: stats.today, icon: CalendarCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "확정 예약", value: stats.confirmed, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "취소 예약", value: stats.cancelled, icon: TrendingUp, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-400">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
