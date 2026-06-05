"use client";

import { useState } from "react";
import { Key, ExternalLink } from "lucide-react";

interface Props {
  onSave: (key: string) => void;
}

export default function ApiKeyModal({ onSave }: Props) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim().startsWith("sk-or-")) {
      setError("OpenRouter API 키는 sk-or- 로 시작해야 합니다.");
      return;
    }
    onSave(key.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">API 키 설정</h2>
            <p className="text-sm text-gray-500">OpenRouter API 키를 입력하세요</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(""); }}
              placeholder="sk-or-v1-..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-medium mb-1">API 키 발급 방법</p>
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              openrouter.ai/keys <ExternalLink className="w-3 h-3" />
            </a>
            <p className="mt-2 text-blue-600 text-xs">
              키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
            </p>
          </div>

          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            시작하기
          </button>
        </form>
      </div>
    </div>
  );
}
