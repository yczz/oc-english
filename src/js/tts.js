// 听力朗读：Web Speech API（TTS 打底，真人音频接口预留：若 TTS_AUDIO_MAP 提供 url 则优先播放）
const TTS_AUDIO_MAP = {}; // 预留：{ word: 'audio/xxx.mp3' }

let cachedVoice = null;

function pickVoice() {
  if (cachedVoice) return cachedVoice;
  const voices = speechSynthesis?.getVoices?.() ?? [];
  cachedVoice =
    voices.find(v => v.lang === 'en-US' && /female|zira|samantha|Google US/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith('en')) ||
    null;
  return cachedVoice;
}

if (window.speechSynthesis) {
  speechSynthesis.onvoiceschanged = () => { cachedVoice = null; pickVoice(); };
}

export function speak(text, rate = 0.85) {
  if (!window.speechSynthesis || !text) return;
  // 有真人音频优先
  const url = TTS_AUDIO_MAP[text.toLowerCase()];
  if (url) {
    const a = new Audio(url);
    a.play().catch(() => fallbackTTS(text, rate));
    return;
  }
  fallbackTTS(text, rate);
}

function fallbackTTS(text, rate) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  const v = pickVoice();
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
