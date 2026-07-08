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
  { icon: "🚶‍♂️", name: "ウォーキング", met: 3.5 },
  { icon: "🏃", name: "ジョギング", met: 7.0 },
  { icon: "🚴", name: "サイクリング", met: 6.0 },
  { icon: "🏊", name: "水泳", met: 8.0 },
  { icon: "🧘", name: "ヨガ", met: 3.0 },
  { icon: "💪", name: "筋トレ", met: 5.0 },
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


const FOOD_CATEGORIES = ["全て","主食","麺類","定食・丼","寿司","肉・揚物","魚・海鮮","野菜・副菜","卵・豆腐","スイーツ","軽食・パン","ドリンク","お酒","焼き鳥","コンビニ","居酒屋","日本料理","中華料理","韓国料理","イタリア","エスニック","フレンチ","アメリカ"];
const FOOD_DB = [
  // 主食
  { cat:"主食", name:"白米（1膳）", cal:252 }, { cat:"主食", name:"玄米（1膳）", cal:230 },
  { cat:"主食", name:"おにぎり 梅（1個）", cal:168 }, { cat:"主食", name:"おにぎり 鮭（1個）", cal:180 },
  { cat:"主食", name:"おにぎり ツナマヨ（1個）", cal:210 }, { cat:"主食", name:"おにぎり 明太子（1個）", cal:185 },
  { cat:"主食", name:"チャーハン", cal:600 }, { cat:"主食", name:"オムライス", cal:580 },
  { cat:"主食", name:"ピラフ", cal:480 }, { cat:"主食", name:"雑炊", cal:200 },
  { cat:"主食", name:"おかゆ", cal:130 }, { cat:"主食", name:"赤飯（1膳）", cal:310 },
  { cat:"主食", name:"混ぜご飯（1膳）", cal:290 }, { cat:"主食", name:"お茶漬け", cal:200 },
  // 麺類
  { cat:"麺類", name:"ラーメン（醤油）", cal:450 }, { cat:"麺類", name:"ラーメン（豚骨）", cal:550 },
  { cat:"麺類", name:"ラーメン（味噌）", cal:500 }, { cat:"麺類", name:"ラーメン（塩）", cal:400 },
  { cat:"麺類", name:"つけ麺", cal:650 }, { cat:"麺類", name:"二郎系ラーメン", cal:900 },
  { cat:"麺類", name:"担々麺", cal:600 }, { cat:"麺類", name:"冷やし中華", cal:480 },
  { cat:"麺類", name:"ちゃんぽん", cal:560 }, { cat:"麺類", name:"〆ラーメン", cal:450 },
  { cat:"麺類", name:"もりそば", cal:250 }, { cat:"麺類", name:"ざるそば", cal:320 },
  { cat:"麺類", name:"かけそば", cal:310 }, { cat:"麺類", name:"たぬきそば", cal:380 },
  { cat:"麺類", name:"天ぷらそば", cal:500 }, { cat:"麺類", name:"きつねそば", cal:390 },
  { cat:"麺類", name:"ざるうどん", cal:290 }, { cat:"麺類", name:"きつねうどん", cal:390 },
  { cat:"麺類", name:"天ぷらうどん", cal:500 }, { cat:"麺類", name:"カレーうどん", cal:480 },
  { cat:"麺類", name:"肉うどん", cal:460 }, { cat:"麺類", name:"そうめん（1人前）", cal:320 },
  { cat:"麺類", name:"パスタ（ナポリタン）", cal:500 }, { cat:"麺類", name:"パスタ（ペペロンチーノ）", cal:400 },
  { cat:"麺類", name:"パスタ（カルボナーラ）", cal:620 }, { cat:"麺類", name:"パスタ（ミートソース）", cal:580 },
  { cat:"麺類", name:"パスタ（ボロネーゼ）", cal:560 }, { cat:"麺類", name:"パスタ（アラビアータ）", cal:430 },
  { cat:"麺類", name:"焼きそば", cal:520 },
  // 定食・丼もの
  { cat:"定食・丼", name:"親子丼", cal:650 }, { cat:"定食・丼", name:"牛丼（並）", cal:630 },
  { cat:"定食・丼", name:"天丼", cal:750 }, { cat:"定食・丼", name:"カツ丼", cal:780 },
  { cat:"定食・丼", name:"うな丼", cal:700 }, { cat:"定食・丼", name:"うな重", cal:800 },
  { cat:"定食・丼", name:"海鮮丼", cal:550 }, { cat:"定食・丼", name:"マグロ丼", cal:480 },
  { cat:"定食・丼", name:"サーモン丼", cal:510 }, { cat:"定食・丼", name:"中華丼", cal:620 },
  { cat:"定食・丼", name:"豚丼（並）", cal:660 }, { cat:"定食・丼", name:"鉄火丼", cal:530 },
  { cat:"定食・丼", name:"鮭定食", cal:560 }, { cat:"定食・丼", name:"とんかつ定食", cal:950 },
  { cat:"定食・丼", name:"唐揚げ定食", cal:850 }, { cat:"定食・丼", name:"焼き魚定食", cal:550 },
  { cat:"定食・丼", name:"しょうが焼き定食", cal:780 }, { cat:"定食・丼", name:"さば味噌定食", cal:620 },
  { cat:"定食・丼", name:"幕の内弁当", cal:700 }, { cat:"定食・丼", name:"のり弁", cal:600 },
  { cat:"定食・丼", name:"カレーライス", cal:700 }, { cat:"定食・丼", name:"カレーライス（大盛）", cal:950 },
  { cat:"定食・丼", name:"ビーフカレー", cal:750 }, { cat:"定食・丼", name:"スープカレー", cal:450 },
  { cat:"定食・丼", name:"ハヤシライス", cal:680 },
  // 寿司
  { cat:"寿司", name:"まぐろ（1貫）", cal:40 }, { cat:"寿司", name:"サーモン（1貫）", cal:50 },
  { cat:"寿司", name:"はまち（1貫）", cal:53 }, { cat:"寿司", name:"えび（1貫）", cal:38 },
  { cat:"寿司", name:"いか（1貫）", cal:38 }, { cat:"寿司", name:"ほたて（1貫）", cal:42 },
  { cat:"寿司", name:"たまご（1貫）", cal:60 }, { cat:"寿司", name:"いくら（1貫）", cal:75 },
  { cat:"寿司", name:"うに（1貫）", cal:68 }, { cat:"寿司", name:"あなご（1貫）", cal:58 },
  { cat:"寿司", name:"かっぱ巻き（1本）", cal:170 }, { cat:"寿司", name:"てっかん（1本）", cal:200 },
  { cat:"寿司", name:"サーモン巻き（1本）", cal:190 }, { cat:"寿司", name:"回転寿司1皿（2貫）", cal:95 },
  { cat:"寿司", name:"にぎり寿司1人前（8貫）", cal:480 }, { cat:"寿司", name:"ちらし寿司", cal:580 },
  { cat:"寿司", name:"稲荷ずし（2個）", cal:200 }, { cat:"寿司", name:"巻き寿司（1本）", cal:350 },
  // 肉・揚物
  { cat:"肉・揚物", name:"唐揚げ（3個）", cal:300 }, { cat:"肉・揚物", name:"とんかつ（1枚）", cal:430 },
  { cat:"肉・揚物", name:"エビフライ（2本）", cal:200 }, { cat:"肉・揚物", name:"コロッケ（1個）", cal:180 },
  { cat:"肉・揚物", name:"メンチカツ（1個）", cal:250 }, { cat:"肉・揚物", name:"チキンカツ（1枚）", cal:350 },
  { cat:"肉・揚物", name:"アジフライ（1枚）", cal:200 }, { cat:"肉・揚物", name:"天ぷら盛り合わせ", cal:400 },
  { cat:"肉・揚物", name:"チキンナゲット（5個）", cal:250 }, { cat:"肉・揚物", name:"ハンバーグ（1個）", cal:250 },
  { cat:"肉・揚物", name:"ビーフステーキ（200g）", cal:400 }, { cat:"肉・揚物", name:"豚の生姜焼き", cal:280 },
  { cat:"肉・揚物", name:"チキンソテー", cal:260 }, { cat:"肉・揚物", name:"サラダチキン", cal:120 },
  { cat:"肉・揚物", name:"鶏胸肉（100g）", cal:108 }, { cat:"肉・揚物", name:"餃子（6個）", cal:280 },
  { cat:"肉・揚物", name:"シュウマイ（3個）", cal:130 }, { cat:"肉・揚物", name:"春巻き（1本）", cal:170 },
  { cat:"肉・揚物", name:"焼肉 カルビ（100g）", cal:350 }, { cat:"肉・揚物", name:"焼肉 ロース（100g）", cal:260 },
  { cat:"肉・揚物", name:"焼肉 ハラミ（100g）", cal:200 }, { cat:"肉・揚物", name:"牛タン（100g）", cal:270 },
  { cat:"肉・揚物", name:"ホルモン（100g）", cal:287 }, { cat:"肉・揚物", name:"豚バラ（100g）", cal:395 },
  { cat:"肉・揚物", name:"ジンギスカン（1人前）", cal:350 }, { cat:"肉・揚物", name:"ラム肉（100g）", cal:198 },
  // 魚・海鮮
  { cat:"魚・海鮮", name:"鮭の塩焼き（1切）", cal:175 }, { cat:"魚・海鮮", name:"サバの塩焼き（1切）", cal:210 },
  { cat:"魚・海鮮", name:"アジの塩焼き（1枚）", cal:130 }, { cat:"魚・海鮮", name:"サンマの塩焼き（1尾）", cal:260 },
  { cat:"魚・海鮮", name:"タラの塩焼き（1切）", cal:95 }, { cat:"魚・海鮮", name:"ブリの塩焼き（1切）", cal:220 },
  { cat:"魚・海鮮", name:"ホッケの塩焼き", cal:180 }, { cat:"魚・海鮮", name:"カレイの塩焼き", cal:110 },
  { cat:"魚・海鮮", name:"さばの味噌煮", cal:290 }, { cat:"魚・海鮮", name:"ぶりの照り焼き", cal:260 },
  { cat:"魚・海鮮", name:"鮭のムニエル", cal:240 }, { cat:"魚・海鮮", name:"タラのムニエル", cal:170 },
  { cat:"魚・海鮮", name:"刺身盛り合わせ", cal:200 }, { cat:"魚・海鮮", name:"まぐろ刺身（100g）", cal:125 },
  { cat:"魚・海鮮", name:"サーモン刺身（100g）", cal:133 }, { cat:"魚・海鮮", name:"エビ天（1本）", cal:150 },
  { cat:"魚・海鮮", name:"牡蠣フライ（3個）", cal:250 }, { cat:"魚・海鮮", name:"シーフードミックス（100g）", cal:80 },
  { cat:"魚・海鮮", name:"海鮮サラダ", cal:120 }, { cat:"魚・海鮮", name:"なめろう", cal:130 },
  // 野菜・副菜
  { cat:"野菜・副菜", name:"サラダ（野菜のみ）", cal:30 }, { cat:"野菜・副菜", name:"シーザーサラダ", cal:200 },
  { cat:"野菜・副菜", name:"コブサラダ", cal:280 }, { cat:"野菜・副菜", name:"ポテトサラダ", cal:180 },
  { cat:"野菜・副菜", name:"ブロッコリー（100g）", cal:33 }, { cat:"野菜・副菜", name:"ほうれん草おひたし", cal:30 },
  { cat:"野菜・副菜", name:"きんぴらごぼう", cal:100 }, { cat:"野菜・副菜", name:"ひじきの煮物", cal:80 },
  { cat:"野菜・副菜", name:"肉じゃが", cal:220 }, { cat:"野菜・副菜", name:"筑前煮", cal:180 },
  { cat:"野菜・副菜", name:"かぼちゃの煮物", cal:120 }, { cat:"野菜・副菜", name:"ほうれん草炒め", cal:80 },
  { cat:"野菜・副菜", name:"味噌汁", cal:40 }, { cat:"野菜・副菜", name:"豚汁", cal:110 },
  { cat:"野菜・副菜", name:"野菜スープ", cal:60 }, { cat:"野菜・副菜", name:"コーンスープ", cal:120 },
  { cat:"野菜・副菜", name:"ミネストローネ", cal:100 }, { cat:"野菜・副菜", name:"クリームシチュー", cal:380 },
  { cat:"野菜・副菜", name:"ビーフシチュー", cal:420 },
  // 卵・豆腐
  { cat:"卵・豆腐", name:"目玉焼き（1個）", cal:100 }, { cat:"卵・豆腐", name:"スクランブルエッグ", cal:150 },
  { cat:"卵・豆腐", name:"オムレツ", cal:200 }, { cat:"卵・豆腐", name:"ゆで卵（1個）", cal:80 },
  { cat:"卵・豆腐", name:"温泉卵（1個）", cal:80 }, { cat:"卵・豆腐", name:"卵かけご飯", cal:350 },
  { cat:"卵・豆腐", name:"だし巻き卵", cal:150 }, { cat:"卵・豆腐", name:"茶碗蒸し", cal:80 },
  { cat:"卵・豆腐", name:"冷奴（1丁）", cal:80 }, { cat:"卵・豆腐", name:"豆腐（1丁）", cal:168 },
  { cat:"卵・豆腐", name:"揚げ出し豆腐", cal:180 }, { cat:"卵・豆腐", name:"麻婆豆腐", cal:250 },
  { cat:"卵・豆腐", name:"納豆（1パック）", cal:100 }, { cat:"卵・豆腐", name:"納豆ご飯", cal:350 },
  { cat:"卵・豆腐", name:"ヨーグルト（プレーン）", cal:100 }, { cat:"卵・豆腐", name:"牛乳（200ml）", cal:134 },
  { cat:"卵・豆腐", name:"豆乳（200ml）", cal:90 }, { cat:"卵・豆腐", name:"プロテイン（1杯）", cal:120 },
  // スイーツ
  { cat:"スイーツ", name:"ショートケーキ", cal:320 }, { cat:"スイーツ", name:"チーズケーキ", cal:350 },
  { cat:"スイーツ", name:"モンブラン", cal:380 }, { cat:"スイーツ", name:"チョコレートケーキ", cal:400 },
  { cat:"スイーツ", name:"プリン", cal:130 }, { cat:"スイーツ", name:"クレームブリュレ", cal:250 },
  { cat:"スイーツ", name:"ソフトクリーム", cal:250 }, { cat:"スイーツ", name:"アイスクリーム（1個）", cal:200 },
  { cat:"スイーツ", name:"ガリガリ君", cal:69 }, { cat:"スイーツ", name:"ハーゲンダッツ（1個）", cal:280 },
  { cat:"スイーツ", name:"ドーナツ", cal:250 }, { cat:"スイーツ", name:"たい焼き", cal:190 },
  { cat:"スイーツ", name:"大福（1個）", cal:150 }, { cat:"スイーツ", name:"みたらし団子（1串）", cal:130 },
  { cat:"スイーツ", name:"ようかん（1切）", cal:170 }, { cat:"スイーツ", name:"どら焼き", cal:230 },
  { cat:"スイーツ", name:"チョコレート（板1枚）", cal:200 }, { cat:"スイーツ", name:"クッキー（3枚）", cal:150 },
  { cat:"スイーツ", name:"シュークリーム", cal:180 }, { cat:"スイーツ", name:"パンケーキ（2枚）", cal:350 },
  { cat:"スイーツ", name:"ティラミス", cal:280 }, { cat:"スイーツ", name:"マカロン（1個）", cal:90 },
  // 軽食・パン
  { cat:"軽食・パン", name:"食パン（1枚）", cal:158 }, { cat:"軽食・パン", name:"フランスパン（1切）", cal:185 },
  { cat:"軽食・パン", name:"クロワッサン", cal:240 }, { cat:"軽食・パン", name:"ベーグル", cal:270 },
  { cat:"軽食・パン", name:"メロンパン", cal:360 }, { cat:"軽食・パン", name:"あんパン", cal:280 },
  { cat:"軽食・パン", name:"クリームパン", cal:300 }, { cat:"軽食・パン", name:"サンドイッチ（ハム）", cal:310 },
  { cat:"軽食・パン", name:"サンドイッチ（たまご）", cal:340 }, { cat:"軽食・パン", name:"ホットサンド", cal:360 },
  { cat:"軽食・パン", name:"バナナ（1本）", cal:86 }, { cat:"軽食・パン", name:"りんご（1個）", cal:138 },
  { cat:"軽食・パン", name:"みかん（1個）", cal:40 }, { cat:"軽食・パン", name:"いちご（100g）", cal:34 },
  { cat:"軽食・パン", name:"ポテトチップス（1袋）", cal:260 }, { cat:"軽食・パン", name:"おせんべい（5枚）", cal:100 },
  { cat:"軽食・パン", name:"ポップコーン（1袋）", cal:180 }, { cat:"軽食・パン", name:"プロテインバー", cal:200 },
  // ドリンク
  { cat:"ドリンク", name:"水（0kcal）", cal:0 }, { cat:"ドリンク", name:"炭酸水（0kcal）", cal:0 },
  { cat:"ドリンク", name:"緑茶（0kcal）", cal:0 }, { cat:"ドリンク", name:"麦茶（0kcal）", cal:0 },
  { cat:"ドリンク", name:"コーヒー（無糖）", cal:5 }, { cat:"ドリンク", name:"コーヒー（砂糖あり）", cal:40 },
  { cat:"ドリンク", name:"カフェラテ（Mサイズ）", cal:140 }, { cat:"ドリンク", name:"抹茶ラテ（Mサイズ）", cal:180 },
  { cat:"ドリンク", name:"コーラ（350ml）", cal:140 }, { cat:"ドリンク", name:"コーラ（500ml）", cal:200 },
  { cat:"ドリンク", name:"オレンジジュース（200ml）", cal:88 }, { cat:"ドリンク", name:"スポーツドリンク（500ml）", cal:120 },
  { cat:"ドリンク", name:"エナジードリンク（250ml）", cal:115 }, { cat:"ドリンク", name:"甘酒（200ml）", cal:130 },
  // お酒
  { cat:"お酒", name:"ビール（350ml缶）", cal:140 }, { cat:"お酒", name:"ビール（500ml缶）", cal:200 },
  { cat:"お酒", name:"発泡酒（350ml缶）", cal:120 }, { cat:"お酒", name:"第三のビール（350ml缶）", cal:115 },
  { cat:"お酒", name:"ハイボール（350ml缶）", cal:140 }, { cat:"お酒", name:"ハイボール（500ml缶）", cal:195 },
  { cat:"お酒", name:"レモンサワー（350ml缶）", cal:130 }, { cat:"お酒", name:"チューハイ（350ml缶）", cal:140 },
  { cat:"お酒", name:"梅サワー（350ml缶）", cal:155 }, { cat:"お酒", name:"ゼロ系チューハイ", cal:45 },
  { cat:"お酒", name:"日本酒（1合）", cal:185 }, { cat:"お酒", name:"日本酒（2合）", cal:370 },
  { cat:"お酒", name:"焼酎（1杯/60ml）", cal:85 }, { cat:"お酒", name:"焼酎水割り（1杯）", cal:60 },
  { cat:"お酒", name:"ワイン赤（1杯/120ml）", cal:88 }, { cat:"お酒", name:"ワイン白（1杯/120ml）", cal:82 },
  { cat:"お酒", name:"スパークリングワイン（1杯）", cal:80 }, { cat:"お酒", name:"ウイスキー（1杯/30ml）", cal:70 },
  { cat:"お酒", name:"梅酒（1杯/60ml）", cal:82 },
  // 焼き鳥（1本）
  { cat:"焼き鳥", name:"もも（1本）", cal:60 }, { cat:"焼き鳥", name:"ねぎま（1本）", cal:55 },
  { cat:"焼き鳥", name:"皮（1本）", cal:90 }, { cat:"焼き鳥", name:"つくね（1本）", cal:70 },
  { cat:"焼き鳥", name:"砂肝（1本）", cal:35 }, { cat:"焼き鳥", name:"ハツ（1本）", cal:45 },
  { cat:"焼き鳥", name:"レバー（1本）", cal:40 }, { cat:"焼き鳥", name:"せせり（1本）", cal:65 },
  { cat:"焼き鳥", name:"ぼんじり（1本）", cal:80 }, { cat:"焼き鳥", name:"手羽先（1本）", cal:100 },
  { cat:"焼き鳥", name:"ぎんなん（1串）", cal:50 }, { cat:"焼き鳥", name:"アスパラ巻き（1本）", cal:55 },
  { cat:"焼き鳥", name:"ベーコン巻き（1本）", cal:80 }, { cat:"焼き鳥", name:"豚バラ（1本）", cal:95 },
  // コンビニ
  { cat:"コンビニ", name:"セブン ツナマヨおにぎり", cal:210 }, { cat:"コンビニ", name:"セブン 親子丼", cal:630 },
  { cat:"コンビニ", name:"ローソン Lチキ（1個）", cal:240 }, { cat:"コンビニ", name:"ローソン から揚げクン（5個）", cal:250 },
  { cat:"コンビニ", name:"ファミマ 肉まん（1個）", cal:210 }, { cat:"コンビニ", name:"ファミマ チキン（1本）", cal:290 },
  { cat:"コンビニ", name:"コンビニおにぎり（平均）", cal:180 }, { cat:"コンビニ", name:"コンビニサンドイッチ", cal:310 },
  { cat:"コンビニ", name:"コンビニ弁当（幕の内）", cal:680 }, { cat:"コンビニ", name:"コンビニカップ麺", cal:380 },
  { cat:"コンビニ", name:"コンビニ豚まん", cal:250 }, { cat:"コンビニ", name:"ビッグマック", cal:545 },
  { cat:"コンビニ", name:"フライドポテト（M）", cal:420 }, { cat:"コンビニ", name:"KFCフライドチキン（1ピース）", cal:290 },
  // 居酒屋
  { cat:"居酒屋", name:"枝豆（1皿）", cal:130 }, { cat:"居酒屋", name:"冷奴（1丁）", cal:80 },
  { cat:"居酒屋", name:"もつ煮込み", cal:180 }, { cat:"居酒屋", name:"ポテトフライ（1皿）", cal:300 },
  { cat:"居酒屋", name:"たこわさ", cal:50 }, { cat:"居酒屋", name:"キムチ（1皿）", cal:45 },
  { cat:"居酒屋", name:"塩辛（1皿）", cal:60 }, { cat:"居酒屋", name:"〆雑炊", cal:250 },
  { cat:"居酒屋", name:"ピザ（1切）", cal:250 }, { cat:"居酒屋", name:"グラタン", cal:400 },
  { cat:"居酒屋", name:"回鍋肉（ホイコーロー）", cal:300 }, { cat:"居酒屋", name:"エビチリ", cal:280 },
  { cat:"居酒屋", name:"麻婆なす", cal:220 }, { cat:"居酒屋", name:"エビマヨ", cal:350 },
  // 日本料理
  { cat:"日本料理", name:"すき焼き（1人前）", cal:650 }, { cat:"日本料理", name:"しゃぶしゃぶ（1人前）", cal:450 },
  { cat:"日本料理", name:"ちゃんこ鍋（1人前）", cal:500 }, { cat:"日本料理", name:"もつ鍋（1人前）", cal:400 },
  { cat:"日本料理", name:"水炊き（1人前）", cal:380 }, { cat:"日本料理", name:"鍋焼きうどん", cal:480 },
  { cat:"日本料理", name:"おでん 大根（1本）", cal:30 }, { cat:"日本料理", name:"おでん 玉子（1個）", cal:80 },
  { cat:"日本料理", name:"おでん 牛すじ（1串）", cal:90 }, { cat:"日本料理", name:"おでん 5種盛り", cal:280 },
  { cat:"日本料理", name:"天ざるそば", cal:580 }, { cat:"日本料理", name:"冷やしそうめん", cal:320 },
  { cat:"日本料理", name:"湯豆腐", cal:100 }, { cat:"日本料理", name:"ところてん", cal:15 },
  { cat:"日本料理", name:"煮物盛り合わせ", cal:180 }, { cat:"日本料理", name:"磯辺焼き（2個）", cal:190 },
  { cat:"日本料理", name:"茶そば", cal:300 }, { cat:"日本料理", name:"精進料理（1膳）", cal:400 },
  { cat:"日本料理", name:"懐石料理（1人前）", cal:800 }, { cat:"日本料理", name:"会席料理（1人前）", cal:900 },
  { cat:"日本料理", name:"鰻の蒲焼き（1切）", cal:230 }, { cat:"日本料理", name:"穴子の天ぷら（1本）", cal:150 },
  { cat:"日本料理", name:"鯛の塩焼き（1切）", cal:145 }, { cat:"日本料理", name:"かれいの煮付け", cal:130 },
  // 中華料理
  { cat:"中華料理", name:"酢豚", cal:350 }, { cat:"中華料理", name:"青椒肉絲（チンジャオロース）", cal:280 },
  { cat:"中華料理", name:"回鍋肉（ホイコーロー）", cal:300 }, { cat:"中華料理", name:"八宝菜", cal:300 },
  { cat:"中華料理", name:"麻婆豆腐", cal:250 }, { cat:"中華料理", name:"麻婆なす", cal:220 },
  { cat:"中華料理", name:"エビチリ", cal:280 }, { cat:"中華料理", name:"エビマヨ", cal:350 },
  { cat:"中華料理", name:"棒棒鶏（バンバンジー）", cal:200 }, { cat:"中華料理", name:"チャーシュー（100g）", cal:252 },
  { cat:"中華料理", name:"天津飯", cal:620 }, { cat:"中華料理", name:"五目炒め", cal:250 },
  { cat:"中華料理", name:"豚の角煮", cal:380 }, { cat:"中華料理", name:"ニラ玉炒め", cal:180 },
  { cat:"中華料理", name:"空芯菜炒め", cal:120 }, { cat:"中華料理", name:"もやし炒め", cal:80 },
  { cat:"中華料理", name:"小籠包（3個）", cal:180 }, { cat:"中華料理", name:"水餃子（6個）", cal:240 },
  { cat:"中華料理", name:"叉焼饅頭（チャーシューバオ）", cal:230 }, { cat:"中華料理", name:"春雨サラダ", cal:180 },
  { cat:"中華料理", name:"杏仁豆腐", cal:120 }, { cat:"中華料理", name:"ごま団子（3個）", cal:250 },
  { cat:"中華料理", name:"北京ダック（1切）", cal:80 }, { cat:"中華料理", name:"中華粥", cal:200 },
  // 韓国料理
  { cat:"韓国料理", name:"ビビンバ", cal:620 }, { cat:"韓国料理", name:"石焼きビビンバ", cal:650 },
  { cat:"韓国料理", name:"冷麺", cal:400 }, { cat:"韓国料理", name:"クッパ", cal:450 },
  { cat:"韓国料理", name:"サムゲタン", cal:450 }, { cat:"韓国料理", name:"キムチチゲ", cal:280 },
  { cat:"韓国料理", name:"スンドゥブチゲ（豆腐チゲ）", cal:250 }, { cat:"韓国料理", name:"カルビタン", cal:380 },
  { cat:"韓国料理", name:"プルコギ（100g）", cal:200 }, { cat:"韓国料理", name:"サムギョプサル（100g）", cal:350 },
  { cat:"韓国料理", name:"チヂミ（1枚）", cal:280 }, { cat:"韓国料理", name:"タッカルビ", cal:350 },
  { cat:"韓国料理", name:"ヤンニョムチキン", cal:380 }, { cat:"韓国料理", name:"トッポギ", cal:300 },
  { cat:"韓国料理", name:"チャプチェ", cal:280 }, { cat:"韓国料理", name:"コムタン（牛骨スープ）", cal:300 },
  { cat:"韓国料理", name:"ナムル（1皿）", cal:50 }, { cat:"韓国料理", name:"海苔巻き（キムパプ）", cal:380 },
  { cat:"韓国料理", name:"ケランチム（韓国茶碗蒸し）", cal:90 }, { cat:"韓国料理", name:"オムク（韓国おでん）", cal:100 },
  // イタリア料理
  { cat:"イタリア", name:"ピザ マルゲリータ（1切）", cal:230 }, { cat:"イタリア", name:"ピザ ペペロニ（1切）", cal:290 },
  { cat:"イタリア", name:"ピザ クワトロフォルマッジ（1切）", cal:310 }, { cat:"イタリア", name:"ピザ Mサイズ1枚", cal:1100 },
  { cat:"イタリア", name:"リゾット（チーズ）", cal:420 }, { cat:"イタリア", name:"リゾット（キノコ）", cal:380 },
  { cat:"イタリア", name:"ラザニア", cal:580 }, { cat:"イタリア", name:"ニョッキ（クリームソース）", cal:420 },
  { cat:"イタリア", name:"フォカッチャ（1切）", cal:200 }, { cat:"イタリア", name:"ブルスケッタ（2枚）", cal:180 },
  { cat:"イタリア", name:"カルパッチョ（魚）", cal:150 }, { cat:"イタリア", name:"カプレーゼ", cal:200 },
  { cat:"イタリア", name:"アクアパッツァ", cal:220 }, { cat:"イタリア", name:"ペスカトーレ", cal:480 },
  { cat:"イタリア", name:"パンナコッタ", cal:200 }, { cat:"イタリア", name:"ジェラート（1スクープ）", cal:150 },
  { cat:"イタリア", name:"プロシュート（3枚）", cal:80 }, { cat:"イタリア", name:"サルシッチャ（1本）", cal:200 },
  { cat:"イタリア", name:"イタリアンサラダ", cal:150 }, { cat:"イタリア", name:"ズッパディペッシェ", cal:250 },
  // エスニック（インド・タイ・ベトナム・東南アジア）
  { cat:"エスニック", name:"インドカレー", cal:650 }, { cat:"エスニック", name:"ナン（1枚）", cal:280 },
  { cat:"エスニック", name:"タンドリーチキン（1本）", cal:200 }, { cat:"エスニック", name:"ラッシー（1杯）", cal:150 },
  { cat:"エスニック", name:"サモサ（2個）", cal:200 }, { cat:"エスニック", name:"ビリヤニ（1皿）", cal:650 },
  { cat:"エスニック", name:"チキンマサラ", cal:380 }, { cat:"エスニック", name:"バターチキンカレー", cal:450 },
  { cat:"エスニック", name:"パッタイ（タイ焼きそば）", cal:480 }, { cat:"エスニック", name:"グリーンカレー", cal:450 },
  { cat:"エスニック", name:"レッドカレー", cal:480 }, { cat:"エスニック", name:"トムヤムクン", cal:150 },
  { cat:"エスニック", name:"ガパオライス", cal:550 }, { cat:"エスニック", name:"マンゴースティッキーライス", cal:350 },
  { cat:"エスニック", name:"フォー（ベトナム麺）", cal:380 }, { cat:"エスニック", name:"バインミー", cal:380 },
  { cat:"エスニック", name:"ベトナム春巻き（2本）", cal:150 }, { cat:"エスニック", name:"ナシゴレン", cal:580 },
  { cat:"エスニック", name:"チキンライス（シンガポール風）", cal:530 }, { cat:"エスニック", name:"ラクサ", cal:480 },
  { cat:"エスニック", name:"サテ（串5本）", cal:250 }, { cat:"エスニック", name:"ガドガド", cal:280 },
  // フレンチ
  { cat:"フレンチ", name:"オニオングラタンスープ", cal:280 }, { cat:"フレンチ", name:"ヴィシソワーズ", cal:180 },
  { cat:"フレンチ", name:"ラタトゥイユ", cal:120 }, { cat:"フレンチ", name:"キッシュ（1切）", cal:280 },
  { cat:"フレンチ", name:"クレープ（1枚）", cal:150 }, { cat:"フレンチ", name:"ガレット（そば粉）", cal:300 },
  { cat:"フレンチ", name:"ブイヤベース", cal:280 }, { cat:"フレンチ", name:"コック・オー・ヴァン", cal:420 },
  { cat:"フレンチ", name:"ポトフ", cal:180 }, { cat:"フレンチ", name:"カスレ", cal:550 },
  { cat:"フレンチ", name:"テリーヌ", cal:250 }, { cat:"フレンチ", name:"フォアグラ（50g）", cal:230 },
  { cat:"フレンチ", name:"エスカルゴ（6個）", cal:150 }, { cat:"フレンチ", name:"ニース風サラダ", cal:220 },
  { cat:"フレンチ", name:"クロックムッシュ", cal:380 }, { cat:"フレンチ", name:"クロックマダム", cal:430 },
  { cat:"フレンチ", name:"ムール貝（1皿）", cal:200 }, { cat:"フレンチ", name:"コンフィ（鴨）", cal:400 },
  // アメリカ料理
  { cat:"アメリカ", name:"チーズバーガー", cal:500 }, { cat:"アメリカ", name:"ビッグマック", cal:545 },
  { cat:"アメリカ", name:"BLTサンドイッチ", cal:450 }, { cat:"アメリカ", name:"クラブハウスサンドイッチ", cal:550 },
  { cat:"アメリカ", name:"フライドポテト（M）", cal:420 }, { cat:"アメリカ", name:"ホットドッグ", cal:280 },
  { cat:"アメリカ", name:"コーンドッグ（1本）", cal:200 }, { cat:"アメリカ", name:"KFCフライドチキン（1ピース）", cal:290 },
  { cat:"アメリカ", name:"バッファローウィング（5本）", cal:350 }, { cat:"アメリカ", name:"BBQリブ（200g）", cal:500 },
  { cat:"アメリカ", name:"コールスロー", cal:120 }, { cat:"アメリカ", name:"マカロニ＆チーズ", cal:450 },
  { cat:"アメリカ", name:"クラムチャウダー", cal:250 }, { cat:"アメリカ", name:"フィッシュ＆チップス", cal:550 },
  { cat:"アメリカ", name:"ベーコンエッグ", cal:350 }, { cat:"アメリカ", name:"ポテトスキン（4個）", cal:280 },
  { cat:"アメリカ", name:"チーズステーキサンドイッチ", cal:620 }, { cat:"アメリカ", name:"ロブスターロール", cal:450 },
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
    padding: "16px 20px", fontWeight: "800", fontSize: 19, cursor: "pointer",
    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
    display: "block", width: "100%", letterSpacing: 0.5,
    boxShadow: `0 4px 20px ${color}44`, ...ex,
  };
}

function WeightGraph({ entries }) {
  if (entries.length === 0)
    return <div style={{ textAlign: "center", color: C.sub, padding: "40px 0", fontSize: 17 }}>データなし</div>;
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
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="13" fill={C.sub}>{e.date.slice(5)}</text>
      ))}
      <text x={pad - 4} y={pad + 4} textAnchor="end" fontSize="13" fill={C.sub}>{max}</text>
      <text x={pad - 4} y={H - pad + 4} textAnchor="end" fontSize="13" fill={C.sub}>{min}</text>
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
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="26" fontWeight="bold" fill={C.text}>{fmt(elapsed)}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="15" fill={color} fontWeight="bold">
        {progress >= 1 ? "COMPLETE!" : active ? "FASTING" : "PAUSED"}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize="14" fill={C.sub}>GOAL {total / 3600}h</text>
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
      {error && <div style={{ color: C.red, fontSize: 17, padding: "8px 0" }}>{error}</div>}
      {result && (
        <div style={{ background: C.card2, border: `1px solid ${C.green}44`, borderRadius: 12, padding: 16, marginTop: 8 }}>
          <div style={{ fontSize: 15, color: C.green, marginBottom: 4, fontWeight: "bold", letterSpacing: 1 }}>AI ANALYSIS</div>
          <div style={{ fontWeight: "bold", fontSize: 22, marginBottom: 4 }}>{result.name}</div>
          <div style={{ fontSize: 17, color: C.sub, marginBottom: 12 }}>{result.description}</div>
          <div style={{ fontSize: 44, fontWeight: "900", color: C.green, marginBottom: 12 }}>
            {result.calories}<span style={{ fontSize: 18, fontWeight: "normal", color: C.sub }}> kcal</span>
          </div>
          <button onClick={() => { onAdd(result.name, result.calories); setImage(null); setResult(null); }} style={sportBtn(C.orange)}>✅ 追加する</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [currentDate, setCurrentDate] = useState(TODAY);
  const [days, setDays] = useState(() => loadData()?.days ?? {});
  const [fastActive, setFastActive] = useState(() => loadData()?.fastActive ?? false);
  const [fastGoal, setFastGoal] = useState(() => loadData()?.fastGoal ?? 16);
  const [fastStartTime, setFastStartTime] = useState(() => loadData()?.fastStartTime ?? null);
  const [fastBaseElapsed, setFastBaseElapsed] = useState(() => loadData()?.fastBaseElapsed ?? 0);
  const [fastElapsed, setFastElapsed] = useState(() => {
    const d = loadData();
    if (!d) return 0;
    // 保存された fastElapsed は過去のバグで破損している可能性があるため使わない
    // fastBaseElapsed と fastStartTime から正確に再計算する
    if (d.fastActive && d.fastStartTime) {
      return (d.fastBaseElapsed ?? 0) + Math.floor((Date.now() - d.fastStartTime) / 1000);
    }
    return d.fastBaseElapsed ?? 0;
  });
  const [fastNotified, setFastNotified] = useState(false);
  const timerRef = useRef(null);
  const [goal, setGoal] = useState(() => loadData()?.goal ?? { target: 60, calLimit: 2000, height: 170 });
  const [weights, setWeights] = useState(() => loadData()?.weights ?? []);
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCalInput, setGoalCalInput] = useState("");
  const [goalHeight, setGoalHeight] = useState("");
  const [memos, setMemos] = useState(() => loadData()?.memos ?? []);
  const [memoInput, setMemoInput] = useState("");
  const [medList, setMedList] = useState(() => loadData()?.medList ?? []);
  const [medInput, setMedInput] = useState("");
  const [mealType, setMealType] = useState("朝食");
  const [mealName, setMealName] = useState("");
  const [mealCal, setMealCal] = useState("");
  const [mealGrams, setMealGrams] = useState("");
  const [mealCalPer100g, setMealCalPer100g] = useState(null);
  const [gramSuggestions, setGramSuggestions] = useState([]);
  const [foodSearch, setFoodSearch] = useState("");
  const [foodCategory, setFoodCategory] = useState("全て");
  const [stepsInput, setStepsInput] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [weightInput, setWeightInput] = useState("");
  const [apiKey, setApiKey] = useState(localStorage.getItem("anthropicKey") ?? "");
  const [aiAdvice, setAiAdvice] = useState([]);
  const [tdeeAge, setTdeeAge] = useState(() => loadData()?.tdeeProfile?.age ?? "");
  const [tdeeSex, setTdeeSex] = useState(() => loadData()?.tdeeProfile?.sex ?? "female");
  const [tdeeActivity, setTdeeActivity] = useState(() => loadData()?.tdeeProfile?.activity ?? 1.55);

  const getDayData = (date) => {
    const d = days[date];
    if (!d) return { meals: [], exercises: [], water: 0 };
    return { meals: d.meals ?? [], exercises: d.exercises ?? [], water: d.water ?? 0, steps: d.steps ?? 0, takenMeds: d.takenMeds ?? [], note: d.note, rating: d.rating };
  };
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
    const data = { days, fastGoal, fastStartTime, fastBaseElapsed, fastActive, fastElapsed, weights, goal, memos, medList, tdeeProfile: { age: tdeeAge, sex: tdeeSex, activity: tdeeActivity } };
    saveData(data);
    const handleVisibility = () => { if (document.visibilityState === 'hidden') saveData(data); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [days, fastGoal, fastStartTime, fastBaseElapsed, fastActive, fastElapsed, weights, goal, memos, medList, tdeeAge, tdeeSex, tdeeActivity]);

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
      meals: [...day.meals, { id: Date.now(), name: String(n).trim(), cal: Number(c), time: new Date().toTimeString().slice(0, 5), color: mealColors[day.meals.length % mealColors.length], type: mealType }]
    }));
    setMealName(""); setMealCal(""); setMealGrams(""); setMealCalPer100g(null); setGramSuggestions([]);
  };

  const addSteps = () => {
    if (!stepsInput) return;
    updateDay(day => ({ ...day, steps: (day.steps || 0) + Number(stepsInput) }));
    setStepsInput("");
  };

  const addExercise = () => {
    if (!exerciseMinutes) return;
    const w = weights.length > 0 ? weights[weights.length - 1].weight : 60;
    const mins = Number(exerciseMinutes);
    const burned = Math.round(selectedExercise.met * w * mins / 60);
    updateDay(day => ({ ...day, exercises: [...day.exercises, { id: Date.now(), name: `${selectedExercise.icon} ${selectedExercise.name} ${mins}分`, burned, time: new Date().toTimeString().slice(0, 5) }] }));
    setExerciseMinutes("");
  };

  const addWater = (ml) => updateDay(day => ({ ...day, water: (day.water || 0) + ml }));
  const resetWater = () => updateDay(day => ({ ...day, water: 0 }));

  const addWeight = () => {
    if (!weightInput) return;
    setWeights([...weights.filter((w) => w.date !== currentDate), { date: currentDate, weight: Number(weightInput) }].sort((a, b) => a.date.localeCompare(b.date)));
    setWeightInput("");
  };

  const addMed = () => {
    if (!medInput.trim()) return;
    setMedList([...medList, { id: Date.now(), name: medInput.trim() }]);
    setMedInput("");
  };
  const removeMed = (id) => setMedList(medList.filter(m => m.id !== id));
  const toggleMed = (id, timing) => updateDay(day => {
    const taken = day.takenMeds ?? [];
    const key = `${id}_${timing}`;
    return { ...day, takenMeds: taken.includes(key) ? taken.filter(x => x !== key) : [...taken, key] };
  });

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
    const dayLabel = isToday ? "今日" : dateLabel;
    // カロリー
    if (totalCal === 0) {
      tips.push(`${dayLabel}はまだ食事が記録されていません。食事を記録してカロリーを管理しましょう！`);
    } else if (totalCal > goal.calLimit) {
      tips.push(`${dayLabel}のカロリーが上限より ${totalCal - goal.calLimit}kcal オーバーしています。次回は ${goal.calLimit}kcal 以内を目指しましょう。`);
    } else {
      tips.push(`${dayLabel}のカロリーは目標内です！あと ${goal.calLimit - totalCal}kcal の余裕があります。この調子で！`);
    }
    // 水分
    if (todayWater === 0) {
      tips.push(`${dayLabel}は水分がまだ記録されていません。こまめな水分補給は代謝アップに効果的です。`);
    } else if (todayWater < 1500) {
      tips.push(`${dayLabel}の水分が ${todayWater}ml です。あと ${2000 - todayWater}ml 飲むと理想的です。`);
    } else {
      tips.push(`水分補給バッチリ！${todayWater}ml 摂取済みです。`);
    }
    // 運動
    if (totalBurned === 0) {
      tips.push(`${dayLabel}はまだ運動の記録がありません。軽いウォーキングだけでも効果があります！`);
    } else if (totalBurned < 200) {
      tips.push(`${dayLabel}は ${totalBurned}kcal 消費しました。もう少し動くとさらに効果的です。`);
    } else {
      tips.push(`${dayLabel}は ${totalBurned}kcal 消費！素晴らしい運動量です。`);
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

  const filteredFoods = FOOD_DB.filter(f =>
    (foodCategory === "全て" || f.cat === foodCategory) &&
    (!foodSearch || f.name.includes(foodSearch))
  );

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
    fontSize: 20, width: "100%", boxSizing: "border-box", outline: "none",
    fontFamily: "inherit", backgroundColor: C.card2, color: C.text,
    WebkitAppearance: "none", appearance: "none", display: "block",
  };
  const card = { background: C.card, borderRadius: 16, padding: 20, margin: "12px 14px 0", border: `1px solid ${C.border}` };
  const sec = { fontSize: 15, fontWeight: "900", color: C.sub, marginBottom: 14, letterSpacing: 2, textTransform: "uppercase" };
  const badge = (c) => ({ background: `${c}22`, color: c, borderRadius: 8, padding: "4px 10px", fontSize: 16, fontWeight: "800", whiteSpace: "nowrap", border: `1px solid ${c}44` });
  const statBox = (c) => ({ flex: 1, background: `${c}0D`, borderRadius: 12, padding: 12, textAlign: "center", border: `1px solid ${c}33` });

  const dateLabel = currentDate === TODAY ? "今日" : currentDate.slice(5).replace("-", "/");

  return (
    <div style={{ fontFamily: "'Segoe UI','Hiragino Sans',sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto", color: C.text }}>

      {/* ヘッダー */}
      <div style={{ background: "linear-gradient(135deg,#1A0A00,#0A0A0A)", borderBottom: `1px solid ${C.border}`, padding: "16px 20px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, color: C.orange, fontWeight: "900", letterSpacing: 3, marginBottom: 2 }}>DIET TRACKER</div>
            <div style={{ fontSize: 24, fontWeight: "900" }}>💪 MY FITNESS</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, fontWeight: "900", color: calPct > 80 ? C.red : C.orange }}>{Math.round(calPct)}<span style={{ fontSize: 15, color: C.sub }}>%</span></div>
            <div style={{ fontSize: 14, color: C.sub }}>{totalCal} / {goal.calLimit} kcal</div>
          </div>
        </div>
        {/* 日付ナビ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 10 }}>
          <button onClick={prevDate} style={{ background: "none", border: `1px solid ${C.border}`, color: C.sub, borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 20 }}>‹</button>
          <div style={{ fontSize: 18, fontWeight: "800", color: isToday ? C.orange : C.text, minWidth: 80, textAlign: "center" }}>{dateLabel}</div>
          <button onClick={nextDate} disabled={isToday} style={{ background: "none", border: `1px solid ${C.border}`, color: isToday ? C.sub2 : C.sub, borderRadius: 8, padding: "4px 12px", cursor: isToday ? "default" : "pointer", fontSize: 20 }}>›</button>
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
                  <div style={{ fontSize: 14, color: C.sub, marginBottom: 6 }}>TARGET</div>
                  <select value={fastGoal} onChange={(e) => { setFastGoal(Number(e.target.value)); resetFastTimer(); }} style={inp}>
                    {[12, 14, 16, 18, 20, 24].map(h => <option key={h} value={h}>{h}h</option>)}
                  </select>
                </div>
                <button onClick={handleTimerBtn} style={sportBtn(fastElapsed >= fastGoal * 3600 ? C.green : fastActive ? C.red : C.orange)}>
                  {fastElapsed >= fastGoal * 3600 ? "🏆 RESET" : fastActive ? "⏸ STOP" : "▶ START"}
                </button>
                <button onClick={resetFastTimer} style={{ marginTop: 8, width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", color: C.sub, fontSize: 16, cursor: "pointer" }}>🔄 RESET</button>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={sec}>🔥 CALORIE BALANCE</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={statBox(C.red)}>
                <div style={{ fontSize: 14, color: C.sub, marginBottom: 4 }}>摂取</div>
                <div style={{ fontSize: 30, fontWeight: "900", color: C.red }}>{totalCal}</div>
                <div style={{ fontSize: 14, color: C.sub }}>kcal</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: C.sub, fontSize: 22 }}>−</div>
              <div style={statBox(C.green)}>
                <div style={{ fontSize: 14, color: C.sub, marginBottom: 4 }}>消費</div>
                <div style={{ fontSize: 30, fontWeight: "900", color: C.green }}>{totalBurned}</div>
                <div style={{ fontSize: 14, color: C.sub }}>kcal</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: C.sub, fontSize: 22 }}>=</div>
              <div style={statBox(C.blue)}>
                <div style={{ fontSize: 14, color: C.sub, marginBottom: 4 }}>正味</div>
                <div style={{ fontSize: 30, fontWeight: "900", color: C.blue }}>{netCal}</div>
                <div style={{ fontSize: 14, color: C.sub }}>kcal</div>
              </div>
            </div>
          </div>

          {/* 水分記録 */}
          <div style={card}>
            <div style={sec}>💧 WATER INTAKE</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 40, fontWeight: "900", color: C.blue }}>{todayWater}</span>
                <span style={{ fontSize: 17, color: C.sub }}> ml</span>
              </div>
              <div style={badge(waterPct >= 100 ? C.green : C.blue)}>{Math.round(waterPct)}% / 2000ml</div>
            </div>
            <div style={{ background: C.border, borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${waterPct}%`, background: `linear-gradient(90deg,${C.blue},${C.green})`, borderRadius: 6, transition: "width 0.5s", boxShadow: `0 0 8px ${C.blue}` }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[100, 200, 500].map(ml => (
                <button key={ml} onClick={() => addWater(ml)} style={sportBtn(C.blue, { flex: 1, padding: "12px 8px", fontSize: 17 })}>+{ml}ml</button>
              ))}
              <button onClick={resetWater} style={{ flex: 1, padding: "12px 8px", background: "none", border: `1px solid ${C.border}`, borderRadius: 12, color: C.sub, fontSize: 16, cursor: "pointer" }}>リセット</button>
            </div>
          </div>

          {/* バッジ */}
          <div style={card}>
            <div style={sec}>🏅 ACHIEVEMENTS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ACHIEVEMENTS.map((a, i) => (
                <div key={i} style={{ background: a.done ? `${C.yellow}22` : C.card2, border: `1px solid ${a.done ? C.yellow : C.border}`, borderRadius: 12, padding: "10px 14px", textAlign: "center", minWidth: 80, flex: 1, opacity: a.done ? 1 : 0.4, filter: a.done ? `drop-shadow(0 0 6px ${C.yellow})` : "none" }}>
                  <div style={{ fontSize: 26 }}>{a.icon}</div>
                  <div style={{ fontSize: 14, color: a.done ? C.yellow : C.sub, fontWeight: "800", marginTop: 4 }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 💊 MEDICATION */}
          <div style={card}>
            <div style={sec}>💊 MEDICATION</div>
            {/* ヘッダー行 */}
            {medList.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", paddingBottom: 8, marginBottom: 4, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ flex: 1 }} />
                {["朝", "昼", "夕"].map(t => (
                  <div key={t} style={{ width: 52, textAlign: "center", fontSize: 16, fontWeight: "900", color: t === "朝" ? C.yellow : t === "昼" ? C.orange : C.blue }}>{t}</div>
                ))}
                <div style={{ width: 36 }} />
              </div>
            )}
            {medList.length === 0 ? (
              <div style={{ color: C.sub, fontSize: 17, textAlign: "center", padding: "10px 0 14px" }}>薬・サプリを追加してください</div>
            ) : (
              medList.map(med => {
                const takenArr = dayData.takenMeds ?? [];
                return (
                  <div key={med.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ flex: 1, fontSize: 18, color: C.text }}>{med.name}</span>
                    {["朝", "昼", "夕"].map(timing => {
                      const key = `${med.id}_${timing}`;
                      const checked = takenArr.includes(key);
                      const color = timing === "朝" ? C.yellow : timing === "昼" ? C.orange : C.blue;
                      return (
                        <button key={timing} onClick={() => toggleMed(med.id, timing)}
                          style={{ width: 52, display: "flex", justifyContent: "center", background: "none", border: "none", cursor: "pointer", touchAction: "manipulation" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: checked ? color : "none", border: `2px solid ${checked ? color : C.sub2}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", fontWeight: "900" }}>
                            {checked ? "✓" : ""}
                          </div>
                        </button>
                      );
                    })}
                    <button onClick={() => removeMed(med.id)}
                      style={{ width: 36, background: "none", border: "none", color: C.sub2, cursor: "pointer", fontSize: 24, touchAction: "manipulation" }}>×</button>
                  </div>
                );
              })
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <input style={{ ...inp, flex: 1 }} placeholder="薬・サプリ名（例：血圧の薬）" value={medInput}
                onChange={e => setMedInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addMed()} />
              <button onClick={addMed} style={sportBtn(C.purple, { flex: "none", padding: "14px 20px", width: "auto" })}>➕</button>
            </div>
          </div>
        </>}

        {/* MEAL */}
        {tab === 1 && <>
          {/* 食事区分セレクター */}
          {(() => {
            const MEAL_TYPES = [
              { label: "🌅 朝食", key: "朝食", color: C.yellow },
              { label: "☀️ 昼食", key: "昼食", color: C.orange },
              { label: "🌙 夕食", key: "夕食", color: C.blue },
              { label: "🍩 間食", key: "間食", color: C.purple },
            ];
            return (
              <div style={{ ...card, padding: "14px 20px" }}>
                <div style={sec}>🍽 MEAL TYPE</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {MEAL_TYPES.map(t => (
                    <button key={t.key} onClick={() => setMealType(t.key)}
                      style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: `2px solid ${mealType === t.key ? t.color : C.border}`, background: mealType === t.key ? `${t.color}22` : C.card2, color: mealType === t.key ? t.color : C.sub, fontWeight: "800", fontSize: 15, cursor: "pointer", lineHeight: 1.4 }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          <div style={card}>
            <div style={sec}>📷 AI CALORIE SCAN</div>
            <CalorieCamera onAdd={(name, cal) => addMeal(name, cal)} apiKey={apiKey} />
          </div>

          {/* 食品DB */}
          <div style={card}>
            <div style={sec}>🍱 FOOD DATABASE</div>
            {/* カテゴリタブ */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 8, WebkitOverflowScrolling: "touch" }}>
              {FOOD_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setFoodCategory(cat); setFoodSearch(""); }}
                  style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 20, border: `1px solid ${foodCategory === cat ? C.orange : C.border}`, background: foodCategory === cat ? `${C.orange}22` : C.card2, color: foodCategory === cat ? C.orange : C.sub, fontWeight: foodCategory === cat ? "800" : "400", fontSize: 16, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {cat}
                </button>
              ))}
            </div>
            <input style={{ ...inp, marginBottom: 10, fontSize: 18 }} placeholder="検索（例：チキン）" value={foodSearch} onChange={e => { setFoodSearch(e.target.value); setFoodCategory("全て"); }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 320, overflowY: "auto" }}>
              {filteredFoods.length === 0
                ? <div style={{ color: C.sub, fontSize: 17, padding: 10 }}>該当なし</div>
                : filteredFoods.map((f, i) => (
                <button key={i} onClick={() => addMeal(f.name, f.cal)}
                  style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", color: C.text, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", fontSize: 17 }}>{f.name}</span>
                  <span style={{ color: C.orange, fontSize: 16, fontWeight: "800", marginLeft: 8, flexShrink: 0 }}>{f.cal} kcal</span>
                </button>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={sec}>✏️ MANUAL INPUT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                      <div key={i} onClick={() => { setMealName(f.name); setMealCalPer100g(f.cal); setGramSuggestions([]); setMealCal(""); }}
                        style={{ padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ color: C.text, fontSize: 17 }}>{f.name}</span>
                        <span style={{ color: C.sub, fontSize: 16 }}>{f.cal}kcal/100g</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {mealCalPer100g !== null && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input style={{ ...inp, flex: 1 }} type="tel" placeholder="グラム数" value={mealGrams}
                    onChange={e => { const g = e.target.value.replace(/[^0-9.]/g, ""); setMealGrams(g); if (g) setMealCal(String(Math.round(mealCalPer100g * parseFloat(g) / 100))); else setMealCal(""); }} />
                  <span style={{ color: C.sub, fontSize: 16, whiteSpace: "nowrap" }}>g</span>
                  {mealCal ? <span style={{ color: C.orange, fontWeight: "700", fontSize: 20, whiteSpace: "nowrap" }}>{mealCal} kcal</span>
                    : <span style={{ color: C.sub, fontSize: 16, whiteSpace: "nowrap" }}>{mealCalPer100g}kcal/100g</span>}
                </div>
              )}
              <input style={inp} type="tel" placeholder={mealCalPer100g ? "カロリー（自動計算 or 手動修正）" : "カロリー（kcal）"}
                value={mealCal} onChange={e => setMealCal(e.target.value.replace(/[^0-9]/g, ""))} />
              <button onClick={() => addMeal()} style={sportBtn(C.orange)}>➕ ADD MEAL</button>
            </div>
          </div>

          {/* 食事記録（区分別グループ表示） */}
          <div style={card}>
            <div style={sec}>📋 TODAY'S MEALS</div>
            {(() => {
              const MEAL_TYPES = [
                { key: "朝食", icon: "🌅", color: C.yellow },
                { key: "昼食", icon: "☀️", color: C.orange },
                { key: "夕食", icon: "🌙", color: C.blue },
                { key: "間食", icon: "🍩", color: C.purple },
              ];
              const allMeals = dayData.meals;
              if (allMeals.length === 0) return <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 17 }}>記録なし</div>;
              return (
                <>
                  {MEAL_TYPES.map(t => {
                    const meals = allMeals.filter(m => (m.type ?? "朝食") === t.key);
                    if (meals.length === 0) return null;
                    const subTotal = meals.reduce((s, m) => s + m.cal, 0);
                    return (
                      <div key={t.key} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 4px", borderBottom: `2px solid ${t.color}44` }}>
                          <span style={{ fontSize: 17, fontWeight: "900", color: t.color }}>{t.icon} {t.key}</span>
                          <span style={{ fontSize: 16, color: t.color, fontWeight: "700" }}>{subTotal} kcal</span>
                        </div>
                        {meals.map(m => (
                          <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 10px 8px", borderBottom: `1px solid ${C.border}` }}>
                            <div>
                              <div style={{ fontWeight: "700", fontSize: 18 }}>{m.name}</div>
                              <div style={{ fontSize: 15, color: C.sub }}>{m.time}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={badge(t.color)}>{m.cal} kcal</span>
                              <button onClick={() => updateDay(day => ({ ...day, meals: day.meals.filter(x => x.id !== m.id) }))}
                                style={{ background: "none", border: "none", color: C.sub2, cursor: "pointer", fontSize: 24, padding: "8px", touchAction: "manipulation" }}>×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  <div style={{ paddingTop: 8, fontWeight: "900", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: C.sub }}>TOTAL</span>
                    <span style={{ color: C.orange }}>{totalCal} kcal</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* 当日まとめ */}
          {(() => {
            const MEAL_TYPES_SUM = [
              { key: "朝食", icon: "🌅", color: C.yellow },
              { key: "昼食", icon: "☀️", color: C.orange },
              { key: "夕食", icon: "🌙", color: C.blue },
              { key: "間食", icon: "🍩", color: C.purple },
            ];
            const netCal2 = totalCal - totalBurned;
            const netColor = netCal2 < 0 ? C.green : netCal2 > 2200 ? C.red : C.orange;
            const RATINGS = ["😞","😐","🙂","😄","🔥"];
            return (
              <div style={card}>
                <div style={sec}>📓 DAY SUMMARY</div>

                {/* ① カロリー全体 */}
                <div style={{ background: C.card2, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
                  <div style={{ fontSize: 15, color: C.sub, fontWeight: "700", marginBottom: 10, letterSpacing: 1 }}>CALORIE BALANCE</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 15, color: C.sub, marginBottom: 2 }}>摂取</div>
                      <div style={{ fontSize: 26, fontWeight: "900", color: C.orange }}>{totalCal}</div>
                      <div style={{ fontSize: 14, color: C.sub }}>kcal</div>
                    </div>
                    <div style={{ fontSize: 24, color: C.sub2 }}>−</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 15, color: C.sub, marginBottom: 2 }}>消費</div>
                      <div style={{ fontSize: 26, fontWeight: "900", color: C.green }}>{totalBurned}</div>
                      <div style={{ fontSize: 14, color: C.sub }}>kcal</div>
                    </div>
                    <div style={{ fontSize: 24, color: C.sub2 }}>=</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 15, color: C.sub, marginBottom: 2 }}>収支</div>
                      <div style={{ fontSize: 26, fontWeight: "900", color: netColor }}>{netCal2 > 0 ? "+" : ""}{netCal2}</div>
                      <div style={{ fontSize: 14, color: C.sub }}>kcal</div>
                    </div>
                  </div>
                </div>

                {/* ② 食事内訳 */}
                {dayData.meals.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 16, color: C.orange, fontWeight: "900", marginBottom: 8 }}>🍽 食事内訳</div>
                    {MEAL_TYPES_SUM.map(t => {
                      const meals = dayData.meals.filter(m => (m.type ?? "朝食") === t.key);
                      if (meals.length === 0) return null;
                      const sub = meals.reduce((s, m) => s + m.cal, 0);
                      return (
                        <div key={t.key} style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, marginBottom: 3 }}>
                            <span style={{ color: t.color, fontWeight: "700" }}>{t.icon} {t.key}</span>
                            <span style={{ color: t.color, fontWeight: "700" }}>{sub} kcal</span>
                          </div>
                          {meals.map(m => (
                            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 16, padding: "2px 8px", color: C.sub }}>
                              <span>{m.time} {m.name}</span>
                              <span>{m.cal} kcal</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ③ 運動記録 */}
                {dayData.exercises.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 16, color: C.green, fontWeight: "900", marginBottom: 6 }}>🏃 運動記録</div>
                    {dayData.exercises.map(e => (
                      <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 16, padding: "3px 0", color: C.sub }}>
                        <span>{e.time} {e.name}</span>
                        <span style={{ color: C.green }}>−{e.burned} kcal</span>
                      </div>
                    ))}
                    <div style={{ fontSize: 16, color: C.sub, textAlign: "right", marginTop: 4, borderTop: `1px solid ${C.border}`, paddingTop: 4 }}>
                      消費合計 <span style={{ color: C.green, fontWeight: "700" }}>−{totalBurned} kcal</span>
                    </div>
                  </div>
                )}

                {/* ④ 水分 */}
                {todayWater > 0 && (
                  <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", fontSize: 17 }}>
                    <span style={{ color: C.sub }}>💧 水分摂取</span>
                    <span style={{ color: C.blue, fontWeight: "700" }}>{todayWater} ml</span>
                  </div>
                )}

                {/* ⑤ 今日の評価 */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 16, color: C.sub, fontWeight: "700", marginBottom: 8 }}>⭐ 今日の評価</div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    {RATINGS.map((emoji, i) => (
                      <button key={i} onClick={() => updateDay(day => ({ ...day, rating: i }))}
                        style={{ fontSize: 32, background: "none", border: `2px solid ${(dayData.rating ?? -1) === i ? C.orange : C.border}`, borderRadius: 10, padding: "6px 10px", cursor: "pointer", opacity: (dayData.rating ?? -1) === i ? 1 : 0.45 }}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ⑥ メモ・感想 */}
                <div>
                  <div style={{ fontSize: 16, color: C.sub, fontWeight: "700", marginBottom: 6 }}>📝 メモ・感想</div>
                  <textarea
                    style={{ ...inp, height: 100, resize: "none", lineHeight: 1.7, fontSize: 18 }}
                    placeholder={"体調・食べた感想・気づき・明日の目標など…"}
                    value={dayData.note ?? ""}
                    onChange={e => updateDay(day => ({ ...day, note: e.target.value }))}
                  />
                </div>
              </div>
            );
          })()}
        </>}

        {/* TRAIN */}
        {tab === 2 && <>
          {/* STEPS：歩数のみ記録（カロリー計算なし） */}
          <div style={card}>
            <div style={sec}>🚶 STEPS</div>
            {dayData.steps > 0 && (
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 44, fontWeight: "900", color: C.blue }}>{dayData.steps.toLocaleString()}</span>
                <span style={{ fontSize: 18, color: C.sub }}> 歩</span>
                <div style={{ fontSize: 15, color: C.sub, marginTop: 4 }}>参考: 約{Math.round(calcStepCalories(dayData.steps, weights.length > 0 ? weights[weights.length-1].weight : 60))} kcal相当</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inp, flex: 1 }} type="tel" placeholder="歩数（例: 8000）" value={stepsInput} onChange={e => setStepsInput(e.target.value.replace(/[^0-9]/g, ""))} />
              <button onClick={addSteps} style={sportBtn(C.blue, { flex: "none", padding: "14px 20px", width: "auto" })}>➕</button>
            </div>
            {dayData.steps > 0 && (
              <button onClick={() => updateDay(day => ({ ...day, steps: 0 }))} style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", color: C.sub, fontSize: 16, cursor: "pointer" }}>🔄 リセット</button>
            )}
          </div>

          {/* WORKOUT：運動種目＋時間でカロリー計算 */}
          <div style={card}>
            <div style={sec}>💪 WORKOUT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <select value={selectedExercise.name} onChange={e => setSelectedExercise(EXERCISES.find(ex => ex.name === e.target.value))} style={inp}>
                {EXERCISES.map(ex => <option key={ex.name} value={ex.name}>{ex.icon} {ex.name}</option>)}
              </select>
              <input style={inp} type="tel" placeholder="時間（分）" value={exerciseMinutes} onChange={e => setExerciseMinutes(e.target.value.replace(/[^0-9]/g, ""))} />
              {exerciseMinutes ? (
                <div style={{ background: `${C.green}11`, border: `1px solid ${C.green}44`, borderRadius: 10, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 17, color: C.sub }}>{selectedExercise.icon} {selectedExercise.name} {exerciseMinutes}分</span>
                  <span style={{ fontSize: 24, fontWeight: "900", color: C.green }}>
                    −{Math.round(selectedExercise.met * (weights.length > 0 ? weights[weights.length-1].weight : 60) * Number(exerciseMinutes) / 60)} kcal
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: 16, color: C.sub, textAlign: "center" }}>時間を入れるとカロリーが表示されます</div>
              )}
              <button onClick={addExercise} style={sportBtn(C.green)}>🔥 ADD WORKOUT</button>
            </div>
          </div>
          <div style={card}>
            <div style={sec}>📋 TODAY'S TRAINING</div>
{dayData.exercises.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 17 }}>記録なし</div>}
            {dayData.exercises.map(e => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 36, borderRadius: 2, background: C.green }} />
                  <div>
                    <div style={{ fontWeight: "700", fontSize: 18 }}>{e.name}</div>
                    <div style={{ fontSize: 15, color: C.sub }}>{e.time}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={badge(C.green)}>{e.burned} kcal</span>
                  <button onClick={() => updateDay(day => ({ ...day, exercises: day.exercises.filter(x => x.id !== e.id) }))}
                    style={{ background: "none", border: "none", color: C.sub2, cursor: "pointer", fontSize: 24, padding: "8px" }}>×</button>
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
                <div style={{ fontSize: 14, color: C.sub, marginBottom: 4 }}>BMI</div>
                <div style={{ fontSize: 40, fontWeight: "900", color: bmiColor }}>{bmi ?? "−"}</div>
                <div style={{ fontSize: 16, color: bmiColor, fontWeight: "800" }}>{bmiLabel}</div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {[["< 18.5", "低体重", C.blue], ["18.5-25", "普通", C.green], ["25-30", "肥満①", C.orange], ["> 30", "肥満②", C.red]].map(([range, label, color]) => (
                  <div key={label} style={{ background: C.card2, borderRadius: 8, padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 15, color: C.sub }}>{range}</span>
                    <span style={{ fontSize: 15, color, fontWeight: "800" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 15, color: C.sub, textAlign: "center" }}>身長: {goal.height}cm（GOALタブで変更可）</div>
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
            {weights.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 17 }}>記録なし</div>}
            {[...weights].reverse().slice(0, 10).map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.sub, fontSize: 17 }}>{w.date}</span>
                <span style={{ fontWeight: "900" }}>{w.weight} <span style={{ fontSize: 15, color: C.sub }}>kg</span></span>
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
            {memos.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 20, fontSize: 17 }}>メモなし</div>}
            {[...memos].reverse().map(m => (
              <div key={m.id} style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 15, color: C.purple, fontWeight: "bold" }}>{m.date}</span>
                  <button onClick={() => setMemos(memos.filter(x => x.id !== m.id))} style={{ background: "none", border: "none", color: C.sub2, cursor: "pointer", fontSize: 24, padding: "4px 8px" }}>×</button>
                </div>
                <div style={{ fontSize: 18, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.text}</div>
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
                <div style={{ fontSize: 14, color: C.sub, marginBottom: 4 }}>TARGET</div>
                <div style={{ fontSize: 34, fontWeight: "900", color: C.purple }}>{goal.target}<span style={{ fontSize: 16, color: C.sub }}> kg</span></div>
              </div>
              <div style={{ flex: 1, background: `${C.orange}11`, border: `1px solid ${C.orange}33`, borderRadius: 14, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 14, color: C.sub, marginBottom: 4 }}>CAL LIMIT</div>
                <div style={{ fontSize: 28, fontWeight: "900", color: C.orange }}>{goal.calLimit}<span style={{ fontSize: 14, color: C.sub }}> kcal</span></div>
              </div>
            </div>
            <div style={{ background: `${Number(weightLeft) <= 0 ? C.green : C.orange}0D`, border: `1px solid ${Number(weightLeft) <= 0 ? C.green : C.orange}33`, borderRadius: 14, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 15, color: C.sub, marginBottom: 4 }}>REMAINING</div>
              <div style={{ fontSize: 34, fontWeight: "900", color: Number(weightLeft) <= 0 ? C.green : C.orange }}>
                {Number(weightLeft) <= 0 ? "🎉 目標達成！" : `あと ${weightLeft} kg！`}
              </div>
            </div>
          </div>

          {/* TDEEカード */}
          <div style={card}>
            <div style={sec}>🔥 TDEE CALCULATOR</div>
            {(() => {
              const w = latestWeight ?? Number(goal.target) ?? 60;
              const h = goal.height;
              const a = Number(tdeeAge);
              const bmr = (tdeeAge && w && h)
                ? Math.round(tdeeSex === "male"
                  ? 10 * w + 6.25 * h - 5 * a + 5
                  : 10 * w + 6.25 * h - 5 * a - 161)
                : null;
              const tdee = bmr ? Math.round(bmr * Number(tdeeActivity)) : null;
              const ACTIVITY_LABELS = [
                { val: 1.2,   label: "座り仕事中心（ほぼ運動なし）" },
                { val: 1.375, label: "軽い運動（週1〜3日）" },
                { val: 1.55,  label: "適度な運動（週3〜5日）" },
                { val: 1.725, label: "激しい運動（週6〜7日）" },
                { val: 1.9,   label: "ハードな肉体労働" },
              ];
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* 性別 */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["female","女性"],["male","男性"]].map(([v,label]) => (
                      <button key={v} onClick={() => setTdeeSex(v)}
                        style={{ flex: 1, padding: "12px", borderRadius: 10, border: `2px solid ${tdeeSex === v ? C.blue : C.border}`, background: tdeeSex === v ? `${C.blue}22` : C.card2, color: tdeeSex === v ? C.blue : C.sub, fontWeight: "800", fontSize: 18, cursor: "pointer" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* 年齢 */}
                  <input style={inp} type="tel" placeholder="年齢（例: 35）" value={tdeeAge}
                    onChange={e => setTdeeAge(e.target.value.replace(/[^0-9]/g, ""))} />
                  {/* 活動量 */}
                  <select value={tdeeActivity} onChange={e => setTdeeActivity(Number(e.target.value))} style={inp}>
                    {ACTIVITY_LABELS.map(a => <option key={a.val} value={a.val}>{a.label}</option>)}
                  </select>
                  {/* 計算結果 */}
                  {bmr && tdee ? (
                    <div style={{ background: C.card2, borderRadius: 12, padding: 16, marginTop: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div style={{ fontSize: 14, color: C.sub, marginBottom: 4 }}>基礎代謝 BMR</div>
                          <div style={{ fontSize: 28, fontWeight: "900", color: C.blue }}>{bmr.toLocaleString()}</div>
                          <div style={{ fontSize: 14, color: C.sub }}>kcal</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", color: C.sub }}>→</div>
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div style={{ fontSize: 14, color: C.sub, marginBottom: 4 }}>1日の総消費 TDEE</div>
                          <div style={{ fontSize: 32, fontWeight: "900", color: C.orange }}>{tdee.toLocaleString()}</div>
                          <div style={{ fontSize: 14, color: C.sub }}>kcal</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 15, color: C.sub, textAlign: "center", marginBottom: 10 }}>
                        ダイエット目標なら <span style={{ color: C.green, fontWeight: "700" }}>{(tdee - 500).toLocaleString()}</span> kcal（−500kcal）が目安
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setGoal(g => ({ ...g, calLimit: tdee }))}
                          style={{ ...sportBtn(C.orange), flex: 1, padding: "10px", fontSize: 16 }}>
                          TDEEをカロリー上限に設定
                        </button>
                        <button onClick={() => setGoal(g => ({ ...g, calLimit: tdee - 500 }))}
                          style={{ ...sportBtn(C.green), flex: 1, padding: "10px", fontSize: 16 }}>
                          −500kcalで設定
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: C.sub, textAlign: "center", padding: "8px 0" }}>
                      年齢を入力するとTDEEを計算します（体重・身長はGOAL設定から参照）
                    </div>
                  )}
                </div>
              );
            })()}
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
                <span style={{ fontSize: 22, flexShrink: 0 }}>💡</span>
                <span style={{ fontSize: 18, lineHeight: 1.6, color: C.sub }}>{a}</span>
              </div>
            ))}
            {aiAdvice.length === 0 && <div style={{ color: C.sub, fontSize: 17, textAlign: "center", padding: "8px 0" }}>ボタンを押してAIアドバイスを取得</div>}
          </div>

          {/* CSVエクスポート */}
          <div style={card}>
            <div style={sec}>📤 EXPORT DATA</div>
            <button onClick={exportCSV} style={sportBtn(C.blue)}>📊 CSVでダウンロード</button>
            <div style={{ fontSize: 15, color: C.sub, marginTop: 8, textAlign: "center" }}>食事・運動・体重・水分の全データをエクスポート</div>
          </div>

        </>}
      </div>

      {/* タブバー */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.card, display: "flex", borderTop: `1px solid ${C.border}`, zIndex: 100 }}>
        {TABS.map((icon, i) => (
          <button key={i} onClick={() => setTab(i)}
            style={{ flex: 1, padding: "10px 2px 8px", border: "none", background: "none", fontSize: 13, fontWeight: i === tab ? "900" : "normal", color: i === tab ? C.orange : C.sub2, cursor: "pointer", WebkitTapHighlightColor: "transparent", touchAction: "manipulation", letterSpacing: 0.5 }}>
            <div style={{ fontSize: 24, marginBottom: 2, filter: i === tab ? `drop-shadow(0 0 6px ${C.orange})` : "none" }}>{icon}</div>
            <div>{TAB_LABELS[i]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
