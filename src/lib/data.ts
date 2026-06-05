import { Doctor } from "./types";

export const DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "김민준",
    department: "내과",
    availableDays: [1, 2, 3, 4, 5],
    availableHours: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"],
  },
  {
    id: "d2",
    name: "이서연",
    department: "소화기내과",
    availableDays: [1, 3, 5],
    availableHours: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"],
  },
  {
    id: "d3",
    name: "박지호",
    department: "정형외과",
    availableDays: [1, 2, 4],
    availableHours: ["09:00", "09:30", "10:00", "11:00", "11:30", "14:00", "15:00", "15:30", "16:00"],
  },
  {
    id: "d4",
    name: "최유나",
    department: "피부과",
    availableDays: [2, 3, 4, 5],
    availableHours: ["09:30", "10:00", "10:30", "11:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
  },
  {
    id: "d5",
    name: "정현우",
    department: "이비인후과",
    availableDays: [1, 2, 3, 4, 5],
    availableHours: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00"],
  },
  {
    id: "d6",
    name: "강수진",
    department: "안과",
    availableDays: [1, 3, 5],
    availableHours: ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30"],
  },
];

export const DEPARTMENTS = [...new Set(DOCTORS.map((d) => d.department))];

export const SYMPTOM_DEPARTMENT_MAP: Record<string, string> = {
  두통: "내과",
  발열: "내과",
  기침: "내과",
  감기: "내과",
  복통: "소화기내과",
  소화불량: "소화기내과",
  위통: "소화기내과",
  설사: "소화기내과",
  관절통: "정형외과",
  허리통증: "정형외과",
  어깨통증: "정형외과",
  무릎통증: "정형외과",
  피부: "피부과",
  여드름: "피부과",
  두드러기: "피부과",
  습진: "피부과",
  귀: "이비인후과",
  코막힘: "이비인후과",
  인후통: "이비인후과",
  목아픔: "이비인후과",
  시력: "안과",
  눈: "안과",
  결막염: "안과",
};

export function getDoctorsByDepartment(department: string): Doctor[] {
  return DOCTORS.filter((d) => d.department === department);
}

export function getAvailableSlots(
  doctorId: string,
  bookedAppointments: { date: string; time: string; doctorId: string }[],
  daysAhead = 7
) {
  const doctor = DOCTORS.find((d) => d.id === doctorId);
  if (!doctor) return [];

  const slots: { date: string; time: string; displayDate: string }[] = [];
  const today = new Date();

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();

    if (!doctor.availableDays.includes(dayOfWeek)) continue;

    const dateStr = date.toISOString().split("T")[0];
    const displayDate = date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });

    for (const time of doctor.availableHours) {
      const isBooked = bookedAppointments.some(
        (a) => a.doctorId === doctorId && a.date === dateStr && a.time === time
      );
      if (!isBooked) {
        slots.push({ date: dateStr, time, displayDate });
      }
    }
  }

  return slots;
}
