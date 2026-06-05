import confetti from "canvas-confetti";

export function fireCelebration() {
  playFanfare();

  // 좌측 대포
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.7 },
    colors: ["#3b82f6", "#60a5fa", "#fbbf24", "#34d399", "#f472b6"],
    scalar: 1.2,
  });

  // 우측 대포
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.7 },
    colors: ["#3b82f6", "#60a5fa", "#fbbf24", "#34d399", "#f472b6"],
    scalar: 1.2,
  });

  // 중앙 풍선 폭발
  setTimeout(() => {
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      shapes: ["circle", "square"],
      colors: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff"],
      scalar: 1.4,
      ticks: 200,
    });
  }, 200);

  // 별 모양 추가
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: 0.3, y: 0.3 },
      shapes: ["star"],
      colors: ["#fbbf24", "#f59e0b"],
      scalar: 1.6,
    });
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: 0.7, y: 0.3 },
      shapes: ["star"],
      colors: ["#fbbf24", "#f59e0b"],
      scalar: 1.6,
    });
  }, 400);
}

function playFanfare() {
  try {
    const ctx = new AudioContext();

    // 빵빠레 멜로디 (도-미-솔-도 상행)
    const notes = [
      { freq: 523.25, start: 0, dur: 0.12 },    // C5
      { freq: 659.25, start: 0.13, dur: 0.12 },  // E5
      { freq: 783.99, start: 0.26, dur: 0.12 },  // G5
      { freq: 1046.5, start: 0.39, dur: 0.35 },  // C6 (길게)
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    });

    // 화음 (솔 추가)
    const harmony = [
      { freq: 392.0, start: 0.39, dur: 0.35 },  // G4
      { freq: 659.25, start: 0.39, dur: 0.35 }, // E5
    ];
    harmony.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    });
  } catch {
    // 오디오 컨텍스트 미지원 환경에서는 무시
  }
}
