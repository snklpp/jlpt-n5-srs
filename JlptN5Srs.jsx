import React, { useState, useEffect, useRef, useMemo } from "react";

/* ============================================================================
   JLPT N5 — Spaced Repetition Flashcards
   Single-file React app. Anki-style learning steps + SM-2 review intervals.
   Vocabulary sourced from the N5V workbook; one deck section per sheet.
   Furigana is added inside mnemonics for kanji above N5's neighbour level
   (N2 / N1 / beyond-JLPT), rendered as ruby. Progress persists via
   window.storage (never localStorage), with an in-memory fallback.
   ========================================================================== */

const DECK = [{"name":"Numbers & Colors","cards":[{"romaji":"zero","kana":"ゼロ","meaning":"zero","mnemonic":"Katakana loanword from English “zero.”"},{"romaji":"ichi","kana":"いち","kanji":"一","meaning":"one","mnemonic":"一 = one: a single horizontal line."},{"romaji":"ni","kana":"に","kanji":"二","meaning":"two","mnemonic":"二 = two: two parallel lines."},{"romaji":"san","kana":"さん","kanji":"三","meaning":"three","mnemonic":"三 = three: three stacked lines."},{"romaji":"yon","kana":"よん","kanji":"四","meaning":"four","mnemonic":"Represents the four walls of a room, or a square window with curtains."},{"romaji":"go","kana":"ご","kanji":"五","meaning":"five","mnemonic":"Looks a bit like a digital '5' with a flat top and bottom."},{"romaji":"roku","kana":"ろく","kanji":"六","meaning":"six","mnemonic":"Looks like a central node with lines spreading out."},{"romaji":"nana","kana":"なな","kanji":"七","meaning":"seven","mnemonic":"An upside-down '7' crossed by a line."},{"romaji":"hachi","kana":"はち","kanji":"八","meaning":"eight","mnemonic":"Two diverging lines, like a tree splitting at the root."},{"romaji":"kyuu","kana":"きゅう","kanji":"九","meaning":"nine","mnemonic":"Looks like a person doing a push-up."},{"romaji":"juu","kana":"じゅう","kanji":"十","meaning":"ten","mnemonic":"A simple addition/plus sign (+)."},{"romaji":"hyaku","kana":"ひゃく","kanji":"百","meaning":"hundred","mnemonic":"One (一) over white (白) — one white light at 100% brightness."},{"romaji":"sen","kana":"せん","kanji":"千","meaning":"thousand","mnemonic":"Ten (十) wearing an extra line/hat on top makes it a magnitude higher (1000)."},{"romaji":"man","kana":"まん","kanji":"万","meaning":"ten thousand","mnemonic":"Looks like the number 5, but missing a piece (5 x 2000 = 10,000)."},{"romaji":"oku","kana":"おく","kanji":"億","meaning":"one hundred million","mnemonic":"A person radical (亻) standing next to a huge idea/meaning (意)."},{"romaji":"hitotsu","kana":"ひとつ","kanji":"一つ","meaning":"one (thing)","mnemonic":"一 (one) + つ (counter suffix)."},{"romaji":"futatsu","kana":"ふたつ","kanji":"二つ","meaning":"two (things)","mnemonic":"二 (two) + つ."},{"romaji":"mittsu","kana":"みっつ","kanji":"三つ","meaning":"three (things)","mnemonic":"三 (three) + つ."},{"romaji":"yottsu","kana":"よっつ","kanji":"四つ","meaning":"four (things)","mnemonic":"四 (four) + つ."},{"romaji":"itsutsu","kana":"いつつ","kanji":"五つ","meaning":"five (things)","mnemonic":"五 (five) + つ."},{"romaji":"muttsu","kana":"むっつ","kanji":"六つ","meaning":"six (things)","mnemonic":"六 (six) + つ."},{"romaji":"nanatsu","kana":"ななつ","kanji":"七つ","meaning":"seven (things)","mnemonic":"七 (seven) + つ."},{"romaji":"yattsu","kana":"やっつ","kanji":"八つ","meaning":"eight (things)","mnemonic":"八 (eight) + つ."},{"romaji":"kokonotsu","kana":"ここのつ","kanji":"九つ","meaning":"nine (things)","mnemonic":"九 (nine) + つ."},{"romaji":"too","kana":"とお","kanji":"十","meaning":"ten (things)","mnemonic":"Same kanji 十 (ten), read とお in the native counting set (ひとつ…とお)."},{"romaji":"ikutsu","kana":"いくつ","kanji":"幾つ","meaning":"how many","mnemonic":"幾 means “how many / several”; 幾つ → “how many (things)?” Usually kana."},{"romaji":"ikura","kana":"いくら","kanji":"幾ら","meaning":"how much","mnemonic":"幾 (“how many”) + ら → “how much?” (price/amount). Usually kana."},{"romaji":"ichiban","kana":"いちばん","kanji":"一番","meaning":"first","mnemonic":"一 (one) + 番 (turn/number)."},{"romaji":"hitori","kana":"ひとり","kanji":"一人","meaning":"one person","mnemonic":"一 (one) + 人 (person)."},{"romaji":"futari","kana":"ふたり","kanji":"二人","meaning":"two people","mnemonic":"二 (two) + 人 (person)."},{"romaji":"zenbu","kana":"ぜんぶ","kanji":"全部","meaning":"all","mnemonic":"全 (whole/king under an umbrella) + 部 (part/section)."},{"romaji":"hanbun","kana":"はんぶん","kanji":"半分","meaning":"half","mnemonic":"半 (half, cut down the middle) + 分 (to divide)."},{"romaji":"takusan","kana":"たくさん","kanji":"沢山","meaning":"many","mnemonic":"沢【さわ】 (marsh) + 山 (mountain) → “marshes and mountains” = a whole lot. Usually kana."},{"romaji":"bangou","kana":"ばんごう","kanji":"番号","meaning":"number","mnemonic":"番 (turn) + 号 (issue/number, looks like a mouth shouting)."},{"romaji":"guramu","kana":"グラム","meaning":"gram","mnemonic":"Katakana loanword from “gram(me)” (metric mass)."},{"romaji":"kiroguramu","kana":"キログラム","meaning":"kilogram","mnemonic":"Katakana loanword: キロ (kilo) + グラム (gram)."},{"romaji":"meetoru","kana":"メートル","meaning":"meter","mnemonic":"Katakana loanword from French “mètre” (metre)."},{"romaji":"kiromeetoru","kana":"キロメートル","meaning":"kilometer","mnemonic":"Katakana loanword: キロ (kilo) + メートル (metre)."},{"romaji":"kuro","kana":"くろ","kanji":"黒","meaning":"black","mnemonic":"A heavy box/unit (里) overheating with four fire dots (灬) at the bottom."},{"romaji":"shiro","kana":"しろ","kanji":"白","meaning":"white","mnemonic":"A single sun (日) shining pure white light."},{"romaji":"ao","kana":"あお","kanji":"青","meaning":"blue","mnemonic":"Top signifies blue hat, bottom is the moon (月)."},{"romaji":"aka","kana":"あか","kanji":"赤","meaning":"red","mnemonic":"A big (大) fire (火) glowing red underneath."},{"romaji":"midori","kana":"みどり","kanji":"緑","meaning":"green","mnemonic":"Has the 糸【いと】 (thread) radical on the left — picture dyeing thread green."},{"romaji":"iro","kana":"いろ","kanji":"色","meaning":"color","mnemonic":"色 = “color.” Doubles up in 色々 (いろいろ, “various”)."},{"romaji":"kiiro","kana":"きいろ","kanji":"黄色","meaning":"yellow","mnemonic":"黄【き】 (yellow) + 色 (color) → the color yellow."},{"romaji":"chairo","kana":"ちゃいろ","kanji":"茶色","meaning":"brown","mnemonic":"cha (茶) = tea"}]},{"name":"Dates, Days, Week, Seasons","cards":[{"romaji":"kyou","kana":"きょう","kanji":"今日","meaning":"today","mnemonic":"今 (now) + 日 (day)"},{"romaji":"kinou","kana":"きのう","kanji":"昨日","meaning":"yesterday","mnemonic":"昨 (previous) + 日 (day)"},{"romaji":"ototoi","kana":"おととい","kanji":"一昨日","meaning":"day before yesterday","mnemonic":"一 (one) + 昨 (previous) + 日 (day)"},{"romaji":"ashita","kana":"あした","kanji":"明日","meaning":"tomorrow","mnemonic":"明 (bright) + 日 (day) = the bright new day"},{"romaji":"asatte","kana":"あさって","kanji":"明後日","meaning":"day after tomorrow","mnemonic":"明 (bright) + 後 (after) + 日 (day)"},{"romaji":"karendaa","kana":"カレンダー","meaning":"calendar","mnemonic":"Katakana loanword from English “calendar.”"},{"romaji":"tsuitachi","kana":"ついたち","kanji":"一日","meaning":"first of month","mnemonic":"一 (one) + 日 (day)."},{"romaji":"futsuka","kana":"ふつか","kanji":"二日","meaning":"second day of the month","mnemonic":"二 (two) + 日 (day). Reads as “futsu + ka.”"},{"romaji":"mikka","kana":"みっか","kanji":"三日","meaning":"third day of the month","mnemonic":"三 (three) + 日 (day). Reads as “mik + ka.”"},{"romaji":"yokka","kana":"よっか","kanji":"四日","meaning":"fourth day of the month","mnemonic":"四 (four) + 日 (day). Reads as “yok + ka.”"},{"romaji":"itsuka","kana":"いつか","kanji":"五日","meaning":"fifth day of the month","mnemonic":"五 (five) + 日 (day). Reads as “itsu + ka.”"},{"romaji":"muika","kana":"むいか","kanji":"六日","meaning":"sixth day of the month","mnemonic":"六 (six) + 日 (day). Reads as “mui + ka.”"},{"romaji":"nanoka","kana":"なのか","kanji":"七日","meaning":"the seventh day","mnemonic":"七 (seven) + 日 (day). Reads as “nano + ka.”"},{"romaji":"youka","kana":"ようか","kanji":"八日","meaning":"eighth day of the month","mnemonic":"八 (eight) + 日 (day). Reads as “you + ka.”"},{"romaji":"kokonoka","kana":"ここのか","kanji":"九日","meaning":"ninth day of the month","mnemonic":"九 (nine) + 日 (day). Reads as “kokono + ka.”"},{"romaji":"tooka","kana":"とおか","kanji":"十日","meaning":"the tenth day","mnemonic":"十 (ten) + 日 (day). Reads as “too + ka.”"},{"romaji":"hatsuka","kana":"はつか","kanji":"二十日","meaning":"twenty days","mnemonic":"Special reading: 二十 (twenty) + 日 (day) fuse into はつか (not にじゅうにち). Also = the 20th."},{"romaji":"mainichi","kana":"まいにち","kanji":"毎日","meaning":"every day","mnemonic":"毎 (every) + 日 (day)."},{"romaji":"yasumi","kana":"やすみ","kanji":"休み","meaning":"rest","mnemonic":"A person (亻) leaning against a tree (木) to rest."},{"romaji":"getsuyoubi","kana":"げつようび","kanji":"月曜日","meaning":"Monday","mnemonic":"月 = Moon | 曜日 = day of the week"},{"romaji":"kayoubi","kana":"かようび","kanji":"火曜日","meaning":"Tuesday","mnemonic":"火 = Fire"},{"romaji":"suiyoubi","kana":"すいようび","kanji":"水曜日","meaning":"Wednesday","mnemonic":"水 = Water"},{"romaji":"mokuyoubi","kana":"もくようび","kanji":"木曜日","meaning":"Thursday","mnemonic":"木 = Wood/Tree"},{"romaji":"kinyoubi","kana":"きんようび","kanji":"金曜日","meaning":"Friday","mnemonic":"金 = Gold/Money"},{"romaji":"doyoubi","kana":"どようび","kanji":"土曜日","meaning":"Saturday","mnemonic":"土 = Earth/Soil"},{"romaji":"nichiyoubi","kana":"にちようび","kanji":"日曜日","meaning":"Sunday","mnemonic":"日 = Sun"},{"romaji":"konshuu","kana":"こんしゅう","kanji":"今週","meaning":"this week","mnemonic":"今 (now/this) + 週 (week)."},{"romaji":"raishuu","kana":"らいしゅう","kanji":"来週","meaning":"next week","mnemonic":"来 (to come) + 週 (week) = the coming week."},{"romaji":"senshuu","kana":"せんしゅう","kanji":"先週","meaning":"last week","mnemonic":"先 (previous/ahead) + 週 (week)."},{"romaji":"maishuu","kana":"まいしゅう","kanji":"毎週","meaning":"every week","mnemonic":"毎 (every) + 週 (week)."},{"romaji":"kisetsu","kana":"きせつ","kanji":"季節","meaning":"season","mnemonic":"季【き】 (seasons) + 節【せつ】 (joint/node) = nodes of the year."},{"romaji":"haru","kana":"はる","kanji":"春","meaning":"spring","mnemonic":"Three horizontal lines like warm air rising in the sun (日)."},{"romaji":"natsu","kana":"なつ","kanji":"夏","meaning":"summer","mnemonic":"Has the \"walking legs\" radical at the bottom; walking outside in the sun."},{"romaji":"aki","kana":"あき","kanji":"秋","meaning":"autumn","mnemonic":"Grain/tree on the left, fire on the right = burning the harvested fields."},{"romaji":"fuyu","kana":"ふゆ","kanji":"冬","meaning":"winter","mnemonic":"The bottom two dots represent ice/cold."},{"romaji":"natsuyasumi","kana":"なつやすみ","kanji":"夏休み","meaning":"summer holiday","mnemonic":"夏 (summer) + 休み (rest)."},{"romaji":"kongetsu","kana":"こんげつ","kanji":"今月","meaning":"this month","mnemonic":"今 (now/this) + 月 (month)."},{"romaji":"sengetsu","kana":"せんげつ","kanji":"先月","meaning":"last month","mnemonic":"先 (previous) + 月 (month)."},{"romaji":"raigetsu","kana":"らいげつ","kanji":"来月","meaning":"next month","mnemonic":"来 (to come) + 月 (month)."},{"romaji":"hitotsuki","kana":"ひとつき","kanji":"一月","meaning":"one month","mnemonic":"一 (one) + 月 (month)."},{"romaji":"maitsuki","kana":"まいつき","kanji":"毎月","meaning":"every month","mnemonic":"毎 (every) + 月 (month)."},{"romaji":"toshi","kana":"とし","kanji":"年","meaning":"year","mnemonic":"年 = “year.” Read とし on its own, ねん in compounds."},{"romaji":"kotoshi","kana":"ことし","kanji":"今年","meaning":"this year","mnemonic":"今 (now) + 年 (year)."},{"romaji":"kyonen","kana":"きょねん","kanji":"去年","meaning":"last year","mnemonic":"去 (past/gone) + 年 (year)."},{"romaji":"ototoshi","kana":"おととし","kanji":"一昨年","meaning":"year before last","mnemonic":"一 (one) + 昨 (previous) + 年 (year), read irregularly as おととし."},{"romaji":"rainen","kana":"らいねん","kanji":"来年","meaning":"next year","mnemonic":"来 (to come) + 年 (year)."},{"romaji":"sarainen","kana":"さらいねん","kanji":"再来年","meaning":"year after next","mnemonic":"再【さい】 (again) + 来年 (next year)."},{"romaji":"maitoshi","kana":"まいとし","kanji":"毎年","meaning":"every year","mnemonic":"毎 (every) + 年 (year)."},{"romaji":"tanjoubi","kana":"たんじょうび","kanji":"誕生日","meaning":"birthday","mnemonic":"誕【たん】 (birth) + 生 (life) + 日 (day)."},{"romaji":"hatachi","kana":"はたち","kanji":"二十歳","meaning":"20 years old","mnemonic":"Special reading (jukujikun): 二十歳 = はたち, the coming-of-age count, not にじゅっさい."}]},{"name":"Weather, Animals & Time","cards":[{"romaji":"tenki","kana":"てんき","kanji":"天気","meaning":"weather","mnemonic":"天 (heaven/sky) + 気 (spirit/air)."},{"romaji":"hare","kana":"はれ","kanji":"晴れ","meaning":"clear weather / sunny","mnemonic":"日 (sun) standing next to 青 (blue) = clear blue sky."},{"romaji":"ame","kana":"あめ","kanji":"雨","meaning":"rain","mnemonic":"Looks like a window with raindrops falling down inside it."},{"romaji":"kumori","kana":"くもり","kanji":"曇り","meaning":"cloudy weather","mnemonic":"日 (sun) sitting over a 雲【くも】 (cloud)."},{"romaji":"yuki","kana":"ゆき","kanji":"雪","meaning":"snow","mnemonic":"雨 (rain) falling onto a sweeping hand (ヨ) catching it."},{"romaji":"kaze","kana":"かぜ","kanji":"風","meaning":"wind","mnemonic":"A bug (虫【むし】) caught inside a massive gust of wind (几)."},{"romaji":"sora","kana":"そら","kanji":"空","meaning":"sky","mnemonic":"A hole (穴【あな】) combined with work/craft (工), representing the vast empty space above."},{"romaji":"doubutsu","kana":"どうぶつ","kanji":"動物","meaning":"animal","mnemonic":"動 (moving) + 物 (thing) = moving things."},{"romaji":"inu","kana":"いぬ","kanji":"犬","meaning":"dog","mnemonic":"A big (大) animal with an extra drop (representing an ear or tail)."},{"romaji":"tori","kana":"とり","kanji":"鳥","meaning":"bird","mnemonic":"Visually looks like a bird facing left with a tail at the bottom (灬)."},{"romaji":"neko","kana":"ねこ","kanji":"猫","meaning":"cat","mnemonic":"The animal radical (犭) next to a seedling (苗【なえ】)."},{"romaji":"petto","kana":"ペット","meaning":"pet","mnemonic":"Katakana loanword from English “pet.”"},{"romaji":"jikan","kana":"じかん","kanji":"時間","meaning":"time","mnemonic":"時 (time/hour) + 間 (interval/space)."},{"romaji":"asa","kana":"あさ","kanji":"朝","meaning":"morning","mnemonic":"The moon (月) fading as the sun rises through the mist (十/日/十)."},{"romaji":"kesa","kana":"けさ","kanji":"今朝","meaning":"this morning","mnemonic":"Special reading: 今 (now) + 朝 (morning) fuse into けさ."},{"romaji":"maiasa","kana":"まいあさ","kanji":"毎朝","meaning":"every morning","mnemonic":"毎 (every) + 朝 (morning)."},{"romaji":"hiru","kana":"ひる","kanji":"昼","meaning":"noon","mnemonic":"A flag or sun resting high above the horizon."},{"romaji":"yuugata","kana":"ゆうがた","kanji":"夕方","meaning":"evening","mnemonic":"夕 (evening/crescent moon) + 方 (direction)."},{"romaji":"yoru","kana":"よる","kanji":"夜","meaning":"night","mnemonic":"A person resting under a roof as the moon comes up."},{"romaji":"sakuya","kana":"さくや","kanji":"昨夜","meaning":"last night","mnemonic":"昨 (previous) + 夜 (night)."},{"romaji":"ban","kana":"ばん","kanji":"晩","meaning":"evening","mnemonic":"日 (sun) + 免【めん】 (excuse/escape) = the sun escaping the sky."},{"romaji":"maiban","kana":"まいばん","kanji":"毎晩","meaning":"every night","mnemonic":"毎 (every) + 晩 (evening)."},{"romaji":"konban","kana":"こんばん","kanji":"今晩","meaning":"this evening / tonight","mnemonic":"今 (now) + 晩 (evening)."},{"romaji":"gozen","kana":"ごぜん","kanji":"午前","meaning":"morning (AM)","mnemonic":"午 (noon) + 前 (before) = before noon."},{"romaji":"gogo","kana":"ごご","kanji":"午後","meaning":"afternoon (PM)","mnemonic":"午 (noon) + 後 (after) = after noon."},{"romaji":"ato","kana":"あと","kanji":"後","meaning":"afterwards","mnemonic":"後 = “after / behind” — the same 後 as うしろ (“behind”)."},{"romaji":"saki","kana":"さき","kanji":"先","meaning":"the future / ahead","mnemonic":"A person moving forward ahead of others."},{"romaji":"ima","kana":"いま","kanji":"今","meaning":"now","mnemonic":"今 = “now”: a lid placed over the present moment. (Also in 今日, きょう.)"},{"romaji":"tsugi","kana":"つぎ","kanji":"次","meaning":"next","mnemonic":"Looks like someone pausing, then taking the next step."},{"romaji":"tokei","kana":"とけい","kanji":"時計","meaning":"clock","mnemonic":"時 (time) + 計 (measure)."}]},{"name":"Food, Drinks, Body","cards":[{"romaji":"gohan","kana":"ごはん","kanji":"ご飯","meaning":"cooked rice / meal","mnemonic":"食 (eat) on the left, 反 (anti/return) on the right."},{"romaji":"asagohan","kana":"あさごはん","kanji":"朝ご飯","meaning":"breakfast","mnemonic":"朝 (morning) + ご飯 (cooked rice/meal)."},{"romaji":"hirugohan","kana":"ひるごはん","kanji":"昼ご飯","meaning":"lunch","mnemonic":"昼 (noon) + ご飯 (meal)."},{"romaji":"bangohan","kana":"ばんごはん","kanji":"晩ご飯","meaning":"dinner","mnemonic":"晩 (evening) + ご飯 (meal)."},{"romaji":"yuuhan","kana":"ゆうはん","kanji":"夕飯","meaning":"dinner","mnemonic":"夕 (evening) + 飯 (meal)."},{"romaji":"obentou","kana":"おべんとう","kanji":"お弁当","meaning":"packed lunch","mnemonic":"弁【べん】 (manage) + 当 (apt) → 弁当, a packed lunch box. Learn 弁当 as a set."},{"romaji":"ryouri","kana":"りょうり","kanji":"料理","meaning":"cuisine","mnemonic":"料 (materials) + 理 (logic/arrangement). Arranging ingredients."},{"romaji":"karee","kana":"カレー","meaning":"curry","mnemonic":"Katakana loanword from English “curry.”"},{"romaji":"pan","kana":"パン","meaning":"bread","mnemonic":"Katakana loanword from Portuguese “pão” (bread)."},{"romaji":"tamago","kana":"たまご","kanji":"卵","meaning":"egg","mnemonic":"Looks like two yolks sitting inside an egg carton."},{"romaji":"niku","kana":"にく","kanji":"肉","meaning":"meat","mnemonic":"Looks like ribs or pieces of meat hanging in a window."},{"romaji":"gyuuniku","kana":"ぎゅうにく","kanji":"牛肉","meaning":"beef","mnemonic":"牛 (cow) + 肉 (meat)."},{"romaji":"butaniku","kana":"ぶたにく","kanji":"豚肉","meaning":"pork","mnemonic":"月 (flesh radical) next to 豕【し】 (pig)."},{"romaji":"toriniku","kana":"とりにく","kanji":"鳥肉","meaning":"chicken meat","mnemonic":"鳥 (bird) + 肉 (meat)."},{"romaji":"sakana","kana":"さかな","kanji":"魚","meaning":"fish","mnemonic":"Top is a head, middle is a scaly body, bottom (灬) is the tail/fins."},{"romaji":"yasai","kana":"やさい","kanji":"野菜","meaning":"vegetable","mnemonic":"野 (field) + 菜【さい】 (vegetable/greens, identifiable by the grass radical 艹)."},{"romaji":"kudamono","kana":"くだもの","kanji":"果物","meaning":"fruit","mnemonic":"果 (fruit: a tree 木 bearing a round fruit 田) + 物 (thing)."},{"romaji":"tabemono","kana":"たべもの","kanji":"食べ物","meaning":"food","mnemonic":"食 (eat) + 物 (thing)."},{"romaji":"nomimono","kana":"のみもの","kanji":"飲み物","meaning":"a drink","mnemonic":"飲 (drink: food 食 + yawn/lack 欠) + 物 (thing)."},{"romaji":"mizu","kana":"みず","kanji":"水","meaning":"water","mnemonic":"Looks like splashing water."},{"romaji":"gyuunyuu","kana":"ぎゅうにゅう","kanji":"牛乳","meaning":"milk","mnemonic":"牛 (cow) + 乳【にゅう】 (milk - looks like a baby floating near a hook)."},{"romaji":"ocha","kana":"おちゃ","kanji":"お茶","meaning":"tea","mnemonic":"艹 (grass/plant) over a person resting in a wooden (木) pavilion."},{"romaji":"koucha","kana":"こうちゃ","kanji":"紅茶","meaning":"black tea","mnemonic":"紅【こう】 (deep red) + 茶 (tea). In Japanese, it translates literally to \"red tea\"."},{"romaji":"koohii","kana":"コーヒー","meaning":"coffee","mnemonic":"Katakana loanword from Dutch “koffie” / English “coffee.”"},{"romaji":"osake","kana":"おさけ","kanji":"お酒","meaning":"alcohol","mnemonic":"氵 (water) next to 酉【とり】 (an alcohol jug)."},{"romaji":"satou","kana":"さとう","kanji":"砂糖","meaning":"sugar","mnemonic":"砂【すな】 (sand - made of stone 石 + few 少) + 糖【とう】 (sugar)."},{"romaji":"shio","kana":"しお","kanji":"塩","meaning":"salt","mnemonic":"土 (earth) + a person lying over a container."},{"romaji":"shouyu","kana":"しょうゆ","kanji":"醤油","meaning":"soy sauce","mnemonic":"Usually just written in Kana at the N5 level."},{"romaji":"bataa","kana":"バター","meaning":"butter","mnemonic":"Katakana loanword from English “butter.”"},{"romaji":"okashi","kana":"おかし","kanji":"お菓子","meaning":"sweets","mnemonic":"菓【か】 (confectionery: grass 艹 + fruit 果) + 子 (child)."},{"romaji":"ame","kana":"あめ","kanji":"飴","meaning":"candy","mnemonic":"食 (food) + 台 (pedestal) → sweet food on a stick. Often written in kana."},{"romaji":"kusuri","kana":"くすり","kanji":"薬","meaning":"medicine","mnemonic":"艹 (grass/plant) over 楽 (comfort/ease) = plants that bring ease."},{"romaji":"osara","kana":"おさら","kanji":"お皿","meaning":"plate","mnemonic":"皿【さら】 (plate/dish) - looks like a wide shallow bowl."},{"romaji":"kappu","kana":"カップ","meaning":"cup","mnemonic":"Katakana loanword from English “cup.”"},{"romaji":"koppu","kana":"コップ","meaning":"a glass","mnemonic":"Katakana loanword from Dutch “kop” (a drinking glass)."},{"romaji":"chawan","kana":"ちゃわん","kanji":"茶碗","meaning":"rice bowl","mnemonic":"茶 (tea) + 碗【わん】 (porcelain bowl)."},{"romaji":"hashi","kana":"はし","kanji":"箸","meaning":"chopsticks","mnemonic":"竹【たけ】 (bamboo) radical at the top over 者 (person)."},{"romaji":"supuun","kana":"スプーン","meaning":"spoon","mnemonic":"Katakana loanword from English “spoon.”"},{"romaji":"fooku","kana":"フォーク","meaning":"fork","mnemonic":"Katakana loanword from English “fork.”"},{"romaji":"naifu","kana":"ナイフ","meaning":"knife","mnemonic":"Katakana loanword from English “knife.”"},{"romaji":"karada","kana":"からだ","kanji":"体","meaning":"body","mnemonic":"亻 (person) + 本 (root/origin) = the root of a person is their body."},{"romaji":"atama","kana":"あたま","kanji":"頭","meaning":"head","mnemonic":"豆【まめ】 (bean) + 頁【けつ】 (head). Think of a head as a bean on top of the body!"},{"romaji":"me","kana":"め","kanji":"目","meaning":"eye","mnemonic":"A picture of an eye turned sideways."},{"romaji":"mimi","kana":"みみ","kanji":"耳","meaning":"ear","mnemonic":"A picture of an ear with cartilage ridges."},{"romaji":"hana","kana":"はな","kanji":"鼻","meaning":"nose","mnemonic":"自 (self - people point to their nose to say \"me\") over a field 田 and two hands."},{"romaji":"kuchi","kana":"くち","kanji":"口","meaning":"mouth","mnemonic":"An open mouth (square)."},{"romaji":"ha","kana":"は","kanji":"歯","meaning":"tooth","mnemonic":"止 (stop) over an open mouth containing teeth."},{"romaji":"onaka","kana":"おなか","kanji":"お腹","meaning":"stomach","mnemonic":"月 (flesh radical) + 復【ふく】 (“return” shape) → the belly. Often written お腹 in kana."},{"romaji":"te","kana":"て","kanji":"手","meaning":"hand","mnemonic":"Lines representing fingers and a palm."},{"romaji":"ashi","kana":"あし","kanji":"足","meaning":"foot / leg","mnemonic":"An open mouth (口) above a person running."},{"romaji":"koe","kana":"こえ","kanji":"声","meaning":"voice","mnemonic":"A samurai (士【し】) over a flag/ear (taking charge with their voice)."},{"romaji":"se","kana":"せ","kanji":"背","meaning":"height / back","mnemonic":"北 (north/back to back) over 月 (flesh)."},{"romaji":"byouki","kana":"びょうき","kanji":"病気","meaning":"illness","mnemonic":"疒 (sickness radical) covering 丙【へい】 + 気 (spirit/energy) = sick energy."}]},{"name":"People & Family","cards":[{"romaji":"otoko","kana":"おとこ","kanji":"男","meaning":"man","mnemonic":"Field (田) + Power/Strength (力). Men traditionally worked the fields."},{"romaji":"onna","kana":"おんな","kanji":"女","meaning":"woman","mnemonic":"Looks like a woman gracefully crossing her legs or holding a child."},{"romaji":"otokonoko","kana":"おとこのこ","kanji":"男の子","meaning":"boy","mnemonic":"男 (man) + の (particle) + 子 (child)."},{"romaji":"onnanoko","kana":"おんなのこ","kanji":"女の子","meaning":"girl","mnemonic":"女 (woman) + の (particle) + 子 (child)."},{"romaji":"watashi","kana":"わたし","kanji":"私","meaning":"I, me","mnemonic":"Grain (禾【か】) + Private (ム) = My private harvest."},{"romaji":"anata","kana":"あなた","kanji":"貴方","meaning":"you","mnemonic":"Polite “you,” literally “that noble person.” Almost always written in kana: あなた."},{"romaji":"kazoku","kana":"かぞく","kanji":"家族","meaning":"family","mnemonic":"家 (house) + 族 (tribe/clan) = The tribe inside the house."},{"romaji":"ojiisan","kana":"おじいさん","kanji":"お祖父さん","meaning":"grandfather","mnemonic":"祖父 (“grandfather,” lit. ancestor-father); the お…さん form おじいさん is usual."},{"romaji":"obaasan","kana":"おばあさん","kanji":"お祖母さん","meaning":"grandmother","mnemonic":"祖母 (“grandmother,” lit. ancestor-mother); the お…さん form おばあさん is usual."},{"romaji":"otousan","kana":"おとうさん","kanji":"お父さん","meaning":"father","mnemonic":"父 (father) + honorifics. Looks like a stern face or two crossed axes."},{"romaji":"okaasan","kana":"おかあさん","kanji":"お母さん","meaning":"mother","mnemonic":"母 (mother). Looks like a mother nursing with two drops."},{"romaji":"ryoushin","kana":"りょうしん","kanji":"両親","meaning":"both parents","mnemonic":"両 (both) + 親 (parent/intimate)."},{"romaji":"ane","kana":"あね","kanji":"姉","meaning":"older sister (own)","mnemonic":"姉 = older sister. Plain 姉 is humble, for your OWN sister; お姉さん is for others’."},{"romaji":"ani","kana":"あに","kanji":"兄","meaning":"older brother  (own)","mnemonic":"Same kanji as above. Used for your own older brother."},{"romaji":"oneesan","kana":"おねえさん","kanji":"お姉さん","meaning":"older sister","mnemonic":"女 (woman) + 市 (market). The woman who goes to the market."},{"romaji":"oniisan","kana":"おにいさん","kanji":"お兄さん","meaning":"older brother","mnemonic":"兄 (older brother) = A speaking mouth (口) giving orders over human legs (儿)."},{"romaji":"otouto","kana":"おとうと","kanji":"弟","meaning":"younger brother","mnemonic":"Looks like a bow with a string wrapped around it."},{"romaji":"imouto","kana":"いもうと","kanji":"妹","meaning":"younger sister","mnemonic":"女 (woman) + 未 (not yet). The woman who is not yet fully grown."},{"romaji":"kyoudai","kana":"きょうだい","kanji":"兄弟","meaning":"brother / siblings","mnemonic":"兄 (older brother) + 弟 (younger brother)."},{"romaji":"ojisan","kana":"おじさん","kanji":"伯父さん","meaning":"uncle","mnemonic":"Uncle. Usually written in kana おじさん — one mora shorter than おじいさん (“grandpa”)."},{"romaji":"obasan","kana":"おばさん","kanji":"伯母さん","meaning":"aunt","mnemonic":"Aunt. Usually written in kana おばさん — one mora shorter than おばあさん (“grandma”)."},{"romaji":"okusan","kana":"おくさん","kanji":"奥さん","meaning":"wife","mnemonic":"奥【おく】 (inner/interior). The person in the inner part of the house."},{"romaji":"otona","kana":"おとな","kanji":"大人","meaning":"adult","mnemonic":"大 (big) + 人 (person)."},{"romaji":"kodomo","kana":"こども","kanji":"子供","meaning":"child","mnemonic":"子 (child) + 供 (companion)."},{"romaji":"isha","kana":"いしゃ","kanji":"医者","meaning":"doctor","mnemonic":"医 (medicine/healing) + 者 (person)."},{"romaji":"omawarisan","kana":"おまわりさん","kanji":"お巡りさん","meaning":"policeman","mnemonic":"Lit. “honorable Mr. Go-around” — the officer who walks the beat. Usually kana."},{"romaji":"keikan","kana":"けいかん","kanji":"警官","meaning":"policeman","mnemonic":"警 (guard/admonish) + 官 (official) → a police officer."},{"romaji":"sensei","kana":"せんせい","kanji":"先生","meaning":"teacher","mnemonic":"先 (before/ahead) + 生 (life). Born before you, holding wisdom."},{"romaji":"gakusei","kana":"がくせい","kanji":"学生","meaning":"student","mnemonic":"学 (study/learning) + 生 (life)."},{"romaji":"seito","kana":"せいと","kanji":"生徒","meaning":"student","mnemonic":"生 (life) + 徒 (junior/follower)."},{"romaji":"ryuugakusei","kana":"りゅうがくせい","kanji":"留学生","meaning":"overseas student","mnemonic":"留 (stay/detain) + 学生 (student)."},{"romaji":"gaikokujin","kana":"がいこくじん","kanji":"外国人","meaning":"foreigner","mnemonic":"外 (outside) + 国 (country) + 人 (person)."},{"romaji":"tomodachi","kana":"ともだち","kanji":"友達","meaning":"friend","mnemonic":"友 (friend: two hands holding) + 達 (plural)."},{"romaji":"issho","kana":"いっしょ","kanji":"一緒","meaning":"together","mnemonic":"一 (one) + 緒 (cord). Tied together into one cord."},{"romaji":"kekkon","kana":"けっこん","kanji":"結婚","meaning":"marriage","mnemonic":"結【けつ】 (tie) + 婚 (marriage)."},{"romaji":"katei","kana":"かてい","kanji":"家庭","meaning":"household","mnemonic":"家 (house) + 庭 (garden)."},{"romaji":"namae","kana":"なまえ","kanji":"名前","meaning":"name","mnemonic":"名 (name: evening 夕 + mouth 口, identifying yourself in the dark) + 前 (before)."},{"romaji":"jibun","kana":"じぶん","kanji":"自分","meaning":"myself","mnemonic":"自 (self) + 分 (part). My part."},{"romaji":"dare","kana":"だれ","kanji":"誰","meaning":"who","mnemonic":"Words (言) + Turkey (隹【すい】). A talking bird? Who is that!"},{"romaji":"donata","kana":"どなた","kanji":"何方","meaning":"who (polite)","mnemonic":"Polite “who?”: the ど- question word + 方 (person). Usually kana どなた."},{"romaji":"hito","kana":"ひと","kanji":"人","meaning":"person","mnemonic":"Two legs walking."},{"romaji":"kata","kana":"かた","kanji":"方","meaning":"person (polite)","mnemonic":"A square/direction. Used respectfully."},{"romaji":"hitori","kana":"ひとり","kanji":"一人","meaning":"one person","mnemonic":"一 (one) + 人 (person)."},{"romaji":"futari","kana":"ふたり","kanji":"二人","meaning":"two people","mnemonic":"二 (two) + 人 (person)."},{"romaji":"oozei","kana":"おおぜい","kanji":"大勢","meaning":"many people","mnemonic":"大 (big) + 勢【せい】 (force/crowd)."},{"romaji":"minasan","kana":"みなさん","kanji":"皆さん","meaning":"everyone","mnemonic":"皆 (all) + san."},{"romaji":"minna","kana":"みんな","kanji":"皆","meaning":"everyone","mnemonic":"皆 = “all / everyone.” みんな is the casual form of みな."},{"romaji":"dareka","kana":"だれか","kanji":"誰か","meaning":"somebody","mnemonic":"誰 (who) + か (question particle)."}]},{"name":"Buildings, Places, Directions","cards":[{"romaji":"higashi","kana":"ひがし","kanji":"東","meaning":"east","mnemonic":"Sun (日) rising through the trees (木)."},{"romaji":"nishi","kana":"にし","kanji":"西","meaning":"west","mnemonic":"Looks like a bird returning to its nest at sunset."},{"romaji":"minami","kana":"みなみ","kanji":"南","meaning":"south","mnemonic":"A cross inside a downward-facing enclosure."},{"romaji":"kita","kana":"きた","kanji":"北","meaning":"north","mnemonic":"Two people sitting back-to-back to stay warm."},{"romaji":"hidari","kana":"ひだり","kanji":"左","meaning":"left","mnemonic":"A hand (ナ) holding a tool/craft (工)."},{"romaji":"migi","kana":"みぎ","kanji":"右","meaning":"right","mnemonic":"A hand (ナ) bringing food to the mouth (口)."},{"romaji":"koko","kana":"ここ","kanji":"此処","meaning":"here","mnemonic":"こ-series (near the speaker): ここ = “here, by me.” Usually kana."},{"romaji":"soko","kana":"そこ","kanji":"其処","meaning":"there","mnemonic":"そ-series (near the listener): そこ = “there, by you.” Usually kana."},{"romaji":"asoko","kana":"あそこ","kanji":"彼処","meaning":"over there","mnemonic":"あ-series (far from both): あそこ = “over there.” Usually kana."},{"romaji":"achira","kana":"あちら","kanji":"彼方","meaning":"over there","mnemonic":"Polite あ-series: あちら = “over there / that one” (far). Usually kana."},{"romaji":"kochira","kana":"こちら","kanji":"此方","meaning":"this way","mnemonic":"Polite こ-series: こちら = “this way / this one” (by me). Usually kana."},{"romaji":"acchi","kana":"あっち","kanji":"彼方","meaning":"over there","mnemonic":"Casual あ-series: あっち = “that way, over there.” Usually kana."},{"romaji":"kocchi","kana":"こっち","kanji":"此方","meaning":"this here","mnemonic":"Casual こ-series: こっち = “this way, over here.” Usually kana."},{"romaji":"socchi","kana":"そっち","kanji":"其方","meaning":"that way","mnemonic":"Casual そ-series: そっち = “that way, by you.” Usually kana."},{"romaji":"mukou","kana":"むこう","kanji":"向こう","meaning":"beyond","mnemonic":"向 (facing/direction)."},{"romaji":"massugu","kana":"まっすぐ","kanji":"真っ直ぐ","meaning":"straight","mnemonic":"真 (true) + 直 (straight)."},{"romaji":"kado","kana":"かど","kanji":"角","meaning":"corner","mnemonic":"Looks like an animal horn or a sharp edge."},{"romaji":"tonari","kana":"となり","kanji":"隣","meaning":"next door","mnemonic":"A village (阝) with rice/goods (米) next door."},{"romaji":"soba","kana":"そば","kanji":"側","meaning":"beside","mnemonic":"Person (亻) next to a rule/side (則【そく】)."},{"romaji":"chikaku","kana":"ちかく","kanji":"近く","meaning":"near","mnemonic":"An axe (斤【きん】) on a road (辶) indicating a short walk."},{"romaji":"soto","kana":"そと","kanji":"外","meaning":"outside","mnemonic":"Evening (夕) + Divination/Magic (卜【ぼく】)."},{"romaji":"naka","kana":"なか","kanji":"中","meaning":"inside","mnemonic":"A line drawn straight through the middle of a box."},{"romaji":"ue","kana":"うえ","kanji":"上","meaning":"up","mnemonic":"A line pointing upward from a base."},{"romaji":"shita","kana":"した","kanji":"下","meaning":"down","mnemonic":"A line pointing downward from a base."},{"romaji":"mae","kana":"まえ","kanji":"前","meaning":"front","mnemonic":"Horns over a butcher block and knife (刂)."},{"romaji":"yoko","kana":"よこ","kanji":"横","meaning":"side","mnemonic":"Tree (木) + Yellow (黄【き】)."},{"romaji":"ushiro","kana":"うしろ","kanji":"後ろ","meaning":"behind","mnemonic":"A moving person (彳) connected to threads."},{"romaji":"tatemono","kana":"たてもの","kanji":"建物","meaning":"building","mnemonic":"建 (build) + 物 (thing)."},{"romaji":"apaato","kana":"アパート","meaning":"apartment","mnemonic":"Katakana loanword, clipped from English “apartment.”"},{"romaji":"ie","kana":"いえ","kanji":"家","meaning":"house","mnemonic":"A roof (宀) with a pig (豕【し】) inside."},{"romaji":"eigakan","kana":"えいがかん","kanji":"映画館","meaning":"cinema","mnemonic":"映 (reflect) + 画 (picture) + 館 (building)."},{"romaji":"eki","kana":"えき","kanji":"駅","meaning":"station","mnemonic":"Horse (馬) + a measuring tool."},{"romaji":"kaisha","kana":"かいしゃ","kanji":"会社","meaning":"company","mnemonic":"会 (meet) + 社 (shrine/society)."},{"romaji":"gakkou","kana":"がっこう","kanji":"学校","meaning":"school","mnemonic":"学 (study) + 校 (school building)."},{"romaji":"kyoushitsu","kana":"きょうしつ","kanji":"教室","meaning":"classroom","mnemonic":"教 (teach) + 室 (room)."},{"romaji":"kissaten","kana":"きっさてん","kanji":"喫茶店","meaning":"cafe","mnemonic":"喫【きつ】 (consume) + 茶 (tea) + 店 (shop)."},{"romaji":"ginkou","kana":"ぎんこう","kanji":"銀行","meaning":"bank","mnemonic":"銀 (silver) + 行 (go/conduct)."},{"romaji":"kouban","kana":"こうばん","kanji":"交番","meaning":"police box","mnemonic":"交 (mix/intersect) + 番 (number/watch)."},{"romaji":"daigaku","kana":"だいがく","kanji":"大学","meaning":"university","mnemonic":"大 (big) + 学 (study)."},{"romaji":"taishikan","kana":"たいしかん","kanji":"大使館","meaning":"embassy","mnemonic":"大 (big) + 使 (use/envoy) + 館 (building)."},{"romaji":"depaato","kana":"デパート","meaning":"mall","mnemonic":"Katakana loanword, clipped from “department (store).”"},{"romaji":"toshokan","kana":"としょかん","kanji":"図書館","meaning":"library","mnemonic":"図 (map/plan) + 書 (write) + 館 (building)."},{"romaji":"byouin","kana":"びょういん","kanji":"病院","meaning":"hospital","mnemonic":"病 (sick) + 院 (institution)."},{"romaji":"puuru","kana":"プール","meaning":"pool","mnemonic":"Katakana loanword from English “pool.”"},{"romaji":"hoteru","kana":"ホテル","meaning":"hotel","mnemonic":"Katakana loanword from English “hotel.”"},{"romaji":"mise","kana":"みせ","kanji":"店","meaning":"shop","mnemonic":"A building covering a fortune (占【せん】)."},{"romaji":"yaoya","kana":"やおや","kanji":"八百屋","meaning":"greengrocer","mnemonic":"八 (eight) + 百 (hundred) + 屋 (shop)."},{"romaji":"yuubinkyoku","kana":"ゆうびんきょく","kanji":"郵便局","meaning":"post office","mnemonic":"郵【ゆう】 (mail) + 便 (convenience) + 局 (bureau)."},{"romaji":"resutoran","kana":"レストラン","meaning":"restaurant","mnemonic":"Katakana loanword from French/English “restaurant.”"},{"romaji":"tokoro","kana":"ところ","kanji":"所","meaning":"place","mnemonic":"戸【と】 (door) + 斤【きん】 (axe) → a spot marked out = a place."},{"romaji":"ike","kana":"いけ","kanji":"池","meaning":"pond","mnemonic":"Water (氵) + Also (也【や】)."},{"romaji":"umi","kana":"うみ","kanji":"海","meaning":"sea","mnemonic":"Water (氵) + Every (毎)."},{"romaji":"kawa","kana":"かわ","kanji":"川","meaning":"river","mnemonic":"Three lines flowing like water."},{"romaji":"yama","kana":"やま","kanji":"山","meaning":"mountain","mnemonic":"A picture of three mountain peaks."},{"romaji":"kouen","kana":"こうえん","kanji":"公園","meaning":"park","mnemonic":"公 (public) + 園 (garden/park)."},{"romaji":"niwa","kana":"にわ","kanji":"庭","meaning":"garden","mnemonic":"Building/roof over an active court."},{"romaji":"kooto","kana":"コート","meaning":"court","mnemonic":"Katakana loanword from English “court.”"},{"romaji":"hashi","kana":"はし","kanji":"橋","meaning":"bridge","mnemonic":"Wood (木) + Tall/Proud (喬【きょう】)."},{"romaji":"eria","kana":"エリア","meaning":"area","mnemonic":"Katakana loanword from English “area.”"},{"romaji":"gaikoku","kana":"がいこく","kanji":"外国","meaning":"abroad","mnemonic":"外 (outside) + 国 (country)."},{"romaji":"kuni","kana":"くに","kanji":"国","meaning":"country","mnemonic":"A jewel (玉【たま】) surrounded by borders (囗)."},{"romaji":"machi","kana":"まち","kanji":"町","meaning":"town","mnemonic":"Field (田) + Street/Nail (丁【ちょう】)."},{"romaji":"mura","kana":"むら","kanji":"村","meaning":"village","mnemonic":"Tree (木) + Measurement/Rule (寸【すん】)."},{"romaji":"michi","kana":"みち","kanji":"道","meaning":"street","mnemonic":"Neck/Head (首) moving along a path (辶)."},{"romaji":"kousaten","kana":"こうさてん","kanji":"交差点","meaning":"intersection","mnemonic":"交 (intersect) + 差 (difference) + 点 (point)."}]},{"name":"Clothes, Belongings & Study","cards":[{"romaji":"fuku","kana":"ふく","kanji":"服","meaning":"clothes","mnemonic":"Moon/Flesh (月) next to a stamp/seal (卩)."},{"romaji":"youfuku","kana":"ようふく","kanji":"洋服","meaning":"clothes","mnemonic":"洋 (Western) + 服 (clothes)."},{"romaji":"shatsu","kana":"シャツ","meaning":"shirt","mnemonic":"Katakana loanword from English “shirt.”"},{"romaji":"waishatsu","kana":"ワイシャツ","meaning":"dress shirt","mnemonic":"Katakana loanword from “white shirt” (ホワイトシャツ, clipped)."},{"romaji":"uwagi","kana":"うわぎ","kanji":"上着","meaning":"jacket","mnemonic":"上 (up/top) + 着 (wear)."},{"romaji":"sebiro","kana":"せびろ","kanji":"背広","meaning":"suit","mnemonic":"背 (back) + 広 (wide)."},{"romaji":"sukaato","kana":"スカート","meaning":"skirt","mnemonic":"Katakana loanword from English “skirt.”"},{"romaji":"zubon","kana":"ズボン","meaning":"trousers","mnemonic":"Katakana loanword from French “jupon” (trousers)."},{"romaji":"seetaa","kana":"セーター","meaning":"sweater","mnemonic":"Katakana loanword from English “sweater.”"},{"romaji":"boushi","kana":"ぼうし","kanji":"帽子","meaning":"hat","mnemonic":"帽【ぼう】 (hat: towel 巾【きん】 over sun) + 子 (noun suffix)."},{"romaji":"megane","kana":"めがね","kanji":"眼鏡","meaning":"glasses","mnemonic":"眼【がん】 (eye) + 鏡【かがみ】 (mirror). Usually Kana at N5."},{"romaji":"nekutai","kana":"ネクタイ","meaning":"tie","mnemonic":"Katakana loanword from English “necktie.”"},{"romaji":"kutsu","kana":"くつ","kanji":"靴","meaning":"shoes","mnemonic":"Leather (革【かわ】) + Change (化)."},{"romaji":"kutsushita","kana":"くつした","kanji":"靴下","meaning":"socks","mnemonic":"靴 (shoes) + 下 (under)."},{"romaji":"surippa","kana":"スリッパ","meaning":"slippers","mnemonic":"Katakana loanword from English “slipper(s).”"},{"romaji":"nimotsu","kana":"にもつ","kanji":"荷物","meaning":"luggage","mnemonic":"荷【に】 (baggage) + 物 (thing)."},{"romaji":"kaban","kana":"かばん","kanji":"鞄","meaning":"bag","mnemonic":"Leather (革【かわ】) + Wrap (包【つつ】)."},{"romaji":"hankachi","kana":"ハンカチ","meaning":"handkerchief","mnemonic":"Katakana loanword, clipped from “handkerchief” (ハンカチーフ)."},{"romaji":"okane","kana":"おかね","kanji":"お金","meaning":"money","mnemonic":"Gold/metal (金) + polite 'o'."},{"romaji":"saifu","kana":"さいふ","kanji":"財布","meaning":"wallet","mnemonic":"財 (wealth) + 布【ぬの】 (cloth)."},{"romaji":"kagi","kana":"かぎ","kanji":"鍵","meaning":"key","mnemonic":"Metal (金) + Build (建)."},{"romaji":"kasa","kana":"かさ","kanji":"傘","meaning":"umbrella","mnemonic":"Looks exactly like an umbrella with people beneath."},{"romaji":"tabako","kana":"たばこ","kanji":"煙草","meaning":"cigarettes","mnemonic":"煙 (smoke) + 草 (grass) → “smoking grass” = tobacco. Usually kana タバコ."},{"romaji":"poketto","kana":"ポケット","meaning":"pocket","mnemonic":"Katakana loanword from English “pocket.”"},{"romaji":"benkyou","kana":"べんきょう","kanji":"勉強","meaning":"study","mnemonic":"勉 (exertion) + 強 (strong)."},{"romaji":"jugyou","kana":"じゅぎょう","kanji":"授業","meaning":"lesson","mnemonic":"授【じゅ】 (instruct) + 業 (vocation)."},{"romaji":"kurasu","kana":"クラス","meaning":"class","mnemonic":"Katakana loanword from English “class.”"},{"romaji":"eigo","kana":"えいご","kanji":"英語","meaning":"English","mnemonic":"英 (hero/Britain) + 語 (language)."},{"romaji":"kanji","kana":"かんじ","kanji":"漢字","meaning":"Kanji","mnemonic":"漢 (Han Chinese) + 字 (character)."},{"romaji":"imi","kana":"いみ","kanji":"意味","meaning":"meaning","mnemonic":"意 (idea) + 味 (flavor)."},{"romaji":"kotoba","kana":"ことば","kanji":"言葉","meaning":"language","mnemonic":"言 (words) + 葉 (leaf)."},{"romaji":"hanashi","kana":"はなし","kanji":"話","meaning":"story","mnemonic":"Words (言) + Tongue (舌【した】)."},{"romaji":"sakubun","kana":"さくぶん","kanji":"作文","meaning":"composition","mnemonic":"作 (make) + 文 (text)."},{"romaji":"bunshou","kana":"ぶんしょう","kanji":"文章","meaning":"sentence","mnemonic":"文 (text) + 章【しょう】 (chapter/badge)."},{"romaji":"shitsumon","kana":"しつもん","kanji":"質問","meaning":"question","mnemonic":"質 (quality) + 問 (ask)."},{"romaji":"shukudai","kana":"しゅくだい","kanji":"宿題","meaning":"homework","mnemonic":"宿 (lodge) + 題 (topic). Work taken to your lodge."},{"romaji":"keizai","kana":"けいざい","kanji":"経済","meaning":"economic","mnemonic":"経 (manage) + 済 (settle) → managing & settling resources = economy / economics."},{"romaji":"tesuto","kana":"テスト","meaning":"test","mnemonic":"Katakana loanword from English “test.”"},{"romaji":"maru","kana":"まる","kanji":"丸","meaning":"round","mnemonic":"A drop adding completeness to nine (九)."},{"romaji":"mondai","kana":"もんだい","kanji":"問題","meaning":"problem","mnemonic":"問 (ask) + 題 (topic)."},{"romaji":"renshuu","kana":"れんしゅう","kanji":"練習","meaning":"practice","mnemonic":"練【れん】 (train) + 習 (learn)."},{"romaji":"botan","kana":"ボタン","meaning":"button","mnemonic":"Katakana loanword from Portuguese “botão” (button)."},{"romaji":"enpitsu","kana":"えんぴつ","kanji":"鉛筆","meaning":"pencil","mnemonic":"鉛【えん】 (lead) + 筆【ふで】 (brush)."},{"romaji":"pen","kana":"ペン","meaning":"pen","mnemonic":"Katakana loanword from English “pen.”"},{"romaji":"boorupen","kana":"ボールペン","meaning":"ballpoint pen","mnemonic":"Katakana loanword from “ball(point) pen.”"},{"romaji":"mannenhitsu","kana":"まんねんひつ","kanji":"万年筆","meaning":"fountain pen","mnemonic":"万 (10,000) + 年 (years) + 筆【ふで】 (brush)."},{"romaji":"hon","kana":"ほん","kanji":"本","meaning":"book","mnemonic":"A tree (木) with a line indicating the root."},{"romaji":"nooto","kana":"ノート","meaning":"notebook","mnemonic":"Katakana loanword, clipped from English “notebook.”"},{"romaji":"peeji","kana":"ページ","meaning":"page","mnemonic":"Katakana loanword from English “page.”"},{"romaji":"hondana","kana":"ほんだな","kanji":"本棚","meaning":"bookshelf","mnemonic":"本 (book) + 棚【たな】 (shelf: Wood 木 + Companions 朋【とも】)."}]},{"name":"U-Verbs","cards":[{"romaji":"au","kana":"あう","kanji":"会う","meaning":"meet","mnemonic":"Looks like a house roof where people gather to meet."},{"romaji":"aku","kana":"あく","kanji":"開く","meaning":"open","mnemonic":"Two gate doors (門【もん】) opening up."},{"romaji":"shimaru","kana":"しまる","kanji":"閉まる","meaning":"close","mnemonic":"A gate (門【もん】) closed tight with a lock (オ)."},{"romaji":"asobu","kana":"あそぶ","kanji":"遊ぶ","meaning":"play","mnemonic":"A child wandering or playing on a path (辶)."},{"romaji":"arau","kana":"あらう","kanji":"洗う","meaning":"wash","mnemonic":"Water (氵) applied before proceeding (先)."},{"romaji":"aru","kana":"ある","kanji":"有る","meaning":"be (thing)","mnemonic":"ナ (hand) over 月 (flesh/moon) → holding something in hand = to exist / have. Usually kana."},{"romaji":"iru","kana":"いる","kanji":"要る","meaning":"need","mnemonic":"A woman (女) holding something very important (西)."},{"romaji":"aruku","kana":"あるく","kanji":"歩く","meaning":"walk","mnemonic":"Stop (止) and take a few (少) steps forward."},{"romaji":"hashiru","kana":"はしる","kanji":"走る","meaning":"run","mnemonic":"A person running swiftly over the earth (土)."},{"romaji":"iu","kana":"いう","kanji":"言う","meaning":"say","mnemonic":"Words vibrating out of a mouth (口) at the bottom."},{"romaji":"iku","kana":"いく","kanji":"行く","meaning":"go","mnemonic":"Looks like a crossroad or steps moving forward."},{"romaji":"utau","kana":"うたう","kanji":"歌う","meaning":"sing","mnemonic":"Two open mouths (欠) singing a song together."},{"romaji":"uru","kana":"うる","kanji":"売る","meaning":"sell","mnemonic":"A samurai (士【し】) managing goods under a roof."},{"romaji":"kau","kana":"かう","kanji":"買う","meaning":"buy","mnemonic":"An eye or net looking over a shell (貝【かい】 = money/currency)."},{"romaji":"oku","kana":"おく","kanji":"置く","meaning":"put","mnemonic":"An eye (目) looking at a straight (直) placement."},{"romaji":"osu","kana":"おす","kanji":"押す","meaning":"push","mnemonic":"A hand (扌) pressing against a hard shield (甲【こう】)."},{"romaji":"hiku","kana":"ひく","kanji":"引く","meaning":"pull","mnemonic":"A bow (弓【ゆみ】) drawn back tightly by a vertical line."},{"romaji":"hiku","kana":"ひく","kanji":"弾く","meaning":"play (music)","mnemonic":"A bow (弓【ゆみ】) striking a single (単) musical note."},{"romaji":"oyogu","kana":"およぐ","kanji":"泳ぐ","meaning":"swim","mnemonic":"Water (氵) and everlasting (永【えい】) fluid movement."},{"romaji":"owaru","kana":"おわる","kanji":"終わる","meaning":"finish","mnemonic":"A thread (糸【いと】) tied to winter (冬) — the end of the year."},{"romaji":"hajimaru","kana":"はじまる","kanji":"始まる","meaning":"begin","mnemonic":"A woman (女) taking the stage on a pedestal (台)."},{"romaji":"kaesu","kana":"かえす","kanji":"返す","meaning":"return","mnemonic":"Anti/Reverse (反) movement on a path (辶)."},{"romaji":"kaeru","kana":"かえる","kanji":"帰る","meaning":"go back","mnemonic":"An apron and a broom returning home."},{"romaji":"kakaru","kana":"かかる","kanji":"掛かる","meaning":"take time","mnemonic":"A hand (扌) holding up a divination/measure (卦【け】)."},{"romaji":"kaku","kana":"かく","kanji":"書く","meaning":"write","mnemonic":"A brush held in a hand writing over paper (日)."},{"romaji":"yomu","kana":"よむ","kanji":"読む","meaning":"read","mnemonic":"Words (言) being sold (売) as stories to read."},{"romaji":"kiku","kana":"きく","kanji":"聞く","meaning":"hear","mnemonic":"An ear (耳) listening closely inside a gate (門【もん】)."},{"romaji":"hanasu","kana":"はなす","kanji":"話す","meaning":"speak","mnemonic":"Words (言) being spoken by the tongue (舌【した】)."},{"romaji":"kasu","kana":"かす","kanji":"貸す","meaning":"lend","mnemonic":"Generations (代) sharing money/shells (貝【かい】)."},{"romaji":"kiru","kana":"きる","kanji":"切る","meaning":"cut","mnemonic":"A sword (刀【かたな】) making seven (七) cuts."},{"romaji":"kumoru","kana":"くもる","kanji":"曇る","meaning":"get cloudy","mnemonic":"The sun (日) totally hidden beneath a heavy cloud (雲【くも】)."},{"romaji":"kesu","kana":"けす","kanji":"消す","meaning":"erase","mnemonic":"Water (氵) washing away a spark (肖【しょう】)."},{"romaji":"komaru","kana":"こまる","kanji":"困る","meaning":"worry","mnemonic":"A tree (木) trapped inside a box (囗), unable to grow."},{"romaji":"saku","kana":"さく","kanji":"咲く","meaning":"bloom","mnemonic":"A mouth (口) smiling wide like an open blossom."},{"romaji":"sasu","kana":"さす","kanji":"差す","meaning":"open (umbrella)","mnemonic":"Hands opening up a canopy or framework."},{"romaji":"shinu","kana":"しぬ","kanji":"死ぬ","meaning":"die","mnemonic":"Bare bones (歹) and a fallen person (匕)."},{"romaji":"shiru","kana":"しる","kanji":"知る","meaning":"know","mnemonic":"An arrow (矢【や】) hitting its target in the mouth (口)."},{"romaji":"suu","kana":"すう","kanji":"吸う","meaning":"inhale","mnemonic":"A mouth (口) breathing in until air reaches (及【およ】) the lungs."},{"romaji":"sumu","kana":"すむ","kanji":"住む","meaning":"live","mnemonic":"A person (亻) standing as the master (主) of a house."},{"romaji":"suwaru","kana":"すわる","kanji":"座る","meaning":"sit","mnemonic":"Two people (人人) sitting together in an enclosure (广)."},{"romaji":"tatsu","kana":"たつ","kanji":"立つ","meaning":"stand","mnemonic":"A person standing firmly on the ground."},{"romaji":"dasu","kana":"だす","kanji":"出す","meaning":"put out","mnemonic":"Two mountains (山) stacked, pushing upward and outward."},{"romaji":"tanomu","kana":"たのむ","kanji":"頼む","meaning":"ask favor","mnemonic":"Binding (束) one's head (頁【けつ】) in a bowing request."},{"romaji":"chigau","kana":"ちがう","kanji":"違う","meaning":"differ","mnemonic":"Stepping (辶) in opposite directions (韋【い】)."},{"romaji":"tsukau","kana":"つかう","kanji":"使う","meaning":"use","mnemonic":"A person (亻) using an official/tool (吏【り】)."},{"romaji":"tsuku","kana":"つく","kanji":"着く","meaning":"arrive","mnemonic":"A sheep (羊【ひつじ】) arriving directly at an eye (目)."},{"romaji":"tsukuru","kana":"つくる","kanji":"作る","meaning":"make","mnemonic":"A person (亻) quickly (乍【さ】) making something."},{"romaji":"tobu","kana":"とぶ","kanji":"飛ぶ","meaning":"fly","mnemonic":"Looks exactly like wings flapping upward in the sky."},{"romaji":"tomaru","kana":"とまる","kanji":"止まる","meaning":"stop","mnemonic":"A footprint firmly halted on the ground."},{"romaji":"toru","kana":"とる","kanji":"取る","meaning":"take","mnemonic":"An ear (耳) grabbed by a hand (又【また】)."},{"romaji":"naku","kana":"なく","kanji":"泣く","meaning":"cry","mnemonic":"Water (氵) standing (立) in the eyes."},{"romaji":"nakusu","kana":"なくす","kanji":"無くす","meaning":"lose","mnemonic":"A fire (灬) at the bottom burning everything to nothing."},{"romaji":"narau","kana":"ならう","kanji":"習う","meaning":"learn","mnemonic":"Feathers (羽【はね】) practicing flight over a white (白) sun."},{"romaji":"narabu","kana":"ならぶ","kanji":"並ぶ","meaning":"line up","mnemonic":"Two people standing perfectly side by side."},{"romaji":"naru","kana":"なる","kanji":"成る","meaning":"become","mnemonic":"A weapon swinging to complete a task."},{"romaji":"noboru","kana":"のぼる","kanji":"登る","meaning":"climb","mnemonic":"Two feet climbing up toward a peak or tent."},{"romaji":"nomu","kana":"のむ","kanji":"飲む","meaning":"drink","mnemonic":"Food/Eat (食) and lack (欠) — lacking food, you drink."},{"romaji":"noru","kana":"のる","kanji":"乗る","meaning":"ride","mnemonic":"A person standing confidently on top of a tree."},{"romaji":"hairu","kana":"はいる","kanji":"入る","meaning":"enter","mnemonic":"An arrow plunging downward and inward."},{"romaji":"haku","kana":"はく","kanji":"履く","meaning":"put on shoes","mnemonic":"A body (尸) stepping forward into footwear."},{"romaji":"nugu","kana":"ぬぐ","kanji":"脱ぐ","meaning":"take off","mnemonic":"Flesh (月) escaping (兌【えつ】) its clothes."},{"romaji":"hataraku","kana":"はたらく","kanji":"働く","meaning":"work","mnemonic":"A person (亻) moving (動) with heavy labor."},{"romaji":"haru","kana":"はる","kanji":"貼る","meaning":"stick","mnemonic":"Shell/money (貝【かい】) used to secure a fortune (占【せん】)."},{"romaji":"fuku","kana":"ふく","kanji":"吹く","meaning":"blow","mnemonic":"A mouth (口) exhaling wind/lack (欠)."},{"romaji":"furu","kana":"ふる","kanji":"降る","meaning":"fall (rain)","mnemonic":"Moving heavily down a steep hill (阝)."},{"romaji":"magaru","kana":"まがる","kanji":"曲がる","meaning":"turn","mnemonic":"A completely bent or curved structural frame."},{"romaji":"matsu","kana":"まつ","kanji":"待つ","meaning":"wait","mnemonic":"Stepping (彳) at a temple (寺【てら】) patiently."},{"romaji":"migaku","kana":"みがく","kanji":"磨く","meaning":"brush","mnemonic":"Hands polishing a stone (石) under a cliff (广)."},{"romaji":"motsu","kana":"もつ","kanji":"持つ","meaning":"hold","mnemonic":"A hand (扌) gripping a temple (寺【てら】) firmly."},{"romaji":"yasumu","kana":"やすむ","kanji":"休む","meaning":"rest","mnemonic":"A person (亻) leaning against a tree (木) to rest."},{"romaji":"yaru","kana":"やる","kanji":"遣る","meaning":"do","mnemonic":"Casual “to do / to give” (= する / あげる). Usually written in kana."},{"romaji":"yobu","kana":"よぶ","kanji":"呼ぶ","meaning":"call out","mnemonic":"A mouth (口) exhaling heavily (乎【こ】) to shout."},{"romaji":"wakaru","kana":"わかる","kanji":"分かる","meaning":"understand","mnemonic":"A knife (刀【かたな】) dividing (八) a problem to understand it."},{"romaji":"watasu","kana":"わたす","kanji":"渡す","meaning":"hand over","mnemonic":"Water (氵) flowing across a span or degree (度)."},{"romaji":"wataru","kana":"わたる","kanji":"渡る","meaning":"go across","mnemonic":"氵 (water) + 度 (a span / degree) → to cross over water = go across."}]},{"name":"Ru-verbs & Irregulars","cards":[{"romaji":"akeru","kana":"あける","kanji":"開ける","meaning":"open","mnemonic":"Two gate doors (門【もん】) opening up."},{"romaji":"shimeru","kana":"しめる","kanji":"閉める","meaning":"close","mnemonic":"A gate (門【もん】) closed tight with a lock (オ)."},{"romaji":"shimeru","kana":"しめる","kanji":"締める","meaning":"tie","mnemonic":"Thread (糸【いと】) pulling tight around a ruler (帝【てい】)."},{"romaji":"ageru","kana":"あげる","kanji":"上げる","meaning":"give / raise","mnemonic":"Pointing up (上)."},{"romaji":"abiru","kana":"あびる","kanji":"浴びる","meaning":"shower","mnemonic":"Water (氵) pouring down in a valley (谷【たに】)."},{"romaji":"iru","kana":"いる","kanji":"居る","meaning":"exist","mnemonic":"A body (尸) resting in an ancient place (古)."},{"romaji":"ireru","kana":"いれる","kanji":"入れる","meaning":"put in","mnemonic":"An arrow plunging downward and inward."},{"romaji":"umareru","kana":"うまれる","kanji":"生まれる","meaning":"be born","mnemonic":"A sprout emerging from the ground."},{"romaji":"okiru","kana":"おきる","kanji":"起きる","meaning":"get up","mnemonic":"Running (走) to oneself (己【おのれ】)."},{"romaji":"neru","kana":"ねる","kanji":"寝る","meaning":"sleep","mnemonic":"A roof covering a bed and a resting body."},{"romaji":"oshieru","kana":"おしえる","kanji":"教える","meaning":"teach","mnemonic":"Filial piety (孝【こう】) driven by action (攵)."},{"romaji":"oboeru","kana":"おぼえる","kanji":"覚える","meaning":"remember","mnemonic":"Seeing (見) with awakened learning at the top."},{"romaji":"oriru","kana":"おりる","kanji":"降りる","meaning":"get off","mnemonic":"Moving heavily down a steep hill (阝)."},{"romaji":"kakeru","kana":"かける","kanji":"掛ける","meaning":"call (phone)","mnemonic":"A hand (扌) holding up a divination measure (卦【け】)."},{"romaji":"kariru","kana":"かりる","kanji":"借りる","meaning":"borrow","mnemonic":"A person (亻) needing days (昔) to repay."},{"romaji":"kieru","kana":"きえる","kanji":"消える","meaning":"disappear","mnemonic":"Water (氵) washing away a spark (肖【しょう】)."},{"romaji":"kiru","kana":"きる","kanji":"着る","meaning":"wear","mnemonic":"Sheep wool draped over eyes."},{"romaji":"kotaeru","kana":"こたえる","kanji":"答える","meaning":"answer","mnemonic":"Bamboo combined with a perfectly matching fit (合)."},{"romaji":"taberu","kana":"たべる","kanji":"食べる","meaning":"eat","mnemonic":"A person gathering good food under a roof."},{"romaji":"tsukareru","kana":"つかれる","kanji":"疲れる","meaning":"get tired","mnemonic":"Sickness covering a person suffering skin (皮【かわ】) deep."},{"romaji":"tsukeru","kana":"つける","kanji":"点ける","meaning":"turn on","mnemonic":"Black points of fire (灬) igniting."},{"romaji":"tsutomeru","kana":"つとめる","kanji":"勤める","meaning":"work","mnemonic":"Yellow clay power working extremely hard."},{"romaji":"dekakeru","kana":"でかける","kanji":"出かける","meaning":"go out","mnemonic":"Going out (出) + hanging/starting (掛)."},{"romaji":"dekiru","kana":"できる","kanji":"出来る","meaning":"be able","mnemonic":"Coming out (出) to come (来)."},{"romaji":"deru","kana":"でる","kanji":"出る","meaning":"exit","mnemonic":"Two mountains stacked, pushing outward."},{"romaji":"naraberu","kana":"ならべる","kanji":"並べる","meaning":"line up","mnemonic":"Two people standing perfectly side by side."},{"romaji":"hareru","kana":"はれる","kanji":"晴れる","meaning":"be sunny","mnemonic":"The sun (日) over blue (青)."},{"romaji":"miseru","kana":"みせる","kanji":"見せる","meaning":"show","mnemonic":"An eye (目) on legs showing itself."},{"romaji":"miru","kana":"みる","kanji":"見る","meaning":"watch","mnemonic":"目 (eye) + 儿 (legs) → an eye up on legs, walking around looking = to see / watch."},{"romaji":"wasureru","kana":"わすれる","kanji":"忘れる","meaning":"forget","mnemonic":"The death/loss (亡) of the heart/mind (心)."},{"romaji":"kuru","kana":"くる","kanji":"来る","meaning":"come","mnemonic":"A tree showing a person arriving under it."},{"romaji":"suru","kana":"する","meaning":"do","mnemonic":"Irregular verb “to do.” Pure kana — attaches to nouns: 勉強する = “to study.”"},{"romaji":"kopiisuru","kana":"コピーする","meaning":"copy","mnemonic":"Katakana コピー (“copy”) + する (to do)."}]},{"name":"I-Adjectives","cards":[{"romaji":"akarui","kana":"あかるい","kanji":"明るい","meaning":"bright","mnemonic":"Sun (日) + Moon (月) = extremely bright."},{"romaji":"kurai","kana":"くらい","kanji":"暗い","meaning":"dark","mnemonic":"Sun (日) goes down, only hearing sound (音)."},{"romaji":"wakai","kana":"わかい","kanji":"若い","meaning":"young","mnemonic":"Grass (艹) leaning to the right (右) like a young shoot."},{"romaji":"atarashii","kana":"あたらしい","kanji":"新しい","meaning":"new","mnemonic":"Standing (立) near a tree (木) with an axe (斤【きん】) to cut new wood."},{"romaji":"furui","kana":"ふるい","kanji":"古い","meaning":"old","mnemonic":"A story told ten (十) times by mouth (口) is old."},{"romaji":"atsui","kana":"あつい","kanji":"暑い","meaning":"hot (weather)","mnemonic":"Sun (日) beating down on a person (者)."},{"romaji":"atatakai","kana":"あたたかい","kanji":"暖かい","meaning":"warm (weather)","mnemonic":"Sun (日) providing gentle, loving (爰【えん】) warmth."},{"romaji":"samui","kana":"さむい","kanji":"寒い","meaning":"cold (weather)","mnemonic":"Ice (冫) freezing the bottom of a house."},{"romaji":"suzushii","kana":"すずしい","kanji":"涼しい","meaning":"cool","mnemonic":"Water (氵) flowing near a capital city (京)."},{"romaji":"atsui","kana":"あつい","kanji":"熱い","meaning":"hot (touch)","mnemonic":"Fire (灬) burning intensely at the bottom."},{"romaji":"tsumetai","kana":"つめたい","kanji":"冷たい","meaning":"cold (touch)","mnemonic":"Ice (冫) freezing a command (令【れい】)."},{"romaji":"nurui","kana":"ぬるい","kanji":"温い","meaning":"lukewarm","mnemonic":"Water (氵) warmed by the sun (日) on a plate (皿【さら】)."},{"romaji":"atsui","kana":"あつい","kanji":"厚い","meaning":"thick","mnemonic":"A generous cliff/rock face sheltering a child (子)."},{"romaji":"usui","kana":"うすい","kanji":"薄い","meaning":"thin","mnemonic":"Water (氵) spread thinly over grass (艹)."},{"romaji":"abunai","kana":"あぶない","kanji":"危ない","meaning":"dangerous","mnemonic":"A person kneeling precariously on a cliff."},{"romaji":"amai","kana":"あまい","kanji":"甘い","meaning":"sweet","mnemonic":"A mouth with a piece of sweet candy inside."},{"romaji":"karai","kana":"からい","kanji":"辛い","meaning":"spicy","mnemonic":"Standing (立) on ten (十) needles."},{"romaji":"yoi / ii","kana":"よい / いい","kanji":"良い","meaning":"good","mnemonic":"良 = “good.” いい is the colloquial form of よい (same 良)."},{"romaji":"warui","kana":"わるい","kanji":"悪い","meaning":"bad","mnemonic":"An evil/asian cross (亜【あ】) over a heart (心)."},{"romaji":"isogashii","kana":"いそがしい","kanji":"忙しい","meaning":"busy","mnemonic":"A heart (忄) that has lost (亡) itself to work."},{"romaji":"itai","kana":"いたい","kanji":"痛い","meaning":"painful","mnemonic":"The sickness radical (疒) covering a path/tunnel."},{"romaji":"urusai","kana":"うるさい","kanji":"煩い","meaning":"noisy","mnemonic":"Often written in Kana at N5."},{"romaji":"oishii","kana":"おいしい","kanji":"美味しい","meaning":"delicious","mnemonic":"Beauty (美) + Flavor (味)."},{"romaji":"mazui","kana":"まずい","kanji":"不味い","meaning":"gross","mnemonic":"Un- (不) + Flavor (味)."},{"romaji":"ooi","kana":"おおい","kanji":"多い","meaning":"many","mnemonic":"Two evening moons (夕) stacked up."},{"romaji":"ookii","kana":"おおきい","kanji":"大きい","meaning":"big","mnemonic":"A person stretching their arms and legs wide."},{"romaji":"chiisai","kana":"ちいさい","kanji":"小さい","meaning":"small","mnemonic":"Three little drops of water."},{"romaji":"osoi","kana":"おそい","kanji":"遅い","meaning":"slow","mnemonic":"A sheep walking slowly on a path (辶)."},{"romaji":"hayai","kana":"はやい","kanji":"速い","meaning":"quick","mnemonic":"Moving (辶) rapidly as a bundle (束)."},{"romaji":"hayai","kana":"はやい","kanji":"早い","meaning":"early","mnemonic":"The sun (日) rising over a cross (十) early in the day."},{"romaji":"omoi","kana":"おもい","kanji":"重い","meaning":"heavy","mnemonic":"A thousand (千) villages (里) stacked up."},{"romaji":"karui","kana":"かるい","kanji":"軽い","meaning":"light","mnemonic":"A car (車) driving lightly next to a water channel."},{"romaji":"kawaii","kana":"かわいい","kanji":"可愛い","meaning":"cute","mnemonic":"Possible (可) to love (愛)."},{"romaji":"kitanai","kana":"きたない","kanji":"汚い","meaning":"dirty","mnemonic":"Water (氵) sitting stagnant in a curved ditch."},{"romaji":"semai","kana":"せまい","kanji":"狭い","meaning":"narrow","mnemonic":"A dog (犭) squeezed into a tight space."},{"romaji":"hiroi","kana":"ひろい","kanji":"広い","meaning":"spacious","mnemonic":"A vast roof (广) covering a private (ム) space."},{"romaji":"takai","kana":"たかい","kanji":"高い","meaning":"tall / expensive","mnemonic":"Looks exactly like a tall pagoda or building."},{"romaji":"hikui","kana":"ひくい","kanji":"低い","meaning":"low","mnemonic":"A person (亻) working at the foundation (氏【し】)."},{"romaji":"yasui","kana":"やすい","kanji":"安い","meaning":"cheap / safe","mnemonic":"A woman (女) relaxing safely under a roof (宀)."},{"romaji":"omoshiroi","kana":"おもしろい","kanji":"面白い","meaning":"interesting","mnemonic":"A face (面) turning white (白) with excitement."},{"romaji":"tanoshii","kana":"たのしい","kanji":"楽しい","meaning":"enjoyable","mnemonic":"White (白) over wood (木) representing musical instruments."},{"romaji":"tsumaranai","kana":"つまらない","meaning":"boring","mnemonic":"Negative-shaped adjective: “nothing comes of it” → trivial, boring, dull. Usually kana."},{"romaji":"chikai","kana":"ちかい","kanji":"近い","meaning":"near","mnemonic":"Taking an axe (斤【きん】) on a short path (辶)."},{"romaji":"tooi","kana":"とおい","kanji":"遠い","meaning":"far","mnemonic":"Carrying heavy garments on a long path (辶)."},{"romaji":"tsuyoi","kana":"つよい","kanji":"強い","meaning":"powerful","mnemonic":"A strong bow (弓【ゆみ】) snapping a bug (虫【むし】)."},{"romaji":"yowai","kana":"よわい","kanji":"弱い","meaning":"weak","mnemonic":"Two limp, unstrung bows side by side."},{"romaji":"nagai","kana":"ながい","kanji":"長い","meaning":"long","mnemonic":"Looks like a person with very long, flowing hair."},{"romaji":"mijikai","kana":"みじかい","kanji":"短い","meaning":"short","mnemonic":"An arrow (矢【や】) next to a small bean (豆【まめ】)."},{"romaji":"futoi","kana":"ふとい","kanji":"太い","meaning":"thick (cylindrical)","mnemonic":"A big (大) object given an extra drop of weight."},{"romaji":"hosoi","kana":"ほそい","kanji":"細い","meaning":"thin (cylindrical)","mnemonic":"A delicate thread (糸【いと】) running through a field (田)."},{"romaji":"muzukashii","kana":"むずかしい","kanji":"難しい","meaning":"difficult","mnemonic":"A bird (隹【すい】) struggling in yellow clay."},{"romaji":"yasashii","kana":"やさしい","kanji":"易しい","meaning":"easy","mnemonic":"The sun (日) shining on a bird — clear and easy."},{"romaji":"hoshii","kana":"ほしい","kanji":"欲しい","meaning":"want","mnemonic":"A valley (谷【たに】) that lacks (欠) water, desiring it."}]},{"name":"Na-Adjectives","cards":[{"romaji":"iroirona","kana":"いろいろな","kanji":"色々な","meaning":"various","mnemonic":"色 (color) repeated.","breakdown":{"word":"色々","means":"various, all sorts","hook":"A doubled kanji — 色 written twice via the repeat-mark 々, “colours upon colours.”","parts":[{"k":"色","pos":"base","text":"“colour.” Pictured as one person bending over another — where mood, passion and colour show."},{"k":"々","pos":"right","text":"the repetition mark: it simply means “say the kanji before me again.”"}],"visualize":"Take one 色 (colour), then 々 says “again!” so you stack shade on shade until every hue is there. 色 (colour) + 々 (repeat) = all kinds, various (色々)!"}},{"romaji":"juubunna","kana":"じゅうぶんな","kanji":"十分な","meaning":"enough","mnemonic":"十 (ten) + 分 (parts) = 100%, enough.","breakdown":{"word":"十分","means":"enough, sufficient","hook":"Literally “ten parts” — and ten parts out of ten is the whole thing.","parts":[{"k":"十","pos":"left","text":"“ten.” One vertical stroke crossing one horizontal stroke: the complete set, 1 through 10."},{"k":"分","pos":"right","text":"“part, to divide.” 八 (a splitting motion) sitting above 刀【かたな】 (a blade) — cut into shares."}],"visualize":"Lay out ten (十) full parts (分) and nothing at all is missing — you have ten-tenths. 十 (ten) + 分 (parts) = a complete measure = enough (十分)!"}},{"romaji":"genkina","kana":"げんきな","kanji":"元気な","meaning":"healthy","mnemonic":"元 (origin) + 気 (spirit/energy).","breakdown":{"word":"元気","means":"energy, spirit, good health","hook":"Your “original ki” — the life-force you were born with.","parts":[{"k":"元","pos":"left","text":"“origin, source.” Two strokes (二) resting on a pair of legs (儿): a person traced back to their root."},{"k":"気","pos":"right","text":"“spirit, air, ki.” Rising vapour (气【き】) curled around 米 (rice) — the steam that lifts off hot rice."}],"visualize":"Picture life-force welling up from the base (元) of a person while warm steam rises off a bowl of rice (気). That root vitality IS your spirit. 元 (origin) + 気 (energy) = vigour (元気)!"}},{"romaji":"shizukana","kana":"しずかな","kanji":"静かな","meaning":"quiet","mnemonic":"青 (blue) + 争 (conflict) = cooling down a conflict.","breakdown":{"word":"静","means":"quiet, calm, still","hook":"The image of a heated argument being cooled right down.","parts":[{"k":"青","pos":"left","text":"“blue / green; cool, fresh.” The colour of clear sky and young plants."},{"k":"争","pos":"right","text":"“to fight, contend.” A hand straining to pull something away in a struggle."}],"visualize":"Take a hot 争 (quarrel) and pour cool 青 (blue) over it until tempers settle and everything goes still. 青 (cool) + 争 (conflict) = calmed down = quiet (静か)!"}},{"romaji":"jouzuna","kana":"じょうずな","kanji":"上手な","meaning":"skillful","mnemonic":"上 (up/good) + 手 (hand).","breakdown":{"word":"上手","means":"skillful, good at","hook":"Literally “the upper hand.”","parts":[{"k":"上","pos":"top","text":"“up, above, upper.” A mark placed above a baseline."},{"k":"手","pos":"bottom","text":"“hand.” A pictograph of a palm with spread fingers and a wrist."}],"visualize":"Whoever holds the 上 (upper) 手 (hand) is the one in control — the skilled one. 上 (upper) + 手 (hand) = the upper hand = skillful (上手)!"}},{"romaji":"joubuna","kana":"じょうぶな","kanji":"丈夫な","meaning":"strong","mnemonic":"丈【じょう】 (sturdy) + 夫 (man).","breakdown":{"word":"丈夫","means":"sturdy, durable, healthy","hook":"Originally “a full-grown man” — and a grown man is tough.","parts":[{"k":"丈【じょう】","pos":"top","text":"“height, stature.” A hand measuring out a tall span."},{"k":"夫","pos":"bottom","text":"“grown man, husband.” 大 (a big person) with a hairpin (一) laid across the top: an adult male."}],"visualize":"Stand a full-height (丈) grown man (夫) in front of you — solid, robust, hard to break. 丈【じょう】 (stature) + 夫 (man) = sturdy, durable (丈夫)!"}},{"romaji":"sukina","kana":"すきな","kanji":"好きな","meaning":"like","mnemonic":"女 (woman) + 子 (child) = something you naturally like.","breakdown":{"word":"好","means":"to like, fond of","hook":"The most natural bond there is — a mother and her child.","parts":[{"k":"女","pos":"left","text":"“woman.” A figure kneeling gracefully."},{"k":"子","pos":"right","text":"“child.” A baby in swaddling with its arms thrown out."}],"visualize":"A 女 (woman) leaning toward her 子 (child) — the very picture of tenderness and liking. 女 (woman) + 子 (child) = to be fond of = like (好き)!"}},{"romaji":"daisukina","kana":"だいすきな","kanji":"大好きな","meaning":"love","mnemonic":"大 (big) + 好き (like).","breakdown":{"word":"大好き","means":"to love, to like a lot","hook":"Just “like” (好) blown up “big” (大).","parts":[{"k":"大","pos":"top","text":"“big, great.” A person standing with arms and legs flung wide."},{"k":"好","pos":"bottom","text":"“to like.” A 女 (woman) drawn close to her 子 (child)."}],"visualize":"Take ordinary liking (好) and stretch it as 大 (big) as someone spreading their arms wide. 大 (big) + 好き (like) = to love (大好き)!"}},{"romaji":"kiraina","kana":"きらいな","kanji":"嫌いな","meaning":"hate","mnemonic":"女 (woman) + 兼【けん】 (concurrent) = complicated feelings.","breakdown":{"word":"嫌","means":"dislike, hate, distasteful","hook":"A tangle of mixed, uneasy feelings.","parts":[{"k":"女","pos":"left","text":"“woman” — here standing in for emotion and feeling."},{"k":"兼【けん】","pos":"right","text":"“to hold two things at once.” A hand grasping two stalks of grain together."}],"visualize":"When too many feelings are 兼【けん】 (held at once) they curdle into suspicion and distaste. 女 (feeling) + 兼 (combined) = conflicted, fed up = to dislike (嫌い)!"}},{"romaji":"kireina","kana":"きれいな","kanji":"綺麗な","meaning":"beautiful","mnemonic":"糸【いと】 (thread) + 奇【き】 (wonderful/strange).","breakdown":{"word":"綺麗","means":"beautiful, pretty, clean","hook":"Two ornate kanji so fancy the word is usually written in kana (きれい).","parts":[{"k":"綺【き】","pos":"left","text":"“fine figured silk.” 糸【いと】 (thread) beside 奇【き】 (rare, wonderful): rare, gorgeous cloth."},{"k":"麗【れい】","pos":"right","text":"“lovely, resplendent.” A 鹿【しか】 (deer) crowned with a matched pair of ornaments — elegance itself."}],"visualize":"Drape someone in rare patterned silk (綺) and crown them like an adorned deer (麗) — dazzling and spotless. 綺 (fine silk) + 麗 (lovely) = gorgeous, clean (綺麗)!"}},{"romaji":"taisetsuna","kana":"たいせつな","kanji":"大切な","meaning":"important","mnemonic":"大 (big) + 切 (cut) = sharply important.","breakdown":{"word":"大切","means":"important, precious","hook":"Picture a cut so big it really matters.","parts":[{"k":"大","pos":"left","text":"“big, great.” A person with arms outstretched."},{"k":"切","pos":"right","text":"“to cut; keen, pressing.” 七 (a cutting stroke) beside 刀【かたな】 (a sword) — slicing sharply."}],"visualize":"Something so 大 (big) and so 切 (sharply pressing) that it cuts straight to what counts. 大 (big) + 切 (sharp/pressing) = of great importance (大切)!"}},{"romaji":"taihenna","kana":"たいへんな","kanji":"大変な","meaning":"tough","mnemonic":"大 (big) + 変 (change/strange) = a big deal.","breakdown":{"word":"大変","means":"tough, awful, serious; very","hook":"A “big change” — and big changes are hard work.","parts":[{"k":"大","pos":"top","text":"“big, great.” A person with arms and legs spread wide."},{"k":"変","pos":"bottom","text":"“change, strange.” A form turning over a trailing foot (夂): things becoming something else."}],"visualize":"When a 大 (big) 変 (upheaval) lands on you, life turns rough and overwhelming. 大 (big) + 変 (change) = a serious ordeal (大変)!"}},{"romaji":"nigiyakana","kana":"にぎやかな","kanji":"賑やかな","meaning":"bustling","mnemonic":"貝【かい】 (money) + 辰【たつ】 (dragon) = a loud, busy market.","breakdown":{"word":"賑","means":"bustling, lively, prosperous","hook":"A marketplace booming with money and motion.","parts":[{"k":"貝【かい】","pos":"left","text":"“shell; money.” Ancient cowrie shells were used as currency."},{"k":"辰【たつ】","pos":"right","text":"“dragon; a stirring.” A great writhing creature, full of movement."}],"visualize":"Money (貝【かい】) changing hands as fast as a thrashing dragon (辰【たつ】) — a packed, noisy, prosperous market. 貝 (money) + 辰 (stirring) = bustling, lively (賑やか)!"}},{"romaji":"himana","kana":"ひまな","kanji":"暇な","meaning":"free (time)","mnemonic":"日 (sun/time) next to a relaxing enclosure.","breakdown":{"word":"暇","means":"free time, leisure, idleness","hook":"Empty days where the sun just drifts past.","parts":[{"k":"日","pos":"left","text":"“sun, day.” A pictograph of the sun."},{"k":"叚【か】","pos":"right","text":"a “borrowed / spare” element — the same shape that sits inside 借りる, “to borrow.”"}],"visualize":"Days (日) that feel borrowed and unclaimed — hours with nothing booked into them. 日 (day) + 叚【か】 (spare time) = idle hours = free time (暇)!"}},{"romaji":"hetana","kana":"へたな","kanji":"下手な","meaning":"bad at","mnemonic":"下 (down/poor) + 手 (hand).","breakdown":{"word":"下手","means":"unskillful, bad at","hook":"The opposite of 上手 — “the lower hand.”","parts":[{"k":"下","pos":"top","text":"“down, below, lower.” A mark hanging below a baseline."},{"k":"手","pos":"bottom","text":"“hand.” A palm with spread fingers."}],"visualize":"If the upper hand is skill, then the 下 (lower) 手 (hand) is the clumsy, losing one. 下 (lower) + 手 (hand) = the lower hand = bad at (下手)!"}},{"romaji":"benrina","kana":"べんりな","kanji":"便利な","meaning":"convenient","mnemonic":"便 (convenience) + 利 (profit/benefit).","breakdown":{"word":"便利","means":"convenient, handy","hook":"A person who makes things flow — at a tidy profit.","parts":[{"k":"便","pos":"left","text":"“convenience, ease.” A person (亻) who smooths things along and keeps them running."},{"k":"利","pos":"right","text":"“profit, advantage; sharp.” 禾【か】 (grain) beside 刂 (a knife): cutting the harvest = gain."}],"visualize":"A handy person (便) who reaps a clean profit (利) makes everything quick and easy. 便 (ease) + 利 (advantage) = convenient (便利)!"}},{"romaji":"massuguna","kana":"まっすぐな","kanji":"真っ直ぐな","meaning":"straight","mnemonic":"真 (true) + 直 (straight).","breakdown":{"word":"真っ直ぐ","means":"straight, direct, upright","hook":"Two “true / straight” kanji stacked for emphasis.","parts":[{"k":"真","pos":"left","text":"“true, real, genuine.” A spoon (匕) over an 目 (eye) over a stand: seeing things exactly as they are."},{"k":"直","pos":"right","text":"“straight, direct; to fix.” Ten (十) 目 (eyes) lined up along one corner — looking dead straight."}],"visualize":"Line up a 真 (true) gaze with a 直 (straight) edge and you get a path with no bends and no lies. 真 (true) + 直 (straight) = perfectly straight (真っ直ぐ)!"}},{"romaji":"yuumeina","kana":"ゆうめいな","kanji":"有名な","meaning":"famous","mnemonic":"有 (exist) + 名 (name).","breakdown":{"word":"有名","means":"famous, well-known","hook":"Literally “to have a name.”","parts":[{"k":"有","pos":"top","text":"“to have, possess, exist.” A hand holding a piece of 月 (meat): having something in hand."},{"k":"名","pos":"bottom","text":"“name.” 夕 (evening) over 口 (mouth): in the dark you call out your name aloud."}],"visualize":"To 有 (have) a 名 (name) on everyone’s lips is exactly what it is to be famous. 有 (to have) + 名 (name) = famous (有名)!"}},{"romaji":"rippana","kana":"りっぱな","kanji":"立派な","meaning":"splendid","mnemonic":"立 (stand) + 派【は】 (faction/splendid).","breakdown":{"word":"立派","means":"splendid, fine, respectable","hook":"Standing tall at the head of your own school.","parts":[{"k":"立","pos":"left","text":"“to stand.” A person planted firmly on the ground (the bottom line)."},{"k":"派【は】","pos":"right","text":"“faction, school; distinguished.” 氵 (water) beside a branching stream: a fine offshoot."}],"visualize":"Someone who can 立 (stand) at the head of their own 派 (faction) cuts an impressive, respectable figure. 立 (stand) + 派 (faction) = splendid (立派)!"}},{"romaji":"onaji","kana":"おなじ","kanji":"同じ","meaning":"same","mnemonic":"A single (一) mouth (口) under a cover (冂) saying the same thing.","breakdown":{"word":"同","means":"same, identical, together","hook":"Everyone under one roof speaking with a single voice.","parts":[{"k":"冂","pos":"outer","text":"an enclosure / cover — a boundary drawn around a group."},{"k":"一口","pos":"inside","text":"“one (一) mouth (口)” — a single speaking mouth."}],"visualize":"Gather people under one 冂 (cover) and have them speak with 一 (one) 口 (mouth) — all saying the very same thing. 冂 (together) + 一口 (one voice) = the same (同じ)!"}},{"romaji":"daijoubu","kana":"だいじょうぶ","kanji":"大丈夫","meaning":"okay","mnemonic":"大 (big) + 丈【じょう】 (sturdy) + 夫 (man).","breakdown":{"word":"大丈夫","means":"okay, alright, safe; no problem","hook":"Literally “a great, full-grown man” — i.e. dependable and fine.","parts":[{"k":"大","pos":"top","text":"“big, great.” A person with arms spread wide."},{"k":"丈【じょう】","pos":"middle","text":"“height, stature.” A measured, tall span."},{"k":"夫","pos":"bottom","text":"“grown man.” 大 with a hairpin (一): a full adult male."}],"visualize":"A 大 (great) man of full 丈【じょう】 (stature), a real 夫 (grown man) — strong and reliable, so everything is fine. 大 + 丈 + 夫 = sturdy & safe = it’s okay (大丈夫)!"}}]},{"name":"Adverbs, Conjunctions & Expressions","cards":[{"romaji":"ikaga","kana":"いかが","kanji":"如何","meaning":"how about","mnemonic":"Polite version of どう (“how”). Usually written in kana いかが."},{"romaji":"ichiban","kana":"いちばん","kanji":"一番","meaning":"best / first","mnemonic":"一 (one) + 番 (number/turn)."},{"romaji":"itsumo","kana":"いつも","kanji":"何時も","meaning":"always","mnemonic":"何時 (“what time”) + も (“even”) → “at any/every time” = always. Usually kana."},{"romaji":"yoku","kana":"よく","kanji":"良く","meaning":"often / well","mnemonic":"良く — the adverb form of 良い/いい (“good”): “well,” and by extension “often.”"},{"romaji":"tokidoki","kana":"ときどき","kanji":"時々","meaning":"sometimes","mnemonic":"時 (time) repeated."},{"romaji":"hajimete","kana":"はじめて","kanji":"初めて","meaning":"first time","mnemonic":"衤 (clothing) + 刀【かたな】 (knife) cutting cloth for the first time."},{"romaji":"suguni","kana":"すぐに","kanji":"直ぐに","meaning":"immediately","mnemonic":"直 (straight/direct)."},{"romaji":"sukoshi","kana":"すこし","kanji":"少し","meaning":"a little","mnemonic":"小 (small) with an extending line sliding out."},{"romaji":"chotto","kana":"ちょっと","kanji":"一寸","meaning":"a little bit","mnemonic":"一寸【すん】 = “one 寸 (sun),” an old unit (~3 cm) → a tiny bit. Usually kana ちょっと."},{"romaji":"motto","kana":"もっと","meaning":"more","mnemonic":"Adverb “more, even more”: もっと + adjective raises the degree."},{"romaji":"taihen","kana":"たいへん","kanji":"大変","meaning":"very","mnemonic":"大 (big) + 変 (change)."},{"romaji":"totemo","kana":"とても","meaning":"very","mnemonic":"Intensifier “very, extremely”: とても + adjective."},{"romaji":"amari","kana":"あまり","kanji":"余り","meaning":"not very","mnemonic":"余 (surplus / remainder) → with a negative, あまり〜ない = “not very.” Usually kana."},{"romaji":"tabun","kana":"たぶん","kanji":"多分","meaning":"probably","mnemonic":"多 (many) + 分 (parts/chances)."},{"romaji":"choudo","kana":"ちょうど","kanji":"丁度","meaning":"exactly","mnemonic":"丁【ちょう】 (exact) + 度 (degree)."},{"romaji":"dou","kana":"どう","meaning":"how","mnemonic":"Question adverb “how? / in what way?” (polite form: いかが)."},{"romaji":"doushite","kana":"どうして","kanji":"如何して","meaning":"why","mnemonic":"どう (“how”) + して (“doing”) → “how come?” = why. Usually written in kana."},{"romaji":"naze","kana":"なぜ","kanji":"何故","meaning":"why","mnemonic":"何 (what) + 故【こ】 (reason) → “for what reason?” = why. Usually kana なぜ."},{"romaji":"mata","kana":"また","kanji":"又","meaning":"again","mnemonic":"Looks like a folding stool you use over and over."},{"romaji":"mouichido","kana":"もういちど","kanji":"もう一度","meaning":"once more","mnemonic":"もう (already) + 一 (one) + 度 (degree/time)."},{"romaji":"mada","kana":"まだ","kanji":"未だ","meaning":"yet","mnemonic":"未 means “not yet”; まだ〜 = “still / not yet.” Usually kana."},{"romaji":"mou","kana":"もう","meaning":"already","mnemonic":"Adverb “already / (with neg.) not any more.” もう一つ = “one more.”"},{"romaji":"yukkurito","kana":"ゆっくりと","meaning":"slowly","mnemonic":"ゆっくり (“slowly, at ease”) + と (adverb marker) → “slowly, leisurely.”"},{"romaji":"ano","kana":"あの","meaning":"um","mnemonic":"Filler “um…, er…” — buys thinking time. Same shape as あの (“that over there”)."},{"romaji":"hai","kana":"はい","meaning":"yes","mnemonic":"Polite “yes” (also “here!” when answering a roll call)."},{"romaji":"iie","kana":"いいえ","meaning":"no","mnemonic":"Polite “no.” Pairs with はい (“yes”)."},{"romaji":"iya","kana":"いや","meaning":"no (casual)","mnemonic":"Casual / blunt “no, nah.” More informal than いいえ."},{"romaji":"kudasai","kana":"ください","kanji":"下さい","meaning":"please","mnemonic":"下 (down/give)."},{"romaji":"konna","kana":"こんな","meaning":"such","mnemonic":"こ-series: “this kind of, such (like this)”; こんな + noun."},{"romaji":"eeto","kana":"ええと","meaning":"well","mnemonic":"Hesitation filler: “well…, let me see…” (stalling for thought)."},{"romaji":"shikashi","kana":"しかし","kanji":"然し","meaning":"however","mnemonic":"Contrastive conjunction “however, but” (formal). 然し is usually written in kana."},{"romaji":"jaa","kana":"じゃあ","meaning":"well then","mnemonic":"Casual transition “well then, so” — a contraction of では."},{"romaji":"soreto","kana":"それと","meaning":"and","mnemonic":"Conjunction “and also, and with that” (adds an item)."},{"romaji":"sorekara","kana":"それから","meaning":"after that","mnemonic":"それ (that) + から (after) → “after that, and then.”"},{"romaji":"soredewa","kana":"それでは","meaning":"then","mnemonic":"“Well then, in that case” (formal); leads into a conclusion. Casual: それじゃ."},{"romaji":"dewa","kana":"では","meaning":"then (formal)","mnemonic":"Formal “well then / in that case.” Casual form: じゃあ."},{"romaji":"demo","kana":"でも","meaning":"but","mnemonic":"Conjunction “but, however” (casual); also “…or something” after a noun."},{"romaji":"douzo","kana":"どうぞ","meaning":"here you go","mnemonic":"Offering word: “please, go ahead, here you go.”"},{"romaji":"doumo","kana":"どうも","meaning":"thanks","mnemonic":"“Thanks” (short for どうもありがとう); also “somehow, really.”"},{"romaji":"nado","kana":"など","kanji":"等","meaning":"etc.","mnemonic":"竹【たけ】 (bamboo) + 寺【てら】 (temple)."},{"romaji":"yori","kana":"より","meaning":"than","mnemonic":"Comparison particle “than”: A は B より … = “A is more … than B.”"}]},{"name":"Daily Life, Objects & Vehicles","cards":[{"romaji":"nagasa","kana":"ながさ","kanji":"長さ","meaning":"length","mnemonic":"長 (long) + さ (degree suffix)."},{"romaji":"hajime","kana":"はじめ","kanji":"始め","meaning":"beginning","mnemonic":"女 (woman) + 台 (pedestal)."},{"romaji":"ongaku","kana":"おんがく","kanji":"音楽","meaning":"music","mnemonic":"音 (sound) + 楽 (enjoy/music)."},{"romaji":"uta","kana":"うた","kanji":"歌","meaning":"song","mnemonic":"Two singing mouths (欠) at the right."},{"romaji":"gitaa","kana":"ギター","meaning":"guitar","mnemonic":"Katakana loanword from English “guitar.”"},{"romaji":"rajio","kana":"ラジオ","meaning":"radio","mnemonic":"Katakana loanword from English “radio.”"},{"romaji":"rajikase","kana":"ラジカセ","meaning":"boombox","mnemonic":"Katakana loanword: blend of ラジオ (radio) + カセット (cassette)."},{"romaji":"teepurekoodaa","kana":"テープレコーダー","meaning":"tape recorder","mnemonic":"Katakana loanword from English “tape recorder.”"},{"romaji":"rekoodo","kana":"レコード","meaning":"record","mnemonic":"Katakana loanword from English “record.”"},{"romaji":"e","kana":"え","kanji":"絵","meaning":"picture","mnemonic":"Thread (糸【いと】) meeting (会) to form an image."},{"romaji":"kami","kana":"かみ","kanji":"紙","meaning":"paper","mnemonic":"Thread (糸【いと】) + Clan/Root (氏【し】)."},{"romaji":"kamera","kana":"カメラ","meaning":"camera","mnemonic":"Katakana loanword from English “camera.”"},{"romaji":"shashin","kana":"しゃしん","kanji":"写真","meaning":"photo","mnemonic":"写 (copy) + 真 (truth)."},{"romaji":"firumu","kana":"フィルム","meaning":"film","mnemonic":"Katakana loanword from English “film.”"},{"romaji":"hagaki","kana":"はがき","kanji":"葉書","meaning":"postcard","mnemonic":"葉 (leaf) + 書 (write)."},{"romaji":"tegami","kana":"てがみ","kanji":"手紙","meaning":"letter","mnemonic":"手 (hand) + 紙 (paper)."},{"romaji":"fuutou","kana":"ふうとう","kanji":"封筒","meaning":"envelope","mnemonic":"封【ふう】 (seal) + 筒【つつ】 (cylinder/tube)."},{"romaji":"kitte","kana":"きって","kanji":"切手","meaning":"stamp","mnemonic":"切 (cut) + 手 (hand)."},{"romaji":"posuto","kana":"ポスト","meaning":"postbox","mnemonic":"Katakana loanword from English “post (box).”"},{"romaji":"hikouki","kana":"ひこうき","kanji":"飛行機","meaning":"airplane","mnemonic":"飛 (fly) + 行 (go) + 機 (machine)."},{"romaji":"kuruma","kana":"くるま","kanji":"車","meaning":"car","mnemonic":"Looks like an axle with two wheels."},{"romaji":"jidousha","kana":"じどうしゃ","kanji":"自動車","meaning":"automobile","mnemonic":"自 (self) + 動 (move) + 車 (car)."},{"romaji":"jitensha","kana":"じてんしゃ","kanji":"自転車","meaning":"bicycle","mnemonic":"自 (self) + 転 (revolve) + 車 (car)."},{"romaji":"basu","kana":"バス","meaning":"bus","mnemonic":"Katakana loanword from English “bus.”"},{"romaji":"takushii","kana":"タクシー","meaning":"taxi","mnemonic":"Katakana loanword from English “taxi.”"},{"romaji":"chikatetsu","kana":"ちかてつ","kanji":"地下鉄","meaning":"subway","mnemonic":"地 (ground) + 下 (under) + 鉄【てつ】 (iron)."},{"romaji":"densha","kana":"でんしゃ","kanji":"電車","meaning":"train","mnemonic":"電 (electricity) + 車 (car)."},{"romaji":"kippu","kana":"きっぷ","kanji":"切符","meaning":"ticket","mnemonic":"切 (cut) + 符【ふ】 (token)."},{"romaji":"tsukue","kana":"つくえ","kanji":"机","meaning":"desk","mnemonic":"Wood (木) + Wind (几)."},{"romaji":"zasshi","kana":"ざっし","kanji":"雑誌","meaning":"magazine","mnemonic":"雑 (mixed) + 誌【し】 (document)."},{"romaji":"shinbun","kana":"しんぶん","kanji":"新聞","meaning":"newspaper","mnemonic":"新 (new) + 聞 (hear/listen)."},{"romaji":"nyuusu","kana":"ニュース","meaning":"news","mnemonic":"Katakana loanword from English “news.”"},{"romaji":"shigoto","kana":"しごと","kanji":"仕事","meaning":"job","mnemonic":"仕 (serve) + 事 (matter)."},{"romaji":"sentaku","kana":"せんたく","kanji":"洗濯","meaning":"washing","mnemonic":"洗 (wash) + 濯【たく】 (rinse)."},{"romaji":"souji","kana":"そうじ","kanji":"掃除","meaning":"cleaning","mnemonic":"掃【そう】 (sweep) + 除 (remove)."},{"romaji":"eiga","kana":"えいが","kanji":"映画","meaning":"movie","mnemonic":"映 (reflect) + 画 (picture)."},{"romaji":"kaimono","kana":"かいもの","kanji":"買い物","meaning":"shopping","mnemonic":"買 (buy) + 物 (thing)."},{"romaji":"supootsu","kana":"スポーツ","meaning":"sports","mnemonic":"Katakana loanword from English “sports.”"},{"romaji":"paatii","kana":"パーティー","meaning":"party","mnemonic":"Katakana loanword from English “party.”"},{"romaji":"sanpo","kana":"さんぽ","kanji":"散歩","meaning":"stroll","mnemonic":"散 (scatter) + 歩 (walk)."},{"romaji":"teeburu","kana":"テーブル","meaning":"table","mnemonic":"Katakana loanword from English “table.”"},{"romaji":"isu","kana":"いす","kanji":"椅子","meaning":"chair","mnemonic":"木 (wood) + 奇【き】 (strange/wonderful) + 子 (object suffix)."},{"romaji":"kabin","kana":"かびん","kanji":"花瓶","meaning":"vase","mnemonic":"花 (flower) + 瓶【びん】 (bottle)."},{"romaji":"macchi","kana":"マッチ","meaning":"match","mnemonic":"Katakana loanword from English “match.”"},{"romaji":"haizara","kana":"はいざら","kanji":"灰皿","meaning":"ashtray","mnemonic":"灰【はい】 (ashes) + 皿【さら】 (plate)."},{"romaji":"hako","kana":"はこ","kanji":"箱","meaning":"box","mnemonic":"Bamboo (竹【たけ】) + Mutually (相)."},{"romaji":"reizouko","kana":"れいぞうこ","kanji":"冷蔵庫","meaning":"fridge","mnemonic":"冷 (cold) + 蔵【ぞう】 (storehouse) + 庫【こ】 (warehouse)."},{"romaji":"terebi","kana":"テレビ","meaning":"television","mnemonic":"Katakana loanword, clipped from English “television.”"},{"romaji":"denwa","kana":"でんわ","kanji":"電話","meaning":"telephone","mnemonic":"電 (electricity) + 話 (speak)."},{"romaji":"beddo","kana":"ベッド","meaning":"bed","mnemonic":"Katakana loanword from English “bed.”"},{"romaji":"shawaa","kana":"シャワー","meaning":"shower","mnemonic":"Katakana loanword from English “shower.”"},{"romaji":"mado","kana":"まど","kanji":"窓","meaning":"window","mnemonic":"A hole (穴【あな】) with a heart (心) looking out."},{"romaji":"sutoobu","kana":"ストーブ","meaning":"stove","mnemonic":"Katakana loanword from English “stove” (a heater)."},{"romaji":"denki","kana":"でんき","kanji":"電気","meaning":"electricity","mnemonic":"電 (electricity/lightning) + 気 (spirit)."},{"romaji":"jisho","kana":"じしょ","kanji":"辞書","meaning":"dictionary","mnemonic":"辞 (word) + 書 (write)."},{"romaji":"teepu","kana":"テープ","meaning":"tape","mnemonic":"Katakana loanword from English “tape.”"},{"romaji":"ki","kana":"き","kanji":"木","meaning":"tree","mnemonic":"A simple drawing of a tree with roots."},{"romaji":"hana","kana":"はな","kanji":"花","meaning":"flower","mnemonic":"Grass (艹) over a changing (化) bud."},{"romaji":"hontou","kana":"ほんとう","kanji":"本当","meaning":"True","mnemonic":"本 (book/origin) + 当 (hit/right)."},{"romaji":"hoka","kana":"ほか","kanji":"他","meaning":"other","mnemonic":"A person (亻) next to a scorpion/snake (也【や】)."},{"romaji":"mono","kana":"もの","kanji":"物","meaning":"thing","mnemonic":"A cow (牛) next to a flag (勿【ぶつ】)."}]},{"name":"Demonstratives & Interrogatives","cards":[{"romaji":"kore","kana":"これ","kanji":"此れ","meaning":"this (noun)","mnemonic":"こ-series (near me): これ = “this (thing).” Usually written in kana."},{"romaji":"are","kana":"あれ","kanji":"彼れ","meaning":"that (over there)","mnemonic":"あ-series (far from both): あれ = “that (over there).” Usually kana."},{"romaji":"kono","kana":"この","kanji":"此の","meaning":"this (adj)","mnemonic":"こ-series adj (near me): この + noun = “this ___.” Usually kana."},{"romaji":"sono","kana":"その","kanji":"其の","meaning":"that (adj)","mnemonic":"そ-series adj (near you): その + noun = “that ___ (by you).” Usually kana."},{"romaji":"ano","kana":"あの","meaning":"that (over there)","mnemonic":"あ-series adj (far): あの + noun = “that ___ over there.” Usually kana."},{"romaji":"dono","kana":"どの","meaning":"which (adj)","mnemonic":"ど-series question adj: どの + noun = “which ___?”"},{"romaji":"dore","kana":"どれ","kanji":"何れ","meaning":"which (noun)","mnemonic":"ど-series question: どれ = “which one?” Usually written in kana."},{"romaji":"docchi","kana":"どっち","kanji":"何方","meaning":"which one","mnemonic":"Casual ど-series: どっち = “which one / which way?” Usually kana."},{"romaji":"doko","kana":"どこ","kanji":"何処","meaning":"where","mnemonic":"ど-series question: どこ = “where?” Usually written in kana."},{"romaji":"nani","kana":"なに","kanji":"何","meaning":"what","mnemonic":"A person (亻) carrying a heavy box (可)."},{"romaji":"itsu","kana":"いつ","kanji":"何時","meaning":"when","mnemonic":"何 (what) + 時 (time)."}]},{"name":"Interiors, Travel & Missed Words","cards":[{"romaji":"kaze","kana":"かぜ","kanji":"風邪","meaning":"a cold","mnemonic":"風 (wind) + 邪【じゃ】 (wicked). A wicked wind makes you sick."},{"romaji":"iriguchi","kana":"いりぐち","kanji":"入り口","meaning":"entrance","mnemonic":"入 (enter) + 口 (mouth/opening)."},{"romaji":"heya","kana":"へや","kanji":"部屋","meaning":"room","mnemonic":"部 (section) + 屋 (roof/shop)."},{"romaji":"erebeetaa","kana":"エレベーター","meaning":"elevator","mnemonic":"Katakana loanword from English “elevator.”"},{"romaji":"otearai","kana":"おてあらい","kanji":"お手洗い","meaning":"bathroom","mnemonic":"手 (hand) + 洗 (wash). The hand-washing room."},{"romaji":"toire","kana":"トイレ","meaning":"toilet","mnemonic":"Katakana loanword, clipped from “toilet” (トイレット)."},{"romaji":"ofuro","kana":"おふろ","kanji":"お風呂","meaning":"bath","mnemonic":"風 (wind) + 呂【ろ】 (stacked stones) → a bath. Usually written in kana お風呂."},{"romaji":"furo","kana":"ふろ","kanji":"風呂","meaning":"bath","mnemonic":"Same as お風呂【ろ】 without the polite お: 風 (wind) + 呂 (stacked stones) → a bath."},{"romaji":"kaidan","kana":"かいだん","kanji":"階段","meaning":"stairs","mnemonic":"階【かい】 (story/floor) + 段 (steps)."},{"romaji":"shokudou","kana":"しょくどう","kanji":"食堂","meaning":"dining hall","mnemonic":"食 (eat) + 堂 (hall)."},{"romaji":"daidokoro","kana":"だいどころ","kanji":"台所","meaning":"kitchen","mnemonic":"台 (pedestal/stand) + 所 (place)."},{"romaji":"rouka","kana":"ろうか","kanji":"廊下","meaning":"corridor","mnemonic":"廊【ろう】 (corridor) + 下 (down/under)."},{"romaji":"to","kana":"と","kanji":"戸","meaning":"Japanese style door","mnemonic":"Looks like a single door swinging open."},{"romaji":"doa","kana":"ドア","meaning":"Western style door","mnemonic":"Katakana loanword from English “door.”"},{"romaji":"mon","kana":"もん","kanji":"門","meaning":"gate","mnemonic":"Looks exactly like two swinging gate doors."},{"romaji":"deguchi","kana":"でぐち","kanji":"出口","meaning":"exit","mnemonic":"出 (exit/out) + 口 (mouth/opening)."},{"romaji":"ryokou","kana":"りょこう","kanji":"旅行","meaning":"travel","mnemonic":"旅 (trip) + 行 (go)."},{"romaji":"chizu","kana":"ちず","kanji":"地図","meaning":"map","mnemonic":"地 (ground) + 図 (diagram)."}]}];

/* ----- flatten deck into addressable cards ----- */
const SECTIONS = DECK.map((s) => s.name);
const CARDS = [];
DECK.forEach((s, si) =>
  s.cards.forEach((c, ci) => CARDS.push({ ...c, id: si + "." + ci, si }))
);
const CARD_BY_ID = {};
CARDS.forEach((c) => (CARD_BY_ID[c.id] = c));

/* ============================ persistence ================================= */
const KEY = "jlpt_n5_srs_v1";
let _mem = null; // in-memory fallback when window.storage is blocked

async function loadState() {
  try {
    const r = await window.storage.get(KEY);
    if (r == null) return _mem;
    return typeof r === "string" ? JSON.parse(r) : r;
  } catch (e) {
    return _mem;
  }
}
async function saveState(s) {
  _mem = s;
  try {
    await window.storage.set(KEY, s, { shared: false });
  } catch (e) {
    /* keep in-memory copy only */
  }
}

/* ============================ scheduler =================================== */
const MIN = 60000;
const DAY = 86400000;
const LEARN_STEPS = [1, 10]; // minutes
const RELEARN_STEPS = [10]; // minutes
const GRAD_IVL = 1; // days  (Good graduates here)
const EASY_IVL = 4; // days  (Easy graduates here)
const START_EASE = 2.5;
const MIN_EASE = 1.3;
const HARD_FACTOR = 1.2;
const EASY_BONUS = 1.3;

const round2 = (x) => Math.round(x * 100) / 100;

function mk(state, step, ease, interval, due, prev, repDelta) {
  return {
    state,
    step,
    ease: round2(ease),
    interval,
    due,
    reps: (prev && prev.reps ? prev.reps : 0) + (repDelta || 0),
    lapses: prev && prev.lapses ? prev.lapses : 0,
  };
}

// grade: 0 Again, 1 Hard, 2 Good, 3 Easy.  s = prior sched object or null.
function applyGrade(s, grade, now) {
  const st = s ? s.state : "new";

  if (st === "new" || st === "learning") {
    const step = s ? s.step || 0 : 0;
    const ease = s ? s.ease || START_EASE : START_EASE;
    if (grade === 0) return mk("learning", 0, ease, 0, now + LEARN_STEPS[0] * MIN, s);
    if (grade === 1) {
      const nxt = step + 1 < LEARN_STEPS.length ? LEARN_STEPS[step + 1] : LEARN_STEPS[step] * 2;
      const delay = (LEARN_STEPS[step] + nxt) / 2;
      return mk("learning", step, ease, 0, now + delay * MIN, s);
    }
    if (grade === 2) {
      const ns = step + 1;
      if (ns >= LEARN_STEPS.length) return mk("review", 0, ease, GRAD_IVL, now + GRAD_IVL * DAY, s, 1);
      return mk("learning", ns, ease, 0, now + LEARN_STEPS[ns] * MIN, s);
    }
    return mk("review", 0, ease, EASY_IVL, now + EASY_IVL * DAY, s, 1); // Easy
  }

  if (st === "review") {
    const ease = s.ease;
    const ivl = s.interval;
    if (grade === 0) {
      const ne = Math.max(MIN_EASE, ease - 0.2);
      const lap = Math.max(1, Math.round(ivl * 0.5));
      const r = mk("relearning", 0, ne, lap, now + RELEARN_STEPS[0] * MIN, s);
      r.lapses = (s.lapses || 0) + 1;
      return r;
    }
    if (grade === 1) {
      const ne = Math.max(MIN_EASE, ease - 0.15);
      const ni = Math.max(ivl + 1, Math.round(ivl * HARD_FACTOR));
      return mk("review", 0, ne, ni, now + ni * DAY, s, 1);
    }
    if (grade === 2) {
      const ni = Math.max(ivl + 1, Math.round(ivl * ease));
      return mk("review", 0, ease, ni, now + ni * DAY, s, 1);
    }
    const ne = ease + 0.15; // Easy
    const gi = Math.max(ivl + 1, Math.round(ivl * ease));
    const ni = Math.max(gi + 1, Math.round(ivl * ease * EASY_BONUS));
    return mk("review", 0, ne, ni, now + ni * DAY, s, 1);
  }

  // relearning
  const step = s.step || 0;
  const ease = s.ease;
  const ivl = s.interval || 1;
  if (grade === 0) return mk("relearning", 0, ease, ivl, now + RELEARN_STEPS[0] * MIN, s);
  if (grade === 1) return mk("relearning", step, ease, ivl, now + RELEARN_STEPS[step] * MIN, s);
  if (grade === 2) {
    const ns = step + 1;
    if (ns >= RELEARN_STEPS.length) return mk("review", 0, ease, ivl, now + ivl * DAY, s, 1);
    return mk("relearning", ns, ease, ivl, now + RELEARN_STEPS[ns] * MIN, s);
  }
  const ni = ivl + 1; // Easy out of relearning
  return mk("review", 0, ease, ni, now + ni * DAY, s, 1);
}

function fmtSpan(ms) {
  if (ms < 0) ms = 0;
  const m = ms / MIN;
  if (m < 60) return "<" + Math.max(1, Math.ceil(m - 0.0001)) + "m";
  const h = ms / 3600000;
  const d = ms / DAY;
  if (d < 1) return "<" + Math.ceil(h) + "h";
  if (d < 30) return Math.round(d) + "d";
  if (d < 365) return Math.round(d / 30) + "mo";
  return Math.round(d / 36.5) / 10 + "y";
}
function fmtWhen(ms) {
  if (ms < MIN) return "in <1m";
  if (ms < 3600000) return "in " + Math.round(ms / MIN) + "m";
  if (ms < DAY) return "in " + Math.round(ms / 3600000) + "h";
  return "in " + Math.ceil(ms / DAY) + "d";
}
const todayStr = (now) => {
  const d = new Date(now);
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
};

/* ============================ palette / css =============================== */
/* Colours are CSS variables so a single [data-theme] attribute flips the app.
   C maps token names -> var() refs, keeping the rest of the code unchanged. */
const C = {
  bg0: "var(--bg0)",
  bg1: "var(--bg1)",
  bg2: "var(--bg2)",
  line: "var(--line)",
  line2: "var(--line2)",
  ink: "var(--ink)",
  sub: "var(--sub)",
  faint: "var(--faint)",
  seal: "var(--seal)",
  gold: "var(--gold)",
  again: "var(--again)",
  hard: "var(--hard)",
  good: "var(--good)",
  easy: "var(--easy)",
  learn: "var(--learn)",
};
const THEME_BG = { dark: "#0f1117", light: "#f4f1ea" }; // for the browser theme-color meta
const FJP = "'Zen Maru Gothic', sans-serif";
const FDISP = "'Zen Kaku Gothic New', sans-serif";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@500;700;900&family=Zen+Maru+Gothic:wght@400;500;700&display=swap');
:root{
  --bg0:#0f1117; --bg1:#171a23; --bg2:#1e222e;
  --line:rgba(255,255,255,0.08); --line2:rgba(255,255,255,0.13);
  --ink:#edeff5; --sub:#9aa1b2; --faint:#646c80;
  --seal:#e3503a; --gold:#e8b65a;
  --again:#e2574f; --hard:#e7e9f0; --good:#48c98b; --easy:#5b9cf0; --learn:#e89a4a;
  --glow:rgba(42,33,80,0.50);
}
:root[data-theme="light"]{
  --bg0:#f4f1ea; --bg1:#ffffff; --bg2:#efeae0;
  --line:rgba(24,18,10,0.10); --line2:rgba(24,18,10,0.17);
  --ink:#23262e; --sub:#5c6271; --faint:#949aa8;
  --seal:#cf4327; --gold:#b07d1e;
  --again:#d6453d; --hard:#3a3f4b; --good:#1ea672; --easy:#2f7fe0; --learn:#c9792a;
  --glow:rgba(232,182,90,0.16);
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{height:100%;margin:0;background:var(--bg0);overscroll-behavior:none;}
body{-webkit-text-size-adjust:100%;text-size-adjust:100%;touch-action:manipulation;-webkit-user-select:none;user-select:none;}
input,textarea{-webkit-user-select:text;user-select:text;}
.n5-scroll::-webkit-scrollbar{width:0;height:0;}
.n5-scroll{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;}
ruby rt{font-size:.52em;color:var(--gold);font-weight:500;line-height:1;margin-bottom:.06em;}
@keyframes n5toast{0%{opacity:0;transform:translate(-50%,8px)}14%{opacity:1;transform:translate(-50%,0)}80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-4px)}}
@keyframes n5in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
@keyframes n5pop{0%{transform:scale(.96);opacity:.4}100%{transform:scale(1);opacity:1}}
`;

/* translucent colour from any CSS colour (incl. var()) — theme-safe */
function hexA(color, a) {
  return `color-mix(in srgb, ${color} ${Math.round(a * 100)}%, transparent)`;
}

/* ===================== mnemonic w/ ruby furigana ========================== */
const RUBY = /([㐀-鿿])【([^】]+)】/g;
function renderMnemonic(text) {
  if (!text) return null;
  const out = [];
  let last = 0;
  let m;
  let k = 0;
  RUBY.lastIndex = 0;
  while ((m = RUBY.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <ruby key={k++}>
        {m[1]}
        <rt>{m[2]}</rt>
      </ruby>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* structured "Visual Link" kanji breakdown (ruby furigana in every text field) */
function Breakdown({ b }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 1.6, color: C.gold, fontFamily: FJP, marginBottom: 9 }}>
        THE VISUAL LINK
      </div>
      <div style={{ fontFamily: FJP, fontSize: 14.5, lineHeight: 1.65, color: "#e7eaf2", marginBottom: 12 }}>
        <span style={{ fontFamily: FDISP, fontWeight: 800, color: C.gold, fontSize: 17 }}>{renderMnemonic(b.word)}</span>
        {" means “"}
        {b.means}
        {".” "}
        {b.hook && <span style={{ color: "#c2c7d4" }}>{renderMnemonic(b.hook)}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 13 }}>
        {b.parts.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
            <span
              style={{
                fontFamily: FDISP,
                fontWeight: 700,
                fontSize: 21,
                color: C.ink,
                lineHeight: 1.15,
                minWidth: 26,
                textAlign: "center",
                flex: "0 0 auto",
              }}
            >
              {renderMnemonic(p.k)}
            </span>
            <div style={{ fontFamily: FJP, fontSize: 13.5, lineHeight: 1.55, color: "#cfd4e0", paddingTop: 2 }}>
              {p.pos && <span style={{ color: C.faint, fontSize: 11.5 }}>{p.pos} · </span>}
              {renderMnemonic(p.text)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid " + C.line, paddingTop: 11 }}>
        <div style={{ fontSize: 10, letterSpacing: 1.4, color: C.easy, fontFamily: FJP, marginBottom: 6 }}>
          HOW TO VISUALIZE IT
        </div>
        <div style={{ fontFamily: FJP, fontSize: 14, lineHeight: 1.7, color: "#d9dde8" }}>
          {renderMnemonic(b.visualize)}
        </div>
      </div>
    </div>
  );
}

const fontForWord = (str) => {
  const n = [...(str || "")].length;
  if (n <= 2) return 66;
  if (n <= 3) return 54;
  if (n <= 5) return 42;
  if (n <= 7) return 32;
  return 26;
};

/* ============================ clipboard =================================== */
function fallbackCopy(t) {
  try {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.opacity = "0";
    ta.style.webkitUserSelect = "text"; // body sets user-select:none for app feel
    ta.style.userSelect = "text";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  } catch (e) {}
}
function copyText(t) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).catch(() => fallbackCopy(t));
      return;
    }
  } catch (e) {}
  fallbackCopy(t);
}

/* ============================ component =================================== */
export default function JlptN5Srs() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("home"); // 'home' | 'study'
  const [scope, setScope] = useState({ type: "all" });
  const [sched, setSched] = useState({});
  const [daily, setDaily] = useState({ date: todayStr(Date.now()), newDone: 0, reviewsToday: 0, extraNew: 0 });
  const [settings, setSettings] = useState({ direction: "jp", newPerDay: 15 });
  const [theme, setTheme] = useState("dark"); // 'dark' | 'light' | 'auto'
  const [sysLight, setSysLight] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [cur, setCur] = useState(null); // {id,isNew,dir}
  const [revealed, setRevealed] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [toast, setToast] = useState(null);
  const [flash, setFlash] = useState(null);
  const [activeGrade, setActiveGrade] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const toastTimer = useRef(null);

  /* ---- load once (restore progress + last screen + theme) ---- */
  useEffect(() => {
    (async () => {
      const s = await loadState();
      if (s) {
        if (s.sched) setSched(s.sched);
        if (s.settings) setSettings((p) => ({ ...p, ...s.settings }));
        if (s.theme) setTheme(s.theme);
        if (s.daily) {
          const d = s.daily;
          if (d.date !== todayStr(Date.now())) setDaily({ date: todayStr(Date.now()), newDone: 0, reviewsToday: 0, extraNew: 0 });
          else setDaily({ extraNew: 0, ...d });
        }
        // restore the screen the user was last on
        if (s.scope) setScope(s.scope);
        if (s.view === "study") {
          setView("study");
          if (s.cur && CARD_BY_ID[s.cur.id]) {
            setCur(s.cur);
            setRevealed(!!s.revealed);
          }
        }
      }
      setReady(true);
    })();
  }, []);

  /* ---- system colour-scheme (for theme:'auto') ---- */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const on = () => setSysLight(!!mq.matches);
    on();
    if (mq.addEventListener) mq.addEventListener("change", on);
    else if (mq.addListener) mq.addListener(on);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", on);
      else if (mq.removeListener) mq.removeListener(on);
    };
  }, []);

  /* ---- apply theme to <html> + browser chrome ---- */
  const effTheme = theme === "auto" ? (sysLight ? "light" : "dark") : theme;
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", effTheme);
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", THEME_BG[effTheme] || THEME_BG.dark);
  }, [effTheme]);

  /* ---- clock tick ---- */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ---- midnight rollover ---- */
  useEffect(() => {
    if (!ready) return;
    const t = todayStr(now);
    if (daily.date !== t) setDaily({ date: t, newDone: 0, reviewsToday: 0, extraNew: 0 });
  }, [now, ready, daily.date]);

  /* ---- persist progress + last screen + theme ---- */
  useEffect(() => {
    if (!ready) return;
    saveState({ v: 1, sched, daily, settings, theme, view, scope, cur, revealed });
  }, [sched, daily, settings, theme, view, scope, cur, revealed, ready]);

  /* ---- scope cards ---- */
  const scopeCards = useMemo(
    () => (scope.type === "all" ? CARDS : CARDS.filter((c) => c.si === scope.si)),
    [scope]
  );

  const newAllowance = (settings.newPerDay || 0) + (daily.extraNew || 0) - (daily.newDone || 0);

  function pickNext(cards, sc, dl, nowMs) {
    let learn = null;
    let review = null;
    for (const c of cards) {
      const s = sc[c.id];
      if (!s) continue;
      if ((s.state === "learning" || s.state === "relearning") && s.due <= nowMs) {
        if (!learn || s.due < sc[learn].due) learn = c.id;
      } else if (s.state === "review" && s.due <= nowMs) {
        if (!review || s.due < sc[review].due) review = c.id;
      }
    }
    if (learn) return { id: learn, isNew: false };
    if (review) return { id: review, isNew: false };
    const allow = (settings.newPerDay || 0) + (dl.extraNew || 0) - (dl.newDone || 0);
    if (allow > 0) {
      for (const c of cards) if (!sc[c.id]) return { id: c.id, isNew: true };
    }
    return null;
  }
  const dirFor = () => {
    const m = settings.direction;
    return m === "mix" ? (Math.random() < 0.5 ? "jp" : "en") : m;
  };

  /* ---- auto-advance when no current card (incl. learning becoming due) ---- */
  useEffect(() => {
    if (!ready || view !== "study" || cur) return;
    const n = pickNext(scopeCards, sched, daily, now);
    if (n) {
      n.dir = dirFor();
      setCur(n);
      setRevealed(false);
    }
    // eslint-disable-next-line
  }, [now, cur, ready, view, scopeCards, sched, daily, settings.newPerDay]);

  function startStudy(sc) {
    setScope(sc);
    setCur(null);
    setRevealed(false);
    setUndoStack([]);
    setView("study");
  }

  function doGrade(g) {
    if (!cur || !revealed) return;
    const id = cur.id;
    const prev = sched[id] ? { ...sched[id] } : null;
    const ns = applyGrade(prev, g, Date.now());
    const nSched = { ...sched, [id]: ns };
    const nDaily = {
      ...daily,
      reviewsToday: (daily.reviewsToday || 0) + 1,
      newDone: daily.newDone + (cur.isNew ? 1 : 0),
    };
    setUndoStack((u) => [...u, { id, prevSched: prev, prevDaily: { ...daily }, dir: cur.dir, isNew: cur.isNew }].slice(-60));
    setSched(nSched);
    setDaily(nDaily);
    const n = pickNext(scopeCards, nSched, nDaily, Date.now());
    if (n) n.dir = dirFor();
    setCur(n);
    setRevealed(false);
    setActiveGrade(-1);
  }

  function doUndo() {
    if (!undoStack.length) return;
    const snap = undoStack[undoStack.length - 1];
    setSched((s) => {
      const c = { ...s };
      if (snap.prevSched) c[snap.id] = snap.prevSched;
      else delete c[snap.id];
      return c;
    });
    setDaily(snap.prevDaily);
    setCur({ id: snap.id, isNew: snap.isNew, dir: snap.dir });
    setRevealed(true);
    setUndoStack((u) => u.slice(0, -1));
  }

  function fireToast(msg) {
    setToast({ msg, id: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1150);
  }
  function copyField(field, text) {
    if (!text) return;
    copyText(text);
    fireToast("Copied " + text);
    setFlash(field);
    setTimeout(() => setFlash((f) => (f === field ? null : f)), 320);
  }

  /* ---- counters for study header ---- */
  const counters = useMemo(() => {
    let learn = 0;
    let due = 0;
    let newLeft = 0;
    for (const c of scopeCards) {
      const s = sched[c.id];
      if (!s) {
        newLeft++;
        continue;
      }
      if ((s.state === "learning" || s.state === "relearning") && s.due <= now) learn++;
      else if (s.state === "review" && s.due <= now) due++;
    }
    const newShow = Math.max(0, Math.min(newLeft, newAllowance));
    return { learn, due, newShow, newLeft };
  }, [scopeCards, sched, now, newAllowance]);

  /* ---- next due (for done screen) ---- */
  const nextDue = useMemo(() => {
    let nd = Infinity;
    for (const c of scopeCards) {
      const s = sched[c.id];
      if (s && s.due > now) nd = Math.min(nd, s.due);
    }
    return nd;
  }, [scopeCards, sched, now]);

  /* ---- collection-wide progress stats ---- */
  const stats = useMemo(() => {
    let seen = 0;
    let relearning = 0;
    let maturing = 0;
    let mature = 0;
    for (const id in sched) {
      const s = sched[id];
      seen++;
      if (s.state === "relearning") relearning++;
      if (s.state === "review") {
        if (s.interval >= 21) mature++;
        else maturing++;
      }
    }
    return { seen, relearning, maturing, mature, total: CARDS.length };
  }, [sched]);

  /* ---- home: per-section progress ---- */
  const homeStats = useMemo(() => {
    return DECK.map((s, si) => {
      let total = 0;
      let seen = 0;
      let due = 0;
      let newLeft = 0;
      for (const c of CARDS) {
        if (c.si !== si) continue;
        total++;
        const sc = sched[c.id];
        if (!sc) {
          newLeft++;
          continue;
        }
        seen++;
        if (sc.due <= now && (sc.state === "review" || sc.state === "learning" || sc.state === "relearning")) due++;
      }
      return { total, seen, due, newLeft };
    });
  }, [sched, now]);

  if (!ready) {
    return (
      <Shell>
        <div style={{ flex: 1, display: "grid", placeItems: "center", color: C.faint, fontFamily: FJP }}>
          読み込み中…
        </div>
      </Shell>
    );
  }

  /* ================================ HOME ================================== */
  if (view === "home") {
    const totalDue = homeStats.reduce((a, s) => a + s.due, 0);
    const totalNew = Math.max(0, Math.min(homeStats.reduce((a, s) => a + s.newLeft, 0), newAllowance));
    return (
      <Shell>
        <Style />
        <header style={hdr}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
            <span style={{ fontFamily: FDISP, fontWeight: 900, fontSize: 21, color: C.ink, letterSpacing: 0.3 }}>
              N5
            </span>
            <span style={{ fontFamily: FJP, fontSize: 12.5, color: C.sub, letterSpacing: 2 }}>語彙 · SRS</span>
          </div>
          <IconBtn onClick={() => setShowSettings(true)} label="⚙" />
        </header>

        <div className="n5-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 14px 18px" }}>
          <button onClick={() => startStudy({ type: "all" })} style={allCardBtn}>
            <div>
              <div style={{ fontFamily: FDISP, fontWeight: 800, fontSize: 18, color: C.bg0 }}>Study everything</div>
              <div style={{ fontSize: 12.5, color: "rgba(15,17,23,0.7)", marginTop: 3, fontFamily: FJP }}>
                All {CARDS.length} words · {SECTIONS.length} sections
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <MiniPill n={totalNew} c={C.bg0} bg="rgba(15,17,23,0.14)" t="new" dark />
              <MiniPill n={totalDue} c={C.bg0} bg="rgba(15,17,23,0.14)" t="due" dark />
            </div>
          </button>

          <div style={{ fontSize: 11, letterSpacing: 2, color: C.faint, margin: "20px 4px 9px", fontFamily: FJP }}>
            SECTIONS
          </div>

          {DECK.map((s, si) => {
            const hs = homeStats[si];
            const pct = Math.round((hs.seen / hs.total) * 100);
            const newShow = Math.max(0, Math.min(hs.newLeft, newAllowance));
            return (
              <button key={si} onClick={() => startStudy({ type: "section", si })} style={secBtn}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: FJP,
                      fontWeight: 700,
                      fontSize: 15,
                      color: C.ink,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                    <div style={{ flex: 1, height: 4, background: C.bg2, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: pct + "%", height: "100%", background: C.seal, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, color: C.faint, fontVariantNumeric: "tabular-nums" }}>
                      {hs.seen}/{hs.total}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
                  <MiniPill n={newShow} c={C.gold} bg={hexA(C.gold, 0.12)} t="new" />
                  <MiniPill n={hs.due} c={C.easy} bg={hexA(C.easy, 0.12)} t="due" />
                </div>
              </button>
            );
          })}
          <div style={{ height: 6 }} />
        </div>

        {showSettings && (
          <SettingsSheet
            settings={settings}
            setSettings={setSettings}
            theme={theme}
            setTheme={setTheme}
            stats={stats}
            daily={daily}
            confirmReset={confirmReset}
            setConfirmReset={setConfirmReset}
            onReset={() => {
              setSched({});
              setDaily({ date: todayStr(Date.now()), newDone: 0, reviewsToday: 0, extraNew: 0 });
              setUndoStack([]);
              setConfirmReset(false);
              setShowSettings(false);
            }}
            onClose={() => {
              setShowSettings(false);
              setConfirmReset(false);
            }}
          />
        )}
      </Shell>
    );
  }

  /* ================================ STUDY ================================= */
  const card = cur ? CARD_BY_ID[cur.id] : null;
  const dir = cur ? cur.dir : "jp";
  const hasKanji = card && card.kanji && card.kanji !== card.kana;
  const promptWord = card ? (dir === "en" ? card.meaning || card.kana : hasKanji ? card.kanji : card.kana) : "";

  return (
    <Shell>
      <Style />
      <header style={hdr}>
        <IconBtn onClick={() => setView("home")} label="‹" />
        <div style={{ flex: 1, textAlign: "center", minWidth: 0, padding: "0 6px" }}>
          <div
            style={{
              fontFamily: FJP,
              fontSize: 13.5,
              fontWeight: 700,
              color: C.ink,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {scope.type === "all" ? "All sections" : SECTIONS[scope.si]}
          </div>
        </div>
        <IconBtn onClick={doUndo} label="↶" disabled={!undoStack.length} />
        <IconBtn onClick={() => setShowSettings(true)} label="⚙" />
      </header>

      <div style={ctr}>
        <Counter label="NEW" n={counters.newShow} color={C.gold} />
        <Counter label="LRN" n={counters.learn} color={C.learn} />
        <Counter label="DUE" n={counters.due} color={C.easy} />
      </div>

      {card ? (
        <>
          <div
            className="n5-scroll"
            onClick={() => !revealed && setRevealed(true)}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              margin: "10px 14px 0",
              borderRadius: 20,
              background: `linear-gradient(180deg, ${C.bg1}, ${C.bg2})`,
              border: "1px solid " + C.line,
              boxShadow: "0 14px 40px rgba(0,0,0,0.34)",
              cursor: revealed ? "default" : "pointer",
              position: "relative",
            }}
          >
            <div style={{ padding: "22px 20px 26px", minHeight: "100%", display: "flex", flexDirection: "column" }}>
              {/* section tag */}
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    letterSpacing: 1.6,
                    color: C.gold,
                    fontFamily: FJP,
                    border: "1px solid " + hexA(C.gold, 0.3),
                    padding: "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  {SECTIONS[card.si]}
                </span>
              </div>

              {/* prompt block */}
              <div style={{ flex: revealed ? "none" : 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                {dir === "en" ? (
                  <CopyTarget active={revealed} flash={flash === "meaning"} onTap={() => copyField("meaning", card.meaning)}>
                    <div style={{ fontFamily: FJP, fontWeight: 700, fontSize: 30, color: C.ink, textAlign: "center", lineHeight: 1.25 }}>
                      {card.meaning}
                    </div>
                  </CopyTarget>
                ) : (
                  <CopyTarget
                    active={revealed}
                    flash={flash === "word"}
                    onTap={() => copyField("word", hasKanji ? card.kanji : card.kana)}
                  >
                    <div style={{ fontFamily: FDISP, fontWeight: 700, fontSize: fontForWord(promptWord), color: C.ink, textAlign: "center", lineHeight: 1.15 }}>
                      {promptWord}
                    </div>
                  </CopyTarget>
                )}
                {!revealed && (
                  <div style={{ marginTop: 22, fontSize: 12.5, color: C.faint, fontFamily: FJP, animation: "n5in .4s" }}>
                    {dir === "en" ? "recall the Japanese · tap to reveal" : "tap to reveal"}
                  </div>
                )}
              </div>

              {/* revealed content */}
              {revealed && (
                <div style={{ animation: "n5in .28s ease both" }}>
                  {dir === "en" && hasKanji && (
                    <CopyTarget active flash={flash === "kanji"} onTap={() => copyField("kanji", card.kanji)} center>
                      <div style={{ fontFamily: FDISP, fontWeight: 700, fontSize: fontForWord(card.kanji), color: C.ink, textAlign: "center", lineHeight: 1.15, marginTop: 6 }}>
                        {card.kanji}
                      </div>
                    </CopyTarget>
                  )}
                  {dir === "jp" && hasKanji && (
                    <CopyTarget active flash={flash === "kanji"} onTap={() => copyField("kanji", card.kanji)} center>
                      {/* kanji already shown as prompt; keep tappable region but no dup */}
                      <div style={{ display: "none" }} />
                    </CopyTarget>
                  )}

                  {/* reading row */}
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                    <CopyTarget active flash={flash === "kana"} onTap={() => copyField("kana", card.kana)}>
                      <span style={{ fontFamily: FJP, fontSize: 22, fontWeight: 500, color: C.ink }}>{card.kana}</span>
                    </CopyTarget>
                    <CopyTarget active flash={flash === "romaji"} onTap={() => copyField("romaji", card.romaji)}>
                      <span style={{ fontFamily: FJP, fontSize: 14, color: C.sub, letterSpacing: 0.6 }}>{card.romaji}</span>
                    </CopyTarget>
                  </div>

                  <div style={{ height: 1, background: C.line, margin: "16px 0" }} />

                  {/* meaning (hidden in en since shown as prompt) */}
                  {dir === "jp" && card.meaning && (
                    <CopyTarget active flash={flash === "meaning"} onTap={() => copyField("meaning", card.meaning)} center>
                      <div style={{ fontFamily: FJP, fontWeight: 700, fontSize: 19, color: C.ink, textAlign: "center", lineHeight: 1.3 }}>
                        {card.meaning}
                      </div>
                    </CopyTarget>
                  )}

                  {/* mnemonic / kanji breakdown */}
                  {(card.breakdown || card.mnemonic) && (
                    <div
                      style={{
                        marginTop: 14,
                        background: hexA("#000000", 0.22),
                        border: "1px solid " + C.line,
                        borderRadius: 14,
                        padding: "14px 15px",
                      }}
                    >
                      {card.breakdown ? (
                        <Breakdown b={card.breakdown} />
                      ) : (
                        <>
                          <div style={{ fontSize: 10, letterSpacing: 1.6, color: C.gold, fontFamily: FJP, marginBottom: 6 }}>
                            HINT
                          </div>
                          <div style={{ fontFamily: FJP, fontSize: 15, lineHeight: 1.7, color: "#d9dde8" }}>
                            {renderMnemonic(card.mnemonic)}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <div style={{ height: 4 }} />
                </div>
              )}
            </div>
          </div>

          {/* grade bar / reveal hint (fixed height slot) */}
          {revealed ? (
            <div style={gradeBar}>
              {[
                { g: 0, label: "Again", color: C.again },
                { g: 1, label: "Hard", color: C.hard },
                { g: 2, label: "Good", color: C.good },
                { g: 3, label: "Easy", color: C.easy },
              ].map((b, i) => {
                const span = fmtSpan(applyGrade(sched[cur.id] || null, b.g, now).due - now);
                return (
                  <button
                    key={b.g}
                    onClick={() => doGrade(b.g)}
                    onPointerDown={() => setActiveGrade(b.g)}
                    onPointerUp={() => setActiveGrade(-1)}
                    onPointerLeave={() => setActiveGrade((a) => (a === b.g ? -1 : a))}
                    style={{
                      flex: 1,
                      height: "100%",
                      border: "none",
                      borderLeft: i === 0 ? "none" : "1px solid " + C.line,
                      background: activeGrade === b.g ? hexA(b.color, 0.18) : "transparent",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                      cursor: "pointer",
                      transition: "background .08s",
                    }}
                  >
                    <span style={{ fontSize: 11.5, color: hexA(b.color, 0.85), fontVariantNumeric: "tabular-nums", fontFamily: FJP }}>
                      {span}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: b.color, fontFamily: FDISP, letterSpacing: 0.2 }}>
                      {b.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ ...gradeBar, justifyContent: "center", alignItems: "center", borderTop: "1px solid " + C.line }}>
              <button
                onClick={() => setRevealed(true)}
                style={{ background: "none", border: "none", color: C.sub, fontFamily: FJP, fontSize: 14, letterSpacing: 1, cursor: "pointer" }}
              >
                Show answer
              </button>
            </div>
          )}
        </>
      ) : (
        /* ----- done for now ----- */
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 28px", textAlign: "center", animation: "n5pop .3s" }}>
          <div style={{ width: 64, height: 64, borderRadius: 40, border: "2px solid " + hexA(C.good, 0.5), display: "grid", placeItems: "center", color: C.good, fontSize: 30, marginBottom: 18 }}>
            ✓
          </div>
          <div style={{ fontFamily: FDISP, fontWeight: 800, fontSize: 22, color: C.ink }}>Done for now</div>
          <div style={{ fontFamily: FJP, fontSize: 14, color: C.sub, marginTop: 8 }}>
            {daily.reviewsToday || 0} card{(daily.reviewsToday || 0) === 1 ? "" : "s"} studied today
          </div>
          <div style={{ marginTop: 18, fontFamily: FJP, fontSize: 13.5, color: C.faint, lineHeight: 1.6 }}>
            {nextDue !== Infinity ? (
              <>Next card due {fmtWhen(nextDue - now)}</>
            ) : counters.newLeft > 0 ? (
              <>Daily new-card limit reached.</>
            ) : scope.type === "all" ? (
              <>Every card in the collection has been seen. 🎉</>
            ) : (
              <>This section is fully introduced.</>
            )}
          </div>
          {counters.newLeft > 0 && newAllowance <= 0 && (
            <button
              onClick={() => setDaily((d) => ({ ...d, extraNew: (d.extraNew || 0) + 10 }))}
              style={moreBtn}
            >
              + Study 10 more new
            </button>
          )}
          <button onClick={() => setView("home")} style={{ ...moreBtn, background: "transparent", color: C.sub, border: "1px solid " + C.line, marginTop: 10 }}>
            Back to sections
          </button>
        </div>
      )}

      {toast && (
        <div
          key={toast.id}
          style={{
            position: "fixed",
            left: "50%",
            bottom: "calc(100px + env(safe-area-inset-bottom))",
            transform: "translateX(-50%)",
            background: C.ink,
            color: C.bg0,
            fontFamily: FJP,
            fontSize: 13,
            fontWeight: 700,
            padding: "9px 16px",
            borderRadius: 30,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            animation: "n5toast 1.15s ease forwards",
            maxWidth: "80%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            zIndex: 50,
          }}
        >
          {toast.msg}
        </div>
      )}

      {showSettings && (
        <SettingsSheet
          settings={settings}
          setSettings={setSettings}
          theme={theme}
          setTheme={setTheme}
          stats={stats}
          daily={daily}
          confirmReset={confirmReset}
          setConfirmReset={setConfirmReset}
          onReset={() => {
            setSched({});
            setDaily({ date: todayStr(Date.now()), newDone: 0, reviewsToday: 0, extraNew: 0 });
            setUndoStack([]);
            setCur(null);
            setConfirmReset(false);
            setShowSettings(false);
          }}
          onClose={() => {
            setShowSettings(false);
            setConfirmReset(false);
          }}
        />
      )}
    </Shell>
  );
}

/* ============================ sub-components ============================== */
function Shell({ children }) {
  return (
    <div
      style={{
        height: "100dvh",
        width: "100%",
        maxWidth: 460,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: `radial-gradient(120% 60% at 50% -10%, var(--glow), transparent 60%), ${C.bg0}`,
        color: C.ink,
        position: "relative",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {children}
    </div>
  );
}
function Style() {
  return <style>{CSS}</style>;
}

const hdr = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 12px",
  height: 54,
  flex: "0 0 auto",
  borderBottom: "1px solid " + C.line,
};
const ctr = {
  display: "flex",
  justifyContent: "center",
  gap: 22,
  padding: "9px 12px 4px",
  flex: "0 0 auto",
};
const gradeBar = {
  display: "flex",
  height: 76,
  flex: "0 0 auto",
  marginTop: 10,
  borderTop: "1px solid " + C.line2,
  paddingBottom: "env(safe-area-inset-bottom)",
};
const allCardBtn = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  background: `linear-gradient(135deg, ${C.gold}, ${C.seal})`,
  border: "none",
  borderRadius: 18,
  padding: "16px 18px",
  marginTop: 8,
  cursor: "pointer",
  textAlign: "left",
  boxShadow: "0 10px 26px rgba(227,80,58,0.28)",
};
const secBtn = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  background: C.bg1,
  border: "1px solid " + C.line,
  borderRadius: 14,
  padding: "13px 14px",
  marginBottom: 9,
  cursor: "pointer",
  textAlign: "left",
};
const moreBtn = {
  marginTop: 22,
  background: C.seal,
  color: "#fff",
  border: "none",
  borderRadius: 24,
  padding: "11px 22px",
  fontFamily: FJP,
  fontWeight: 700,
  fontSize: 13.5,
  cursor: "pointer",
};

function IconBtn({ onClick, label, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        border: "1px solid " + C.line,
        background: C.bg1,
        color: disabled ? C.faint : C.ink,
        opacity: disabled ? 0.4 : 1,
        fontSize: 19,
        lineHeight: 1,
        cursor: disabled ? "default" : "pointer",
        flex: "0 0 auto",
        display: "grid",
        placeItems: "center",
      }}
    >
      {label}
    </button>
  );
}
function Counter({ label, n, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ fontSize: 9.5, letterSpacing: 1.5, color: C.faint, fontFamily: FJP }}>{label}</span>
      <span style={{ fontSize: 19, fontWeight: 800, color, fontFamily: FDISP, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
        {n}
      </span>
    </div>
  );
}
function MiniPill({ n, c, bg, t, dark }) {
  return (
    <div style={{ minWidth: 34, textAlign: "center", background: bg, borderRadius: 9, padding: "5px 7px" }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: FDISP, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{n}</div>
      <div style={{ fontSize: 8.5, letterSpacing: 1, color: dark ? "rgba(15,17,23,0.7)" : c, opacity: dark ? 1 : 0.75, fontFamily: FJP, marginTop: 2 }}>{t}</div>
    </div>
  );
}
function CopyTarget({ children, onTap, active, flash, center }) {
  return (
    <div
      onClick={(e) => {
        if (active) {
          e.stopPropagation();
          onTap();
        }
      }}
      style={{
        cursor: active ? "pointer" : "default",
        borderRadius: 10,
        padding: "2px 8px",
        transition: "background .15s",
        background: flash ? hexA(C.gold, 0.22) : "transparent",
        alignSelf: center ? "center" : "auto",
      }}
    >
      {children}
    </div>
  );
}

function SettingsSheet({ settings, setSettings, theme, setTheme, stats, daily, confirmReset, setConfirmReset, onReset, onClose }) {
  const dirs = [
    { v: "jp", t: "JP → EN", d: "see the word, recall the meaning" },
    { v: "en", t: "EN → JP", d: "see the meaning, recall the word" },
    { v: "mix", t: "Mixed", d: "random direction per card" },
  ];
  const newOpts = [5, 10, 15, 20, 30, 50];
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="n5-scroll"
        style={{
          width: "100%",
          maxWidth: 460,
          maxHeight: "86vh",
          overflowY: "auto",
          background: C.bg1,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          border: "1px solid " + C.line,
          padding: "10px 18px calc(24px + env(safe-area-inset-bottom))",
          animation: "n5in .25s ease",
        }}
      >
        <div style={{ width: 38, height: 4, background: C.line2, borderRadius: 4, margin: "6px auto 16px" }} />
        <div style={{ fontFamily: FDISP, fontWeight: 800, fontSize: 19, marginBottom: 18 }}>Settings</div>

        <Label>Appearance</Label>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {[
            { v: "dark", t: "Dark" },
            { v: "light", t: "Light" },
            { v: "auto", t: "Auto" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setTheme(o.v)}
              style={{
                flex: 1,
                background: theme === o.v ? C.seal : C.bg2,
                border: "1px solid " + (theme === o.v ? C.seal : C.line),
                color: theme === o.v ? "#fff" : C.ink,
                borderRadius: 11,
                padding: "10px 0",
                fontFamily: FJP,
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              {o.t}
            </button>
          ))}
        </div>

        <Label>Study direction</Label>
        {dirs.map((o) => (
          <button
            key={o.v}
            onClick={() => setSettings((s) => ({ ...s, direction: o.v }))}
            style={{
              width: "100%",
              textAlign: "left",
              background: settings.direction === o.v ? hexA(C.seal, 0.14) : C.bg2,
              border: "1px solid " + (settings.direction === o.v ? C.seal : C.line),
              borderRadius: 12,
              padding: "11px 14px",
              marginBottom: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontFamily: FJP, fontWeight: 700, fontSize: 14.5, color: C.ink }}>{o.t}</div>
              <div style={{ fontFamily: FJP, fontSize: 11.5, color: C.sub, marginTop: 2 }}>{o.d}</div>
            </div>
            {settings.direction === o.v && <span style={{ color: C.seal, fontSize: 18 }}>●</span>}
          </button>
        ))}

        <Label style={{ marginTop: 18 }}>New cards / day</Label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {newOpts.map((n) => (
            <button
              key={n}
              onClick={() => setSettings((s) => ({ ...s, newPerDay: n }))}
              style={{
                flex: "1 1 26%",
                background: settings.newPerDay === n ? C.seal : C.bg2,
                border: "1px solid " + (settings.newPerDay === n ? C.seal : C.line),
                color: settings.newPerDay === n ? "#fff" : C.ink,
                borderRadius: 11,
                padding: "11px 0",
                fontFamily: FDISP,
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <Label style={{ marginTop: 20 }}>Progress</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <Stat n={stats.seen} t="seen" sub={"/ " + stats.total} color={C.ink} />
          <Stat n={stats.relearning} t="relearning" color={C.again} />
          <Stat n={stats.maturing} t="maturing" color={C.learn} />
          <Stat n={stats.mature} t="mature" color={C.good} />
        </div>

        <Label style={{ marginTop: 20 }}>Reset</Label>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} style={resetBtn}>
            Reset all progress
          </button>
        ) : (
          <div style={{ background: hexA(C.again, 0.1), border: "1px solid " + hexA(C.again, 0.4), borderRadius: 12, padding: 14 }}>
            <div style={{ fontFamily: FJP, fontSize: 13.5, color: C.ink, marginBottom: 12, lineHeight: 1.5 }}>
              Erase all scheduling and counters for every card? This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onReset} style={{ ...resetBtn, flex: 1, marginTop: 0, background: C.again, color: "#fff", border: "none" }}>
                Yes, reset
              </button>
              <button onClick={() => setConfirmReset(false)} style={{ ...resetBtn, flex: 1, marginTop: 0, background: C.bg2 }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <button onClick={onClose} style={{ ...resetBtn, background: "transparent", border: "1px solid " + C.line, color: C.sub }}>
          Close
        </button>
      </div>
    </div>
  );
}
function Label({ children, style }) {
  return (
    <div style={{ fontSize: 10.5, letterSpacing: 1.6, color: C.faint, fontFamily: FJP, marginBottom: 9, ...style }}>
      {children}
    </div>
  );
}
function Stat({ n, t, sub, color }) {
  return (
    <div style={{ flex: 1, background: C.bg2, borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
      <div style={{ fontFamily: FDISP, fontWeight: 800, fontSize: 20, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{n}</div>
      {sub && <div style={{ fontSize: 9, color: C.faint, marginTop: 1 }}>{sub}</div>}
      <div style={{ fontFamily: FJP, fontSize: 10, color: C.sub, marginTop: 5, letterSpacing: 0.3 }}>{t}</div>
    </div>
  );
}
const resetBtn = {
  width: "100%",
  marginTop: 10,
  background: C.bg2,
  border: "1px solid " + C.line,
  color: C.ink,
  borderRadius: 12,
  padding: "12px 0",
  fontFamily: FJP,
  fontWeight: 700,
  fontSize: 13.5,
  cursor: "pointer",
};
