"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Phone, Stethoscope, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Appointment } from "@/lib/types";
import { getAppointments, updateAppointmentStatus, deleteAppointment } from "@/lib/storage";

interface Props {
  refreshTrigger: number;
}

const STATUS_CONFIG = {
  confirmed: { label: "확정", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
  pending: { label: "대기", color: "text-yellow-600", bg: "bg-yellow-50", icon: AlertCircle },
  cancelled: { label: "취소", color: "text-red-500", bg: "bg-red-50", icon: XCircle },
};

export default function AppointmentPanel({ refreshTrigger }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all" | Appointment["status"]>("all");

  useEffect(() => {
    setAppointments(getAppointments());
  }, [refreshTrigger]);

  const filtered = appointments
    .filter((a) => filter === "all" || a.status === filter)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  const handleCancel = (id: string) => {
    updateAppointmentStatus(id, "cancelled");
    setAppointments(getAppointments());
  };

  const handleDelete = (id: string) => {
    deleteAppointment(id);
    setAppointments(getAppointments());
  };

  const counts = {
    all: appointments.length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    pending: appointments.filter((a) => a.status === "pending").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">예약 현황</h2>
        <p className="text-xs text-gray-400 mt-0.5">총 {counts.all}건의 예약</p>
      </div>

      <div className="px-4 py-3 border-b border-gray-50">
        <div className="flex gap-1.5">
          {(["all", "confirmed", "pending", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              {s === "all" ? "전체" : STATUS_CONFIG[s].label} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-300">
            <Calendar className="w-10 h-10 mb-2" />
            <p className="text-sm">예약 내역이 없습니다</p>
          </div>
        ) : (
          filtered.map((apt) => {
            const statusCfg = STATUS_CONFIG[apt.status];
            const StatusIcon = statusCfg.icon;
            const dateObj = new Date(apt.date);
            const displayDate = dateObj.toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
              weekday: "short",
            });

            return (
              <div key={apt.id} className={`rounded-xl border p-4 ${apt.status === "cancelled" ? "opacity-60" : ""} border-gray-100`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${statusCfg.color} ${statusCfg.bg}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg font-medium">
                      {apt.department}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {apt.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        title="예약 취소"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(apt.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-800">{apt.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">{apt.patientPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">{apt.doctorName} 선생님</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      {displayDate}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {apt.time}
                    </span>
                  </div>
                  {apt.symptoms && (
                    <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                      증상: {apt.symptoms}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
