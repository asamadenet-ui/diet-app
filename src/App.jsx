import { useState, useEffect, useRef } from "react";

const TABS = ["🏠", "🍽", "⚖️", "🎯"];
const TAB_LABELS = ["ホーム", "食事", "体重", "目標"];

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  const setStoredValue = (val) => {
    try {
      setValue(val);
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  };
  return [value, setStoredValue];
}

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
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={progress >= 1 ? "#6BCB77" : "#FF6B6B"} strokeWidth="12"
        strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dasharray 0.5s" }} />
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#2D2D2D">{fmt(elapsed)}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#888">{progress >= 1 ? "🎉 完了！" : active ? "断食中" : "停止中"}</text>
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
        <button onTouchEnd={(e) => { e.preventDefault(); fileRef.current.removeAttribute("capture"); fileRef.current.click(); }}
          onClick={() => { fileRef.current.removeAttribute("capture"); fileRef.current.click(); }}
          style={tb("#FF6B6B", { flex: 1 })}>📁 アルバム</button>
        <button onTouchEnd={(e) => { e.preventDefault(); fileRef.current.setAttribute("capture", "environment"); fileRef.current.click(); }}
          onClick={() => { fileRef.current.setAttribute("capture", "environment"); fileRef.current.click(); }}
          style={tb("#4D96FF", { flex: 1 })}>📷 カメラ</button>
      </div>
      {image && (
        <div style={{ marginBottom: 12 }}>
          <img src={image} alt="食事" style={{ width: "100%", borderRadius: 16, maxHeight: 200, objectFit: "cover" }} />
          <button onTouchEnd={(e) => { e.preventDefault(); if (!loading) analyze(); }}
            onClick={() => { if (!loading) analyze(); }} disabled={loading}
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
          <div style={{ fontSize: 32, fontWeight: "bold", color: "#6BCB77", marginBottom: 12 }}>{result.calories} <span style={{ fontSize: 16 }}>kcal</span></div>
          <button onTouchEnd={(e) => { e.preventDefault(); onAdd(result.name, result.calories); setImage(null); setResult(null); }}
            onClick={() => { onAdd(result.name, result.calories); setImage(null); setResult(null); }}
            style={tb("#FF6B6B")}>✅ 食事記録に追加</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);

  // データ保存機能付き
  const [fastElapsed, setFastElapsed] = useLocalStorage("fastElapsed", 0);
  const [fastActive, setFastActive] = useLocalStorage("fastActive", false);
  const [fastGoal, setFastGoal] = useLocalStorage("fastGoal", 16);
  const [meals, setMeals] = useLocalStorage("meals", []);
  const [weights, setWeights] = useLocalStorage("weights", [
    { date: "2025-06-01", weight: 68.5 }, { date: "2025-06-04", weight: 67.9 },
    { date: "2025-06-07", weight: 67.4 }, { date: "2025-06-10", weight: 66.8 },
    { date: "2025-06-13", weight: 66.3 },
  ]);
  const [goal, setGoal] = useLocalStorage("goal", { current: 66.3, target: 60, calLimit: 1800 });

  const timerRef = useRef(null);

  // タイマー（アプリを閉じても経過時間を保持）
  useEffect(() => {
    if (fastActive) {
      timerRef.current = setInterval(() => {
        setFastElapsed((e) => e + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [fastActive]);

  const colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#C77DFF", "#FFA07A"];
  const [mealName, setMealName] = useState("");
  const [mealCal, setMealCal] = useState("");

  const addMeal = (name, cal) => {
    if (!name || !cal) return;
    setMeals([...meals, { id: Date.now(), name, cal: Number(cal), time: new Date().toTimeString().slice(0, 5), color: colors[meals.length % colors.length] }]);
    setMealName(""); setMealCal("");
  };

  const totalCal = meals.reduce((s, m) => s + m.cal, 0);
  const [weightInput, setWeightInput] = useState("");

  const addWeight = () => {
    if (!weightInput) return;
    const today = new Date().toISOString().slice(0, 10);
    setWeights([...weights.filter((w) => w.date !== today), { date: today, weight: Number(weightInput) }]
      .sort((a, b) => a.date.localeCompare(b.date)));
    setWeightInput("");
  };

  const [goalTarget, setGoalTarget] = useState("");
  const [goalCal, setGoalCal] = useState("");

  const saveGoal = () => {
    setGoal({ ...goal, target: Number(goalTarget) || goal.target, calLimit: Number(goalCal) || goal.calLimit });
    setGoalTarget(""); setGoalCal("");
  };

  const weightLeft = (goal.current - goal.target).toFixed(1);
  const calPct = Math.min((totalCal / goal.calLimit) * 100, 100);

  const inp = {
    border: "2px solid #F0F0F0", borderRadius: 12, padding: "14px",
    fontSize: 18, width: "100%", boxSizing: "border-box", outline: "none",
    fontFamily: "inherit", WebkitAppearance: "none", appearance: "none", backgroundColor: "#fff",
  };
  const btn = (c, ex = {}) => ({
    background: c, color: "#fff", border: "none", borderRadius: 14,
    padding: "16px 24px", fontWeight: "bold", fontSize: 16, cursor: "pointer",
    width: "100%", WebkitTapHighlightColor: "transparent", touchAction: "manipulation", ...ex,
  });
  const card = { background: "#fff", borderRadius: 20, padding: 20, margin: "16px 16px 0", boxShadow: "0 4px 16px rgba(0,0,0,0.07)" };
  const sec = { fontSize: 12, fontWeight: "bold", color: "#888", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 };
  const tag = (c) => ({ background: c + "22", color: c, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: "bold", whiteSpace: "nowrap" });

  return (
    <div style={{ fontFamily: "'Segoe UI','Hiragino Sans',sans-serif", background: "#FFF9F0", minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#FF6B6B,#C77DFF)", color: "#fff", padding: "20px 20px 24px", borderRadius: "0 0 24px 24px" }}>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>🌸 ダイエットアプリ</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</div>
      </div>
      <div style={{ paddingBottom: 90 }}>
        {tab === 0 && <>
          <div style={card}>
            <div style={sec}>⏱ 断食タイマー</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FastingRing elapsed={fastElapsed} total={fastGoal * 3600} active={fastActive} />
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 12, color: "#888" }}>目標時間</label>
                  <select value={fastGoal} onChange={(e) => { setFastGoal(Number(e.target.value)); setFastElapsed(0); setFastActive(false); }} style={{ ...inp, marginTop: 4 }}>
                    {[12, 14, 16, 18, 20, 24].map((h) => <option key={h} value={h}>{h}時間</option>)}
                  </select>
                </div>
                <button
                  onTouchEnd={(e) => { e.preventDefault(); if (fastElapsed >= fastGoal * 3600) { setFastElapsed(0); setFastActive(false); } else { setFastActive(!fastActive); } }}
                  onClick={() => { if (fastElapsed >= fastGoal * 3600) { setFastElapsed(0); setFastActive(false); } else { setFastActive(!fastActive); } }}
                  style={btn(fastElapsed >= fastGoal * 3600 ? "#6BCB77" : fastActive ? "#FF6B6B" : "#4D96FF")}>
                  {fastElapsed >= fastGoal * 3600 ? "🎉 リセット" : fastActive ? "⏸ 停止" : "▶ スタート"}
                </button>
              </div>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>🍽 今日のカロリー</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 28, fontWeight: "bold" }}>{totalCal} <span style={{ fontSize: 14, color: "#888" }}>kcal</span></span>
              <span style={tag(calPct > 90 ? "#FF6B6B" : "#6BCB77")}>残り {goal.calLimit - totalCal}</span>
            </div>
            <div style={{ background: "#F0F0F0", borderRadius: 10, height: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${calPct}%`, background: `linear-gradient(90deg,#6BCB77,${calPct > 80 ? "#FF6B6B" : "#4D96FF"})`, borderRadius: 10, transition: "width 0.5s" }} />
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>目標: {goal.calLimit} kcal</div>
          </div>
          <div style={card}>
            <div style={sec}>⚖️ 体重</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><span style={{ fontSize: 32, fontWeight: "bold" }}>{goal.current}</span><span style={{ fontSize: 14, color: "#888" }}> kg</span></div>
              <div style={{ textAlign: "right" }}>
                <div style={tag("#C77DFF")}>目標まで {weightLeft} kg</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>目標: {goal.target} kg</div>
              </div>
            </div>
          </div>
        </>}
        {tab === 1 && <>
          <div style={card}>
            <div style={sec}>📷 AIカロリー計算</div>
            <CalorieCamera onAdd={(name, cal) => addMeal(name, cal)} />
          </div>
          <div style={card}>
            <div style={sec}>✏️ 手動で追加</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input style={inp} placeholder="食事名（例：チキンサラダ）" value={mealName} onChange={(e) => setMealName(e.target.value)} />
              <input style={inp} placeholder="カロリー（例：420）" inputMode="numeric" pattern="[0-9]*" value={mealCal} onChange={(e) => setMealCal(e.target.value.replace(/[^0-9]/g, ""))} />
              <button onTouchEnd={(e) => { e.preventDefault(); addMeal(mealName, mealCal); }} onClick={() => addMeal(mealName, mealCal)} style={btn("#FF6B6B")}>追加する</button>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>📋 今日の食事</div>
            {meals.length === 0 && <div style={{ color: "#888", textAlign: "center", padding: 20 }}>まだ記録がありません</div>}
            {meals.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F5F5F5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                  <div><div style={{ fontWeight: "bold", fontSize: 14 }}>{m.name}</div><div style={{ fontSize: 11, color: "#888" }}>{m.time}</div></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={tag(m.color)}>{m.cal} kcal</span>
                  <button onTouchEnd={(e) => { e.preventDefault(); setMeals(meals.filter((x) => x.id !== m.id)); }}
                    onClick={() => setMeals(meals.filter((x) => x.id !== m.id))}
                    style={{ background: "none", border: "none", color: "#CCC", cursor: "pointer", fontSize: 22, padding: "8px 10px", touchAction: "manipulation" }}>×</button>
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 12, fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
              <span>合計</span><span style={{ color: totalCal > goal.calLimit ? "#FF6B6B" : "#6BCB77" }}>{totalCal} kcal</span>
            </div>
          </div>
        </>}
        {tab === 2 && <>
          <div style={card}>
            <div style={sec}>📈 体重グラフ</div>
            <WeightGraph entries={weights} />
          </div>
          <div style={card}>
            <div style={sec}>➕ 体重を記録</div>
            <input style={{ ...inp, marginBottom: 12 }} placeholder="例: 66.5" inputMode="decimal" pattern="[0-9]*\.?[0-9]*" value={weightInput} onChange={(e) => setWeightInput(e.target.value.replace(/[^0-9.]/g, ""))} />
            <button onTouchEnd={(e) => { e.preventDefault(); addWeight(); }} onClick={addWeight} style={btn("#4D96FF")}>⚖️ 記録する</button>
          </div>
          <div style={card}>
            <div style={sec}>📅 履歴</div>
            {[...weights].reverse().slice(0, 7).map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
                <span style={{ color: "#888", fontSize: 13 }}>{w.date}</span>
                <span style={{ fontWeight: "bold" }}>{w.weight} kg</span>
              </div>
            ))}
          </div>
        </>}
        {tab === 3 && <>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input style={inp} placeholder={`目標体重（現在: ${goal.target} kg）`} inputMode="decimal" pattern="[0-9]*\.?[0-9]*" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value.replace(/[^0-9.]/g, ""))} />
              <input style={inp} placeholder={`カロリー上限（現在: ${goal.calLimit} kcal）`} inputMode="numeric" pattern="[0-9]*" value={goalCal} onChange={(e) => setGoalCal(e.target.value.replace(/[^0-9]/g, ""))} />
              <button onTouchEnd={(e) => { e.preventDefault(); saveGoal(); }} onClick={saveGoal} style={btn("#C77DFF")}>保存する</button>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>💡 今日のアドバイス</div>
            {[{ icon: "🥗", text: "タンパク質を意識して筋肉を維持しよう" }, { icon: "💧", text: "1日2Lの水を飲むと代謝アップ！" }, { icon: "🚶", text: "食後30分のウォーキングが効果的" }].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 2 ? "1px solid #F5F5F5" : "none" }}>
                <span style={{ fontSize: 22 }}>{tip.icon}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5 }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </>}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", display: "flex", borderTop: "1px solid #F0F0F0", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", zIndex: 100 }}>
        {TABS.map((icon, i) => (
          <button key={i} onTouchEnd={(e) => { e.preventDefault(); setTab(i); }} onClick={() => setTab(i)}
            style={{ flex: 1, padding: "10px 4px 8px", border: "none", background: "none", fontSize: 11, fontWeight: i === tab ? "bold" : "normal", color: i === tab ? "#FF6B6B" : "#888", cursor: "pointer", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div>{TAB_LABELS[i]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}