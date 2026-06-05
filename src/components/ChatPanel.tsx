"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Calendar, Clock, Stethoscope } from "lucide-react";
import { Message, ChatState, AppointmentSuggestion, Appointment } from "@/lib/types";
import { analyzePatientInquiry } from "@/lib/openrouter";
import { saveAppointment, generateId } from "@/lib/storage";
import { fireCelebration } from "@/lib/celebrate";

interface Props {
  apiKey: string;
  onAppointmentCreated: () => void;
}

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  content: "안녕하세요! 진료 예약 도우미입니다. 어떤 증상이 있으시거나 예약을 원하시면 말씀해 주세요. 환자 성함, 연락처, 증상을 알려주시면 적합한 진료 일정을 안내해 드리겠습니다.",
  timestamp: new Date(),
};

export default function ChatPanel({ apiKey, onAppointmentCreated }: Props) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({ step: "idle" });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (msg: Omit<Message, "id" | "timestamp">) => {
    const newMsg: Message = { ...msg, id: Date.now().toString(), timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    addMessage({ role: "user", content: userText });
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { response, updatedState, suggestions } = await analyzePatientInquiry(
        userText,
        history,
        chatState,
        apiKey
      );

      setChatState(updatedState);
      addMessage({ role: "assistant", content: response, suggestions });
    } catch (err) {
      addMessage({
        role: "assistant",
        content: `오류가 발생했습니다: ${err instanceof Error ? err.message : "알 수 없는 오류"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AppointmentSuggestion) => {
    setChatState((prev) => ({ ...prev, selectedSuggestion: suggestion, step: "confirming" }));
    addMessage({
      role: "assistant",
      content: `${suggestion.displayDate} ${suggestion.time}에 ${suggestion.doctorName} 선생님 (${suggestion.department}) 진료를 예약하시겠습니까? 확인을 눌러주세요.`,
    });
  };

  const handleConfirm = () => {
    const { selectedSuggestion, patientName, patientPhone, symptoms } = chatState;
    if (!selectedSuggestion || !patientName || !patientPhone) return;

    const appointment: Appointment = {
      id: generateId(),
      patientName,
      patientPhone,
      doctorId: selectedSuggestion.doctorId,
      doctorName: selectedSuggestion.doctorName,
      department: selectedSuggestion.department,
      date: selectedSuggestion.date,
      time: selectedSuggestion.time,
      symptoms: symptoms || "",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    saveAppointment(appointment);
    onAppointmentCreated();
    fireCelebration();
    setChatState({ step: "completed" });
    addMessage({
      role: "assistant",
      content: `예약이 완료되었습니다! ✅\n\n환자명: ${patientName}\n진료과: ${selectedSuggestion.department}\n담당의: ${selectedSuggestion.doctorName} 선생님\n일시: ${selectedSuggestion.displayDate} ${selectedSuggestion.time}\n\n예약 현황은 오른쪽 패널에서 확인하실 수 있습니다. 추가 문의사항이 있으시면 말씀해 주세요.`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">예약 도우미</h2>
          <p className="text-xs text-gray-400">AI 기반 진료 예약 상담</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">온라인</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-blue-100" : "bg-gray-100"}`}>
              {msg.role === "assistant" ? (
                <Bot className="w-4 h-4 text-blue-600" />
              ) : (
                <User className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <div className={`flex flex-col gap-2 max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "assistant" ? "bg-gray-50 text-gray-800 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
                {msg.content}
              </div>

              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="w-full space-y-2 mt-1">
                  <p className="text-xs text-gray-500 font-medium px-1">추천 예약 일정</p>
                  {msg.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left bg-white border border-blue-200 rounded-xl p-3 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-800">{s.doctorName} 선생님</span>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{s.department}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{s.displayDate}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.time}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {chatState.step === "confirming" && chatState.selectedSuggestion && msg.role === "assistant" && msg === messages[messages.length - 1] && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 font-medium transition-colors"
                  >
                    예약 확인
                  </button>
                  <button
                    onClick={() => { setChatState((p) => ({ ...p, step: "showing_suggestions", selectedSuggestion: undefined })); addMessage({ role: "assistant", content: "다른 일정을 선택하시거나 원하시는 조건을 말씀해 주세요." }); }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-xl hover:bg-gray-200 font-medium transition-colors"
                  >
                    취소
                  </button>
                </div>
              )}

              <span className="text-xs text-gray-300 px-1">
                {msg.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-sm text-gray-400">분석 중...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="증상이나 예약 문의를 입력하세요..."
            rows={2}
            className="flex-1 resize-none px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-end"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-300 mt-2 text-center">Enter로 전송 · Shift+Enter로 줄바꿈</p>
      </div>
    </div>
  );
}
