export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  symptoms: string;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  availableDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  availableHours: string[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: AppointmentSuggestion[];
}

export interface AppointmentSuggestion {
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  displayDate: string;
}

export interface ChatState {
  step: "idle" | "collecting_info" | "showing_suggestions" | "confirming" | "completed";
  patientName?: string;
  patientPhone?: string;
  symptoms?: string;
  preferredDate?: string;
  preferredDepartment?: string;
  selectedSuggestion?: AppointmentSuggestion;
}
