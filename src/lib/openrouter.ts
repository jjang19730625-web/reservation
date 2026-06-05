import { AppointmentSuggestion, ChatState } from "./types";
import { DOCTORS, SYMPTOM_DEPARTMENT_MAP, getAvailableSlots } from "./data";
import { getAppointments } from "./storage";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function callOpenRouter(
  messages: { role: string; content: string }[],
  apiKey: string
): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Medical Appointment System",
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API 오류: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

export async function analyzePatientInquiry(
  userMessage: string,
  chatHistory: { role: string; content: string }[],
  chatState: ChatState,
  apiKey: string
): Promise<{ response: string; updatedState: ChatState; suggestions?: AppointmentSuggestion[] }> {
  const bookedSlots = getAppointments().map((a) => ({
    date: a.date,
    time: a.time,
    doctorId: a.doctorId,
  }));

  const systemPrompt = `당신은 병원 예약 도우미입니다. 환자의 문의를 분석하고 예약을 도와주세요.

현재 진행 상태: ${JSON.stringify(chatState)}

진료과 목록: ${[...new Set(DOCTORS.map((d) => d.department))].join(", ")}

응답 시 다음 JSON 형식으로만 답하세요:
{
  "response": "환자에게 보낼 메시지",
  "extractedInfo": {
    "patientName": "환자 이름 (파악된 경우)",
    "patientPhone": "전화번호 (파악된 경우)",
    "symptoms": "증상 (파악된 경우)",
    "preferredDepartment": "진료과 (파악된 경우)",
    "preferredDate": "선호 날짜 (파악된 경우, YYYY-MM-DD 형식)"
  },
  "nextStep": "idle|collecting_info|showing_suggestions|confirming|completed",
  "readyForSuggestions": true/false
}

규칙:
- 환자 이름, 전화번호, 증상이 모두 파악되면 readyForSuggestions를 true로 설정
- 정보가 부족하면 자연스럽게 질문
- 한국어로 친절하게 응답
- 증상을 파악하면 적절한 진료과를 추천`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...chatHistory.slice(-6),
    { role: "user", content: userMessage },
  ];

  const rawResponse = await callOpenRouter(messages, apiKey);

  let parsed: {
    response: string;
    extractedInfo: Partial<ChatState & { preferredDepartment: string }>;
    nextStep: ChatState["step"];
    readyForSuggestions: boolean;
  };

  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
  } catch {
    return {
      response: rawResponse,
      updatedState: chatState,
    };
  }

  const updatedState: ChatState = {
    ...chatState,
    step: parsed.nextStep || chatState.step,
    patientName: parsed.extractedInfo.patientName || chatState.patientName,
    patientPhone: parsed.extractedInfo.patientPhone || chatState.patientPhone,
    symptoms: parsed.extractedInfo.symptoms || chatState.symptoms,
    preferredDate: parsed.extractedInfo.preferredDate || chatState.preferredDate,
    preferredDepartment:
      parsed.extractedInfo.preferredDepartment || chatState.preferredDepartment,
  };

  // 증상으로 진료과 추천
  if (!updatedState.preferredDepartment && updatedState.symptoms) {
    for (const [keyword, dept] of Object.entries(SYMPTOM_DEPARTMENT_MAP)) {
      if (updatedState.symptoms.includes(keyword)) {
        updatedState.preferredDepartment = dept;
        break;
      }
    }
  }

  let suggestions: AppointmentSuggestion[] | undefined;

  if (parsed.readyForSuggestions && updatedState.preferredDepartment) {
    const doctors = DOCTORS.filter(
      (d) => d.department === updatedState.preferredDepartment
    );
    const allSlots: AppointmentSuggestion[] = [];

    for (const doctor of doctors) {
      const slots = getAvailableSlots(doctor.id, bookedSlots, 7);
      for (const slot of slots.slice(0, 2)) {
        allSlots.push({
          doctorId: doctor.id,
          doctorName: doctor.name,
          department: doctor.department,
          date: slot.date,
          time: slot.time,
          displayDate: slot.displayDate,
        });
      }
    }

    suggestions = allSlots.slice(0, 4);
    updatedState.step = "showing_suggestions";
  }

  return {
    response: parsed.response,
    updatedState,
    suggestions,
  };
}
