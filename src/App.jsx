import { useState, useEffect, useRef } from "react";

const TABS = ["🏠", "🍽", "🏃", "⚖️", "🎯"];
const TAB_LABELS = ["ホーム", "食事", "運動", "体重", "目標"];

function WeightGraph({ entries }) {
  if (entries.length === 0)
    return <div style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>まだデータがありません</div>;
  const vals = entries.map((e) => e.weight);
  const min = Math.floor(Math.min(...vals) - 1);
  const max = Math.ceil(Math.max(...vals) + 1);
  const W = 320, H = 160, pad = 36;
  const x = (i) => pad + (i / Math.max(entries.length - 1, 1)) * (W - pad * 2);
  const y = (v) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
  const points = entries.map((e, i) => `${x(i)},${y(e.weight)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", borderRadius: 16 }}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4D96FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4D96FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.33, 0.66, 1].map((t, i) => (
        <line key={i} x1={pad} y1={pad + t * (H - pad * 2)} x2={W - pad} y2={pad + t * (H - pad * 2)} stroke="#E0E0E0" strokeWidth="1" />
      ))}
      <polygon points={`${x(0)},${H - pad} ${points} ${x(entries.length - 1)},${H - pad}`} fill="url(#wg)" />
      <polyline points={points} fill="none" stroke="#4D96FF" strokeWidth="2.5" strokeLinejoin="round" />
      {entries.map((e, i) => <circle key={i} cx={x(i)} cy={y(e.weight)} r="5" fill="#fff" stroke="#4D96FF" strokeWidth="2.5" />)}
      {entries.map((e, i) => i % Math.max(1, Math.floor(entries.length / 5)) === 0 && (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#888">{e.date.slice(5)}</text>
      ))}
      <text x={pad - 4} y={pad + 4} textAnchor="end" fontSize="9" fill="#888">{max}</text>
      <text x={pad - 4} y={H - pad + 4} textAnchor="end" fontSize="9" fill="#888">{min}</text>
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
  return (
    <svg viewBox="0 0 180 180" style={{ width: 160 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEE" strokeWidth="12" />
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={progress >= 1 ? "#6BCB77" : "#FF6B6B"} strokeWidth="12"
        strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dasharray 0.5s" }} />
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#2D2D2D">{fmt(elapsed)}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#888">
        {progress >= 1 ? "🎉 完了！" : active ? "断食中" : "停止中"}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize="10" fill="#888">目標 {total / 3600}h</text>
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
    } catch (e) {
      setError("解析に失敗しました。もう一度試してください。");
    }
    setLoading(false);
  };

  const tb = (c, ex = {}) => ({
    background: c, color: "#fff", border: "none", borderRadius: 14,
    padding: "16px 20px", fontWeight: "bold", fontSize: 15, cursor: "pointer",
    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
    display: "block", width: "100%", ...ex,
  });

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => { fileRef.current.removeAttribute("capture"); fileRef.current.click(); }}
          style={tb("#FF6B6B", { flex: 1 })}>📁 アルバム</button>
        <button onClick={() => { fileRef.current.setAttribute("capture", "environment"); fileRef.current.click(); }}
          style={tb("#4D96FF", { flex: 1 })}>📷 カメラ</button>
      </div>
      {image && (
        <div style={{ marginBottom: 12 }}>
          <img src={image} alt="食事" style={{ width: "100%", borderRadius: 16, maxHeight: 200, objectFit: "cover" }} />
          <button onClick={() => { if (!loading) analyze(); }} disabled={loading}
            style={tb(loading ? "#CCC" : "#6BCB77", { marginTop: 10 })}>
            {loading ? "🤖 AI解析中..." : "🤖 AIでカロリーを計算"}
          </button>
        </div>
      )}
      {error && <div style={{ color: "#FF6B6B", fontSize: 13, padding: "8px 0" }}>{error}</div>}
      {result && (
        <div style={{ background: "#6BCB7715", borderRadius: 16, padding: 16, marginTop: 8 }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>AI解析結果</div>
          <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 4 }}>{result.name}</div>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>{result.description}</div>
          <div style={{ fontSize: 32, fontWeight: "bold", color: "#6BCB77", marginBottom: 12 }}>
            {result.calories} <span style={{ fontSize: 16 }}>kcal</span>
          </div>
          <button onClick={() => { onAdd(result.name, result.calories); setImage(null); setResult(null); }}
            style={tb("#FF6B6B")}>✅ 食事記録に追加</button>
        </div>
      )}
    </div>
  );
}

const STORAGE_KEY = "dietapp_v5";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

// 歩数から消費カロリーを計算（体重×0.035×歩数/1000）
function calcStepCalories(steps, weight) {
  return Math.round(weight * 0.035 * steps / 1000 * 10) / 10;
}

const EXERCISES = [
  { name: "ウォーキング", met: 3.5, icon: "🚶" },
  { name: "ジョギング", met: 7.0, icon: "🏃" },
  { name: "サイクリング", met: 6.0, icon: "🚴" },
  { name: "水泳", met: 8.0, icon: "🏊" },
  { name: "筋トレ", met: 5.0, icon: "💪" },
  { name: "ヨガ", met: 2.5, icon: "🧘" },
  { name: "ダンス", met: 5.5, icon: "💃" },
  { name: "その他", met: 4.0, icon: "⚡" },
];

export default function App() {
  const [tab, setTab] = useState(0);
  const saved = loadData();

  const [fastGoal, setFastGoal] = useState(saved?.fastGoal || 16);
  const [fastStartTime, setFastStartTime] = useState(saved?.fastStartTime || null);
  const [fastBaseElapsed, setFastBaseElapsed] = useState(saved?.fastBaseElapsed || 0);
  const [fastActive, setFastActive] = useState(saved?.fastActive || false);
  const [fastElapsed, setFastElapsed] = useState(() => {
    if (saved?.fastActive && saved?.fastStartTime) {
      return saved.fastBaseElapsed + Math.floor((Date.now() - saved.fastStartTime) / 1000);
    }
    return saved?.fastBaseElapsed || 0;
  });

  const [meals, setMeals] = useState(saved?.meals || []);
  const [exercises, setExercises] = useState(saved?.exercises || []);
  const [weights, setWeights] = useState(saved?.weights || []);
  const [goal, setGoal] = useState(saved?.goal || { target: 60, calLimit: 1800 });

  const [mealName, setMealName] = useState("");
  const [mealCal, setMealCal] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCalInput, setGoalCalInput] = useState("");

  // 運動入力
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [stepsInput, setStepsInput] = useState("");

  const timerRef = useRef(null);

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
    saveData({ fastGoal, fastStartTime, fastBaseElapsed, fastActive, fastElapsed, meals, exercises, weights, goal });
  }, [fastGoal, fastStartTime, fastBaseElapsed, fastActive, fastElapsed, meals, exercises, weights, goal]);

  const colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#C77DFF", "#FFA07A"];

  const handleTimerBtn = () => {
    if (fastElapsed >= fastGoal * 3600) {
      setFastElapsed(0); setFastBaseElapsed(0); setFastStartTime(null); setFastActive(false);
    } else if (fastActive) {
      setFastBaseElapsed(fastElapsed); setFastStartTime(null); setFastActive(false);
    } else {
      setFastStartTime(Date.now()); setFastActive(true);
    }
  };

  const addMeal = (name, cal) => {
    const n = name || mealName;
    const c = cal || mealCal;
    if (!n || !c) return;
    setMeals([...meals, { id: Date.now(), name: String(n).trim(), cal: Number(c), time: new Date().toTimeString().slice(0, 5), color: colors[meals.length % colors.length] }]);
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

  const saveGoal = () => {
    setGoal({ target: goalTarget ? Number(goalTarget) : goal.target, calLimit: goalCalInput ? Number(goalCalInput) : goal.calLimit });
    setGoalTarget(""); setGoalCalInput("");
  };

  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
  const totalCal = meals.reduce((s, m) => s + m.cal, 0);
  const totalBurned = exercises.reduce((s, e) => s + e.burned, 0);
  const netCal = totalCal - totalBurned;
  const weightLeft = latestWeight ? (latestWeight - goal.target).toFixed(1) : "−";
  const calPct = Math.min((netCal / goal.calLimit) * 100, 100);

  const inp = {
    border: "2px solid #E0E0E0", borderRadius: 12, padding: "16px",
    fontSize: 18, width: "100%", boxSizing: "border-box", outline: "none",
    fontFamily: "inherit", backgroundColor: "#fff",
    WebkitAppearance: "none", appearance: "none", color: "#2D2D2D", display: "block",
  };
  const btn = (c, ex = {}) => ({
    background: c, color: "#fff", border: "none", borderRadius: 14,
    padding: "18px 24px", fontWeight: "bold", fontSize: 17, cursor: "pointer",
    width: "100%", WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
    display: "block", textAlign: "center", ...ex,
  });
  const card = { background: "#fff", borderRadius: 20, padding: 20, margin: "16px 16px 0", boxShadow: "0 4px 16px rgba(0,0,0,0.07)" };
  const sec = { fontSize: 12, fontWeight: "bold", color: "#888", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 };
  const tag = (c) => ({ background: c + "22", color: c, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: "bold", whiteSpace: "nowrap" });

  return (
    <div style={{ fontFamily: "'Segoe UI','Hiragino Sans',sans-serif", background: "#FFF9F0", minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#FF6B6B,#C77DFF)", color: "#fff", padding: "20px 20px 24px", borderRadius: "0 0 24px 24px" }}>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>🌸 ダイエットアプリ</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
          {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </div>
      </div>

      <div style={{ paddingBottom: 90 }}>

        {/* ホーム */}
        {tab === 0 && <>
          <div style={card}>
            <div style={sec}>⏱ 断食タイマー</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FastingRing elapsed={fastElapsed} total={fastGoal * 3600} active={fastActive} />
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 12, color: "#888" }}>目標時間</label>
                  <select value={fastGoal}
                    onChange={(e) => { setFastGoal(Number(e.target.value)); setFastElapsed(0); setFastBaseElapsed(0); setFastStartTime(null); setFastActive(false); }}
                    style={{ ...inp, marginTop: 4 }}>
                    {[12, 14, 16, 18, 20, 24].map((h) => <option key={h} value={h}>{h}時間</option>)}
                  </select>
                </div>
                <button onClick={handleTimerBtn}
                  style={btn(fastElapsed >= fastGoal * 3600 ? "#6BCB77" : fastActive ? "#FF6B6B" : "#4D96FF")}>
                  {fastElapsed >= fastGoal * 3600 ? "🎉 リセット" : fastActive ? "⏸ 停止" : "▶ スタート"}
                </button>
              </div>
            </div>
          </div>

          {/* カロリーサマリー */}
          <div style={card}>
            <div style={sec}>🍽 カロリーバランス</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, background: "#FF6B6B15", borderRadius: 14, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#888" }}>摂取</div>
                <div style={{ fontSize: 22, fontWeight: "bold", color: "#FF6B6B" }}>{totalCal}</div>
                <div style={{ fontSize: 11, color: "#888" }}>kcal</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", fontSize: 20 }}>−</div>
              <div style={{ flex: 1, background: "#6BCB7715", borderRadius: 14, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#888" }}>消費</div>
                <div style={{ fontSize: 22, fontWeight: "bold", color: "#6BCB77" }}>{totalBurned}</div>
                <div style={{ fontSize: 11, color: "#888" }}>kcal</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", fontSize: 20 }}>=</div>
              <div style={{ flex: 1, background: "#4D96FF15", borderRadius: 14, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#888" }}>正味</div>
                <div style={{ fontSize: 22, fontWeight: "bold", color: "#4D96FF" }}>{netCal}</div>
                <div style={{ fontSize: 11, color: "#888" }}>kcal</div>
              </div>
            </div>
            <div style={{ background: "#F0F0F0", borderRadius: 10, height: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.max(0, calPct)}%`, background: `linear-gradient(90deg,#6BCB77,${calPct > 80 ? "#FF6B6B" : "#4D96FF"})`, borderRadius: 10, transition: "width 0.5s" }} />
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>目標: {goal.calLimit} kcal</div>
          </div>

          <div style={card}>
            <div style={sec}>⚖️ 体重</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 32, fontWeight: "bold" }}>{latestWeight || "−"}</span>
                <span style={{ fontSize: 14, color: "#888" }}> kg</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={tag("#C77DFF")}>目標まで {weightLeft} kg</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>目標: {goal.target} kg</div>
              </div>
            </div>
          </div>
        </>}

        {/* 食事 */}
        {tab === 1 && <>
          <div style={card}>
            <div style={sec}>📷 写真でカロリー計算</div>
            <CalorieCamera onAdd={(name, cal) => addMeal(name, cal)} />
          </div>
          <div style={card}>
            <div style={sec}>✏️ 手動で追加</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>食事名</label>
                <input style={inp} type="text" placeholder="例：チキンサラダ"
                  value={mealName} onChange={(e) => setMealName(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = "#FF6B6B"}
                  onBlur={(e) => e.target.style.borderColor = "#E0E0E0"} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>カロリー (kcal)</label>
                <input style={inp} type="tel" placeholder="例：420"
                  value={mealCal} onChange={(e) => setMealCal(e.target.value.replace(/[^0-9]/g, ""))}
                  onFocus={(e) => e.target.style.borderColor = "#FF6B6B"}
                  onBlur={(e) => e.target.style.borderColor = "#E0E0E0"} />
              </div>
              <button onClick={() => addMeal()} style={btn("#FF6B6B")}>➕ 追加する</button>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>📋 今日の食事</div>
            {meals.length === 0 && <div style={{ color: "#888", textAlign: "center", padding: 20 }}>まだ記録がありません</div>}
            {meals.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F5F5F5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{m.time}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={tag(m.color)}>{m.cal} kcal</span>
                  <button onClick={() => setMeals(meals.filter((x) => x.id !== m.id))}
                    style={{ background: "none", border: "none", color: "#CCC", cursor: "pointer", fontSize: 22, padding: "8px 10px", touchAction: "manipulation" }}>×</button>
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 12, fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
              <span>合計</span>
              <span style={{ color: "#FF6B6B" }}>{totalCal} kcal</span>
            </div>
          </div>
        </>}

        {/* 運動 */}
        {tab === 2 && <>
          <div style={card}>
            <div style={sec}>🚶 歩数を記録</div>
            <div>
              <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>今日の歩数</label>
              <input style={{ ...inp, marginBottom: 12 }} type="tel" placeholder="例: 8000"
                value={stepsInput} onChange={(e) => setStepsInput(e.target.value.replace(/[^0-9]/g, ""))}
                onFocus={(e) => e.target.style.borderColor = "#6BCB77"}
                onBlur={(e) => e.target.style.borderColor = "#E0E0E0"} />
              {stepsInput && (
                <div style={{ background: "#6BCB7715", borderRadius: 12, padding: 12, marginBottom: 12, textAlign: "center" }}>
                  <span style={{ fontSize: 13, color: "#888" }}>消費カロリー目安: </span>
                  <span style={{ fontSize: 18, fontWeight: "bold", color: "#6BCB77" }}>
                    {calcStepCalories(Number(stepsInput), latestWeight || 60)} kcal
                  </span>
                </div>
              )}
              <button onClick={addExercise} style={btn("#6BCB77")}>🚶 歩数を追加</button>
            </div>
          </div>

          <div style={card}>
            <div style={sec}>🏃 運動を記録</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>運動の種類</label>
                <select style={inp} value={selectedExercise.name}
                  onChange={(e) => setSelectedExercise(EXERCISES.find((ex) => ex.name === e.target.value))}>
                  {EXERCISES.map((ex) => (
                    <option key={ex.name} value={ex.name}>{ex.icon} {ex.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>運動時間 (分)</label>
                <input style={inp} type="tel" placeholder="例: 30"
                  value={exerciseMinutes} onChange={(e) => setExerciseMinutes(e.target.value.replace(/[^0-9]/g, ""))}
                  onFocus={(e) => e.target.style.borderColor = "#FF6B6B"}
                  onBlur={(e) => e.target.style.borderColor = "#E0E0E0"} />
              </div>
              {exerciseMinutes && (
                <div style={{ background: "#6BCB7715", borderRadius: 12, padding: 12, textAlign: "center" }}>
                  <span style={{ fontSize: 13, color: "#888" }}>消費カロリー目安: </span>
                  <span style={{ fontSize: 18, fontWeight: "bold", color: "#6BCB77" }}>
                    {Math.round(selectedExercise.met * (latestWeight || 60) * Number(exerciseMinutes) / 60)} kcal
                  </span>
                </div>
              )}
              <button onClick={addExercise} style={btn("#FF6B6B")}>🏃 運動を追加</button>
            </div>
          </div>

          <div style={card}>
            <div style={sec}>📋 今日の運動</div>
            {exercises.length === 0 && <div style={{ color: "#888", textAlign: "center", padding: 20 }}>まだ記録がありません</div>}
            {exercises.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F5F5F5" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 14 }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{e.time}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={tag("#6BCB77")}>{e.burned} kcal</span>
                  <button onClick={() => setExercises(exercises.filter((x) => x.id !== e.id))}
                    style={{ background: "none", border: "none", color: "#CCC", cursor: "pointer", fontSize: 22, padding: "8px 10px", touchAction: "manipulation" }}>×</button>
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 12, fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
              <span>合計消費</span>
              <span style={{ color: "#6BCB77" }}>{totalBurned} kcal</span>
            </div>
          </div>
        </>}

        {/* 体重 */}
        {tab === 3 && <>
          <div style={card}>
            <div style={sec}>📈 体重グラフ</div>
            <WeightGraph entries={weights} />
          </div>
          <div style={card}>
            <div style={sec}>➕ 体重を記録</div>
            <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>体重 (kg)</label>
            <input style={{ ...inp, marginBottom: 12 }} type="tel" placeholder="例: 66.5"
              value={weightInput} onChange={(e) => setWeightInput(e.target.value.replace(/[^0-9.]/g, ""))}
              onFocus={(e) => e.target.style.borderColor = "#4D96FF"}
              onBlur={(e) => e.target.style.borderColor = "#E0E0E0"} />
            <button onClick={addWeight} style={btn("#4D96FF")}>⚖️ 記録する</button>
          </div>
          <div style={card}>
            <div style={sec}>📅 履歴</div>
            {weights.length === 0 && <div style={{ color: "#888", textAlign: "center", padding: 20 }}>まだ記録がありません</div>}
            {[...weights].reverse().slice(0, 7).map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
                <span style={{ color: "#888", fontSize: 13 }}>{w.date}</span>
                <span style={{ fontWeight: "bold" }}>{w.weight} kg</span>
              </div>
            ))}
          </div>
        </>}

        {/* 目標 */}
        {tab === 4 && <>
          <div style={card}>
            <div style={sec}>🎯 現在の目標</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, background: "#C77DFF22", borderRadius: 16, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#888" }}>目標体重</div>
                <div style={{ fontSize: 28, fontWeight: "bold", color: "#C77DFF" }}>{goal.target}<span style={{ fontSize: 13 }}> kg</span></div>
              </div>
              <div style={{ flex: 1, background: "#FF6B6B22", borderRadius: 16, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#888" }}>カロリー上限</div>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#FF6B6B" }}>{goal.calLimit}<span style={{ fontSize: 13 }}> kcal</span></div>
              </div>
            </div>
            <div style={{ marginTop: 12, background: "#6BCB7722", borderRadius: 16, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#888" }}>現在との差</div>
              <div style={{ fontSize: 22, fontWeight: "bold", color: "#6BCB77" }}>あと {weightLeft} kg！</div>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>✏️ 目標を変更</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>目標体重 (kg)</label>
                <input style={inp} type="tel" placeholder={`現在: ${goal.target} kg`}
                  value={goalTarget} onChange={(e) => setGoalTarget(e.target.value.replace(/[^0-9.]/g, ""))}
                  onFocus={(e) => e.target.style.borderColor = "#C77DFF"}
                  onBlur={(e) => e.target.style.borderColor = "#E0E0E0"} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>1日カロリー上限 (kcal)</label>
                <input style={inp} type="tel" placeholder={`現在: ${goal.calLimit} kcal`}
                  value={goalCalInput} onChange={(e) => setGoalCalInput(e.target.value.replace(/[^0-9]/g, ""))}
                  onFocus={(e) => e.target.style.borderColor = "#C77DFF"}
                  onBlur={(e) => e.target.style.borderColor = "#E0E0E0"} />
              </div>
              <button onClick={saveGoal} style={btn("#C77DFF")}>💾 保存する</button>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>💡 今日のアドバイス</div>
            {[
              { icon: "🥗", text: "タンパク質を意識して筋肉を維持しよう" },
              { icon: "💧", text: "1日2Lの水を飲むと代謝アップ！" },
              { icon: "🚶", text: "食後30分のウォーキングが効果的" },
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 2 ? "1px solid #F5F5F5" : "none" }}>
                <span style={{ fontSize: 22 }}>{tip.icon}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5 }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </>}
      </div>

      {/* タブバー */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", display: "flex", borderTop: "1px solid #F0F0F0", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", zIndex: 100 }}>
        {TABS.map((icon, i) => (
          <button key={i} onClick={() => setTab(i)}
            style={{ flex: 1, padding: "10px 4px 8px", border: "none", background: "none", fontSize: 11, fontWeight: i === tab ? "bold" : "normal", color: i === tab ? "#FF6B6B" : "#888", cursor: "pointer", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
            <div style={{ fontSize: 20 }}>{icon}</div>
            <div>{TAB_LABELS[i]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}