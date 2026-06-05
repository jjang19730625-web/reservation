"use client";

import { useState, useEffect } from "react";
import { Hospital, Settings, Key } from "lucide-react";
import ApiKeyModal from "@/components/ApiKeyModal";
import ChatPanel from "@/components/ChatPanel";
import AppointmentPanel from "@/components/AppointmentPanel";
import StatsBar from "@/components/StatsBar";

const API_KEY_STORAGE = "openrouter_api_key";

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const envKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (envKey && envKey !== "여기에_API_키_입력") {
      setApiKey(envKey);
      return;
    }
    const saved = localStorage.getItem(API_KEY_STORAGE);
    if (saved) setApiKey(saved);
  }, []);

  const handleSaveKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
    setShowKeyModal(false);
  };

  const handleClearKey = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey(null);
  };

  const handleAppointmentCreated = () => {
    setRefreshTrigger((n) => n + 1);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {(!apiKey || showKeyModal) && (
        <ApiKeyModal onSave={handleSaveKey} />
      )}

      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Hospital className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">진료 예약 관리</h1>
              <p className="text-xs text-gray-400">AI 기반 스마트 예약 시스템</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {apiKey && (
              <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                <Key className="w-3 h-3" />
                API 연결됨
              </span>
            )}
            <button
              onClick={() => setShowKeyModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="API 키 설정"
            >
              <Settings className="w-4 h-4" />
            </button>
            {apiKey && (
              <button
                onClick={handleClearKey}
                className="text-xs text-gray-400 hover:text-red-500 px-2 py-1"
              >
                키 초기화
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        <StatsBar refreshTrigger={refreshTrigger} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5" style={{ height: "calc(100vh - 220px)" }}>
          <div className="lg:col-span-3 min-h-0">
            {apiKey ? (
              <ChatPanel apiKey={apiKey} onAppointmentCreated={handleAppointmentCreated} />
            ) : (
              <div className="h-full bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-300">
                  <Hospital className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-sm">API 키를 설정하면 예약 상담을 시작할 수 있습니다</p>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-2 min-h-0">
            <AppointmentPanel refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}
