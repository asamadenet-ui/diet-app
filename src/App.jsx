import { useState, useEffect, useRef } from "react";

function calcStepCalories(steps, weight) {
  return Math.round(weight * steps * 0.0005 * 10) / 10;
}

const TABS = ["🏠", "🍽", "🏃", "⚖️", "📝", "🎯"];
const TAB_LABELS = ["HOME", "MEAL", "TRAIN", "WEIGHT", "MEMO", "GOAL"];

const EXERCISES = [
  { icon: "🏃", name: "ジョギング", met: 7.0 },
  { icon: "🚴", name: "サイクリング", met: 6.0 },
  { icon: "🏊", name: "水泳", met: 8.0 },
  { icon: "🧘", name: "ヨガ", met: 3.0 },
  { icon: "💪", name: "筋トレ", met: 5.0 },
  { icon: "🏋️", name: "ウォーキング", met: 3.5 },
];

const C = {
  bg: "#0A0A0A",
  card: "#141414",
  card2: "#1A1A1A",
  border: "#2A2A2A",
  orange: "#FF6B00",
  red: "#FF3D3D",
  green: "#00E676",
  blue: "#00B4FF",
  purple: "#B44FFF",
  text: "#FFFFFF",
  sub: "#888888",
  sub2: "#555555",
};

function saveData(data) {
  localStorage.setItem("dietAppData", JSON.stringify(data));
}
function loadData() {
  try {
    const raw = localStorage.getItem("dietAppData");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function WeightGraph({ entries }) {
  if (entries.length === 0)
    return <div style={{ textAlign: "center", color: C.sub, padding: "40px 0", fontSize: 13 }}>データなし</div>;
  const vals = entries.map((e) => e.weight);
  const min = Math.floor(Math.min(...vals) - 1);
  const max = Math.ceil(Math.max(...vals) + 1);
  const W = 320, H = 160, pad = 36;
  const x = (i) => pad + (i / Math.max(entries.length - 1, 1)) * (W - pad * 2);
  const y = (v) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
  const points = entries.map((e, i) => `${x(i)},${y(e.weight)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", borderRadius: 12 }}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.orange} stopOpacity="0.4" />
          <stop offset="100%" stopColor={C.orange} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.33, 0.66, 1].map((t, i) => (
        <line key={i} x1={pad} y1={pad + t * (H - pad * 2)} x2={W - pad} y2={pad + t * (H - pad * 2)} stroke={C.border} strokeWidth="1" />
      ))}
      <polygon points={`${x(0)},${H - pad} ${points} ${x(entries.length - 1)},${H - pad}`} fill="url(#wg)" />
      <polyline points={points} fill="none" stroke={C.orange} strokeWidth="2.5" strokeLinejoin="round" />
      {entries.map((e, i) => <circle key={i} cx={x(i)} cy={y(e.weight)} r="5" fill={C.bg} stroke={C.orange} strokeWidth="2.5" />)}
      {entries.map((e, i) => i % Math.max(1, Math.floor(entries.length / 5)) === 0 && (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill={C.sub}>{e.date.slice(5)}</text>
      ))}
      <text x={pad - 4} y={pad + 4} textAnchor="end" fontSize="9" fill={C.sub}>{max}</text>
      <text x={pad - 4} y={H - pad + 4} textAnchor="end" fontSize="9" fill={C.sub}>{min}</text>
    </svg>
  );
}

function FastingRing({ elapsed, total, active }) {
  const r = 70, cx = 90, cy = 90;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(elapsed / total, 1);
  const dash = progress * circumference;
  const fmt = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };
  const color = progress >= 1 ? C.green : active ? C.orange : C.sub2;
  return (
    <svg viewBox="0 0 180 180" style={{ width: 160 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="12" />
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="12"
        strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dasharray 0.5s", filter: active ? `drop-shadow(0 0 8px ${color})` : "none" }} />
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="bold" fill={C.text}>{fmt(elapsed)}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill={color} fontWeight="bold">
        {progress >= 1 ? "COMPLETE!" : active ? "FASTING" : "PAUSED"}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize="10" fill={C.sub}>GOAL {total / 3600}h</text>
    </svg>
  );
}

function CalorieCamera({ onAdd }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setImage(ev.target.result); setResult(null); setError(null); };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true); setError(null);
    try {
      const base64 = image.split(",")[1];
      const mediaType = image.split(";")[0].split(":")[1];
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: "この食事の写真を見て、料理名とカロリーを推定してください。必ず以下のJSON形式のみで返答してください（他のテキストは不要）：{\"name\":\"料理名\",\"calories\":数値,\"description\":\"簡単な説明\"}" }
            ]
          }]
        })
      });
      const data = await response.json();
      const text = data.content[0].text;
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
    } catch {
      setError("解析に失敗しました。もう一度試してください。");
    }
    setLoading(false);
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => { fileRef.current.removeAttribute("capture"); fileRef.current.click(); }}
          style={sportBtn(C.red, { flex: 1 })}>📁 アルバム</button>
        <button onClick={() => { fileRef.current.setAttribute("capture", "environment"); fileRef.current.click(); }}
          style={sportBtn(C.blue, { flex: 1 })}>📷 カメラ</button>
      </div>
      {image && (
        <div style={{ marginBottom: 12 }}>
          <img src={image} alt="食事" style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />
          <button onClick={() => { if (!loading) analyze(); }} disabled={loading}
            style={sportBtn(loading ? C.sub2 : C.green, { marginTop: 10 })}>
            {loading ? "⚡ AI解析中..." : "⚡ AIでカロリーを計算"}
          </button>
        </div>
      )}
      {error && <div style={{ color: C.red, fontSize: 13, padding: "8px 0" }}>{error}</div>}
      {result && (
        <div style={{ background: C.card2, border: `1px solid ${C.green}44`, borderRadius: 12, padding: 16, marginTop: 8 }}>
          <div style={{ fontSize: 11, color: C.green, marginBottom: 4, fontWeight: "bold", letterSpacing: 1 }}>AI ANALYSIS</div>
          <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 4, color: C.text }}>{result.name}</div>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>{result.description}</div>
          <div style={{ fontSize: 40, fontWeight: "900", color: C.green, marginBottom: 12, letterSpacing: -1 }}>
            {result.calories}<span style={{ fontSize: 16, fontWeight: "normal", color: C.sub }}> kcal</span>
          </div>
          <button onClick={() => { onAdd(result.name, result.calories); setImage(null); setResult(null); }}
            style={sportBtn(C.orange)}>✅ 食事記録に追加</button>
        </div>
      )}
    </div>
  );
}

function sportBtn(color, ex = {}) {
  return {
    background: `linear-gradient(135deg, ${color}, ${color}CC)`,
    color: "#fff", border: "none", borderRadius: 12,
    padding: "16px 20px", fontWeight: "800", fontSize: 15, cursor: "pointer",
    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
    display: "block", width: "100%", letterSpacing: 0.5,
    boxShadow: `0 4px 20px ${color}44`,
    ...ex,
  };
}

export default function App() {
  const saved = loadData();
  const [tab, setTab] = useState(0);
  const [fastActive, setFastActive] = useState(saved?.fastActive ?? false);
  const [fastElapsed, setFastElapsed] = useState(saved?.fastElapsed ?? 0);
  const [fastGoal, setFastGoal] = useState(saved?.fastGoal ?? 16);
  const [fastStartTime, setFastStartTime] = useState(null);
  const [fastBaseElapsed, setFastBaseElapsed] = useState(saved?.fastBaseElapsed ?? 0);
  const timerRef = useRef(null);
  const [meals, setMeals] = useState(saved?.meals ?? []);
  const [mealName, setMealName] = useState("");
  const [mealCal, setMealCal] = useState("");
  const [goal, setGoal] = useState(saved?.goal ?? { current: 0, target: 0, calLimit: 2000 });
  const [exercises, setExercises] = useState(saved?.exercises ?? []);
  const [stepsInput, setStepsInput] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [weights, setWeights] = useState(saved?.weights ?? []);
  const [weightInput, setWeightInput] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCalInput, setGoalCalInput] = useState("");
  const [memos, setMemos] = useState(saved?.memos ?? []);
  const [memoInput, setMemoInput] = useState("");

  useEffect(() => {
    if (fastActive) {
      timerRef.current = setInterval(() => {
        setFastElapsed(fastBaseElapsed + Math.floor((Date.now() - fastStartTime) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [fastActive, fastStartTime, fastBaseElapsed]);

  useEffect(() => {
    saveData({ fastGoal, fastStartTime, fastBaseElapsed, fastActive, fastElapsed, meals, exercises, weights, goal, memos });
  }, [fastGoal, fastStartTime, fastBaseElapsed, fastActive, fastElapsed, meals, exercises, weights, goal, memos]);

  const mealColors = [C.orange, C.green, C.blue, C.purple, C.red];

  const handleTimerBtn = () => {
    if (fastElapsed >= fastGoal * 3600) {
      setFastElapsed(0); setFastBaseElapsed(0); setFastStartTime(null); setFastActive(false);
    } else if (fastActive) {
      setFastBaseElapsed(fastElapsed); setFastStartTime(null); setFastActive(false);
    } else {
      setFastStartTime(Date.now()); setFastActive(true);
    }
  };
  const resetFastTimer = () => {
    setFastElapsed(0); setFastBaseElapsed(0); setFastStartTime(null); setFastActive(false);
  };

  const addMeal = (name, cal) => {
    const n = name || mealName;
    const c = cal || mealCal;
    if (!n || !c) return;
    setMeals([...meals, { id: Date.now(), name: String(n).trim(), cal: Number(c), time: new Date().toTimeString().slice(0, 5), color: mealColors[meals.length % mealColors.length] }]);
    setMealName(""); setMealCal("");
  };

  const addExercise = () => {
    const w = weights.length > 0 ? weights[weights.length - 1].weight : 60;
    if (stepsInput) {
      const steps = Number(stepsInput);
      const burned = calcStepCalories(steps, w);
      setExercises([...exercises, { id: Date.now(), name: `🚶 歩数: ${steps.toLocaleString()}歩`, burned, time: new Date().toTimeString().slice(0, 5) }]);
      setStepsInput("");
    } else if (exerciseMinutes) {
      const mins = Number(exerciseMinutes);
      const burned = Math.round(selectedExercise.met * w * mins / 60);
      setExercises([...exercises, { id: Date.now(), name: `${selectedExercise.icon} ${selectedExercise.name} ${mins}分`, burned, time: new Date().toTimeString().slice(0, 5) }]);
      setExerciseMinutes("");
    }
  };

  const addWeight = () => {
    if (!weightInput) return;
    const today = new Date().toISOString().slice(0, 10);
    setWeights([...weights.filter((w) => w.date !== today), { date: today, weight: Number(weightInput) }].sort((a, b) => a.date.localeCompare(b.date)));
    setWeightInput("");
  };

  const addMemo = () => {
    if (!memoInput.trim()) return;
    setMemos([...memos, { id: Date.now(), text: memoInput.trim(), date: new Date().toLocaleDateString("ja-JP") }]);
    setMemoInput("");
  };

  const saveGoal = () => {
    setGoal({ target: goalTarget ? Number(goalTarget) : goal.target, calLimit: goalCalInput ? Number(goalCalInput) : goal.calLimit });
    setGoalTarget(""); setGoalCalInput("");
  };

  const totalCal = meals.reduce((sum, m) => sum + (m.cal || 0), 0);
  const totalBurned = exercises.reduce((sum, e) => sum + (e.burned || 0), 0);
  const netCal = totalCal - totalBurned;
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
  const weightLeft = (latestWeight !== null ? latestWeight - goal.target : 0).toFixed(1);
  const calPct = Math.min((totalCal / goal.calLimit) * 100, 100);

  const inp = {
    border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px",
    fontSize: 16, width: "100%", boxSizing: "border-box", outline: "none",
    fontFamily: "inherit", backgroundColor: C.card2, color: C.text,
    WebkitAppearance: "none", appearance: "none", display: "block",
  };
  const card = {
    background: C.card, borderRadius: 16, padding: 20,
    margin: "12px 14px 0", border: `1px solid ${C.border}`,
  };
  const sec = {
    fontSize: 11, fontWeight: "900", color: C.sub, marginBottom: 14,
    letterSpacing: 2, textTransform: "uppercase",
  };
  const badge = (c) => ({
    background: `${c}22`, color: c, borderRadius: 8, padding: "4px 10px",
    fontSize: 12, fontWeight: "800", whiteSpace: "nowrap", border: `1px solid ${c}44`,
  });
  const statBox = (c) => ({
    flex: 1, background: `${c}0D`, borderRadius: 12, padding: 12,
    textAlign: "center", border: `1px solid ${c}33`,
  });

  return (
    <div style={{ fontFamily: "'Segoe UI','Hiragino Sans',sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto", color: C.text }}>

      {/* ヘッダー */}
      <div style={{ background: `linear-gradient(135deg, #1A0A00, #0A0A0A)`, borderBottom: `1px solid ${C.border}`, padding: "18px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: C.orange, fontWeight: "900", letterSpacing: 3, marginBottom: 2 }}>DIET TRACKER</div>
            <div style={{ fontSize: 22, fontWeight: "900", letterSpacing: -0.5 }}>💪 MY FITNESS</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.sub }}>{new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}</div>
            <div style={{ fontSize: 28, fontWeight: "900", color: calPct > 80 ? C.red : C.orange, marginTop: 2 }}>{Math.round(calPct)}<span style={{ fontSize: 12, fontWeight: "normal", color: C.sub }}>%</span></div>
          </div>
        </div>
        {/* カロリープログレス */}
        <div style={{ marginTop: 14, background: C.border, borderRadius: 6, height: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.max(0, calPct)}%`, background: calPct > 80 ? `linear-gradient(90deg,${C.orange},${C.red})` : `linear-gradient(90deg,${C.green},${C.orange})`, borderRadius: 6, transition: "width 0.5s", boxShadow: calPct > 80 ? `0 0 8px ${C.red}` : `0 0 8px ${C.orange}` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: C.sub }}>
          <span>{totalCal} kcal 摂取</span><span>上限 {goal.calLimit} kcal</span>
        </div>
      </div>

      <div style={{ paddingBottom: 80 }}>

        {/* HOME */}
        {tab === 0 && <>
          <div style={card}>
            <div style={sec}>⏱ FASTING TIMER</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FastingRing elapsed={fastElapsed} total={fastGoal * 3600} active={fastActive} />
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: C.sub, marginBottom: 6 }}>TARGET</div>
                  <select value={fastGoal}
                    onChange={(e) => { setFastGoal(Number(e.target.value)); setFastElapsed(0); setFastBaseElapsed(0); setFastStartTime(null); setFastActive(false); }}
                    style={inp}>
                    {[12, 14, 16, 18, 20, 24].map((h) => <option key={h} value={h}>{h}h</option>)}
                  </select>
                </div>
                <button onClick={handleTimerBtn}
                  style={sportBtn(fastElapsed >= fastGoal * 3600 ? C.green : fastActive ? C.red : C.orange)}>
                  {fastElapsed >= fastGoal * 3600 ? "🏆 RESET" : fastActive ? "⏸ STOP" : "▶ START"}
                </button>
                <button onClick={resetFastTimer} style={{ marginTop: 8, width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", color: C.sub, fontSize: 12, cursor: "pointer" }}>🔄 RESET</button>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={sec}>🔥 CALORIE BALANCE</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <div style={statBox(C.red)}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>摂取</div>
                <div style={{ fontSize: 26, fontWeight: "900", color: C.red, letterSpacing: -1 }}>{totalCal}</div>
                <div style={{ fontSize: 10, color: C.sub }}>kcal</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: C.sub, fontSize: 18, fontWeight: "bold" }}>−</div>
              <div style={statBox(C.green)}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>消費</div>
                <div style={{ fontSize: 26, fontWeight: "900", color: C.green, letterSpacing: -1 }}>{totalBurned}</div>
                <div style={{ fontSize: 10, color: C.sub }}>kcal</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: C.sub, fontSize: 18, fontWeight: "bold" }}>=</div>
              <div style={statBox(C.blue)}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>正味</div>
                <div style={{ fontSize: 26, fontWeight: "900", color: C.blue, letterSpacing: -1 }}>{netCal}</div>
                <div style={{ fontSize: 10, color: C.sub }}>kcal</div>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={sec}>⚖️ CURRENT WEIGHT</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 48, fontWeight: "900", color: C.text, letterSpacing: -2 }}>{latestWeight || "−"}</span>
                <span style={{ fontSize: 16, color: C.sub }}> kg</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={badge(C.purple)}>あと {weightLeft} kg</div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 6 }}>目標 {goal.target} kg</div>
              </div>
            </div>
          </div>
        </>}

        {/* MEAL */}
        {tab === 1 && <>
          <div style={card}>
            <div style={sec}>📷 AI CALORIE SCAN</div>
            <CalorieCamera onAdd={(name, cal) => addMeal(name, cal)} />
          </div>
          <div style={card}>
            <div style={sec}>✏️ MANUAL INPUT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input style={inp} type="text" placeholder="食事名（例：チキンサラダ）"
                value={mealName} onChange={(e) => setMealName(e.target.value)} />
              <input style={inp} type="tel" placeholder="カロリー（例：420）"
                value={mealCal} onChange={(e) => setMealCal(e.target.value.replace(/[^0-9]/g, ""))} />
              <button onClick={() => addMeal()} style={sportBtn(C.orange)}>➕ ADD MEAL</button>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>📋 TODAY'S MEALS</div>
            {meals.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 13 }}>記録なし</div>}
            {meals.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 36, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: "700", fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: C.sub }}>{m.time}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={badge(m.color)}>{m.cal} kcal</span>
                  <button onClick={() => setMeals(meals.filter((x) => x.id !== m.id))}
                    style={{ background: "none", border: "none", color: C.sub2, cursor: "pointer", fontSize: 20, padding: "8px", touchAction: "manipulation" }}>×</button>
                </div>
              </div>
            ))}
            {meals.length > 0 && (
              <div style={{ paddingTop: 12, fontWeight: "900", display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                <span style={{ color: C.sub }}>TOTAL</span>
                <span style={{ color: C.orange }}>{totalCal} kcal</span>
              </div>
            )}
          </div>
        </>}

        {/* TRAIN */}
        {tab === 2 && <>
          <div style={card}>
            <div style={sec}>🚶 STEPS</div>
            <input style={{ ...inp, marginBottom: 12 }} type="tel" placeholder="歩数（例: 8000）"
              value={stepsInput} onChange={(e) => setStepsInput(e.target.value.replace(/[^0-9]/g, ""))} />
            <button onClick={addExercise} style={sportBtn(C.green)}>➕ ADD STEPS</button>
          </div>
          <div style={card}>
            <div style={sec}>💪 WORKOUT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <select value={selectedExercise.name}
                onChange={(e) => setSelectedExercise(EXERCISES.find((ex) => ex.name === e.target.value))}
                style={inp}>
                {EXERCISES.map((ex) => <option key={ex.name} value={ex.name}>{ex.icon} {ex.name}</option>)}
              </select>
              <input style={inp} type="tel" placeholder="時間（分）（例: 30）"
                value={exerciseMinutes} onChange={(e) => setExerciseMinutes(e.target.value.replace(/[^0-9]/g, ""))} />
              <button onClick={addExercise} style={sportBtn(C.green)}>🔥 ADD WORKOUT</button>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>📋 TODAY'S TRAINING</div>
            {exercises.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 13 }}>記録なし</div>}
            {exercises.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 36, borderRadius: 2, background: C.green }} />
                  <div>
                    <div style={{ fontWeight: "700", fontSize: 14 }}>{e.name}</div>
                    <div style={{ fontSize: 11, color: C.sub }}>{e.time}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={badge(C.green)}>{e.burned} kcal</span>
                  <button onClick={() => setExercises(exercises.filter((x) => x.id !== e.id))}
                    style={{ background: "none", border: "none", color: C.sub2, cursor: "pointer", fontSize: 20, padding: "8px", touchAction: "manipulation" }}>×</button>
                </div>
              </div>
            ))}
            {exercises.length > 0 && (
              <div style={{ paddingTop: 12, fontWeight: "900", display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                <span style={{ color: C.sub }}>TOTAL BURNED</span>
                <span style={{ color: C.green }}>{totalBurned} kcal</span>
              </div>
            )}
          </div>
        </>}

        {/* WEIGHT */}
        {tab === 3 && <>
          <div style={card}>
            <div style={sec}>📈 WEIGHT GRAPH</div>
            <WeightGraph entries={weights} />
          </div>
          <div style={card}>
            <div style={sec}>➕ RECORD WEIGHT</div>
            <input style={{ ...inp, marginBottom: 12 }} placeholder="体重（例: 66.5）" inputMode="decimal"
              value={weightInput} onChange={(e) => setWeightInput(e.target.value.replace(/[^0-9.]/g, ""))} />
            <button onTouchEnd={(e) => { e.preventDefault(); addWeight(); }} onClick={addWeight} style={sportBtn(C.blue)}>⚖️ SAVE WEIGHT</button>
          </div>
          <div style={card}>
            <div style={sec}>📅 HISTORY</div>
            {weights.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 13 }}>記録なし</div>}
            {[...weights].reverse().slice(0, 7).map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.sub, fontSize: 13 }}>{w.date}</span>
                <span style={{ fontWeight: "900", color: C.text }}>{w.weight} <span style={{ fontSize: 11, color: C.sub }}>kg</span></span>
              </div>
            ))}
          </div>
        </>}

        {/* MEMO */}
        {tab === 4 && <>
          <div style={card}>
            <div style={sec}>✏️ NEW MEMO</div>
            <textarea
              style={{ ...inp, height: 100, resize: "none", lineHeight: 1.6 }}
              placeholder="気づいたこと、体調、食欲など…"
              value={memoInput}
              onChange={(e) => setMemoInput(e.target.value)}
            />
            <button onClick={addMemo} style={{ ...sportBtn(C.purple), marginTop: 12 }}>📝 SAVE MEMO</button>
          </div>
          <div style={card}>
            <div style={sec}>📋 MEMO LIST</div>
            {memos.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 13 }}>メモなし</div>}
            {[...memos].reverse().map((m) => (
              <div key={m.id} style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.purple, fontWeight: "bold" }}>{m.date}</span>
                  <button onClick={() => setMemos(memos.filter((x) => x.id !== m.id))}
                    style={{ background: "none", border: "none", color: C.sub2, cursor: "pointer", fontSize: 20, padding: "4px 8px" }}>×</button>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", color: C.text }}>{m.text}</div>
              </div>
            ))}
          </div>
        </>}

        {/* GOAL */}
        {tab === 5 && <>
          <div style={card}>
            <div style={sec}>🎯 CURRENT GOALS</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, background: `${C.purple}11`, border: `1px solid ${C.purple}33`, borderRadius: 14, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 6, letterSpacing: 1 }}>TARGET WEIGHT</div>
                <div style={{ fontSize: 34, fontWeight: "900", color: C.purple, letterSpacing: -1 }}>{goal.target}<span style={{ fontSize: 13, fontWeight: "normal", color: C.sub }}> kg</span></div>
              </div>
              <div style={{ flex: 1, background: `${C.orange}11`, border: `1px solid ${C.orange}33`, borderRadius: 14, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 6, letterSpacing: 1 }}>CAL LIMIT</div>
                <div style={{ fontSize: 28, fontWeight: "900", color: C.orange, letterSpacing: -1 }}>{goal.calLimit}<span style={{ fontSize: 11, fontWeight: "normal", color: C.sub }}> kcal</span></div>
              </div>
            </div>
            <div style={{ background: `${C.green}0D`, border: `1px solid ${C.green}33`, borderRadius: 14, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>REMAINING</div>
              <div style={{ fontSize: 32, fontWeight: "900", color: C.green }}>あと {weightLeft} kg！</div>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>✏️ UPDATE GOALS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input style={inp} placeholder={`目標体重（現在: ${goal.target} kg）`} inputMode="decimal"
                value={goalTarget} onChange={(e) => setGoalTarget(e.target.value.replace(/[^0-9.]/g, ""))} />
              <input style={inp} placeholder={`カロリー上限（現在: ${goal.calLimit} kcal）`} inputMode="numeric"
                value={goalCalInput} onChange={(e) => setGoalCalInput(e.target.value.replace(/[^0-9]/g, ""))} />
              <button onTouchEnd={(e) => { e.preventDefault(); saveGoal(); }} onClick={saveGoal} style={sportBtn(C.purple)}>💾 SAVE GOALS</button>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>💡 PRO TIPS</div>
            {[
              { icon: "🥩", text: "タンパク質を意識して筋肉を維持しよう" },
              { icon: "💧", text: "1日2Lの水を飲むと代謝アップ！" },
              { icon: "🏃", text: "食後30分のウォーキングが効果的" },
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{tip.icon}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: C.sub }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </>}
      </div>

      {/* タブバー */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.card, display: "flex", borderTop: `1px solid ${C.border}`, zIndex: 100 }}>
        {TABS.map((icon, i) => (
          <button key={i} onClick={() => setTab(i)}
            style={{ flex: 1, padding: "10px 2px 8px", border: "none", background: "none", fontSize: 9, fontWeight: i === tab ? "900" : "normal", color: i === tab ? C.orange : C.sub2, cursor: "pointer", WebkitTapHighlightColor: "transparent", touchAction: "manipulation", letterSpacing: 0.5 }}>
            <div style={{ fontSize: 20, marginBottom: 2, filter: i === tab ? `drop-shadow(0 0 6px ${C.orange})` : "none" }}>{icon}</div>
            <div>{TAB_LABELS[i]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
