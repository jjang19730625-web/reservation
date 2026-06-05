import { Appointment } from "./types";

const KEY = "medical_appointments";

export function getAppointments(): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAppointment(appointment: Appointment): void {
  const appointments = getAppointments();
  appointments.push(appointment);
  localStorage.setItem(KEY, JSON.stringify(appointments));
}

export function updateAppointmentStatus(
  id: string,
  status: Appointment["status"]
): void {
  const appointments = getAppointments();
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx !== -1) {
    appointments[idx].status = status;
    localStorage.setItem(KEY, JSON.stringify(appointments));
  }
}

export function deleteAppointment(id: string): void {
  const appointments = getAppointments().filter((a) => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(appointments));
}

export function generateId(): string {
  return `apt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
