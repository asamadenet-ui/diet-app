import { useState, useEffect, useRef } from "react";

function calcStepCalories(steps, weight) {
  return Math.round(weight * steps * 0.0005 * 10) / 10;
}

function getLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
const TODAY = getLocalDate();

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

const FOOD_CAL_PER_100G = [
  // 穀物・主食
  { name: "白米（炊飯）", cal: 168 }, { name: "玄米（炊飯）", cal: 165 },
  { name: "もち米（炊飯）", cal: 190 }, { name: "おかゆ", cal: 71 },
  { name: "食パン", cal: 248 }, { name: "フランスパン", cal: 279 },
  { name: "クロワッサン", cal: 448 }, { name: "ベーグル", cal: 270 },
  { name: "うどん（茹で）", cal: 105 }, { name: "そば（茹で）", cal: 132 },
  { name: "そうめん（茹で）", cal: 127 }, { name: "パスタ（茹で）", cal: 165 },
  { name: "中華麺（茹で）", cal: 149 }, { name: "春雨（茹で）", cal: 84 },
  { name: "ビーフン", cal: 364 }, { name: "オートミール", cal: 380 },
  { name: "コーンフレーク", cal: 381 }, { name: "もち", cal: 235 },
  { name: "餃子の皮", cal: 270 }, { name: "シュウマイの皮", cal: 270 },
  // 肉類
  { name: "鶏胸肉（皮なし）", cal: 108 }, { name: "鶏胸肉（皮あり）", cal: 145 },
  { name: "鶏もも肉（皮なし）", cal: 138 }, { name: "鶏もも肉（皮あり）", cal: 200 },
  { name: "鶏ささみ", cal: 98 }, { name: "鶏手羽元", cal: 197 },
  { name: "鶏手羽先", cal: 226 }, { name: "鶏レバー", cal: 111 },
  { name: "豚ロース", cal: 263 }, { name: "豚バラ", cal: 395 },
  { name: "豚肩ロース", cal: 253 }, { name: "豚もも", cal: 171 },
  { name: "豚ひき肉", cal: 221 }, { name: "豚レバー", cal: 128 },
  { name: "牛ロース", cal: 380 }, { name: "牛ヒレ", cal: 133 },
  { name: "牛もも（赤身）", cal: 140 }, { name: "牛バラ", cal: 472 },
  { name: "牛ひき肉", cal: 272 }, { name: "牛タン", cal: 269 },
  { name: "牛レバー", cal: 132 }, { name: "牛カルビ", cal: 472 },
  { name: "ラム肩（ジンギスカン）", cal: 233 }, { name: "ラムもも", cal: 198 },
  { name: "マトン", cal: 248 }, { name: "ジンギスカン（たれ込み）", cal: 178 },
  { name: "ベーコン", cal: 405 }, { name: "ロースハム", cal: 196 },
  { name: "ウインナー", cal: 321 }, { name: "サラミ", cal: 497 },
  { name: "フランクフルト", cal: 298 }, { name: "焼き鳥（もも）", cal: 198 },
  { name: "唐揚げ", cal: 307 }, { name: "ハンバーグ", cal: 200 },
  { name: "とんかつ", cal: 330 }, { name: "コロッケ", cal: 217 },
  { name: "チキンナゲット", cal: 263 },
  // 魚介類
  { name: "鮭（サーモン）", cal: 133 }, { name: "まぐろ（赤身）", cal: 125 },
  { name: "まぐろ（トロ）", cal: 344 }, { name: "サバ", cal: 202 },
  { name: "イワシ", cal: 169 }, { name: "アジ", cal: 126 },
  { name: "タイ", cal: 142 }, { name: "ブリ", cal: 257 },
  { name: "サンマ", cal: 297 }, { name: "カツオ", cal: 114 },
  { name: "ヒラメ", cal: 103 }, { name: "カレイ", cal: 95 },
  { name: "タラ", cal: 72 }, { name: "アナゴ", cal: 161 },
  { name: "タコ", cal: 76 }, { name: "イカ", cal: 88 },
  { name: "エビ（ブラックタイガー）", cal: 82 }, { name: "ホタテ", cal: 72 },
  { name: "牡蠣", cal: 70 }, { name: "アサリ", cal: 30 },
  { name: "シジミ", cal: 54 }, { name: "ハマグリ", cal: 38 },
  { name: "かに（ずわい）", cal: 65 }, { name: "うに", cal: 120 },
  { name: "いくら", cal: 272 }, { name: "明太子", cal: 121 },
  { name: "ツナ缶（水煮）", cal: 71 }, { name: "ツナ缶（油漬け）", cal: 267 },
  { name: "さばの水煮缶", cal: 174 }, { name: "ちくわ", cal: 121 },
  { name: "かまぼこ", cal: 95 }, { name: "魚肉ソーセージ", cal: 161 },
  { name: "さつま揚げ", cal: 139 },
  // 大豆・豆類
  { name: "大豆（茹で）", cal: 180 }, { name: "大豆（乾燥）", cal: 422 },
  { name: "枝豆", cal: 135 }, { name: "納豆", cal: 200 },
  { name: "豆腐（木綿）", cal: 72 }, { name: "豆腐（絹ごし）", cal: 56 },
  { name: "厚揚げ", cal: 150 }, { name: "油揚げ", cal: 388 },
  { name: "がんもどき", cal: 228 }, { name: "豆乳（無調整）", cal: 46 },
  { name: "きな粉", cal: 451 }, { name: "黒豆（茹で）", cal: 148 },
  { name: "ひよこ豆（茹で）", cal: 149 }, { name: "レンズ豆（茹で）", cal: 120 },
  { name: "そら豆（茹で）", cal: 112 }, { name: "インゲン豆（茹で）", cal: 127 },
  { name: "小豆（茹で）", cal: 143 }, { name: "グリーンピース", cal: 93 },
  // 野菜
  { name: "ブロッコリー", cal: 33 }, { name: "カリフラワー", cal: 27 },
  { name: "キャベツ", cal: 23 }, { name: "白菜", cal: 14 },
  { name: "ほうれん草", cal: 20 }, { name: "小松菜", cal: 13 },
  { name: "春菊", cal: 22 }, { name: "水菜", cal: 23 },
  { name: "レタス", cal: 12 }, { name: "サニーレタス", cal: 16 },
  { name: "チンゲン菜", cal: 9 }, { name: "アスパラガス", cal: 22 },
  { name: "ピーマン", cal: 22 }, { name: "パプリカ（赤）", cal: 30 },
  { name: "パプリカ（黄）", cal: 27 }, { name: "トマト", cal: 19 },
  { name: "ミニトマト", cal: 29 }, { name: "きゅうり", cal: 14 },
  { name: "なす", cal: 18 }, { name: "ズッキーニ", cal: 17 },
  { name: "オクラ", cal: 30 }, { name: "玉ねぎ", cal: 37 },
  { name: "長ねぎ", cal: 34 }, { name: "にんにく", cal: 136 },
  { name: "しょうが", cal: 30 }, { name: "にんじん", cal: 39 },
  { name: "ごぼう", cal: 65 }, { name: "れんこん", cal: 66 },
  { name: "じゃがいも", cal: 76 }, { name: "さつまいも", cal: 132 },
  { name: "里芋", cal: 58 }, { name: "山芋", cal: 65 },
  { name: "とうもろこし", cal: 92 }, { name: "かぼちゃ", cal: 91 },
  { name: "もやし", cal: 15 }, { name: "豆苗", cal: 31 },
  { name: "セロリ", cal: 15 }, { name: "大根", cal: 18 },
  { name: "かぶ", cal: 20 }, { name: "ごま（乾燥）", cal: 605 },
  { name: "しそ（大葉）", cal: 37 }, { name: "菜の花", cal: 33 },
  { name: "アボカド", cal: 187 }, { name: "トウガラシ（乾燥）", cal: 345 },
  // きのこ
  { name: "しいたけ", cal: 18 }, { name: "まいたけ", cal: 16 },
  { name: "えのき", cal: 22 }, { name: "なめこ", cal: 15 },
  { name: "しめじ", cal: 17 }, { name: "エリンギ", cal: 24 },
  { name: "マッシュルーム", cal: 11 }, { name: "まつたけ", cal: 23 },
  { name: "きくらげ（乾燥）", cal: 167 },
  // 海藻
  { name: "わかめ（生）", cal: 16 }, { name: "わかめ（乾燥）", cal: 186 },
  { name: "昆布（乾燥）", cal: 138 }, { name: "のり（板海苔）", cal: 188 },
  { name: "ひじき（乾燥）", cal: 149 }, { name: "もずく", cal: 5 },
  { name: "めかぶ", cal: 11 },
  // 果物
  { name: "バナナ", cal: 86 }, { name: "りんご", cal: 54 },
  { name: "みかん", cal: 46 }, { name: "いちご", cal: 34 },
  { name: "ぶどう", cal: 59 }, { name: "桃", cal: 40 },
  { name: "梨", cal: 43 }, { name: "スイカ", cal: 37 },
  { name: "メロン", cal: 42 }, { name: "キウイ", cal: 53 },
  { name: "パイナップル", cal: 54 }, { name: "マンゴー", cal: 68 },
  { name: "ブルーベリー", cal: 49 }, { name: "グレープフルーツ", cal: 38 },
  { name: "レモン", cal: 54 }, { name: "柿", cal: 63 },
  { name: "さくらんぼ", cal: 60 }, { name: "プルーン（生）", cal: 49 },
  { name: "パパイア", cal: 33 }, { name: "ライチ", cal: 63 },
  // 乳製品・卵
  { name: "卵", cal: 151 }, { name: "うずら卵", cal: 179 },
  { name: "牛乳", cal: 67 }, { name: "低脂肪乳", cal: 46 },
  { name: "ヨーグルト（無糖）", cal: 62 }, { name: "ヨーグルト（加糖）", cal: 65 },
  { name: "チーズ（プロセス）", cal: 339 }, { name: "クリームチーズ", cal: 346 },
  { name: "カマンベール", cal: 310 }, { name: "モッツァレラ", cal: 276 },
  { name: "バター", cal: 745 }, { name: "生クリーム", cal: 433 },
  { name: "アイスクリーム", cal: 212 },
  // ナッツ・種
  { name: "アーモンド", cal: 598 }, { name: "くるみ", cal: 674 },
  { name: "カシューナッツ", cal: 576 }, { name: "ピスタチオ", cal: 615 },
  { name: "マカダミアナッツ", cal: 751 }, { name: "ピーナッツ", cal: 562 },
  { name: "チアシード", cal: 486 }, { name: "ひまわりの種", cal: 611 },
  // お菓子・スイーツ
  { name: "チョコレート（ミルク）", cal: 558 }, { name: "ポテトチップス", cal: 554 },
  { name: "クッキー", cal: 492 }, { name: "ショートケーキ", cal: 327 },
  { name: "プリン", cal: 127 }, { name: "大福", cal: 235 },
  { name: "どら焼き", cal: 284 }, { name: "羊羹", cal: 296 },
  { name: "せんべい", cal: 380 }, { name: "ポッキー", cal: 476 },
  { name: "グミ", cal: 320 }, { name: "ゼリー（果汁）", cal: 61 },
  // 調味料・油
  { name: "オリーブオイル", cal: 921 }, { name: "ごま油", cal: 921 },
  { name: "サラダ油", cal: 921 }, { name: "マヨネーズ", cal: 703 },
  { name: "ドレッシング（和風）", cal: 100 }, { name: "ケチャップ", cal: 119 },
  { name: "味噌", cal: 198 }, { name: "しょうゆ", cal: 71 },
  // 和食・惣菜（グラムで計算）
  { name: "鮭の塩焼き", cal: 157 }, { name: "サバの塩焼き", cal: 238 },
  { name: "焼き魚（アジ）", cal: 145 }, { name: "煮魚（さば）", cal: 175 },
  { name: "筑前煮", cal: 95 }, { name: "肉じゃが", cal: 100 },
  { name: "きんぴらごぼう", cal: 150 }, { name: "ひじきの煮物", cal: 80 },
  { name: "切り干し大根の煮物", cal: 75 }, { name: "ほうれん草のお浸し", cal: 25 },
  { name: "茶碗蒸し", cal: 70 }, { name: "おでん（大根）", cal: 30 },
  { name: "麻婆豆腐", cal: 90 }, { name: "酢豚", cal: 180 },
  { name: "回鍋肉（ホイコーロー）", cal: 180 }, { name: "チンジャオロース", cal: 200 },
  { name: "餃子（焼き）", cal: 233 }, { name: "シュウマイ", cal: 191 },
  { name: "春巻き", cal: 266 }, { name: "エビチリ", cal: 130 },
  { name: "天ぷら（エビ）", cal: 231 }, { name: "天ぷら（かき揚げ）", cal: 340 },
  { name: "とんかつ", cal: 330 }, { name: "チキン南蛮", cal: 220 },
  { name: "ハンバーグ", cal: 200 }, { name: "ミートボール", cal: 210 },
  { name: "コロッケ", cal: 217 }, { name: "メンチカツ", cal: 267 },
  { name: "エビフライ", cal: 240 }, { name: "アジフライ", cal: 255 },
  { name: "フライドポテト", cal: 313 }, { name: "ポテトサラダ", cal: 135 },
  { name: "マカロニサラダ", cal: 155 }, { name: "コールスロー", cal: 100 },
  // 洋食・麺類・丼（グラムで計算）
  { name: "ナポリタン", cal: 155 }, { name: "ミートソースパスタ", cal: 160 },
  { name: "カルボナーラ", cal: 210 }, { name: "ペペロンチーノ", cal: 175 },
  { name: "ボロネーゼ", cal: 180 }, { name: "グラタン", cal: 155 },
  { name: "ラザニア", cal: 190 }, { name: "ピザ（マルゲリータ）", cal: 245 },
  { name: "ピザ（照り焼きチキン）", cal: 270 }, { name: "クリームシチュー", cal: 80 },
  { name: "ビーフシチュー", cal: 100 }, { name: "ハヤシライス", cal: 140 },
  { name: "オムライス", cal: 160 }, { name: "ドリア", cal: 145 },
  { name: "親子丼（ご飯込み）", cal: 140 }, { name: "牛丼（ご飯込み）", cal: 150 },
  { name: "天丼（ご飯込み）", cal: 180 }, { name: "カツ丼（ご飯込み）", cal: 170 },
  { name: "うな丼（ご飯込み）", cal: 200 }, { name: "釜飯", cal: 140 },
];


const FOOD_DB = [
  // 主食・定番
  { name: "白米（1膳）", cal: 252 }, { name: "おにぎり（1個）", cal: 180 },
  { name: "食パン（1枚）", cal: 158 }, { name: "ラーメン", cal: 500 },
  { name: "チャーハン", cal: 600 }, { name: "カレーライス", cal: 700 },
  { name: "パスタ", cal: 430 }, { name: "ざるそば", cal: 320 },
  { name: "ざるうどん", cal: 290 }, { name: "きつねうどん", cal: 390 },
  { name: "天ぷらうどん", cal: 500 }, { name: "たぬきそば", cal: 380 },
  // 定食・丼もの
  { name: "親子丼", cal: 650 }, { name: "牛丼（並）", cal: 630 },
  { name: "天丼", cal: 750 }, { name: "カツ丼", cal: 780 },
  { name: "うな丼", cal: 700 }, { name: "鮭定食", cal: 560 },
  { name: "とんかつ定食", cal: 950 }, { name: "唐揚げ定食", cal: 850 },
  { name: "焼き魚定食", cal: 550 }, { name: "しょうが焼き定食", cal: 780 },
  // お寿司（1貫）
  { name: "🍣 まぐろ（1貫）", cal: 40 }, { name: "🍣 サーモン（1貫）", cal: 50 },
  { name: "🍣 はまち（1貫）", cal: 53 }, { name: "🍣 えび（1貫）", cal: 38 },
  { name: "🍣 いか（1貫）", cal: 38 }, { name: "🍣 ほたて（1貫）", cal: 42 },
  { name: "🍣 たまご（1貫）", cal: 60 }, { name: "🍣 いくら（1貫）", cal: 75 },
  { name: "🍣 うに（1貫）", cal: 68 }, { name: "🍣 あなご（1貫）", cal: 58 },
  { name: "🍣 かっぱ巻き（1本）", cal: 170 }, { name: "🍣 てっかん（1本）", cal: 200 },
  { name: "🍣 回転寿司1皿（2貫）", cal: 95 }, { name: "🍣 にぎり寿司1人前（8貫）", cal: 480 },
  // 揚げ物・おかず
  { name: "唐揚げ（3個）", cal: 300 }, { name: "とんかつ（1枚）", cal: 430 },
  { name: "エビフライ（2本）", cal: 200 }, { name: "コロッケ（1個）", cal: 180 },
  { name: "餃子（6個）", cal: 280 }, { name: "シュウマイ（3個）", cal: 130 },
  { name: "春巻き（1本）", cal: 170 }, { name: "天ぷら盛り合わせ", cal: 400 },
  // たんぱく質・副菜
  { name: "サラダチキン", cal: 120 }, { name: "ゆで卵（1個）", cal: 80 },
  { name: "鶏胸肉（100g）", cal: 108 }, { name: "サーモン（100g）", cal: 133 },
  { name: "豆腐（1丁）", cal: 168 }, { name: "ブロッコリー（100g）", cal: 33 },
  { name: "味噌汁", cal: 40 }, { name: "豚汁", cal: 110 },
  // 軽食・スナック
  { name: "バナナ（1本）", cal: 86 }, { name: "りんご（1個）", cal: 138 },
  { name: "牛乳（200ml）", cal: 134 }, { name: "ヨーグルト", cal: 100 },
  { name: "プロテイン", cal: 120 }, { name: "ハンバーガー", cal: 450 },
  { name: "コーヒー（無糖）", cal: 5 }, { name: "コーラ（350ml）", cal: 140 },
  { name: "オレンジジュース（200ml）", cal: 88 },
  // 酒類
  { name: "ビール（350ml缶）", cal: 140 }, { name: "ビール（500ml缶）", cal: 200 },
  { name: "ハイボール（350ml缶）", cal: 140 }, { name: "ハイボール（500ml缶）", cal: 195 },
  { name: "焼酎（1杯/60ml）", cal: 85 }, { name: "焼酎水割り（1杯）", cal: 60 },
  { name: "チューハイ（350ml缶）", cal: 140 }, { name: "レモンサワー（350ml缶）", cal: 130 },
  { name: "日本酒（1合/180ml）", cal: 185 }, { name: "ワイン（1杯/120ml）", cal: 88 },
  { name: "ウイスキー（1杯/30ml）", cal: 70 }, { name: "梅酒（1杯/60ml）", cal: 82 },
];

const C = {
  bg: "#0A0A0A", card: "#141414", card2: "#1A1A1A", border: "#2A2A2A",
  orange: "#FF6B00", red: "#FF3D3D", green: "#00E676", blue: "#00B4FF",
  purple: "#B44FFF", yellow: "#FFD700", text: "#FFFFFF", sub: "#888888", sub2: "#444444",
};

function saveData(data) { localStorage.setItem("dietAppData", JSON.stringify(data)); }
function loadData() {
  try { const r = localStorage.getItem("dietAppData"); return r ? JSON.parse(r) : null; }
  catch { return null; }
}

function sportBtn(color, ex = {}) {
  return {
    background: `linear-gradient(135deg, ${color}, ${color}CC)`,
    color: "#fff", border: "none", borderRadius: 12,
    padding: "16px 20px", fontWeight: "800", fontSize: 15, cursor: "pointer",
    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
    display: "block", width: "100%", letterSpacing: 0.5,
    boxShadow: `0 4px 20px ${color}44`, ...ex,
  };
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
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.5s", filter: active ? `drop-shadow(0 0 8px ${color})` : "none" }} />
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="bold" fill={C.text}>{fmt(elapsed)}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill={color} fontWeight="bold">
        {progress >= 1 ? "COMPLETE!" : active ? "FASTING" : "PAUSED"}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize="10" fill={C.sub}>GOAL {total / 3600}h</text>
    </svg>
  );
}

function CalorieCamera({ onAdd, apiKey }) {
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
    if (!apiKey) { setError("AI解析にはAPIキーが必要です。下の食品DBからワンタップで追加できます。"); return; }
    setLoading(true); setError(null);
    try {
      const base64 = image.split(",")[1];
      const mediaType = image.split(";")[0].split(":")[1];
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 500,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: "この食事のカロリーをJSON形式のみで返してください：{\"name\":\"料理名\",\"calories\":数値,\"description\":\"説明\"}" }
          ]}]
        })
      });
      const data = await response.json();
      const parsed = JSON.parse(data.content[0].text.replace(/```json|```/g, "").trim());
      setResult(parsed);
    } catch { setError("解析失敗。もう一度お試しください。"); }
    setLoading(false);
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => { fileRef.current.removeAttribute("capture"); fileRef.current.click(); }} style={sportBtn(C.red, { flex: 1 })}>📁 アルバム</button>
        <button onClick={() => { fileRef.current.setAttribute("capture", "environment"); fileRef.current.click(); }} style={sportBtn(C.blue, { flex: 1 })}>📷 カメラ</button>
      </div>
      {image && (
        <div style={{ marginBottom: 12 }}>
          <img src={image} alt="食事" style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />
          <button onClick={() => { if (!loading) analyze(); }} disabled={loading} style={sportBtn(loading ? C.sub2 : C.green, { marginTop: 10 })}>
            {loading ? "⚡ AI解析中..." : "⚡ AIでカロリーを計算"}
          </button>
        </div>
      )}
      {error && <div style={{ color: C.red, fontSize: 13, padding: "8px 0" }}>{error}</div>}
      {result && (
        <div style={{ background: C.card2, border: `1px solid ${C.green}44`, borderRadius: 12, padding: 16, marginTop: 8 }}>
          <div style={{ fontSize: 11, color: C.green, marginBottom: 4, fontWeight: "bold", letterSpacing: 1 }}>AI ANALYSIS</div>
          <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 4 }}>{result.name}</div>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>{result.description}</div>
          <div style={{ fontSize: 40, fontWeight: "900", color: C.green, marginBottom: 12 }}>
            {result.calories}<span style={{ fontSize: 14, fontWeight: "normal", color: C.sub }}> kcal</span>
          </div>
          <button onClick={() => { onAdd(result.name, result.calories); setImage(null); setResult(null); }} style={sportBtn(C.orange)}>✅ 追加する</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const saved = loadData();
  const [tab, setTab] = useState(0);
  const [currentDate, setCurrentDate] = useState(TODAY);
  const [days, setDays] = useState(saved?.days ?? {});
  const [fastActive, setFastActive] = useState(saved?.fastActive ?? false);
  const [fastElapsed, setFastElapsed] = useState(saved?.fastElapsed ?? 0);
  const [fastGoal, setFastGoal] = useState(saved?.fastGoal ?? 16);
  const [fastStartTime, setFastStartTime] = useState(saved?.fastStartTime ?? null);
  const [fastBaseElapsed, setFastBaseElapsed] = useState(saved?.fastBaseElapsed ?? 0);
  const [fastNotified, setFastNotified] = useState(false);
  const timerRef = useRef(null);
  const [goal, setGoal] = useState(saved?.goal ?? { target: 60, calLimit: 2000, height: 170 });
  const [weights, setWeights] = useState(saved?.weights ?? []);
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCalInput, setGoalCalInput] = useState("");
  const [goalHeight, setGoalHeight] = useState("");
  const [memos, setMemos] = useState(saved?.memos ?? []);
  const [memoInput, setMemoInput] = useState("");
  const [mealName, setMealName] = useState("");
  const [mealCal, setMealCal] = useState("");
  const [mealGrams, setMealGrams] = useState("");
  const [mealCalPer100g, setMealCalPer100g] = useState(null);
  const [gramSuggestions, setGramSuggestions] = useState([]);
  const [foodSearch, setFoodSearch] = useState("");
  const [stepsInput, setStepsInput] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [weightInput, setWeightInput] = useState("");
  const [apiKey, setApiKey] = useState(localStorage.getItem("anthropicKey") ?? "");
  const [aiAdvice, setAiAdvice] = useState([]);

  const getDayData = (date) => days[date] ?? { meals: [], exercises: [], water: 0 };
  const dayData = getDayData(currentDate);
  const updateDay = (updater) => {
    setDays(prev => ({ ...prev, [currentDate]: updater(getDayData(currentDate)) }));
  };

  const isToday = currentDate === TODAY;
  const prevDate = () => {
    const d = new Date(currentDate); d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().slice(0, 10));
  };
  const nextDate = () => {
    const d = new Date(currentDate); d.setDate(d.getDate() + 1);
    const next = d.toISOString().slice(0, 10);
    if (next <= TODAY) setCurrentDate(next);
  };

  useEffect(() => {
    if (fastActive) {
      timerRef.current = setInterval(() => {
        const elapsed = fastBaseElapsed + Math.floor((Date.now() - fastStartTime) / 1000);
        setFastElapsed(elapsed);
        if (elapsed >= fastGoal * 3600 && !fastNotified) {
          setFastNotified(true);
          if (Notification.permission === "granted") {
            new Notification("🎉 断食完了！", { body: `${fastGoal}時間の断食を達成しました！`, icon: "/favicon.ico" });
          }
        }
      }, 1000);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [fastActive, fastStartTime, fastBaseElapsed, fastGoal, fastNotified]);

  useEffect(() => {
    const data = { days, fastGoal, fastStartTime, fastBaseElapsed, fastActive, fastElapsed, weights, goal, memos };
    saveData(data);
    const handleVisibility = () => { if (document.visibilityState === 'hidden') saveData(data); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [days, fastGoal, fastStartTime, fastBaseElapsed, fastActive, fastElapsed, weights, goal, memos]);

  const requestNotificationPermission = async () => {
    if (Notification.permission === "default") await Notification.requestPermission();
  };

  const mealColors = [C.orange, C.green, C.blue, C.purple, C.red];

  const handleTimerBtn = () => {
    if (fastElapsed >= fastGoal * 3600) {
      setFastElapsed(0); setFastBaseElapsed(0); setFastStartTime(null); setFastActive(false); setFastNotified(false);
    } else if (fastActive) {
      setFastBaseElapsed(fastElapsed); setFastStartTime(null); setFastActive(false);
    } else {
      requestNotificationPermission();
      setFastStartTime(Date.now()); setFastActive(true);
    }
  };
  const resetFastTimer = () => {
    setFastElapsed(0); setFastBaseElapsed(0); setFastStartTime(null); setFastActive(false); setFastNotified(false);
  };

  const addMeal = (name, cal) => {
    const n = name || mealName; const c = cal || mealCal;
    if (!n || !c) return;
    updateDay(day => ({
      ...day,
      meals: [...day.meals, { id: Date.now(), name: String(n).trim(), cal: Number(c), time: new Date().toTimeString().slice(0, 5), color: mealColors[day.meals.length % mealColors.length] }]
    }));
    setMealName(""); setMealCal("");
  };

  const addExercise = () => {
    const w = weights.length > 0 ? weights[weights.length - 1].weight : 60;
    if (stepsInput) {
      const steps = Number(stepsInput);
      const burned = calcStepCalories(steps, w);
      updateDay(day => ({ ...day, exercises: [...day.exercises, { id: Date.now(), name: `🚶 ${steps.toLocaleString()}歩`, burned, time: new Date().toTimeString().slice(0, 5) }] }));
      setStepsInput("");
    } else if (exerciseMinutes) {
      const mins = Number(exerciseMinutes);
      const burned = Math.round(selectedExercise.met * w * mins / 60);
      updateDay(day => ({ ...day, exercises: [...day.exercises, { id: Date.now(), name: `${selectedExercise.icon} ${selectedExercise.name} ${mins}分`, burned, time: new Date().toTimeString().slice(0, 5) }] }));
      setExerciseMinutes("");
    }
  };

  const addWater = (ml) => updateDay(day => ({ ...day, water: (day.water || 0) + ml }));
  const resetWater = () => updateDay(day => ({ ...day, water: 0 }));

  const addWeight = () => {
    if (!weightInput) return;
    setWeights([...weights.filter((w) => w.date !== currentDate), { date: currentDate, weight: Number(weightInput) }].sort((a, b) => a.date.localeCompare(b.date)));
    setWeightInput("");
  };

  const addMemo = () => {
    if (!memoInput.trim()) return;
    setMemos([...memos, { id: Date.now(), text: memoInput.trim(), date: new Date().toLocaleDateString("ja-JP") }]);
    setMemoInput("");
  };

  const saveGoal = () => {
    setGoal({
      target: goalTarget ? Number(goalTarget) : goal.target,
      calLimit: goalCalInput ? Number(goalCalInput) : goal.calLimit,
      height: goalHeight ? Number(goalHeight) : goal.height,
    });
    setGoalTarget(""); setGoalCalInput(""); setGoalHeight("");
  };

  const saveApiKey = (key) => { setApiKey(key); localStorage.setItem("anthropicKey", key); };

  const exportCSV = () => {
    const rows = [["日付", "種類", "名前", "カロリー/数値"]];
    Object.entries(days).sort().forEach(([date, day]) => {
      (day.meals || []).forEach(m => rows.push([date, "食事", m.name, m.cal]));
      (day.exercises || []).forEach(e => rows.push([date, "運動", e.name, e.burned]));
      (day.water ? [[date, "水分", "水分摂取", day.water]] : []).forEach(r => rows.push(r));
    });
    weights.forEach(w => rows.push([w.date, "体重", "体重", w.weight]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "diet_data.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const generateAdvice = () => {
    const tips = [];
    // カロリー
    if (totalCal === 0) {
      tips.push("まだ食事が記録されていません。食事を記録してカロリーを管理しましょう！");
    } else if (totalCal > goal.calLimit) {
      tips.push(`カロリーが上限より ${totalCal - goal.calLimit}kcal オーバーしています。明日は ${goal.calLimit}kcal 以内を目指しましょう。`);
    } else {
      tips.push(`今日のカロリーは目標内です！あと ${goal.calLimit - totalCal}kcal の余裕があります。この調子で！`);
    }
    // 水分
    if (todayWater === 0) {
      tips.push("水分がまだ記録されていません。こまめな水分補給は代謝アップに効果的です。");
    } else if (todayWater < 1500) {
      tips.push(`水分が ${todayWater}ml です。あと ${2000 - todayWater}ml 飲むと理想的です。`);
    } else {
      tips.push(`水分補給バッチリ！${todayWater}ml 摂取済みです。`);
    }
    // 運動
    if (totalBurned === 0) {
      tips.push("今日はまだ運動の記録がありません。軽いウォーキングだけでも効果があります！");
    } else if (totalBurned < 200) {
      tips.push(`今日は ${totalBurned}kcal 消費しました。もう少し動くとさらに効果的です。`);
    } else {
      tips.push(`今日は ${totalBurned}kcal 消費！素晴らしい運動量です。`);
    }
    // 体重トレンド
    if (weights.length >= 2) {
      const diff = (weights[weights.length - 1].weight - weights[weights.length - 2].weight).toFixed(1);
      if (Number(diff) < 0) tips.push(`前回より ${Math.abs(diff)}kg 減量！順調に進んでいます。`);
      else if (Number(diff) > 0) tips.push(`前回より ${diff}kg 増加。食事内容を見直してみましょう。`);
      else tips.push("体重が維持できています。安定した良い状態です。");
    }
    // BMI
    if (bmi) {
      if (Number(bmi) < 18.5) tips.push("BMIが低めです。筋肉をつけることを意識してタンパク質を多めに摂りましょう。");
      else if (Number(bmi) >= 25) tips.push("BMIを下げるには有酸素運動と食事管理の組み合わせが効果的です。");
    }
    setAiAdvice(tips.slice(0, 4));
  };

  const totalCal = dayData.meals.reduce((s, m) => s + (m.cal || 0), 0);
  const totalBurned = dayData.exercises.reduce((s, e) => s + (e.burned || 0), 0);
  const netCal = totalCal - totalBurned;
  const todayWater = dayData.water || 0;
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
  const weightLeft = (latestWeight !== null ? latestWeight - goal.target : 0).toFixed(1);
  const calPct = Math.min((totalCal / goal.calLimit) * 100, 100);
  const bmi = latestWeight ? (latestWeight / Math.pow(goal.height / 100, 2)).toFixed(1) : null;
  const bmiLabel = !bmi ? "−" : bmi < 18.5 ? "低体重" : bmi < 25 ? "普通" : bmi < 30 ? "肥満①" : "肥満②";
  const bmiColor = !bmi ? C.sub : bmi < 18.5 ? C.blue : bmi < 25 ? C.green : bmi < 30 ? C.orange : C.red;
  const waterPct = Math.min((todayWater / 2000) * 100, 100);

  const filteredFoods = FOOD_DB.filter(f => f.name.includes(foodSearch));

  const ACHIEVEMENTS = [
    { icon: "🍽", label: "初記録", done: Object.values(days).some(d => d.meals?.length > 0) },
    { icon: "💧", label: "水分2L", done: Object.values(days).some(d => (d.water || 0) >= 2000) },
    { icon: "🏆", label: "目標達成", done: latestWeight && goal.target && latestWeight <= goal.target },
    { icon: "⚡", label: "断食完了", done: fastNotified },
    { icon: "📅", label: "3日記録", done: weights.length >= 3 },
    { icon: "✅", label: "カロリー管理", done: Object.values(days).some(d => d.meals?.length > 0 && d.meals.reduce((s, m) => s + m.cal, 0) <= goal.calLimit) },
  ];

  const inp = {
    border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px",
    fontSize: 16, width: "100%", boxSizing: "border-box", outline: "none",
    fontFamily: "inherit", backgroundColor: C.card2, color: C.text,
    WebkitAppearance: "none", appearance: "none", display: "block",
  };
  const card = { background: C.card, borderRadius: 16, padding: 20, margin: "12px 14px 0", border: `1px solid ${C.border}` };
  const sec = { fontSize: 11, fontWeight: "900", color: C.sub, marginBottom: 14, letterSpacing: 2, textTransform: "uppercase" };
  const badge = (c) => ({ background: `${c}22`, color: c, borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: "800", whiteSpace: "nowrap", border: `1px solid ${c}44` });
  const statBox = (c) => ({ flex: 1, background: `${c}0D`, borderRadius: 12, padding: 12, textAlign: "center", border: `1px solid ${c}33` });

  const dateLabel = currentDate === TODAY ? "今日" : currentDate.slice(5).replace("-", "/");

  return (
    <div style={{ fontFamily: "'Segoe UI','Hiragino Sans',sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto", color: C.text }}>

      {/* ヘッダー */}
      <div style={{ background: "linear-gradient(135deg,#1A0A00,#0A0A0A)", borderBottom: `1px solid ${C.border}`, padding: "16px 20px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: C.orange, fontWeight: "900", letterSpacing: 3, marginBottom: 2 }}>DIET TRACKER</div>
            <div style={{ fontSize: 20, fontWeight: "900" }}>💪 MY FITNESS</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: "900", color: calPct > 80 ? C.red : C.orange }}>{Math.round(calPct)}<span style={{ fontSize: 11, color: C.sub }}>%</span></div>
            <div style={{ fontSize: 10, color: C.sub }}>{totalCal} / {goal.calLimit} kcal</div>
          </div>
        </div>
        {/* 日付ナビ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 10 }}>
          <button onClick={prevDate} style={{ background: "none", border: `1px solid ${C.border}`, color: C.sub, borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 16 }}>‹</button>
          <div style={{ fontSize: 14, fontWeight: "800", color: isToday ? C.orange : C.text, minWidth: 80, textAlign: "center" }}>{dateLabel}</div>
          <button onClick={nextDate} disabled={isToday} style={{ background: "none", border: `1px solid ${C.border}`, color: isToday ? C.sub2 : C.sub, borderRadius: 8, padding: "4px 12px", cursor: isToday ? "default" : "pointer", fontSize: 16 }}>›</button>
        </div>
        {/* カロリーバー */}
        <div style={{ background: C.border, borderRadius: 6, height: 5, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.max(0, calPct)}%`, background: calPct > 80 ? `linear-gradient(90deg,${C.orange},${C.red})` : `linear-gradient(90deg,${C.green},${C.orange})`, borderRadius: 6, transition: "width 0.5s", boxShadow: `0 0 8px ${calPct > 80 ? C.red : C.orange}` }} />
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
                  <div style={{ fontSize: 10, color: C.sub, marginBottom: 6 }}>TARGET</div>
                  <select value={fastGoal} onChange={(e) => { setFastGoal(Number(e.target.value)); resetFastTimer(); }} style={inp}>
                    {[12, 14, 16, 18, 20, 24].map(h => <option key={h} value={h}>{h}h</option>)}
                  </select>
                </div>
                <button onClick={handleTimerBtn} style={sportBtn(fastElapsed >= fastGoal * 3600 ? C.green : fastActive ? C.red : C.orange)}>
                  {fastElapsed >= fastGoal * 3600 ? "🏆 RESET" : fastActive ? "⏸ STOP" : "▶ START"}
                </button>
                <button onClick={resetFastTimer} style={{ marginTop: 8, width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", color: C.sub, fontSize: 12, cursor: "pointer" }}>🔄 RESET</button>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={sec}>🔥 CALORIE BALANCE</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={statBox(C.red)}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>摂取</div>
                <div style={{ fontSize: 26, fontWeight: "900", color: C.red }}>{totalCal}</div>
                <div style={{ fontSize: 10, color: C.sub }}>kcal</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: C.sub, fontSize: 18 }}>−</div>
              <div style={statBox(C.green)}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>消費</div>
                <div style={{ fontSize: 26, fontWeight: "900", color: C.green }}>{totalBurned}</div>
                <div style={{ fontSize: 10, color: C.sub }}>kcal</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: C.sub, fontSize: 18 }}>=</div>
              <div style={statBox(C.blue)}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>正味</div>
                <div style={{ fontSize: 26, fontWeight: "900", color: C.blue }}>{netCal}</div>
                <div style={{ fontSize: 10, color: C.sub }}>kcal</div>
              </div>
            </div>
          </div>

          {/* 水分記録 */}
          <div style={card}>
            <div style={sec}>💧 WATER INTAKE</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 36, fontWeight: "900", color: C.blue }}>{todayWater}</span>
                <span style={{ fontSize: 13, color: C.sub }}> ml</span>
              </div>
              <div style={badge(waterPct >= 100 ? C.green : C.blue)}>{Math.round(waterPct)}% / 2000ml</div>
            </div>
            <div style={{ background: C.border, borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${waterPct}%`, background: `linear-gradient(90deg,${C.blue},${C.green})`, borderRadius: 6, transition: "width 0.5s", boxShadow: `0 0 8px ${C.blue}` }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[100, 200, 500].map(ml => (
                <button key={ml} onClick={() => addWater(ml)} style={sportBtn(C.blue, { flex: 1, padding: "12px 8px", fontSize: 13 })}>+{ml}ml</button>
              ))}
              <button onClick={resetWater} style={{ flex: 1, padding: "12px 8px", background: "none", border: `1px solid ${C.border}`, borderRadius: 12, color: C.sub, fontSize: 12, cursor: "pointer" }}>リセット</button>
            </div>
          </div>

          {/* バッジ */}
          <div style={card}>
            <div style={sec}>🏅 ACHIEVEMENTS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ACHIEVEMENTS.map((a, i) => (
                <div key={i} style={{ background: a.done ? `${C.yellow}22` : C.card2, border: `1px solid ${a.done ? C.yellow : C.border}`, borderRadius: 12, padding: "10px 14px", textAlign: "center", minWidth: 80, flex: 1, opacity: a.done ? 1 : 0.4, filter: a.done ? `drop-shadow(0 0 6px ${C.yellow})` : "none" }}>
                  <div style={{ fontSize: 22 }}>{a.icon}</div>
                  <div style={{ fontSize: 10, color: a.done ? C.yellow : C.sub, fontWeight: "800", marginTop: 4 }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* MEAL */}
        {tab === 1 && <>
          <div style={card}>
            <div style={sec}>📷 AI CALORIE SCAN</div>
            <CalorieCamera onAdd={(name, cal) => addMeal(name, cal)} apiKey={apiKey} />
          </div>

          {/* 食品DB */}
          <div style={card}>
            <div style={sec}>🍱 FOOD DATABASE</div>
            <input style={{ ...inp, marginBottom: 10 }} placeholder="検索（例：チキン）" value={foodSearch} onChange={e => setFoodSearch(e.target.value)} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 180, overflowY: "auto" }}>
              {filteredFoods.map((f, i) => (
                <button key={i} onClick={() => addMeal(f.name, f.cal)}
                  style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 12, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontWeight: "700" }}>{f.name}</span>
                  <span style={{ color: C.orange, fontSize: 11, marginLeft: 6 }}>{f.cal}kcal</span>
                </button>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={sec}>✏️ MANUAL INPUT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* 食品名 + グラム計算 */}
              <div style={{ position: "relative" }}>
                <input style={inp} type="text" placeholder="食品名（例：鶏胸肉）" value={mealName}
                  onChange={e => {
                    const v = e.target.value;
                    setMealName(v);
                    setMealCalPer100g(null);
                    setMealGrams("");
                    if (v.length >= 1) {
                      setGramSuggestions(FOOD_CAL_PER_100G.filter(f => f.name.includes(v)).slice(0, 6));
                    } else {
                      setGramSuggestions([]);
                    }
                  }} />
                {gramSuggestions.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, zIndex: 10, maxHeight: 200, overflowY: "auto" }}>
                    {gramSuggestions.map((f, i) => (
                      <div key={i} onClick={() => {
                        setMealName(f.name);
                        setMealCalPer100g(f.cal);
                        setGramSuggestions([]);
                        setMealCal("");
                      }} style={{ padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ color: C.text, fontSize: 13 }}>{f.name}</span>
                        <span style={{ color: C.sub, fontSize: 12 }}>{f.cal}kcal/100g</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* グラム入力（食品選択後に表示） */}
              {mealCalPer100g !== null && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input style={{ ...inp, flex: 1 }} type="tel" placeholder="グラム数"
                    value={mealGrams}
                    onChange={e => {
                      const g = e.target.value.replace(/[^0-9.]/g, "");
                      setMealGrams(g);
                      if (g) setMealCal(String(Math.round(mealCalPer100g * parseFloat(g) / 100)));
                      else setMealCal("");
                    }} />
                  <span style={{ color: C.sub, fontSize: 12, whiteSpace: "nowrap" }}>g</span>
                  {mealCal ? (
                    <span style={{ color: C.orange, fontWeight: "700", fontSize: 16, whiteSpace: "nowrap" }}>{mealCal} kcal</span>
                  ) : (
                    <span style={{ color: C.sub, fontSize: 12, whiteSpace: "nowrap" }}>{mealCalPer100g}kcal/100g</span>
                  )}
                </div>
              )}
              {/* カロリー直接入力（食品未選択 or 上書き） */}
              <input style={inp} type="tel" placeholder={mealCalPer100g ? "カロリー（自動計算 or 手動修正）" : "カロリー（kcal）"}
                value={mealCal} onChange={e => setMealCal(e.target.value.replace(/[^0-9]/g, ""))} />
              <button onClick={() => {
                addMeal();
                setMealGrams("");
                setMealCalPer100g(null);
                setGramSuggestions([]);
              }} style={sportBtn(C.orange)}>➕ ADD MEAL</button>
            </div>
          </div>

          <div style={card}>
            <div style={sec}>📋 TODAY'S MEALS</div>
            {dayData.meals.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 13 }}>記録なし</div>}
            {dayData.meals.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 36, borderRadius: 2, background: m.color }} />
                  <div>
                    <div style={{ fontWeight: "700", fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: C.sub }}>{m.time}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={badge(m.color)}>{m.cal} kcal</span>
                  <button onClick={() => updateDay(day => ({ ...day, meals: day.meals.filter(x => x.id !== m.id) }))}
                    style={{ background: "none", border: "none", color: C.sub2, cursor: "pointer", fontSize: 20, padding: "8px", touchAction: "manipulation" }}>×</button>
                </div>
              </div>
            ))}
            {dayData.meals.length > 0 && (
              <div style={{ paddingTop: 12, fontWeight: "900", display: "flex", justifyContent: "space-between" }}>
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
            <input style={{ ...inp, marginBottom: 12 }} type="tel" placeholder="歩数（例: 8000）" value={stepsInput} onChange={e => setStepsInput(e.target.value.replace(/[^0-9]/g, ""))} />
            <button onClick={addExercise} style={sportBtn(C.green)}>➕ ADD STEPS</button>
          </div>
          <div style={card}>
            <div style={sec}>💪 WORKOUT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <select value={selectedExercise.name} onChange={e => setSelectedExercise(EXERCISES.find(ex => ex.name === e.target.value))} style={inp}>
                {EXERCISES.map(ex => <option key={ex.name} value={ex.name}>{ex.icon} {ex.name}</option>)}
              </select>
              <input style={inp} type="tel" placeholder="時間（分）" value={exerciseMinutes} onChange={e => setExerciseMinutes(e.target.value.replace(/[^0-9]/g, ""))} />
              <button onClick={addExercise} style={sportBtn(C.green)}>🔥 ADD WORKOUT</button>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>📋 TODAY'S TRAINING</div>
            {dayData.exercises.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 13 }}>記録なし</div>}
            {dayData.exercises.map(e => (
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
                  <button onClick={() => updateDay(day => ({ ...day, exercises: day.exercises.filter(x => x.id !== e.id) }))}
                    style={{ background: "none", border: "none", color: C.sub2, cursor: "pointer", fontSize: 20, padding: "8px" }}>×</button>
                </div>
              </div>
            ))}
            {dayData.exercises.length > 0 && (
              <div style={{ paddingTop: 12, fontWeight: "900", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.sub }}>TOTAL BURNED</span>
                <span style={{ color: C.green }}>{totalBurned} kcal</span>
              </div>
            )}
          </div>
        </>}

        {/* WEIGHT */}
        {tab === 3 && <>
          <div style={card}>
            <div style={sec}>📊 BMI</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              <div style={{ flex: 1, background: `${bmiColor}11`, border: `1px solid ${bmiColor}33`, borderRadius: 14, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>BMI</div>
                <div style={{ fontSize: 36, fontWeight: "900", color: bmiColor }}>{bmi ?? "−"}</div>
                <div style={{ fontSize: 12, color: bmiColor, fontWeight: "800" }}>{bmiLabel}</div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {[["< 18.5", "低体重", C.blue], ["18.5-25", "普通", C.green], ["25-30", "肥満①", C.orange], ["> 30", "肥満②", C.red]].map(([range, label, color]) => (
                  <div key={label} style={{ background: C.card2, borderRadius: 8, padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: C.sub }}>{range}</span>
                    <span style={{ fontSize: 11, color, fontWeight: "800" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.sub, textAlign: "center" }}>身長: {goal.height}cm（GOALタブで変更可）</div>
          </div>
          <div style={card}>
            <div style={sec}>📈 WEIGHT GRAPH</div>
            <WeightGraph entries={weights} />
          </div>
          <div style={card}>
            <div style={sec}>➕ RECORD WEIGHT</div>
            <input style={{ ...inp, marginBottom: 12 }} placeholder="体重（例: 66.5）" inputMode="decimal" value={weightInput} onChange={e => setWeightInput(e.target.value.replace(/[^0-9.]/g, ""))} />
            <button onTouchEnd={e => { e.preventDefault(); addWeight(); }} onClick={addWeight} style={sportBtn(C.blue)}>⚖️ SAVE WEIGHT</button>
          </div>
          <div style={card}>
            <div style={sec}>📅 HISTORY</div>
            {weights.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 13 }}>記録なし</div>}
            {[...weights].reverse().slice(0, 10).map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.sub, fontSize: 13 }}>{w.date}</span>
                <span style={{ fontWeight: "900" }}>{w.weight} <span style={{ fontSize: 11, color: C.sub }}>kg</span></span>
              </div>
            ))}
          </div>
        </>}

        {/* MEMO */}
        {tab === 4 && <>
          <div style={card}>
            <div style={sec}>✏️ NEW MEMO</div>
            <textarea style={{ ...inp, height: 100, resize: "none", lineHeight: 1.6 }} placeholder="気づいたこと、体調…" value={memoInput} onChange={e => setMemoInput(e.target.value)} />
            <button onClick={addMemo} style={{ ...sportBtn(C.purple), marginTop: 12 }}>📝 SAVE MEMO</button>
          </div>
          <div style={card}>
            <div style={sec}>📋 MEMO LIST</div>
            {memos.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 13 }}>メモなし</div>}
            {[...memos].reverse().map(m => (
              <div key={m.id} style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.purple, fontWeight: "bold" }}>{m.date}</span>
                  <button onClick={() => setMemos(memos.filter(x => x.id !== m.id))} style={{ background: "none", border: "none", color: C.sub2, cursor: "pointer", fontSize: 20, padding: "4px 8px" }}>×</button>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.text}</div>
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
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>TARGET</div>
                <div style={{ fontSize: 30, fontWeight: "900", color: C.purple }}>{goal.target}<span style={{ fontSize: 12, color: C.sub }}> kg</span></div>
              </div>
              <div style={{ flex: 1, background: `${C.orange}11`, border: `1px solid ${C.orange}33`, borderRadius: 14, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>CAL LIMIT</div>
                <div style={{ fontSize: 24, fontWeight: "900", color: C.orange }}>{goal.calLimit}<span style={{ fontSize: 10, color: C.sub }}> kcal</span></div>
              </div>
            </div>
            <div style={{ background: `${C.green}0D`, border: `1px solid ${C.green}33`, borderRadius: 14, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>REMAINING</div>
              <div style={{ fontSize: 30, fontWeight: "900", color: C.green }}>あと {weightLeft} kg！</div>
            </div>
          </div>

          <div style={card}>
            <div style={sec}>✏️ UPDATE GOALS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input style={inp} placeholder={`目標体重（現在: ${goal.target}kg）`} inputMode="decimal" value={goalTarget} onChange={e => setGoalTarget(e.target.value.replace(/[^0-9.]/g, ""))} />
              <input style={inp} placeholder={`カロリー上限（現在: ${goal.calLimit}kcal）`} inputMode="numeric" value={goalCalInput} onChange={e => setGoalCalInput(e.target.value.replace(/[^0-9]/g, ""))} />
              <input style={inp} placeholder={`身長（現在: ${goal.height}cm）`} inputMode="numeric" value={goalHeight} onChange={e => setGoalHeight(e.target.value.replace(/[^0-9]/g, ""))} />
              <button onTouchEnd={e => { e.preventDefault(); saveGoal(); }} onClick={saveGoal} style={sportBtn(C.purple)}>💾 SAVE GOALS</button>
            </div>
          </div>

          {/* AIアドバイス */}
          <div style={card}>
            <div style={sec}>📊 SMART ADVICE</div>
            <button onClick={generateAdvice} style={sportBtn(C.green, { marginBottom: 12 })}>
              ⚡ データを分析してアドバイス
            </button>
            {aiAdvice.length > 0 && aiAdvice.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < aiAdvice.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: C.sub }}>{a}</span>
              </div>
            ))}
            {aiAdvice.length === 0 && <div style={{ color: C.sub, fontSize: 13, textAlign: "center", padding: "8px 0" }}>ボタンを押してAIアドバイスを取得</div>}
          </div>

          {/* CSVエクスポート */}
          <div style={card}>
            <div style={sec}>📤 EXPORT DATA</div>
            <button onClick={exportCSV} style={sportBtn(C.blue)}>📊 CSVでダウンロード</button>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 8, textAlign: "center" }}>食事・運動・体重・水分の全データをエクスポート</div>
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
