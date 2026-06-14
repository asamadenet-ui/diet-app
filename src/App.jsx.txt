import { useState, useEffect, useRef } from "react";

const COLORS = {
  coral: "#FF6B6B",
  yellow: "#FFD93D",
  mint: "#6BCB77",
  sky: "#4D96FF",
  purple: "#C77DFF",
  peach: "#FFA07A",
  bg: "#FFF9F0",
  card: "#FFFFFF",
  text: "#2D2D2D",
  sub: "#888",
};

const TABS = ["🏠 ホーム", "🍽 食事", "⚖️ 体重", "🎯 目標"];

function WeightGraph({ entries }) {
  if (entries.length === 0)
    return (
      <div style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>
        まだデータがありません。体重を入力してみましょう！
      </div>
    );
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
      {entries.map((e, i) => (
        <circle key={i} cx={x(i)} cy={y(e.weight)} r="5" fill="#fff" stroke="#4D96FF" strokeWidth="2.5" />
      ))}
      {entries.map((e, i) => (
        i % Math.max(1, Math.floor(entries.length / 5)) === 0 && (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#888">{e.date.slice(5)}</text>
        )
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
    <svg viewBox="0 0 180 180" style={{ width: 180 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEE" strokeWidth="12" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={progress >= 1 ? "#6BCB77" : "#FF6B6B"} strokeWidth="12"
        strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dasharray 0.5s" }} />
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#2D2D2D">{fmt(elapsed)}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#888">{progress >= 1 ? "🎉 完了！" : active ? "断食中" : "停止中"}</text>
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize="10" fill="#888">目標 {total / 3600}h</text>
    </svg>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [fastActive, setFastActive] = useState(false);
  const [fastElapsed, setFastElapsed] = useState(0);
  const [fastGoal, setFastGoal] = useState(16);
  const timerRef = useRef(null);

  useEffect(() => {
    if (fastActive) {
      timerRef.current = setInterval(() => setFastElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [fastActive]);

  const [meals, setMeals] = useState([
    { id: 1, name: "ランチ（チキンサラダ）", cal: 420, time: "12:30", color: "#6BCB77" },
    { id: 2, name: "夕食（鮭定食）", cal: 680, time: "19:00", color: "#4D96FF" },
  ]);
  const [mealInput, setMealInput] = useState({ name: "", cal: "" });

  const addMeal = () => {
    if (!mealInput.name || !mealInput.cal) return;
    const colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#C77DFF", "#FFA07A"];
    setMeals([...meals, { id: Date.now(), name: mealInput.name, cal: Number(mealInput.cal), time: new Date().toTimeString().slice(0, 5), color: colors[meals.length % colors.length] }]);
    setMealInput({ name: "", cal: "" });
  };

  const totalCal = meals.reduce((s, m) => s + m.cal, 0);

  const [weights, setWeights] = useState([
    { date: "2025-06-01", weight: 68.5 },
    { date: "2025-06-04", weight: 67.9 },
    { date: "2025-06-07", weight: 67.4 },
    { date: "2025-06-10", weight: 66.8 },
    { date: "2025-06-13", weight: 66.3 },
  ]);
  const [weightInput, setWeightInput] = useState("");

  const addWeight = () => {
    if (!weightInput) return;
    const today = new Date().toISOString().slice(0, 10);
    setWeights([...weights.filter((w) => w.date !== today), { date: today, weight: Number(weightInput) }].sort((a, b) => a.date.localeCompare(b.date)));
    setWeightInput("");
  };

  const [goal, setGoal] = useState({ current: 66.3, target: 60, calLimit: 1800 });
  const [goalInput, setGoalInput] = useState({ target: "", calLimit: "" });

  const saveGoal = () => {
    setGoal({ ...goal, target: Number(goalInput.target) || goal.target, calLimit: Number(goalInput.calLimit) || goal.calLimit });
    setGoalInput({ target: "", calLimit: "" });
  };

  const weightLeft = (goal.current - goal.target).toFixed(1);
  const calPct = Math.min((totalCal / goal.calLimit) * 100, 100);

  const s = {
    app: { fontFamily: "'Segoe UI','Hiragino Sans',sans-serif", background: "#FFF9F0", minHeight: "100vh", maxWidth: 420, margin: "0 auto", paddingBottom: 80 },
    header: { background: "linear-gradient(135deg,#FF6B6B,#C77DFF)", color: "#fff", padding: "20px 20px 28px", borderRadius: "0 0 28px 28px" },
    card: { background: "#fff", borderRadius: 20, padding: 20, margin: "16px 16px 0", boxShadow: "0 4px 16px rgba(0,0,0,0.07)" },
    tabBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: "#fff", display: "flex", borderTop: "1px solid #F0F0F0", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" },
    btn: (c) => ({ background: c, color: "#fff", border: "none", borderRadius: 14, padding: "12px 24px", fontWeight: "bold", fontSize: 15, cursor: "pointer", width: "100%" }),
    input: { border: "2px solid #F0F0F0", borderRadius: 12, padding: "10px 14px", fontSize: 14, width: "100%", boxSizing: "border-box", outline: "none", fontFamily: "inherit" },
    tag: (c) => ({ background: c + "22", color: c, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: "bold" }),
    sec: { fontSize: 13, fontWeight: "bold", color: "#888", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 },
  };

  const HomeTab = () => (
    <>
      <div style={s.card}>
        <div style={s.sec}>⏱ 断食タイマー</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <FastingRing elapsed={fastElapsed} total={fastGoal * 3600} active={fastActive} />
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: "#888" }}>目標時間</label>
              <select value={fastGoal} onChange={(e) => { setFastGoal(Number(e.target.value)); setFastElapsed(0); setFastActive(false); }} style={{ ...s.input, marginTop: 4 }}>
                {[12, 14, 16, 18, 20, 24].map((h) => <option key={h} value={h}>{h}時間</option>)}
              </select>
            </div>
            <button onClick={() => { if (fastElapsed >= fastGoal * 3600) { setFastElapsed(0); setFastActive(false); return; } setFastActive(!fastActive); }}
              style={s.btn(fastElapsed >= fastGoal * 3600 ? "#6BCB77" : fastActive ? "#FF6B6B" : "#4D96FF")}>
              {fastElapsed >= fastGoal * 3600 ? "🎉 リセット" : fastActive ? "⏸ 一時停止" : "▶ スタート"}
            </button>
          </div>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.sec}>🍽 今日のカロリー</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 28, fontWeight: "bold" }}>{totalCal} <span style={{ fontSize: 14, color: "#888" }}>kcal</span></span>
          <span style={s.tag(calPct > 90 ? "#FF6B6B" : "#6BCB77")}>残り {goal.calLimit - totalCal} kcal</span>
        </div>
        <div style={{ background: "#F0F0F0", borderRadius: 10, height: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${calPct}%`, background: `linear-gradient(90deg,#6BCB77,${calPct > 80 ? "#FF6B6B" : "#4D96FF"})`, borderRadius: 10, transition: "width 0.5s" }} />
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>目標: {goal.calLimit} kcal</div>
      </div>
      <div style={s.card}>
        <div style={s.sec}>⚖️ 体重</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><span style={{ fontSize: 32, fontWeight: "bold" }}>{goal.current}</span><span style={{ fontSize: 14, color: "#888" }}> kg</span></div>
          <div style={{ textAlign: "right" }}>
            <div style={s.tag("#C77DFF")}>目標まで {weightLeft} kg</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>目標: {goal.target} kg</div>
          </div>
        </div>
      </div>
    </>
  );

  const MealTab = () => (
    <>
      <div style={s.card}>
        <div style={s.sec}>➕ 食事を追加</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={s.input} placeholder="食事名（例：チキンサラダ）" value={mealInput.name} onChange={(e) => setMealInput({ ...mealInput, name: e.target.value })} />
          <input style={s.input} placeholder="カロリー（kcal）" type="number" value={mealInput.cal} onChange={(e) => setMealInput({ ...mealInput, cal: e.target.value })} />
          <button onClick={addMeal} style={s.btn("#FF6B6B")}>追加する</button>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.sec}>📋 今日の食事</div>
        {meals.length === 0 && <div style={{ color: "#888", textAlign: "center", padding: 20 }}>まだ記録がありません</div>}
        {meals.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F5F5F5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.color }} />
              <div><div style={{ fontWeight: "bold", fontSize: 14 }}>{m.name}</div><div style={{ fontSize: 11, color: "#888" }}>{m.time}</div></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={s.tag(m.color)}>{m.cal} kcal</span>
              <button onClick={() => setMeals(meals.filter((x) => x.id !== m.id))} style={{ background: "none", border: "none", color: "#DDD", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
          </div>
        ))}
        <div style={{ paddingTop: 12, fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
          <span>合計</span><span style={{ color: totalCal > goal.calLimit ? "#FF6B6B" : "#6BCB77" }}>{totalCal} kcal</span>
        </div>
      </div>
    </>
  );

  const WeightTab = () => (
    <>
      <div style={s.card}>
        <div style={s.sec}>📈 体重グラフ</div>
        <WeightGraph entries={weights} />
      </div>
      <div style={s.card}>
        <div style={s.sec}>➕ 体重を記録</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input style={{ ...s.input, flex: 1 }} placeholder="例: 66.5" type="number" step="0.1" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
          <button onClick={addWeight} style={{ ...s.btn("#4D96FF"), width: "auto", whiteSpace: "nowrap" }}>記録</button>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.sec}>📅 履歴</div>
        {[...weights].reverse().slice(0, 7).map((w, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
            <span style={{ color: "#888", fontSize: 13 }}>{w.date}</span>
            <span style={{ fontWeight: "bold" }}>{w.weight} kg</span>
          </div>
        ))}
      </div>
    </>
  );

  const GoalTab = () => (
    <>
      <div style={s.card}>
        <div style={s.sec}>🎯 現在の目標</div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, background: "#C77DFF22", borderRadius: 16, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>目標体重</div>
            <div style={{ fontSize: 28, fontWeight: "bold", color: "#C77DFF" }}>{goal.target}<span style={{ fontSize: 13 }}> kg</span></div>
          </div>
          <div style={{ flex: 1, background: "#FF6B6B22", borderRadius: 16, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>カロリー制限</div>
            <div style={{ fontSize: 28, fontWeight: "bold", color: "#FF6B6B" }}>{goal.calLimit}<span style={{ fontSize: 13 }}> kcal</span></div>
          </div>
        </div>
        <div style={{ marginTop: 16, background: "#6BCB7722", borderRadius: 16, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#888" }}>現在の体重との差</div>
          <div style={{ fontSize: 22, fontWeight: "bold", color: "#6BCB77" }}>あと {weightLeft} kg！</div>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.sec}>✏️ 目標を変更</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={s.input} placeholder={`目標体重（現在: ${goal.target} kg）`} type="number" step="0.5" value={goalInput.target} onChange={(e) => setGoalInput({ ...goalInput, target: e.target.value })} />
          <input style={s.input} placeholder={`1日カロリー上限（現在: ${goal.calLimit} kcal）`} type="number" value={goalInput.calLimit} onChange={(e) => setGoalInput({ ...goalInput, calLimit: e.target.value })} />
          <button onClick={saveGoal} style={s.btn("#C77DFF")}>保存する</button>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.sec}>💡 今日のアドバイス</div>
        {[{ icon: "🥗", text: "タンパク質を意識して筋肉を維持しよう" }, { icon: "💧", text: "1日2Lの水を飲むと代謝アップ！" }, { icon: "🚶", text: "食後30分のウォーキングが効果的" }].map((tip, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 2 ? "1px solid #F5F5F5" : "none" }}>
            <span style={{ fontSize: 22 }}>{tip.icon}</span>
            <span style={{ fontSize: 13, lineHeight: 1.5 }}>{tip.text}</span>
          </div>
        ))}
      </div>
    </>
  );
s
  return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={{ fontSize: 22, fontWeight: "bold" }}>🌸 ダイエットアプリ</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</div>
      </div>
      <div style={{ paddingBottom: 8 }}>
        {tab === 0 && <HomeTab />}
        {tab === 1 && <MealTab />}
        {tab === 2 && <WeightTab />}
        {tab === 3 && <GoalTab />}
      </div>
      <div style={s.tabBar}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "10px 4px 8px", border: "none", background: "none", fontSize: 11, fontWeight: i === tab ? "bold" : "normal", color: i === tab ? "#FF6B6B" : "#888", cursor: "pointer" }}>
            <div style={{ fontSize: 20 }}>{t.split(" ")[0]}</div>
            <div>{t.split(" ")[1]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}