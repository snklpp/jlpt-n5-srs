import React, { useState, useEffect, useRef, useMemo } from "react";

/* ============================================================================
   JLPT N5 — Spaced Repetition Flashcards
   Single-file React app. Anki-style learning steps + SM-2 review intervals.
   Vocabulary sourced from the N5V workbook; one deck section per sheet.
   Furigana is added inside mnemonics for kanji above N5's neighbour level
   (N2 / N1 / beyond-JLPT), rendered as ruby. Progress persists via
   window.storage (never localStorage), with an in-memory fallback.
   ========================================================================== */

const DECK = [{"name":"Numbers & Colors","cards":[{"romaji":"zero","kana":"ゼロ","meaning":"zero","mnemonic":"Katakana loanword from English “zero.”"},{"romaji":"ichi","kana":"いち","kanji":"一","meaning":"one","mnemonic":"一 = one: a single horizontal line.","breakdown":{"word":"一","means":"one","hook":"The simplest character in the language — a single horizontal stroke.","parts":[{"k":"一","pos":"whole","text":"one bold line laid flat on the ground = a single unit."}],"visualize":"One stroke, one thing. 一 = one!"}},{"romaji":"ni","kana":"に","kanji":"二","meaning":"two","mnemonic":"二 = two: two parallel lines.","breakdown":{"word":"二","means":"two","hook":"Add a second line and you can count them.","parts":[{"k":"二","pos":"whole","text":"two parallel lines stacked — count them: 1, 2."}],"visualize":"Two lines = two. 二 = two!"}},{"romaji":"san","kana":"さん","kanji":"三","meaning":"three","mnemonic":"三 = three: three stacked lines.","breakdown":{"word":"三","means":"three","hook":"Keep stacking strokes.","parts":[{"k":"三","pos":"whole","text":"three lines stacked one above another."}],"visualize":"Three lines = three. 三 = three!"}},{"romaji":"yon","kana":"よん","kanji":"四","meaning":"four","mnemonic":"Represents the four walls of a room, or a square window with curtains.","breakdown":{"word":"四","means":"four","hook":"Lines give way to a little room.","parts":[{"k":"囗","pos":"frame","text":"the enclosure radical: the four walls of a room."},{"k":"儿","pos":"inside","text":"two little legs (or curtains) standing inside the room."}],"visualize":"Four walls (囗) around two legs (儿) = the four corners of a room. 四 = four!"}},{"romaji":"go","kana":"ご","kanji":"五","meaning":"five","mnemonic":"Looks a bit like a digital '5' with a flat top and bottom.","breakdown":{"word":"五","means":"five","hook":"A stylised, angular '5'.","parts":[{"k":"五","pos":"whole","text":"a top line and a bottom line pinched by a Z — like thread winding on a spool between two boards."}],"visualize":"Top, bottom, a tangle between = 5. 五 = five!"}},{"romaji":"roku","kana":"ろく","kanji":"六","meaning":"six","mnemonic":"Looks like a central node with lines spreading out.","breakdown":{"word":"六","means":"six","hook":"A little house, or a node sending out lines.","parts":[{"k":"六","pos":"whole","text":"a dot-roof on top with two legs spreading out beneath it."}],"visualize":"A roof over two legs = six. 六 = six!"}},{"romaji":"nana","kana":"なな","kanji":"七","meaning":"seven","mnemonic":"An upside-down '7' crossed by a line.","breakdown":{"word":"七","means":"seven","hook":"An upside-down 7.","parts":[{"k":"七","pos":"whole","text":"flip a '7' over and slash it through with a cross-stroke."}],"visualize":"Flip a '7', cross it through = 七. 七 = seven!"}},{"romaji":"hachi","kana":"はち","kanji":"八","meaning":"eight","mnemonic":"Two diverging lines, like a tree splitting at the root.","breakdown":{"word":"八","means":"eight","hook":"The number that literally means 'split / spread'.","parts":[{"k":"八","pos":"whole","text":"two strokes diverging — legs spreading wide, or a tree splitting at the root."}],"visualize":"Two legs spreading wide open = eight. 八 = eight!"}},{"romaji":"kyuu","kana":"きゅう","kanji":"九","meaning":"nine","mnemonic":"Looks like a person doing a push-up.","breakdown":{"word":"九","means":"nine","hook":"Almost ten, but bent over straining.","parts":[{"k":"九","pos":"whole","text":"a hooked stroke like a person doubled over doing a push-up — one short of ten."}],"visualize":"One bent figure straining toward ten = nine. 九 = nine!"}},{"romaji":"juu","kana":"じゅう","kanji":"十","meaning":"ten","mnemonic":"A simple addition/plus sign (+).","breakdown":{"word":"十","means":"ten","hook":"A complete cross — all fingers counted.","parts":[{"k":"十","pos":"whole","text":"a perfect plus sign (+): two strokes crossing dead centre."}],"visualize":"A full cross, both hands counted = ten. 十 = ten!"}},{"romaji":"hyaku","kana":"ひゃく","kanji":"百","meaning":"hundred","mnemonic":"One (一) over white (白) — one white light at 100% brightness.","breakdown":{"word":"百","means":"hundred","hook":"One unit of pure white light.","parts":[{"k":"一","pos":"top","text":"'one' laid across the top."},{"k":"白","pos":"bottom","text":"'white' (a shining sun) sitting underneath."}],"visualize":"One (一) lamp of white (白) light at full 100% brightness = a hundred. 一 + 白 = hundred (百)!"}},{"romaji":"sen","kana":"せん","kanji":"千","meaning":"thousand","mnemonic":"Ten (十) wearing an extra line/hat on top makes it a magnitude higher (1000).","breakdown":{"word":"千","means":"thousand","hook":"Ten, promoted by a hat.","parts":[{"k":"丿","pos":"top","text":"a slanting stroke laid like a hat across the top."},{"k":"十","pos":"bottom","text":"'ten' sitting underneath."}],"visualize":"Put a hat (丿) on ten (十) and it jumps a whole magnitude = a thousand. 千 = thousand!"}},{"romaji":"man","kana":"まん","kanji":"万","meaning":"ten thousand","mnemonic":"Looks like the number 5, but missing a piece (5 x 2000 = 10,000).","breakdown":{"word":"万","means":"ten thousand","hook":"A '5' with a piece knocked off, multiplied out.","parts":[{"k":"万","pos":"whole","text":"a single hooked figure — picture the number 5 missing its top stroke."}],"visualize":"5 × 2000 lives in that curl. 万 = ten thousand!"}},{"romaji":"oku","kana":"おく","kanji":"億","meaning":"one hundred million","mnemonic":"A person radical (亻) standing next to a huge idea/meaning (意).","breakdown":{"word":"億","means":"one hundred million","hook":"A person facing an idea too vast to picture.","parts":[{"k":"亻","pos":"left","text":"the person radical — someone standing."},{"k":"意","pos":"right","text":"'idea / meaning' (音 sound over 心 heart) — here, a quantity beyond imagining."}],"visualize":"A person (亻) before an idea (意) so huge it has no end = a hundred million. 亻 + 意 = hundred million (億)!"}},{"romaji":"hitotsu","kana":"ひとつ","kanji":"一つ","meaning":"one (thing)","mnemonic":"一 (one) + つ (counter suffix).","breakdown":{"word":"一つ","means":"one (thing)","hook":"The native-count form: kanji plus the counter つ.","parts":[{"k":"一","pos":"left","text":"'one'."},{"k":"つ","pos":"suffix","text":"the native counter-tail (ひと・ふた・みっ… counting)."}],"visualize":"一 (one) + つ (native counter) = one thing (一つ)!"}},{"romaji":"futatsu","kana":"ふたつ","kanji":"二つ","meaning":"two (things)","mnemonic":"二 (two) + つ.","breakdown":{"word":"二つ","means":"two (things)","hook":"Native-count: two plus the counter つ.","parts":[{"k":"二","pos":"left","text":"'two'."},{"k":"つ","pos":"suffix","text":"the native counter-tail."}],"visualize":"二 (two) + つ (native counter) = two things (二つ)!"}},{"romaji":"mittsu","kana":"みっつ","kanji":"三つ","meaning":"three (things)","mnemonic":"三 (three) + つ.","breakdown":{"word":"三つ","means":"three (things)","hook":"Native-count: three plus the counter つ.","parts":[{"k":"三","pos":"left","text":"'three'."},{"k":"つ","pos":"suffix","text":"the native counter-tail."}],"visualize":"三 (three) + つ (native counter) = three things (三つ)!"}},{"romaji":"yottsu","kana":"よっつ","kanji":"四つ","meaning":"four (things)","mnemonic":"四 (four) + つ.","breakdown":{"word":"四つ","means":"four (things)","hook":"Native-count: four plus the counter つ.","parts":[{"k":"四","pos":"left","text":"'four' (the room of four walls)."},{"k":"つ","pos":"suffix","text":"the native counter-tail."}],"visualize":"四 (four) + つ (native counter) = four things (四つ)!"}},{"romaji":"itsutsu","kana":"いつつ","kanji":"五つ","meaning":"five (things)","mnemonic":"五 (five) + つ.","breakdown":{"word":"五つ","means":"five (things)","hook":"Native-count: five plus the counter つ.","parts":[{"k":"五","pos":"left","text":"'five'."},{"k":"つ","pos":"suffix","text":"the native counter-tail."}],"visualize":"五 (five) + つ (native counter) = five things (五つ)!"}},{"romaji":"muttsu","kana":"むっつ","kanji":"六つ","meaning":"six (things)","mnemonic":"六 (six) + つ.","breakdown":{"word":"六つ","means":"six (things)","hook":"Native-count: six plus the counter つ.","parts":[{"k":"六","pos":"left","text":"'six'."},{"k":"つ","pos":"suffix","text":"the native counter-tail."}],"visualize":"六 (six) + つ (native counter) = six things (六つ)!"}},{"romaji":"nanatsu","kana":"ななつ","kanji":"七つ","meaning":"seven (things)","mnemonic":"七 (seven) + つ.","breakdown":{"word":"七つ","means":"seven (things)","hook":"Native-count: seven plus the counter つ.","parts":[{"k":"七","pos":"left","text":"'seven'."},{"k":"つ","pos":"suffix","text":"the native counter-tail."}],"visualize":"七 (seven) + つ (native counter) = seven things (七つ)!"}},{"romaji":"yattsu","kana":"やっつ","kanji":"八つ","meaning":"eight (things)","mnemonic":"八 (eight) + つ.","breakdown":{"word":"八つ","means":"eight (things)","hook":"Native-count: eight plus the counter つ.","parts":[{"k":"八","pos":"left","text":"'eight'."},{"k":"つ","pos":"suffix","text":"the native counter-tail."}],"visualize":"八 (eight) + つ (native counter) = eight things (八つ)!"}},{"romaji":"kokonotsu","kana":"ここのつ","kanji":"九つ","meaning":"nine (things)","mnemonic":"九 (nine) + つ.","breakdown":{"word":"九つ","means":"nine (things)","hook":"Native-count: nine plus the counter つ.","parts":[{"k":"九","pos":"left","text":"'nine'."},{"k":"つ","pos":"suffix","text":"the native counter-tail."}],"visualize":"九 (nine) + つ (native counter) = nine things (九つ)!"}},{"romaji":"too","kana":"とお","kanji":"十","meaning":"ten (things)","mnemonic":"Same kanji 十 (ten), read とお in the native counting set (ひとつ…とお).","breakdown":{"word":"十","means":"ten","hook":"A complete cross — all fingers counted.","parts":[{"k":"十","pos":"whole","text":"a perfect plus sign (+): two strokes crossing dead centre."}],"visualize":"A full cross, both hands counted = ten. 十 = ten!"}},{"romaji":"ikutsu","kana":"いくつ","kanji":"幾つ","meaning":"how many","mnemonic":"幾 means “how many / several”; 幾つ → “how many (things)?” Usually kana.","breakdown":{"word":"幾つ","means":"how many","hook":"Usually written in kana — but the kanji 幾 means 'how many / several'.","parts":[{"k":"幾【いく】","pos":"left","text":"'how many': fine threads 幺幺 beside a halberd 戈 — 'just how many of these tiny things?'"},{"k":"つ","pos":"suffix","text":"the native counter-tail."}],"visualize":"幾【いく】 (how many) + つ (counter) = how many things? (幾つ)!"}},{"romaji":"ikura","kana":"いくら","kanji":"幾ら","meaning":"how much","mnemonic":"幾 (“how many”) + ら → “how much?” (price/amount). Usually kana.","breakdown":{"word":"幾ら","means":"how much (price/amount)","hook":"The same 幾, now asking about cost (usually kana).","parts":[{"k":"幾【いく】","pos":"left","text":"'how many / how much'."},{"k":"ら","pos":"suffix","text":"a softening tail → 'about how much?'"}],"visualize":"幾【いく】 (how many) + ら → how much? (幾ら)!"}},{"romaji":"ichiban","kana":"いちばん","kanji":"一番","meaning":"first","mnemonic":"一 (one) + 番 (turn/number).","breakdown":{"word":"一番","means":"first, best, number one","hook":"Literally 'turn number one'.","parts":[{"k":"一","pos":"left","text":"'one'."},{"k":"番","pos":"right","text":"'turn / number in a sequence' — 釆 (a sieve) over 田 (a field), like numbered plots."}],"visualize":"一 (one) + 番 (turn/number) = the first, the very best (一番)!"}},{"romaji":"hitori","kana":"ひとり","kanji":"一人","meaning":"one person","mnemonic":"一 (one) + 人 (person).","breakdown":{"word":"一人","means":"one person","hook":"Count people the irregular way: ひとり.","parts":[{"k":"一","pos":"left","text":"'one'."},{"k":"人","pos":"right","text":"'person' — a figure standing on two legs."}],"visualize":"一 (one) + 人 (person) = one person (一人)!"}},{"romaji":"futari","kana":"ふたり","kanji":"二人","meaning":"two people","mnemonic":"二 (two) + 人 (person).","breakdown":{"word":"二人","means":"two people","hook":"Count people the irregular way: ふたり.","parts":[{"k":"二","pos":"left","text":"'two'."},{"k":"人","pos":"right","text":"'person' — a figure standing on two legs."}],"visualize":"二 (two) + 人 (person) = two people (二人)!"}},{"romaji":"zenbu","kana":"ぜんぶ","kanji":"全部","meaning":"all","mnemonic":"全 (whole/king under an umbrella) + 部 (part/section).","breakdown":{"word":"全部","means":"all, the whole lot","hook":"Every single section, complete.","parts":[{"k":"全","pos":"left","text":"'whole / complete' — a roof 𠆢 over 王 (king): everything under one rule."},{"k":"部","pos":"right","text":"'part / section' — 咅 beside 阝 (a village hill)."}],"visualize":"全 (whole) + 部 (every part) = the whole thing, all of it (全部)!"}},{"romaji":"hanbun","kana":"はんぶん","kanji":"半分","meaning":"half","mnemonic":"半 (half, cut down the middle) + 分 (to divide).","breakdown":{"word":"半分","means":"half","hook":"Cut straight down the middle, then split.","parts":[{"k":"半","pos":"left","text":"'half' — an object sliced down the centre by the splitting strokes 八."},{"k":"分","pos":"right","text":"'to divide' — 八 (split) over 刀 (a knife)."}],"visualize":"半 (half) + 分 (divide) = a half-portion (半分)!"}},{"romaji":"takusan","kana":"たくさん","kanji":"沢山","meaning":"many","mnemonic":"沢【さわ】 (marsh) + 山 (mountain) → “marshes and mountains” = a whole lot. Usually kana.","breakdown":{"word":"沢山","means":"a lot, many","hook":"So much it fills marsh and mountain (usually written in kana).","parts":[{"k":"沢【さわ】","pos":"left","text":"'marsh / swamp' — the water radical 氵 beside 尺, a wetland brimming over."},{"k":"山","pos":"right","text":"'mountain'."}],"visualize":"沢【さわ】 (marshes) + 山 (mountains) — enough to fill them both = a whole lot (沢山)!"}},{"romaji":"bangou","kana":"ばんごう","kanji":"番号","meaning":"number","mnemonic":"番 (turn) + 号 (issue/number, looks like a mouth shouting).","breakdown":{"word":"番号","means":"a number (in a series)","hook":"Your place in line, called out.","parts":[{"k":"番","pos":"left","text":"'turn / order in a sequence'."},{"k":"号","pos":"right","text":"'number / sign' — a mouth 口 shouting out the issue-number."}],"visualize":"番 (sequence) + 号 (number/sign) = an assigned number (番号)!"}},{"romaji":"guramu","kana":"グラム","meaning":"gram","mnemonic":"Katakana loanword from “gram(me)” (metric mass)."},{"romaji":"kiroguramu","kana":"キログラム","meaning":"kilogram","mnemonic":"Katakana loanword: キロ (kilo) + グラム (gram)."},{"romaji":"meetoru","kana":"メートル","meaning":"meter","mnemonic":"Katakana loanword from French “mètre” (metre)."},{"romaji":"kiromeetoru","kana":"キロメートル","meaning":"kilometer","mnemonic":"Katakana loanword: キロ (kilo) + メートル (metre)."},{"romaji":"kuro","kana":"くろ","kanji":"黒","meaning":"black","mnemonic":"A heavy box/unit (里) overheating with four fire dots (灬) at the bottom.","breakdown":{"word":"黒","means":"black","hook":"A window blackened by the fire beneath it.","parts":[{"k":"里","pos":"top","text":"a heavy grid/unit (the village-measure 里) — picture a sooty window-frame."},{"k":"灬","pos":"bottom","text":"the four-dot fire radical, scorching everything above."}],"visualize":"A frame (里) charred by fire (灬) underneath = soot-black. 黒 = black!"}},{"romaji":"shiro","kana":"しろ","kanji":"白","meaning":"white","mnemonic":"A single sun (日) shining pure white light.","breakdown":{"word":"白","means":"white","hook":"A single, blinding source of light.","parts":[{"k":"白","pos":"whole","text":"the sun 日 with a ray 丿 flaring off the top — light so pure it has no colour."}],"visualize":"One blazing point of light = white. 白 = white!"}},{"romaji":"ao","kana":"あお","kanji":"青","meaning":"blue","mnemonic":"Top signifies blue hat, bottom is the moon (月).","breakdown":{"word":"青","means":"blue (also fresh / green)","hook":"Fresh growth under a clear moon.","parts":[{"k":"生","pos":"top","text":"'fresh / living growth' (simplified at the top)."},{"k":"月","pos":"bottom","text":"'moon' — the blue night sky."}],"visualize":"Fresh shoots (生) under the moon (月) = the blue-green of a clear night. 青 = blue!"}},{"romaji":"aka","kana":"あか","kanji":"赤","meaning":"red","mnemonic":"A big (大) fire (火) glowing red underneath.","breakdown":{"word":"赤","means":"red","hook":"A big fire glowing.","parts":[{"k":"大","pos":"top","text":"'big' — a person with arms flung wide."},{"k":"火","pos":"bottom","text":"'fire' (flattened here) — flames licking up red."}],"visualize":"A big (大) fire (火) blazing = red. 赤 = red!"}},{"romaji":"midori","kana":"みどり","kanji":"緑","meaning":"green","mnemonic":"Has the 糸【いと】 (thread) radical on the left — picture dyeing thread green.","breakdown":{"word":"緑","means":"green","hook":"Dye the thread green.","parts":[{"k":"糸【いと】","pos":"left","text":"the thread radical — skeins of silk ready to be dyed."},{"k":"彔","pos":"right","text":"a hand cranking water from a well (the 録 'record' element) — here, dye dripping down."}],"visualize":"Take thread 糸【いと】 and soak it in dye (彔) = green-dyed silk. 緑 = green!"}},{"romaji":"iro","kana":"いろ","kanji":"色","meaning":"color","mnemonic":"色 = “color.” Doubles up in 色々 (いろいろ, “various”).","breakdown":{"word":"色","means":"colour","hook":"Two figures — and the flush of colour between them.","parts":[{"k":"色","pos":"whole","text":"a person 𠂉 bending over a kneeling figure 巴 — where mood, passion and colour rise to the skin."}],"visualize":"Where feeling shows on the skin = colour. 色 = colour!"}},{"romaji":"kiiro","kana":"きいろ","kanji":"黄色","meaning":"yellow","mnemonic":"黄【き】 (yellow) + 色 (color) → the color yellow.","breakdown":{"word":"黄色","means":"yellow","hook":"The colour yellow, spelled right out.","parts":[{"k":"黄【き】","pos":"left","text":"'yellow' on its own."},{"k":"色","pos":"right","text":"'colour'."}],"visualize":"黄【き】 (yellow) + 色 (colour) = the colour yellow (黄色)!"}},{"romaji":"chairo","kana":"ちゃいろ","kanji":"茶色","meaning":"brown","mnemonic":"cha (茶) = tea","breakdown":{"word":"茶色","means":"brown","hook":"Tea-colour.","parts":[{"k":"茶","pos":"left","text":"'tea' — grass 艹 over a figure sheltering by a tree: the tea plant."},{"k":"色","pos":"right","text":"'colour'."}],"visualize":"茶 (tea) + 色 (colour) = the warm brown of steeped tea (茶色)!"}}],"level":"N5"},{"name":"Dates, Days, Week, Seasons","cards":[{"romaji":"kyou","kana":"きょう","kanji":"今日","meaning":"today","mnemonic":"今 (now) + 日 (day)","breakdown":{"word":"今日","means":"today","hook":"This very day.","parts":[{"k":"今","pos":"left","text":"'now' — a roof 𠆢 gathering the present moment underneath."},{"k":"日","pos":"right","text":"'day / sun'."}],"visualize":"今 (now) + 日 (day) = this day, today (今日)!"}},{"romaji":"kinou","kana":"きのう","kanji":"昨日","meaning":"yesterday","mnemonic":"昨 (previous) + 日 (day)","breakdown":{"word":"昨日","means":"yesterday","hook":"The day that just slipped past.","parts":[{"k":"昨","pos":"left","text":"'previous / last' — 日 (day) beside 乍【さ】, a fleeting moment now gone."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"昨 (the just-passed) + 日 (day) = yesterday (昨日)!"}},{"romaji":"ototoi","kana":"おととい","kanji":"一昨日","meaning":"day before yesterday","mnemonic":"一 (one) + 昨 (previous) + 日 (day)","breakdown":{"word":"一昨日","means":"day before yesterday","hook":"Step one day further back than yesterday.","parts":[{"k":"一","pos":"left","text":"'one' more step back."},{"k":"昨","pos":"middle","text":"'previous' (the 乍【さ】 of passing time)."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"一 (one back) + 昨 (previous) + 日 (day) = the day before yesterday (一昨日)!"}},{"romaji":"ashita","kana":"あした","kanji":"明日","meaning":"tomorrow","mnemonic":"明 (bright) + 日 (day) = the bright new day","breakdown":{"word":"明日","means":"tomorrow","hook":"The bright new day ahead.","parts":[{"k":"明","pos":"left","text":"'bright' — the sun 日 and the moon 月 side by side."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"明 (bright) + 日 (day) = the bright day to come, tomorrow (明日)!"}},{"romaji":"asatte","kana":"あさって","kanji":"明後日","meaning":"day after tomorrow","mnemonic":"明 (bright) + 後 (after) + 日 (day)","breakdown":{"word":"明後日","means":"day after tomorrow","hook":"One bright day, then one more.","parts":[{"k":"明","pos":"left","text":"'bright' (sun 日 + moon 月)."},{"k":"後","pos":"middle","text":"'after / later'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"明 (bright) + 後 (after) + 日 (day) = the day after tomorrow (明後日)!"}},{"romaji":"karendaa","kana":"カレンダー","meaning":"calendar","mnemonic":"Katakana loanword from English “calendar.”"},{"romaji":"tsuitachi","kana":"ついたち","kanji":"一日","meaning":"first of month","mnemonic":"一 (one) + 日 (day).","breakdown":{"word":"一日","means":"first of the month (also: one day)","hook":"Day number one — read ついたち.","parts":[{"k":"一","pos":"left","text":"'one'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"一 (one) + 日 (day) = the 1st of the month (一日)!"}},{"romaji":"futsuka","kana":"ふつか","kanji":"二日","meaning":"second day of the month","mnemonic":"二 (two) + 日 (day). Reads as “futsu + ka.”","breakdown":{"word":"二日","means":"2nd of the month (two days)","hook":"Number + 日, read ふつか.","parts":[{"k":"二","pos":"left","text":"'two'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"二 (two) + 日 (day) = the 2nd / two days (二日)!"}},{"romaji":"mikka","kana":"みっか","kanji":"三日","meaning":"third day of the month","mnemonic":"三 (three) + 日 (day). Reads as “mik + ka.”","breakdown":{"word":"三日","means":"3rd of the month (three days)","hook":"Number + 日, read みっか.","parts":[{"k":"三","pos":"left","text":"'three'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"三 (three) + 日 (day) = the 3rd / three days (三日)!"}},{"romaji":"yokka","kana":"よっか","kanji":"四日","meaning":"fourth day of the month","mnemonic":"四 (four) + 日 (day). Reads as “yok + ka.”","breakdown":{"word":"四日","means":"4th of the month (four days)","hook":"Number + 日, read よっか.","parts":[{"k":"四","pos":"left","text":"'four'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"四 (four) + 日 (day) = the 4th / four days (四日)!"}},{"romaji":"itsuka","kana":"いつか","kanji":"五日","meaning":"fifth day of the month","mnemonic":"五 (five) + 日 (day). Reads as “itsu + ka.”","breakdown":{"word":"五日","means":"5th of the month (five days)","hook":"Number + 日, read いつか.","parts":[{"k":"五","pos":"left","text":"'five'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"五 (five) + 日 (day) = the 5th / five days (五日)!"}},{"romaji":"muika","kana":"むいか","kanji":"六日","meaning":"sixth day of the month","mnemonic":"六 (six) + 日 (day). Reads as “mui + ka.”","breakdown":{"word":"六日","means":"6th of the month (six days)","hook":"Number + 日, read むいか.","parts":[{"k":"六","pos":"left","text":"'six'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"六 (six) + 日 (day) = the 6th / six days (六日)!"}},{"romaji":"nanoka","kana":"なのか","kanji":"七日","meaning":"the seventh day","mnemonic":"七 (seven) + 日 (day). Reads as “nano + ka.”","breakdown":{"word":"七日","means":"7th of the month (seven days)","hook":"Number + 日, read なのか.","parts":[{"k":"七","pos":"left","text":"'seven'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"七 (seven) + 日 (day) = the 7th / seven days (七日)!"}},{"romaji":"youka","kana":"ようか","kanji":"八日","meaning":"eighth day of the month","mnemonic":"八 (eight) + 日 (day). Reads as “you + ka.”","breakdown":{"word":"八日","means":"8th of the month (eight days)","hook":"Number + 日, read ようか.","parts":[{"k":"八","pos":"left","text":"'eight'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"八 (eight) + 日 (day) = the 8th / eight days (八日)!"}},{"romaji":"kokonoka","kana":"ここのか","kanji":"九日","meaning":"ninth day of the month","mnemonic":"九 (nine) + 日 (day). Reads as “kokono + ka.”","breakdown":{"word":"九日","means":"9th of the month (nine days)","hook":"Number + 日, read ここのか.","parts":[{"k":"九","pos":"left","text":"'nine'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"九 (nine) + 日 (day) = the 9th / nine days (九日)!"}},{"romaji":"tooka","kana":"とおか","kanji":"十日","meaning":"the tenth day","mnemonic":"十 (ten) + 日 (day). Reads as “too + ka.”","breakdown":{"word":"十日","means":"10th of the month (ten days)","hook":"Number + 日, read とおか.","parts":[{"k":"十","pos":"left","text":"'ten'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"十 (ten) + 日 (day) = the 10th / ten days (十日)!"}},{"romaji":"hatsuka","kana":"はつか","kanji":"二十日","meaning":"twenty days","mnemonic":"Special reading: 二十 (twenty) + 日 (day) fuse into はつか (not にじゅうにち). Also = the 20th.","breakdown":{"word":"二十日","means":"20th of the month (twenty days)","hook":"Twenty fuses into the special reading はつか.","parts":[{"k":"二十","pos":"left","text":"'twenty' (二 + 十)."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"二十 (twenty) + 日 (day) = the 20th, はつか (二十日)!"}},{"romaji":"mainichi","kana":"まいにち","kanji":"毎日","meaning":"every day","mnemonic":"毎 (every) + 日 (day).","breakdown":{"word":"毎日","means":"every day","hook":"Day in, day out, without fail.","parts":[{"k":"毎","pos":"left","text":"'every' — 𠂉 over 母 (mother), a recurring source."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"毎 (every) + 日 (day) = every single day (毎日)!"}},{"romaji":"yasumi","kana":"やすみ","kanji":"休み","meaning":"rest","mnemonic":"A person (亻) leaning against a tree (木) to rest.","breakdown":{"word":"休み","means":"rest, a break, holiday","hook":"A worker flops against a tree.","parts":[{"k":"亻","pos":"left","text":"the person radical — a worker."},{"k":"木","pos":"right","text":"'tree' — shade to lean on."}],"visualize":"A person (亻) resting against a tree (木) = a break, a rest (休み)!"}},{"romaji":"getsuyoubi","kana":"げつようび","kanji":"月曜日","meaning":"Monday","mnemonic":"月 = Moon | 曜日 = day of the week","breakdown":{"word":"月曜日","means":"Monday","hook":"Moon-day — like English 'Monday'.","parts":[{"k":"月","pos":"head","text":"'moon' — the element that names this day."},{"k":"曜日","pos":"tail","text":"'day of the week' — 曜 (sun 日 + wings 羽【はね】 over a bird 隹【すい】, light wheeling round) + 日 (day)."}],"visualize":"月 (moon) + 曜日 (day of the week) = Moon-day, Monday (月曜日)!"}},{"romaji":"kayoubi","kana":"かようび","kanji":"火曜日","meaning":"Tuesday","mnemonic":"火 = Fire","breakdown":{"word":"火曜日","means":"Tuesday","hook":"Fire-day (Mars day, like Romance languages).","parts":[{"k":"火","pos":"head","text":"'fire' — the element naming this day."},{"k":"曜日","pos":"tail","text":"'day of the week' (曜 + 日)."}],"visualize":"火 (fire) + 曜日 (day of the week) = Fire-day, Tuesday (火曜日)!"}},{"romaji":"suiyoubi","kana":"すいようび","kanji":"水曜日","meaning":"Wednesday","mnemonic":"水 = Water","breakdown":{"word":"水曜日","means":"Wednesday","hook":"Water-day.","parts":[{"k":"水","pos":"head","text":"'water' — the element naming this day."},{"k":"曜日","pos":"tail","text":"'day of the week' (曜 + 日)."}],"visualize":"水 (water) + 曜日 (day of the week) = Water-day, Wednesday (水曜日)!"}},{"romaji":"mokuyoubi","kana":"もくようび","kanji":"木曜日","meaning":"Thursday","mnemonic":"木 = Wood/Tree","breakdown":{"word":"木曜日","means":"Thursday","hook":"Wood-day.","parts":[{"k":"木","pos":"head","text":"'tree / wood' — the element naming this day."},{"k":"曜日","pos":"tail","text":"'day of the week' (曜 + 日)."}],"visualize":"木 (wood) + 曜日 (day of the week) = Wood-day, Thursday (木曜日)!"}},{"romaji":"kinyoubi","kana":"きんようび","kanji":"金曜日","meaning":"Friday","mnemonic":"金 = Gold/Money","breakdown":{"word":"金曜日","means":"Friday","hook":"Gold/metal-day.","parts":[{"k":"金","pos":"head","text":"'gold / metal / money' — the element naming this day."},{"k":"曜日","pos":"tail","text":"'day of the week' (曜 + 日)."}],"visualize":"金 (gold) + 曜日 (day of the week) = Gold-day, Friday (金曜日)!"}},{"romaji":"doyoubi","kana":"どようび","kanji":"土曜日","meaning":"Saturday","mnemonic":"土 = Earth/Soil","breakdown":{"word":"土曜日","means":"Saturday","hook":"Earth-day.","parts":[{"k":"土","pos":"head","text":"'earth / soil' — the element naming this day."},{"k":"曜日","pos":"tail","text":"'day of the week' (曜 + 日)."}],"visualize":"土 (earth) + 曜日 (day of the week) = Earth-day, Saturday (土曜日)!"}},{"romaji":"nichiyoubi","kana":"にちようび","kanji":"日曜日","meaning":"Sunday","mnemonic":"日 = Sun","breakdown":{"word":"日曜日","means":"Sunday","hook":"Sun-day — exactly like English.","parts":[{"k":"日","pos":"head","text":"'sun' — the element naming this day."},{"k":"曜日","pos":"tail","text":"'day of the week' (曜 + 日)."}],"visualize":"日 (sun) + 曜日 (day of the week) = Sun-day, Sunday (日曜日)!"}},{"romaji":"konshuu","kana":"こんしゅう","kanji":"今週","meaning":"this week","mnemonic":"今 (now/this) + 週 (week).","breakdown":{"word":"今週","means":"this week","hook":"The lap of seven days we're in now.","parts":[{"k":"今","pos":"left","text":"'now / this'."},{"k":"週","pos":"right","text":"'week' — 辶 (movement) carrying 周【しゅう】 (a full circuit/lap)."}],"visualize":"今 (this) + 週 (week-lap) = this week (今週)!"}},{"romaji":"raishuu","kana":"らいしゅう","kanji":"来週","meaning":"next week","mnemonic":"来 (to come) + 週 (week) = the coming week.","breakdown":{"word":"来週","means":"next week","hook":"The week coming toward you.","parts":[{"k":"来","pos":"left","text":"'to come'."},{"k":"週","pos":"right","text":"'week' (辶 + 周【しゅう】, a circuit)."}],"visualize":"来 (coming) + 週 (week) = next week (来週)!"}},{"romaji":"senshuu","kana":"せんしゅう","kanji":"先週","meaning":"last week","mnemonic":"先 (previous/ahead) + 週 (week).","breakdown":{"word":"先週","means":"last week","hook":"The week out ahead of you — in the past.","parts":[{"k":"先","pos":"left","text":"'previous / ahead' — a foot stepping out front."},{"k":"週","pos":"right","text":"'week' (辶 + 周【しゅう】)."}],"visualize":"先 (previous) + 週 (week) = last week (先週)!"}},{"romaji":"maishuu","kana":"まいしゅう","kanji":"毎週","meaning":"every week","mnemonic":"毎 (every) + 週 (week).","breakdown":{"word":"毎週","means":"every week","hook":"Week after week, no gaps.","parts":[{"k":"毎","pos":"left","text":"'every'."},{"k":"週","pos":"right","text":"'week' (辶 + 周【しゅう】)."}],"visualize":"毎 (every) + 週 (week) = every week (毎週)!"}},{"romaji":"kisetsu","kana":"きせつ","kanji":"季節","meaning":"season","mnemonic":"季【き】 (seasons) + 節【せつ】 (joint/node) = nodes of the year.","breakdown":{"word":"季節","means":"season","hook":"The year, marked off at its joints.","parts":[{"k":"季【き】","pos":"left","text":"'season' — grain 禾【か】 over a child 子, the young crop of a season."},{"k":"節【せつ】","pos":"right","text":"'joint / node' — bamboo 竹【たけ】 marking off segments of the year."}],"visualize":"季【き】 (season-crop) + 節【せつ】 (node) = the year's segments, the seasons (季節)!"}},{"romaji":"haru","kana":"はる","kanji":"春","meaning":"spring","mnemonic":"Three horizontal lines like warm air rising in the sun (日).","breakdown":{"word":"春","means":"spring","hook":"Warm air shimmering over the sun.","parts":[{"k":"𡗗","pos":"top","text":"three strokes like warm air / new shoots rising."},{"k":"日","pos":"bottom","text":"'sun' warming the ground."}],"visualize":"Warm air rising over the sun (日) = spring (春)!"}},{"romaji":"natsu","kana":"なつ","kanji":"夏","meaning":"summer","mnemonic":"Has the \"walking legs\" radical at the bottom; walking outside in the sun.","breakdown":{"word":"夏","means":"summer","hook":"Out walking under the high sun.","parts":[{"k":"頁","pos":"top","text":"a head/face turned to the heat."},{"k":"夂","pos":"bottom","text":"the 'walking legs' radical — strolling outdoors."}],"visualize":"A figure walking out (夂) in the blazing heat = summer (夏)!"}},{"romaji":"aki","kana":"あき","kanji":"秋","meaning":"autumn","mnemonic":"Grain/tree on the left, fire on the right = burning the harvested fields.","breakdown":{"word":"秋","means":"autumn","hook":"Burning the stubble after harvest.","parts":[{"k":"禾【か】","pos":"left","text":"'grain' — a stalk of ripe rice bending over."},{"k":"火","pos":"right","text":"'fire'."}],"visualize":"Grain 禾【か】 set beside fire (火) — torching the harvested fields = autumn (秋)!"}},{"romaji":"fuyu","kana":"ふゆ","kanji":"冬","meaning":"winter","mnemonic":"The bottom two dots represent ice/cold.","breakdown":{"word":"冬","means":"winter","hook":"Two dots of ice at the bottom.","parts":[{"k":"夂","pos":"top","text":"a figure trudging slowly."},{"k":"冫","pos":"bottom","text":"two ice-dots — frozen ground."}],"visualize":"A slow walk (夂) over ice (冫 dots) = winter (冬)!"}},{"romaji":"natsuyasumi","kana":"なつやすみ","kanji":"夏休み","meaning":"summer holiday","mnemonic":"夏 (summer) + 休み (rest).","breakdown":{"word":"夏休み","means":"summer holiday","hook":"The big break in the hot season.","parts":[{"k":"夏","pos":"left","text":"'summer' (walking out 夂 in the heat)."},{"k":"休み","pos":"right","text":"'rest' (a person 亻 by a tree 木)."}],"visualize":"夏 (summer) + 休み (rest) = the summer holiday (夏休み)!"}},{"romaji":"kongetsu","kana":"こんげつ","kanji":"今月","meaning":"this month","mnemonic":"今 (now/this) + 月 (month).","breakdown":{"word":"今月","means":"this month","hook":"The moon-cycle we're in now.","parts":[{"k":"今","pos":"left","text":"'now / this'."},{"k":"月","pos":"right","text":"'moon / month'."}],"visualize":"今 (this) + 月 (month) = this month (今月)!"}},{"romaji":"sengetsu","kana":"せんげつ","kanji":"先月","meaning":"last month","mnemonic":"先 (previous) + 月 (month).","breakdown":{"word":"先月","means":"last month","hook":"The month out ahead — now behind us.","parts":[{"k":"先","pos":"left","text":"'previous / ahead'."},{"k":"月","pos":"right","text":"'moon / month'."}],"visualize":"先 (previous) + 月 (month) = last month (先月)!"}},{"romaji":"raigetsu","kana":"らいげつ","kanji":"来月","meaning":"next month","mnemonic":"来 (to come) + 月 (month).","breakdown":{"word":"来月","means":"next month","hook":"The month coming up.","parts":[{"k":"来","pos":"left","text":"'to come'."},{"k":"月","pos":"right","text":"'moon / month'."}],"visualize":"来 (coming) + 月 (month) = next month (来月)!"}},{"romaji":"hitotsuki","kana":"ひとつき","kanji":"一月","meaning":"one month","mnemonic":"一 (one) + 月 (month).","breakdown":{"word":"一月","means":"one month (also January)","hook":"One turn of the moon.","parts":[{"k":"一","pos":"left","text":"'one'."},{"k":"月","pos":"right","text":"'moon / month'."}],"visualize":"一 (one) + 月 (month) = one month (一月)!"}},{"romaji":"maitsuki","kana":"まいつき","kanji":"毎月","meaning":"every month","mnemonic":"毎 (every) + 月 (month).","breakdown":{"word":"毎月","means":"every month","hook":"Month after month.","parts":[{"k":"毎","pos":"left","text":"'every'."},{"k":"月","pos":"right","text":"'moon / month'."}],"visualize":"毎 (every) + 月 (month) = every month (毎月)!"}},{"romaji":"toshi","kana":"とし","kanji":"年","meaning":"year","mnemonic":"年 = “year.” Read とし on its own, ねん in compounds.","breakdown":{"word":"年","means":"year","hook":"One full turn of the harvest.","parts":[{"k":"年","pos":"whole","text":"a person bearing grain — the cycle from sowing to harvest = one year."}],"visualize":"One harvest cycle = a year. 年 = year!"}},{"romaji":"kotoshi","kana":"ことし","kanji":"今年","meaning":"this year","mnemonic":"今 (now) + 年 (year).","breakdown":{"word":"今年","means":"this year","hook":"The harvest-cycle we're in now.","parts":[{"k":"今","pos":"left","text":"'now / this'."},{"k":"年","pos":"right","text":"'year'."}],"visualize":"今 (this) + 年 (year) = this year (今年)!"}},{"romaji":"kyonen","kana":"きょねん","kanji":"去年","meaning":"last year","mnemonic":"去 (past/gone) + 年 (year).","breakdown":{"word":"去年","means":"last year","hook":"The year that has gone.","parts":[{"k":"去","pos":"left","text":"'past / to leave' — earth 土 over 厶, walking off and away."},{"k":"年","pos":"right","text":"'year'."}],"visualize":"去 (gone) + 年 (year) = last year (去年)!"}},{"romaji":"ototoshi","kana":"おととし","kanji":"一昨年","meaning":"year before last","mnemonic":"一 (one) + 昨 (previous) + 年 (year), read irregularly as おととし.","breakdown":{"word":"一昨年","means":"year before last","hook":"Step one year past 'last year' (read おととし).","parts":[{"k":"一","pos":"left","text":"'one' more step back."},{"k":"昨","pos":"middle","text":"'previous' (the 乍【さ】 of passing time)."},{"k":"年","pos":"right","text":"'year'."}],"visualize":"一 (one back) + 昨 (previous) + 年 (year) = the year before last (一昨年)!"}},{"romaji":"rainen","kana":"らいねん","kanji":"来年","meaning":"next year","mnemonic":"来 (to come) + 年 (year).","breakdown":{"word":"来年","means":"next year","hook":"The year coming toward you.","parts":[{"k":"来","pos":"left","text":"'to come'."},{"k":"年","pos":"right","text":"'year'."}],"visualize":"来 (coming) + 年 (year) = next year (来年)!"}},{"romaji":"sarainen","kana":"さらいねん","kanji":"再来年","meaning":"year after next","mnemonic":"再【さい】 (again) + 来年 (next year).","breakdown":{"word":"再来年","means":"year after next","hook":"'Next year' — and then once again.","parts":[{"k":"再【さい】","pos":"left","text":"'again, a second time'."},{"k":"来年","pos":"right","text":"'next year' (来 coming + 年 year)."}],"visualize":"再【さい】 (again) + 来年 (next year) = the year after next (再来年)!"}},{"romaji":"maitoshi","kana":"まいとし","kanji":"毎年","meaning":"every year","mnemonic":"毎 (every) + 年 (year).","breakdown":{"word":"毎年","means":"every year","hook":"Year after year, every time round.","parts":[{"k":"毎","pos":"left","text":"'every'."},{"k":"年","pos":"right","text":"'year'."}],"visualize":"毎 (every) + 年 (year) = every year (毎年)!"}},{"romaji":"tanjoubi","kana":"たんじょうび","kanji":"誕生日","meaning":"birthday","mnemonic":"誕【たん】 (birth) + 生 (life) + 日 (day).","breakdown":{"word":"誕生日","means":"birthday","hook":"The day a life was announced.","parts":[{"k":"誕【たん】","pos":"left","text":"'birth' — words 言 stretched out (延) in proclamation."},{"k":"生","pos":"middle","text":"'life / to be born'."},{"k":"日","pos":"right","text":"'day'."}],"visualize":"誕【たん】 (birth) + 生 (life) + 日 (day) = the day of birth, a birthday (誕生日)!"}},{"romaji":"hatachi","kana":"はたち","kanji":"二十歳","meaning":"20 years old","mnemonic":"Special reading (jukujikun): 二十歳 = はたち, the coming-of-age count, not にじゅっさい.","breakdown":{"word":"二十歳","means":"20 years old","hook":"The coming-of-age count — special reading はたち, not にじゅっさい.","parts":[{"k":"二十","pos":"left","text":"'twenty' (二 + 十)."},{"k":"歳","pos":"right","text":"'years of age' — 止 (a footstep) marking each year that passes."}],"visualize":"二十 (twenty) + 歳 (years old) = age twenty, はたち (二十歳)!"}}],"level":"N5"},{"name":"Weather, Animals & Time","cards":[{"romaji":"tenki","kana":"てんき","kanji":"天気","meaning":"weather","mnemonic":"天 (heaven/sky) + 気 (spirit/air).","breakdown":{"word":"天気","means":"weather","hook":"The mood of the sky.","parts":[{"k":"天","pos":"left","text":"'heaven / sky' — 一 (a line) over 大 (a big person): the great expanse above."},{"k":"気","pos":"right","text":"'spirit / air' — 气【き】, rising vapour."}],"visualize":"天 (sky) + 気 (air/spirit) = the sky's temper, the weather (天気)!"}},{"romaji":"hare","kana":"はれ","kanji":"晴れ","meaning":"clear weather / sunny","mnemonic":"日 (sun) standing next to 青 (blue) = clear blue sky.","breakdown":{"word":"晴れ","means":"clear / sunny weather","hook":"Sun next to clear blue.","parts":[{"k":"日","pos":"left","text":"'sun'."},{"k":"青","pos":"right","text":"'blue' (fresh growth under a moon)."}],"visualize":"日 (sun) standing beside 青 (blue) = a clear blue sky, sunny (晴れ)!"}},{"romaji":"ame","kana":"あめ","kanji":"雨","meaning":"rain","mnemonic":"Looks like a window with raindrops falling down inside it.","breakdown":{"word":"雨","means":"rain","hook":"Look through the window at the falling drops.","parts":[{"k":"雨","pos":"whole","text":"a window-frame 冂 with a line of cloud across it and four drops falling inside."}],"visualize":"Drops falling behind a windowpane = rain. 雨 = rain!"}},{"romaji":"kumori","kana":"くもり","kanji":"曇り","meaning":"cloudy weather","mnemonic":"日 (sun) sitting over a 雲【くも】 (cloud).","breakdown":{"word":"曇り","means":"cloudy weather","hook":"The sun shut away above the clouds.","parts":[{"k":"日","pos":"top","text":"'sun'."},{"k":"雲【くも】","pos":"bottom","text":"'cloud' — rain 雨 over 云, a billowing mass."}],"visualize":"日 (sun) sitting on top of a 雲【くも】 (cloud) that blocks it = cloudy (曇り)!"}},{"romaji":"yuki","kana":"ゆき","kanji":"雪","meaning":"snow","mnemonic":"雨 (rain) falling onto a sweeping hand (ヨ) catching it.","breakdown":{"word":"雪","means":"snow","hook":"Rain you can sweep up by hand.","parts":[{"k":"雨","pos":"top","text":"'rain' — precipitation from the sky."},{"k":"ヨ","pos":"bottom","text":"a sweeping hand / broom catching what falls."}],"visualize":"雨 (rain) landing on a sweeping hand (ヨ) — soft enough to brush away = snow (雪)!"}},{"romaji":"kaze","kana":"かぜ","kanji":"風","meaning":"wind","mnemonic":"A bug (虫【むし】) caught inside a massive gust of wind (几).","breakdown":{"word":"風","means":"wind","hook":"A bug swept up inside a gust.","parts":[{"k":"几","pos":"frame","text":"a sail / gust enclosure billowing out."},{"k":"虫【むし】","pos":"inside","text":"'bug / insect' tossed about inside the gust."}],"visualize":"A bug 虫【むし】 caught in a billowing gust (几) = the wind. 風 = wind!"}},{"romaji":"sora","kana":"そら","kanji":"空","meaning":"sky","mnemonic":"A hole (穴【あな】) combined with work/craft (工), representing the vast empty space above.","breakdown":{"word":"空","means":"sky, empty","hook":"The vast hollow overhead.","parts":[{"k":"穴【あな】","pos":"top","text":"'hole / cave' — an opening, an emptiness."},{"k":"工","pos":"bottom","text":"'work / craft' — props holding the hollow open."}],"visualize":"A hole 穴【あな】 propped open by craft (工) into a vast emptiness = the sky. 空 = sky / empty!"}},{"romaji":"doubutsu","kana":"どうぶつ","kanji":"動物","meaning":"animal","mnemonic":"動 (moving) + 物 (thing) = moving things.","breakdown":{"word":"動物","means":"animal","hook":"Things that move.","parts":[{"k":"動","pos":"left","text":"'to move' — something heavy 重 driven by power 力."},{"k":"物","pos":"right","text":"'thing' — an ox 牛 beside 勿【ぶつ】, i.e. an object."}],"visualize":"動 (moving) + 物 (thing) = moving things, animals (動物)!"}},{"romaji":"inu","kana":"いぬ","kanji":"犬","meaning":"dog","mnemonic":"A big (大) animal with an extra drop (representing an ear or tail).","breakdown":{"word":"犬","means":"dog","hook":"A big beast with a flicking ear.","parts":[{"k":"大","pos":"base","text":"'big' — a large animal."},{"k":"丶","pos":"corner","text":"one extra drop — its pricked ear (or wagging tail)."}],"visualize":"A big (大) creature with one extra mark for its ear = a dog. 犬 = dog!"}},{"romaji":"tori","kana":"とり","kanji":"鳥","meaning":"bird","mnemonic":"Visually looks like a bird facing left with a tail at the bottom (灬).","breakdown":{"word":"鳥","means":"bird","hook":"A bird in profile, tail-feathers fanned.","parts":[{"k":"鳥","pos":"whole","text":"a bird facing left — eye and crest on top, body in the middle, tail-feathers 灬 fanned beneath."}],"visualize":"A side-on bird with fanned tail = a bird. 鳥 = bird!"}},{"romaji":"neko","kana":"ねこ","kanji":"猫","meaning":"cat","mnemonic":"The animal radical (犭) next to a seedling (苗【なえ】).","breakdown":{"word":"猫","means":"cat","hook":"The little beast that prowls the seedlings.","parts":[{"k":"犭","pos":"left","text":"the animal/beast radical."},{"k":"苗【なえ】","pos":"right","text":"'seedling / sprout' — a cat creeping through the young plants."}],"visualize":"A beast (犭) slinking among the seedlings 苗【なえ】 = a cat. 猫 = cat!"}},{"romaji":"petto","kana":"ペット","meaning":"pet","mnemonic":"Katakana loanword from English “pet.”"},{"romaji":"jikan","kana":"じかん","kanji":"時間","meaning":"time","mnemonic":"時 (time/hour) + 間 (interval/space).","breakdown":{"word":"時間","means":"time","hook":"The hour, and the gap between hours.","parts":[{"k":"時","pos":"left","text":"'time / hour' — the sun 日 beside a temple 寺【てら】, where the day's hours were rung."},{"k":"間","pos":"right","text":"'interval' — sunlight 日 showing through a gate 門【もん】, the gap between."}],"visualize":"時 (hour) + 間 (interval) = stretches of time (時間)!"}},{"romaji":"asa","kana":"あさ","kanji":"朝","meaning":"morning","mnemonic":"The moon (月) fading as the sun rises through the mist (十/日/十).","breakdown":{"word":"朝","means":"morning","hook":"Sun rising through the reeds as the moon fades.","parts":[{"k":"龺","pos":"left","text":"the sun 日 rising amid grass / reeds (十…日…十)."},{"k":"月","pos":"right","text":"'moon' — still pale in the dawn sky."}],"visualize":"Sun climbing through the reeds beside the fading moon (月) = morning (朝)!"}},{"romaji":"kesa","kana":"けさ","kanji":"今朝","meaning":"this morning","mnemonic":"Special reading: 今 (now) + 朝 (morning) fuse into けさ.","breakdown":{"word":"今朝","means":"this morning","hook":"'Now' + 'morning' fuse into the special reading けさ.","parts":[{"k":"今","pos":"left","text":"'now / this'."},{"k":"朝","pos":"right","text":"'morning' (sun through reeds + fading moon 月)."}],"visualize":"今 (this) + 朝 (morning) = this morning, けさ (今朝)!"}},{"romaji":"maiasa","kana":"まいあさ","kanji":"毎朝","meaning":"every morning","mnemonic":"毎 (every) + 朝 (morning).","breakdown":{"word":"毎朝","means":"every morning","hook":"Morning after morning.","parts":[{"k":"毎","pos":"left","text":"'every'."},{"k":"朝","pos":"right","text":"'morning'."}],"visualize":"毎 (every) + 朝 (morning) = every morning (毎朝)!"}},{"romaji":"hiru","kana":"ひる","kanji":"昼","meaning":"noon","mnemonic":"A flag or sun resting high above the horizon.","breakdown":{"word":"昼","means":"noon, daytime","hook":"The sun pinned high over the horizon.","parts":[{"k":"尺","pos":"top","text":"a measuring hand marking the sun's height."},{"k":"旦","pos":"bottom","text":"the sun 日 resting on the horizon line 一."}],"visualize":"The sun measured at its high point over the horizon = midday. 昼 = noon!"}},{"romaji":"yuugata","kana":"ゆうがた","kanji":"夕方","meaning":"evening","mnemonic":"夕 (evening/crescent moon) + 方 (direction).","breakdown":{"word":"夕方","means":"evening","hook":"The hour of the crescent moon.","parts":[{"k":"夕","pos":"left","text":"'evening' — a thin crescent moon."},{"k":"方","pos":"right","text":"'direction / time-of-day'."}],"visualize":"夕 (crescent-moon hour) + 方 (time-of-day) = early evening (夕方)!"}},{"romaji":"yoru","kana":"よる","kanji":"夜","meaning":"night","mnemonic":"A person resting under a roof as the moon comes up.","breakdown":{"word":"夜","means":"night","hook":"A person sheltering as the moon comes out.","parts":[{"k":"亠","pos":"top","text":"a roof to shelter under."},{"k":"夕","pos":"inside","text":"'evening moon' tucked beneath the roof — darkness fallen."}],"visualize":"A person under a roof with the evening moon 夕 risen = night. 夜 = night!"}},{"romaji":"sakuya","kana":"さくや","kanji":"昨夜","meaning":"last night","mnemonic":"昨 (previous) + 夜 (night).","breakdown":{"word":"昨夜","means":"last night","hook":"The night just gone.","parts":[{"k":"昨","pos":"left","text":"'previous' — 日 (day) with 乍【さ】, time just passed."},{"k":"夜","pos":"right","text":"'night' (a figure under a roof with the moon 夕)."}],"visualize":"昨 (just-passed) + 夜 (night) = last night (昨夜)!"}},{"romaji":"ban","kana":"ばん","kanji":"晩","meaning":"evening","mnemonic":"日 (sun) + 免【めん】 (excuse/escape) = the sun escaping the sky.","breakdown":{"word":"晩","means":"evening, nightfall","hook":"The sun making its escape.","parts":[{"k":"日","pos":"left","text":"'sun'."},{"k":"免【めん】","pos":"right","text":"'to escape / be excused' — the sun slipping away."}],"visualize":"The sun (日) making its escape 免【めん】 below the horizon = nightfall. 晩 = evening!"}},{"romaji":"maiban","kana":"まいばん","kanji":"毎晩","meaning":"every night","mnemonic":"毎 (every) + 晩 (evening).","breakdown":{"word":"毎晩","means":"every night","hook":"Night after night.","parts":[{"k":"毎","pos":"left","text":"'every'."},{"k":"晩","pos":"right","text":"'evening' (the sun 日 escaping 免【めん】)."}],"visualize":"毎 (every) + 晩 (evening) = every night (毎晩)!"}},{"romaji":"konban","kana":"こんばん","kanji":"今晩","meaning":"this evening / tonight","mnemonic":"今 (now) + 晩 (evening).","breakdown":{"word":"今晩","means":"this evening, tonight","hook":"The evening happening now.","parts":[{"k":"今","pos":"left","text":"'now / this'."},{"k":"晩","pos":"right","text":"'evening'."}],"visualize":"今 (this) + 晩 (evening) = tonight (今晩)!"}},{"romaji":"gozen","kana":"ごぜん","kanji":"午前","meaning":"morning (AM)","mnemonic":"午 (noon) + 前 (before) = before noon.","breakdown":{"word":"午前","means":"morning, a.m.","hook":"The hours before noon.","parts":[{"k":"午","pos":"left","text":"'noon' — the marker post at midday."},{"k":"前","pos":"right","text":"'before / in front'."}],"visualize":"午 (noon) + 前 (before) = before noon, a.m. (午前)!"}},{"romaji":"gogo","kana":"ごご","kanji":"午後","meaning":"afternoon (PM)","mnemonic":"午 (noon) + 後 (after) = after noon.","breakdown":{"word":"午後","means":"afternoon, p.m.","hook":"The hours after noon.","parts":[{"k":"午","pos":"left","text":"'noon'."},{"k":"後","pos":"right","text":"'after / behind' — 彳 (a step) trailing behind."}],"visualize":"午 (noon) + 後 (after) = after noon, p.m. (午後)!"}},{"romaji":"ato","kana":"あと","kanji":"後","meaning":"afterwards","mnemonic":"後 = “after / behind” — the same 後 as うしろ (“behind”).","breakdown":{"word":"後","means":"afterwards, behind","hook":"Dragging along at the back.","parts":[{"k":"彳","pos":"left","text":"the 'step' radical — walking."},{"k":"幺夂","pos":"right","text":"a tangled thread 幺 and a slow foot 夂 — lagging, coming after."}],"visualize":"Walking (彳) but trailing with slow feet (夂) = behind, afterwards. 後 = after!"}},{"romaji":"saki","kana":"さき","kanji":"先","meaning":"the future / ahead","mnemonic":"A person moving forward ahead of others.","breakdown":{"word":"先","means":"ahead, the future, previous","hook":"A foot striding out in front.","parts":[{"k":"先","pos":"whole","text":"a leg 儿 with a foot 𠂉 thrust out ahead of everyone else."}],"visualize":"One foot pushed out front of the rest = ahead. 先 = ahead / earlier!"}},{"romaji":"ima","kana":"いま","kanji":"今","meaning":"now","mnemonic":"今 = “now”: a lid placed over the present moment. (Also in 今日, きょう.)","breakdown":{"word":"今","means":"now","hook":"A lid clapped over the present moment.","parts":[{"k":"今","pos":"whole","text":"a roof 𠆢 closing over a tuck 𠃌 — the present, captured right here."}],"visualize":"A lid sealing this very instant = now. 今 = now!"}},{"romaji":"tsugi","kana":"つぎ","kanji":"次","meaning":"next","mnemonic":"Looks like someone pausing, then taking the next step.","breakdown":{"word":"次","means":"next","hook":"A yawn, a pause, then the next step.","parts":[{"k":"冫","pos":"left","text":"two strokes — breath, or a brief pause."},{"k":"欠","pos":"right","text":"'lack / yawn' — a person stopping mid-stride."}],"visualize":"Pause (冫) by a yawning figure (欠) before moving on = the next one. 次 = next!"}},{"romaji":"tokei","kana":"とけい","kanji":"時計","meaning":"clock","mnemonic":"時 (time) + 計 (measure).","breakdown":{"word":"時計","means":"clock, watch","hook":"A machine that measures the hours.","parts":[{"k":"時","pos":"left","text":"'time / hour' (sun 日 + temple 寺【てら】)."},{"k":"計","pos":"right","text":"'to measure' — words 言 counting up to ten 十."}],"visualize":"時 (time) + 計 (measure) = the thing that measures time, a clock (時計)!"}}],"level":"N5"},{"name":"Food, Drinks, Body","cards":[{"romaji":"gohan","kana":"ごはん","kanji":"ご飯","meaning":"cooked rice / meal","mnemonic":"食 (eat) on the left, 反 (anti/return) on the right."},{"romaji":"asagohan","kana":"あさごはん","kanji":"朝ご飯","meaning":"breakfast","mnemonic":"朝 (morning) + ご飯 (cooked rice/meal)."},{"romaji":"hirugohan","kana":"ひるごはん","kanji":"昼ご飯","meaning":"lunch","mnemonic":"昼 (noon) + ご飯 (meal)."},{"romaji":"bangohan","kana":"ばんごはん","kanji":"晩ご飯","meaning":"dinner","mnemonic":"晩 (evening) + ご飯 (meal)."},{"romaji":"yuuhan","kana":"ゆうはん","kanji":"夕飯","meaning":"dinner","mnemonic":"夕 (evening) + 飯 (meal)."},{"romaji":"obentou","kana":"おべんとう","kanji":"お弁当","meaning":"packed lunch","mnemonic":"弁【べん】 (manage) + 当 (apt) → 弁当, a packed lunch box. Learn 弁当 as a set."},{"romaji":"ryouri","kana":"りょうり","kanji":"料理","meaning":"cuisine","mnemonic":"料 (materials) + 理 (logic/arrangement). Arranging ingredients."},{"romaji":"karee","kana":"カレー","meaning":"curry","mnemonic":"Katakana loanword from English “curry.”"},{"romaji":"pan","kana":"パン","meaning":"bread","mnemonic":"Katakana loanword from Portuguese “pão” (bread)."},{"romaji":"tamago","kana":"たまご","kanji":"卵","meaning":"egg","mnemonic":"Looks like two yolks sitting inside an egg carton."},{"romaji":"niku","kana":"にく","kanji":"肉","meaning":"meat","mnemonic":"Looks like ribs or pieces of meat hanging in a window."},{"romaji":"gyuuniku","kana":"ぎゅうにく","kanji":"牛肉","meaning":"beef","mnemonic":"牛 (cow) + 肉 (meat)."},{"romaji":"butaniku","kana":"ぶたにく","kanji":"豚肉","meaning":"pork","mnemonic":"月 (flesh radical) next to 豕【し】 (pig)."},{"romaji":"toriniku","kana":"とりにく","kanji":"鳥肉","meaning":"chicken meat","mnemonic":"鳥 (bird) + 肉 (meat)."},{"romaji":"sakana","kana":"さかな","kanji":"魚","meaning":"fish","mnemonic":"Top is a head, middle is a scaly body, bottom (灬) is the tail/fins."},{"romaji":"yasai","kana":"やさい","kanji":"野菜","meaning":"vegetable","mnemonic":"野 (field) + 菜【さい】 (vegetable/greens, identifiable by the grass radical 艹)."},{"romaji":"kudamono","kana":"くだもの","kanji":"果物","meaning":"fruit","mnemonic":"果 (fruit: a tree 木 bearing a round fruit 田) + 物 (thing)."},{"romaji":"tabemono","kana":"たべもの","kanji":"食べ物","meaning":"food","mnemonic":"食 (eat) + 物 (thing)."},{"romaji":"nomimono","kana":"のみもの","kanji":"飲み物","meaning":"a drink","mnemonic":"飲 (drink: food 食 + yawn/lack 欠) + 物 (thing)."},{"romaji":"mizu","kana":"みず","kanji":"水","meaning":"water","mnemonic":"Looks like splashing water."},{"romaji":"gyuunyuu","kana":"ぎゅうにゅう","kanji":"牛乳","meaning":"milk","mnemonic":"牛 (cow) + 乳【にゅう】 (milk - looks like a baby floating near a hook)."},{"romaji":"ocha","kana":"おちゃ","kanji":"お茶","meaning":"tea","mnemonic":"艹 (grass/plant) over a person resting in a wooden (木) pavilion."},{"romaji":"koucha","kana":"こうちゃ","kanji":"紅茶","meaning":"black tea","mnemonic":"紅【こう】 (deep red) + 茶 (tea). In Japanese, it translates literally to \"red tea\"."},{"romaji":"koohii","kana":"コーヒー","meaning":"coffee","mnemonic":"Katakana loanword from Dutch “koffie” / English “coffee.”"},{"romaji":"osake","kana":"おさけ","kanji":"お酒","meaning":"alcohol","mnemonic":"氵 (water) next to 酉【とり】 (an alcohol jug)."},{"romaji":"satou","kana":"さとう","kanji":"砂糖","meaning":"sugar","mnemonic":"砂【すな】 (sand - made of stone 石 + few 少) + 糖【とう】 (sugar)."},{"romaji":"shio","kana":"しお","kanji":"塩","meaning":"salt","mnemonic":"土 (earth) + a person lying over a container."},{"romaji":"shouyu","kana":"しょうゆ","kanji":"醤油","meaning":"soy sauce","mnemonic":"Usually just written in Kana at the N5 level."},{"romaji":"bataa","kana":"バター","meaning":"butter","mnemonic":"Katakana loanword from English “butter.”"},{"romaji":"okashi","kana":"おかし","kanji":"お菓子","meaning":"sweets","mnemonic":"菓【か】 (confectionery: grass 艹 + fruit 果) + 子 (child)."},{"romaji":"ame","kana":"あめ","kanji":"飴","meaning":"candy","mnemonic":"食 (food) + 台 (pedestal) → sweet food on a stick. Often written in kana."},{"romaji":"kusuri","kana":"くすり","kanji":"薬","meaning":"medicine","mnemonic":"艹 (grass/plant) over 楽 (comfort/ease) = plants that bring ease."},{"romaji":"osara","kana":"おさら","kanji":"お皿","meaning":"plate","mnemonic":"皿【さら】 (plate/dish) - looks like a wide shallow bowl."},{"romaji":"kappu","kana":"カップ","meaning":"cup","mnemonic":"Katakana loanword from English “cup.”"},{"romaji":"koppu","kana":"コップ","meaning":"a glass","mnemonic":"Katakana loanword from Dutch “kop” (a drinking glass)."},{"romaji":"chawan","kana":"ちゃわん","kanji":"茶碗","meaning":"rice bowl","mnemonic":"茶 (tea) + 碗【わん】 (porcelain bowl)."},{"romaji":"hashi","kana":"はし","kanji":"箸","meaning":"chopsticks","mnemonic":"竹【たけ】 (bamboo) radical at the top over 者 (person)."},{"romaji":"supuun","kana":"スプーン","meaning":"spoon","mnemonic":"Katakana loanword from English “spoon.”"},{"romaji":"fooku","kana":"フォーク","meaning":"fork","mnemonic":"Katakana loanword from English “fork.”"},{"romaji":"naifu","kana":"ナイフ","meaning":"knife","mnemonic":"Katakana loanword from English “knife.”"},{"romaji":"karada","kana":"からだ","kanji":"体","meaning":"body","mnemonic":"亻 (person) + 本 (root/origin) = the root of a person is their body."},{"romaji":"atama","kana":"あたま","kanji":"頭","meaning":"head","mnemonic":"豆【まめ】 (bean) + 頁【けつ】 (head). Think of a head as a bean on top of the body!"},{"romaji":"me","kana":"め","kanji":"目","meaning":"eye","mnemonic":"A picture of an eye turned sideways."},{"romaji":"mimi","kana":"みみ","kanji":"耳","meaning":"ear","mnemonic":"A picture of an ear with cartilage ridges."},{"romaji":"hana","kana":"はな","kanji":"鼻","meaning":"nose","mnemonic":"自 (self - people point to their nose to say \"me\") over a field 田 and two hands."},{"romaji":"kuchi","kana":"くち","kanji":"口","meaning":"mouth","mnemonic":"An open mouth (square)."},{"romaji":"ha","kana":"は","kanji":"歯","meaning":"tooth","mnemonic":"止 (stop) over an open mouth containing teeth."},{"romaji":"onaka","kana":"おなか","kanji":"お腹","meaning":"stomach","mnemonic":"月 (flesh radical) + 復【ふく】 (“return” shape) → the belly. Often written お腹 in kana."},{"romaji":"te","kana":"て","kanji":"手","meaning":"hand","mnemonic":"Lines representing fingers and a palm."},{"romaji":"ashi","kana":"あし","kanji":"足","meaning":"foot / leg","mnemonic":"An open mouth (口) above a person running."},{"romaji":"koe","kana":"こえ","kanji":"声","meaning":"voice","mnemonic":"A samurai (士【し】) over a flag/ear (taking charge with their voice)."},{"romaji":"se","kana":"せ","kanji":"背","meaning":"height / back","mnemonic":"北 (north/back to back) over 月 (flesh)."},{"romaji":"byouki","kana":"びょうき","kanji":"病気","meaning":"illness","mnemonic":"疒 (sickness radical) covering 丙【へい】 + 気 (spirit/energy) = sick energy."}],"level":"N5"},{"name":"People & Family","cards":[{"romaji":"otoko","kana":"おとこ","kanji":"男","meaning":"man","mnemonic":"Field (田) + Power/Strength (力). Men traditionally worked the fields."},{"romaji":"onna","kana":"おんな","kanji":"女","meaning":"woman","mnemonic":"Looks like a woman gracefully crossing her legs or holding a child."},{"romaji":"otokonoko","kana":"おとこのこ","kanji":"男の子","meaning":"boy","mnemonic":"男 (man) + の (particle) + 子 (child)."},{"romaji":"onnanoko","kana":"おんなのこ","kanji":"女の子","meaning":"girl","mnemonic":"女 (woman) + の (particle) + 子 (child)."},{"romaji":"watashi","kana":"わたし","kanji":"私","meaning":"I, me","mnemonic":"Grain (禾【か】) + Private (ム) = My private harvest."},{"romaji":"anata","kana":"あなた","kanji":"貴方","meaning":"you","mnemonic":"Polite “you,” literally “that noble person.” Almost always written in kana: あなた."},{"romaji":"kazoku","kana":"かぞく","kanji":"家族","meaning":"family","mnemonic":"家 (house) + 族 (tribe/clan) = The tribe inside the house."},{"romaji":"ojiisan","kana":"おじいさん","kanji":"お祖父さん","meaning":"grandfather","mnemonic":"祖父 (“grandfather,” lit. ancestor-father); the お…さん form おじいさん is usual."},{"romaji":"obaasan","kana":"おばあさん","kanji":"お祖母さん","meaning":"grandmother","mnemonic":"祖母 (“grandmother,” lit. ancestor-mother); the お…さん form おばあさん is usual."},{"romaji":"otousan","kana":"おとうさん","kanji":"お父さん","meaning":"father","mnemonic":"父 (father) + honorifics. Looks like a stern face or two crossed axes."},{"romaji":"okaasan","kana":"おかあさん","kanji":"お母さん","meaning":"mother","mnemonic":"母 (mother). Looks like a mother nursing with two drops."},{"romaji":"ryoushin","kana":"りょうしん","kanji":"両親","meaning":"both parents","mnemonic":"両 (both) + 親 (parent/intimate)."},{"romaji":"ane","kana":"あね","kanji":"姉","meaning":"older sister (own)","mnemonic":"姉 = older sister. Plain 姉 is humble, for your OWN sister; お姉さん is for others’."},{"romaji":"ani","kana":"あに","kanji":"兄","meaning":"older brother  (own)","mnemonic":"Same kanji as above. Used for your own older brother."},{"romaji":"oneesan","kana":"おねえさん","kanji":"お姉さん","meaning":"older sister","mnemonic":"女 (woman) + 市 (market). The woman who goes to the market."},{"romaji":"oniisan","kana":"おにいさん","kanji":"お兄さん","meaning":"older brother","mnemonic":"兄 (older brother) = A speaking mouth (口) giving orders over human legs (儿)."},{"romaji":"otouto","kana":"おとうと","kanji":"弟","meaning":"younger brother","mnemonic":"Looks like a bow with a string wrapped around it."},{"romaji":"imouto","kana":"いもうと","kanji":"妹","meaning":"younger sister","mnemonic":"女 (woman) + 未 (not yet). The woman who is not yet fully grown."},{"romaji":"kyoudai","kana":"きょうだい","kanji":"兄弟","meaning":"brother / siblings","mnemonic":"兄 (older brother) + 弟 (younger brother)."},{"romaji":"ojisan","kana":"おじさん","kanji":"伯父さん","meaning":"uncle","mnemonic":"Uncle. Usually written in kana おじさん — one mora shorter than おじいさん (“grandpa”)."},{"romaji":"obasan","kana":"おばさん","kanji":"伯母さん","meaning":"aunt","mnemonic":"Aunt. Usually written in kana おばさん — one mora shorter than おばあさん (“grandma”)."},{"romaji":"okusan","kana":"おくさん","kanji":"奥さん","meaning":"wife","mnemonic":"奥【おく】 (inner/interior). The person in the inner part of the house."},{"romaji":"otona","kana":"おとな","kanji":"大人","meaning":"adult","mnemonic":"大 (big) + 人 (person)."},{"romaji":"kodomo","kana":"こども","kanji":"子供","meaning":"child","mnemonic":"子 (child) + 供 (companion)."},{"romaji":"isha","kana":"いしゃ","kanji":"医者","meaning":"doctor","mnemonic":"医 (medicine/healing) + 者 (person)."},{"romaji":"omawarisan","kana":"おまわりさん","kanji":"お巡りさん","meaning":"policeman","mnemonic":"Lit. “honorable Mr. Go-around” — the officer who walks the beat. Usually kana."},{"romaji":"keikan","kana":"けいかん","kanji":"警官","meaning":"policeman","mnemonic":"警 (guard/admonish) + 官 (official) → a police officer."},{"romaji":"sensei","kana":"せんせい","kanji":"先生","meaning":"teacher","mnemonic":"先 (before/ahead) + 生 (life). Born before you, holding wisdom."},{"romaji":"gakusei","kana":"がくせい","kanji":"学生","meaning":"student","mnemonic":"学 (study/learning) + 生 (life)."},{"romaji":"seito","kana":"せいと","kanji":"生徒","meaning":"student","mnemonic":"生 (life) + 徒 (junior/follower)."},{"romaji":"ryuugakusei","kana":"りゅうがくせい","kanji":"留学生","meaning":"overseas student","mnemonic":"留 (stay/detain) + 学生 (student)."},{"romaji":"gaikokujin","kana":"がいこくじん","kanji":"外国人","meaning":"foreigner","mnemonic":"外 (outside) + 国 (country) + 人 (person)."},{"romaji":"tomodachi","kana":"ともだち","kanji":"友達","meaning":"friend","mnemonic":"友 (friend: two hands holding) + 達 (plural)."},{"romaji":"issho","kana":"いっしょ","kanji":"一緒","meaning":"together","mnemonic":"一 (one) + 緒 (cord). Tied together into one cord."},{"romaji":"kekkon","kana":"けっこん","kanji":"結婚","meaning":"marriage","mnemonic":"結【けつ】 (tie) + 婚 (marriage)."},{"romaji":"katei","kana":"かてい","kanji":"家庭","meaning":"household","mnemonic":"家 (house) + 庭 (garden)."},{"romaji":"namae","kana":"なまえ","kanji":"名前","meaning":"name","mnemonic":"名 (name: evening 夕 + mouth 口, identifying yourself in the dark) + 前 (before)."},{"romaji":"jibun","kana":"じぶん","kanji":"自分","meaning":"myself","mnemonic":"自 (self) + 分 (part). My part."},{"romaji":"dare","kana":"だれ","kanji":"誰","meaning":"who","mnemonic":"Words (言) + Turkey (隹【すい】). A talking bird? Who is that!"},{"romaji":"donata","kana":"どなた","kanji":"何方","meaning":"who (polite)","mnemonic":"Polite “who?”: the ど- question word + 方 (person). Usually kana どなた."},{"romaji":"hito","kana":"ひと","kanji":"人","meaning":"person","mnemonic":"Two legs walking."},{"romaji":"kata","kana":"かた","kanji":"方","meaning":"person (polite)","mnemonic":"A square/direction. Used respectfully."},{"romaji":"hitori","kana":"ひとり","kanji":"一人","meaning":"one person","mnemonic":"一 (one) + 人 (person)."},{"romaji":"futari","kana":"ふたり","kanji":"二人","meaning":"two people","mnemonic":"二 (two) + 人 (person)."},{"romaji":"oozei","kana":"おおぜい","kanji":"大勢","meaning":"many people","mnemonic":"大 (big) + 勢【せい】 (force/crowd)."},{"romaji":"minasan","kana":"みなさん","kanji":"皆さん","meaning":"everyone","mnemonic":"皆 (all) + san."},{"romaji":"minna","kana":"みんな","kanji":"皆","meaning":"everyone","mnemonic":"皆 = “all / everyone.” みんな is the casual form of みな."},{"romaji":"dareka","kana":"だれか","kanji":"誰か","meaning":"somebody","mnemonic":"誰 (who) + か (question particle)."}],"level":"N5"},{"name":"Buildings, Places, Directions","cards":[{"romaji":"higashi","kana":"ひがし","kanji":"東","meaning":"east","mnemonic":"Sun (日) rising through the trees (木)."},{"romaji":"nishi","kana":"にし","kanji":"西","meaning":"west","mnemonic":"Looks like a bird returning to its nest at sunset."},{"romaji":"minami","kana":"みなみ","kanji":"南","meaning":"south","mnemonic":"A cross inside a downward-facing enclosure."},{"romaji":"kita","kana":"きた","kanji":"北","meaning":"north","mnemonic":"Two people sitting back-to-back to stay warm."},{"romaji":"hidari","kana":"ひだり","kanji":"左","meaning":"left","mnemonic":"A hand (ナ) holding a tool/craft (工)."},{"romaji":"migi","kana":"みぎ","kanji":"右","meaning":"right","mnemonic":"A hand (ナ) bringing food to the mouth (口)."},{"romaji":"koko","kana":"ここ","kanji":"此処","meaning":"here","mnemonic":"こ-series (near the speaker): ここ = “here, by me.” Usually kana."},{"romaji":"soko","kana":"そこ","kanji":"其処","meaning":"there","mnemonic":"そ-series (near the listener): そこ = “there, by you.” Usually kana."},{"romaji":"asoko","kana":"あそこ","kanji":"彼処","meaning":"over there","mnemonic":"あ-series (far from both): あそこ = “over there.” Usually kana."},{"romaji":"achira","kana":"あちら","kanji":"彼方","meaning":"over there","mnemonic":"Polite あ-series: あちら = “over there / that one” (far). Usually kana."},{"romaji":"kochira","kana":"こちら","kanji":"此方","meaning":"this way","mnemonic":"Polite こ-series: こちら = “this way / this one” (by me). Usually kana."},{"romaji":"acchi","kana":"あっち","kanji":"彼方","meaning":"over there","mnemonic":"Casual あ-series: あっち = “that way, over there.” Usually kana."},{"romaji":"kocchi","kana":"こっち","kanji":"此方","meaning":"this here","mnemonic":"Casual こ-series: こっち = “this way, over here.” Usually kana."},{"romaji":"socchi","kana":"そっち","kanji":"其方","meaning":"that way","mnemonic":"Casual そ-series: そっち = “that way, by you.” Usually kana."},{"romaji":"mukou","kana":"むこう","kanji":"向こう","meaning":"beyond","mnemonic":"向 (facing/direction)."},{"romaji":"massugu","kana":"まっすぐ","kanji":"真っ直ぐ","meaning":"straight","mnemonic":"真 (true) + 直 (straight)."},{"romaji":"kado","kana":"かど","kanji":"角","meaning":"corner","mnemonic":"Looks like an animal horn or a sharp edge."},{"romaji":"tonari","kana":"となり","kanji":"隣","meaning":"next door","mnemonic":"A village (阝) with rice/goods (米) next door."},{"romaji":"soba","kana":"そば","kanji":"側","meaning":"beside","mnemonic":"Person (亻) next to a rule/side (則【そく】)."},{"romaji":"chikaku","kana":"ちかく","kanji":"近く","meaning":"near","mnemonic":"An axe (斤【きん】) on a road (辶) indicating a short walk."},{"romaji":"soto","kana":"そと","kanji":"外","meaning":"outside","mnemonic":"Evening (夕) + Divination/Magic (卜【ぼく】)."},{"romaji":"naka","kana":"なか","kanji":"中","meaning":"inside","mnemonic":"A line drawn straight through the middle of a box."},{"romaji":"ue","kana":"うえ","kanji":"上","meaning":"up","mnemonic":"A line pointing upward from a base."},{"romaji":"shita","kana":"した","kanji":"下","meaning":"down","mnemonic":"A line pointing downward from a base."},{"romaji":"mae","kana":"まえ","kanji":"前","meaning":"front","mnemonic":"Horns over a butcher block and knife (刂)."},{"romaji":"yoko","kana":"よこ","kanji":"横","meaning":"side","mnemonic":"Tree (木) + Yellow (黄【き】)."},{"romaji":"ushiro","kana":"うしろ","kanji":"後ろ","meaning":"behind","mnemonic":"A moving person (彳) connected to threads."},{"romaji":"tatemono","kana":"たてもの","kanji":"建物","meaning":"building","mnemonic":"建 (build) + 物 (thing)."},{"romaji":"apaato","kana":"アパート","meaning":"apartment","mnemonic":"Katakana loanword, clipped from English “apartment.”"},{"romaji":"ie","kana":"いえ","kanji":"家","meaning":"house","mnemonic":"A roof (宀) with a pig (豕【し】) inside."},{"romaji":"eigakan","kana":"えいがかん","kanji":"映画館","meaning":"cinema","mnemonic":"映 (reflect) + 画 (picture) + 館 (building)."},{"romaji":"eki","kana":"えき","kanji":"駅","meaning":"station","mnemonic":"Horse (馬) + a measuring tool."},{"romaji":"kaisha","kana":"かいしゃ","kanji":"会社","meaning":"company","mnemonic":"会 (meet) + 社 (shrine/society)."},{"romaji":"gakkou","kana":"がっこう","kanji":"学校","meaning":"school","mnemonic":"学 (study) + 校 (school building)."},{"romaji":"kyoushitsu","kana":"きょうしつ","kanji":"教室","meaning":"classroom","mnemonic":"教 (teach) + 室 (room)."},{"romaji":"kissaten","kana":"きっさてん","kanji":"喫茶店","meaning":"cafe","mnemonic":"喫【きつ】 (consume) + 茶 (tea) + 店 (shop)."},{"romaji":"ginkou","kana":"ぎんこう","kanji":"銀行","meaning":"bank","mnemonic":"銀 (silver) + 行 (go/conduct)."},{"romaji":"kouban","kana":"こうばん","kanji":"交番","meaning":"police box","mnemonic":"交 (mix/intersect) + 番 (number/watch)."},{"romaji":"daigaku","kana":"だいがく","kanji":"大学","meaning":"university","mnemonic":"大 (big) + 学 (study)."},{"romaji":"taishikan","kana":"たいしかん","kanji":"大使館","meaning":"embassy","mnemonic":"大 (big) + 使 (use/envoy) + 館 (building)."},{"romaji":"depaato","kana":"デパート","meaning":"mall","mnemonic":"Katakana loanword, clipped from “department (store).”"},{"romaji":"toshokan","kana":"としょかん","kanji":"図書館","meaning":"library","mnemonic":"図 (map/plan) + 書 (write) + 館 (building)."},{"romaji":"byouin","kana":"びょういん","kanji":"病院","meaning":"hospital","mnemonic":"病 (sick) + 院 (institution)."},{"romaji":"puuru","kana":"プール","meaning":"pool","mnemonic":"Katakana loanword from English “pool.”"},{"romaji":"hoteru","kana":"ホテル","meaning":"hotel","mnemonic":"Katakana loanword from English “hotel.”"},{"romaji":"mise","kana":"みせ","kanji":"店","meaning":"shop","mnemonic":"A building covering a fortune (占【せん】)."},{"romaji":"yaoya","kana":"やおや","kanji":"八百屋","meaning":"greengrocer","mnemonic":"八 (eight) + 百 (hundred) + 屋 (shop)."},{"romaji":"yuubinkyoku","kana":"ゆうびんきょく","kanji":"郵便局","meaning":"post office","mnemonic":"郵【ゆう】 (mail) + 便 (convenience) + 局 (bureau)."},{"romaji":"resutoran","kana":"レストラン","meaning":"restaurant","mnemonic":"Katakana loanword from French/English “restaurant.”"},{"romaji":"tokoro","kana":"ところ","kanji":"所","meaning":"place","mnemonic":"戸【と】 (door) + 斤【きん】 (axe) → a spot marked out = a place."},{"romaji":"ike","kana":"いけ","kanji":"池","meaning":"pond","mnemonic":"Water (氵) + Also (也【や】)."},{"romaji":"umi","kana":"うみ","kanji":"海","meaning":"sea","mnemonic":"Water (氵) + Every (毎)."},{"romaji":"kawa","kana":"かわ","kanji":"川","meaning":"river","mnemonic":"Three lines flowing like water."},{"romaji":"yama","kana":"やま","kanji":"山","meaning":"mountain","mnemonic":"A picture of three mountain peaks."},{"romaji":"kouen","kana":"こうえん","kanji":"公園","meaning":"park","mnemonic":"公 (public) + 園 (garden/park)."},{"romaji":"niwa","kana":"にわ","kanji":"庭","meaning":"garden","mnemonic":"Building/roof over an active court."},{"romaji":"kooto","kana":"コート","meaning":"court","mnemonic":"Katakana loanword from English “court.”"},{"romaji":"hashi","kana":"はし","kanji":"橋","meaning":"bridge","mnemonic":"Wood (木) + Tall/Proud (喬【きょう】)."},{"romaji":"eria","kana":"エリア","meaning":"area","mnemonic":"Katakana loanword from English “area.”"},{"romaji":"gaikoku","kana":"がいこく","kanji":"外国","meaning":"abroad","mnemonic":"外 (outside) + 国 (country)."},{"romaji":"kuni","kana":"くに","kanji":"国","meaning":"country","mnemonic":"A jewel (玉【たま】) surrounded by borders (囗)."},{"romaji":"machi","kana":"まち","kanji":"町","meaning":"town","mnemonic":"Field (田) + Street/Nail (丁【ちょう】)."},{"romaji":"mura","kana":"むら","kanji":"村","meaning":"village","mnemonic":"Tree (木) + Measurement/Rule (寸【すん】)."},{"romaji":"michi","kana":"みち","kanji":"道","meaning":"street","mnemonic":"Neck/Head (首) moving along a path (辶)."},{"romaji":"kousaten","kana":"こうさてん","kanji":"交差点","meaning":"intersection","mnemonic":"交 (intersect) + 差 (difference) + 点 (point)."}],"level":"N5"},{"name":"Clothes, Belongings & Study","cards":[{"romaji":"fuku","kana":"ふく","kanji":"服","meaning":"clothes","mnemonic":"Moon/Flesh (月) next to a stamp/seal (卩)."},{"romaji":"youfuku","kana":"ようふく","kanji":"洋服","meaning":"clothes","mnemonic":"洋 (Western) + 服 (clothes)."},{"romaji":"shatsu","kana":"シャツ","meaning":"shirt","mnemonic":"Katakana loanword from English “shirt.”"},{"romaji":"waishatsu","kana":"ワイシャツ","meaning":"dress shirt","mnemonic":"Katakana loanword from “white shirt” (ホワイトシャツ, clipped)."},{"romaji":"uwagi","kana":"うわぎ","kanji":"上着","meaning":"jacket","mnemonic":"上 (up/top) + 着 (wear)."},{"romaji":"sebiro","kana":"せびろ","kanji":"背広","meaning":"suit","mnemonic":"背 (back) + 広 (wide)."},{"romaji":"sukaato","kana":"スカート","meaning":"skirt","mnemonic":"Katakana loanword from English “skirt.”"},{"romaji":"zubon","kana":"ズボン","meaning":"trousers","mnemonic":"Katakana loanword from French “jupon” (trousers)."},{"romaji":"seetaa","kana":"セーター","meaning":"sweater","mnemonic":"Katakana loanword from English “sweater.”"},{"romaji":"boushi","kana":"ぼうし","kanji":"帽子","meaning":"hat","mnemonic":"帽【ぼう】 (hat: towel 巾【きん】 over sun) + 子 (noun suffix)."},{"romaji":"megane","kana":"めがね","kanji":"眼鏡","meaning":"glasses","mnemonic":"眼【がん】 (eye) + 鏡【かがみ】 (mirror). Usually Kana at N5."},{"romaji":"nekutai","kana":"ネクタイ","meaning":"tie","mnemonic":"Katakana loanword from English “necktie.”"},{"romaji":"kutsu","kana":"くつ","kanji":"靴","meaning":"shoes","mnemonic":"Leather (革【かわ】) + Change (化)."},{"romaji":"kutsushita","kana":"くつした","kanji":"靴下","meaning":"socks","mnemonic":"靴 (shoes) + 下 (under)."},{"romaji":"surippa","kana":"スリッパ","meaning":"slippers","mnemonic":"Katakana loanword from English “slipper(s).”"},{"romaji":"nimotsu","kana":"にもつ","kanji":"荷物","meaning":"luggage","mnemonic":"荷【に】 (baggage) + 物 (thing)."},{"romaji":"kaban","kana":"かばん","kanji":"鞄","meaning":"bag","mnemonic":"Leather (革【かわ】) + Wrap (包【つつ】)."},{"romaji":"hankachi","kana":"ハンカチ","meaning":"handkerchief","mnemonic":"Katakana loanword, clipped from “handkerchief” (ハンカチーフ)."},{"romaji":"okane","kana":"おかね","kanji":"お金","meaning":"money","mnemonic":"Gold/metal (金) + polite 'o'."},{"romaji":"saifu","kana":"さいふ","kanji":"財布","meaning":"wallet","mnemonic":"財 (wealth) + 布【ぬの】 (cloth)."},{"romaji":"kagi","kana":"かぎ","kanji":"鍵","meaning":"key","mnemonic":"Metal (金) + Build (建)."},{"romaji":"kasa","kana":"かさ","kanji":"傘","meaning":"umbrella","mnemonic":"Looks exactly like an umbrella with people beneath."},{"romaji":"tabako","kana":"たばこ","kanji":"煙草","meaning":"cigarettes","mnemonic":"煙 (smoke) + 草 (grass) → “smoking grass” = tobacco. Usually kana タバコ."},{"romaji":"poketto","kana":"ポケット","meaning":"pocket","mnemonic":"Katakana loanword from English “pocket.”"},{"romaji":"benkyou","kana":"べんきょう","kanji":"勉強","meaning":"study","mnemonic":"勉 (exertion) + 強 (strong)."},{"romaji":"jugyou","kana":"じゅぎょう","kanji":"授業","meaning":"lesson","mnemonic":"授【じゅ】 (instruct) + 業 (vocation)."},{"romaji":"kurasu","kana":"クラス","meaning":"class","mnemonic":"Katakana loanword from English “class.”"},{"romaji":"eigo","kana":"えいご","kanji":"英語","meaning":"English","mnemonic":"英 (hero/Britain) + 語 (language)."},{"romaji":"kanji","kana":"かんじ","kanji":"漢字","meaning":"Kanji","mnemonic":"漢 (Han Chinese) + 字 (character)."},{"romaji":"imi","kana":"いみ","kanji":"意味","meaning":"meaning","mnemonic":"意 (idea) + 味 (flavor)."},{"romaji":"kotoba","kana":"ことば","kanji":"言葉","meaning":"language","mnemonic":"言 (words) + 葉 (leaf)."},{"romaji":"hanashi","kana":"はなし","kanji":"話","meaning":"story","mnemonic":"Words (言) + Tongue (舌【した】)."},{"romaji":"sakubun","kana":"さくぶん","kanji":"作文","meaning":"composition","mnemonic":"作 (make) + 文 (text)."},{"romaji":"bunshou","kana":"ぶんしょう","kanji":"文章","meaning":"sentence","mnemonic":"文 (text) + 章【しょう】 (chapter/badge)."},{"romaji":"shitsumon","kana":"しつもん","kanji":"質問","meaning":"question","mnemonic":"質 (quality) + 問 (ask)."},{"romaji":"shukudai","kana":"しゅくだい","kanji":"宿題","meaning":"homework","mnemonic":"宿 (lodge) + 題 (topic). Work taken to your lodge."},{"romaji":"keizai","kana":"けいざい","kanji":"経済","meaning":"economic","mnemonic":"経 (manage) + 済 (settle) → managing & settling resources = economy / economics."},{"romaji":"tesuto","kana":"テスト","meaning":"test","mnemonic":"Katakana loanword from English “test.”"},{"romaji":"maru","kana":"まる","kanji":"丸","meaning":"round","mnemonic":"A drop adding completeness to nine (九)."},{"romaji":"mondai","kana":"もんだい","kanji":"問題","meaning":"problem","mnemonic":"問 (ask) + 題 (topic)."},{"romaji":"renshuu","kana":"れんしゅう","kanji":"練習","meaning":"practice","mnemonic":"練【れん】 (train) + 習 (learn)."},{"romaji":"botan","kana":"ボタン","meaning":"button","mnemonic":"Katakana loanword from Portuguese “botão” (button)."},{"romaji":"enpitsu","kana":"えんぴつ","kanji":"鉛筆","meaning":"pencil","mnemonic":"鉛【えん】 (lead) + 筆【ふで】 (brush)."},{"romaji":"pen","kana":"ペン","meaning":"pen","mnemonic":"Katakana loanword from English “pen.”"},{"romaji":"boorupen","kana":"ボールペン","meaning":"ballpoint pen","mnemonic":"Katakana loanword from “ball(point) pen.”"},{"romaji":"mannenhitsu","kana":"まんねんひつ","kanji":"万年筆","meaning":"fountain pen","mnemonic":"万 (10,000) + 年 (years) + 筆【ふで】 (brush)."},{"romaji":"hon","kana":"ほん","kanji":"本","meaning":"book","mnemonic":"A tree (木) with a line indicating the root."},{"romaji":"nooto","kana":"ノート","meaning":"notebook","mnemonic":"Katakana loanword, clipped from English “notebook.”"},{"romaji":"peeji","kana":"ページ","meaning":"page","mnemonic":"Katakana loanword from English “page.”"},{"romaji":"hondana","kana":"ほんだな","kanji":"本棚","meaning":"bookshelf","mnemonic":"本 (book) + 棚【たな】 (shelf: Wood 木 + Companions 朋【とも】)."}],"level":"N5"},{"name":"U-Verbs","cards":[{"romaji":"au","kana":"あう","kanji":"会う","meaning":"meet","mnemonic":"Looks like a house roof where people gather to meet."},{"romaji":"aku","kana":"あく","kanji":"開く","meaning":"open","mnemonic":"Two gate doors (門【もん】) opening up."},{"romaji":"shimaru","kana":"しまる","kanji":"閉まる","meaning":"close","mnemonic":"A gate (門【もん】) closed tight with a lock (オ)."},{"romaji":"asobu","kana":"あそぶ","kanji":"遊ぶ","meaning":"play","mnemonic":"A child wandering or playing on a path (辶)."},{"romaji":"arau","kana":"あらう","kanji":"洗う","meaning":"wash","mnemonic":"Water (氵) applied before proceeding (先)."},{"romaji":"aru","kana":"ある","kanji":"有る","meaning":"be (thing)","mnemonic":"ナ (hand) over 月 (flesh/moon) → holding something in hand = to exist / have. Usually kana."},{"romaji":"iru","kana":"いる","kanji":"要る","meaning":"need","mnemonic":"A woman (女) holding something very important (西)."},{"romaji":"aruku","kana":"あるく","kanji":"歩く","meaning":"walk","mnemonic":"Stop (止) and take a few (少) steps forward."},{"romaji":"hashiru","kana":"はしる","kanji":"走る","meaning":"run","mnemonic":"A person running swiftly over the earth (土)."},{"romaji":"iu","kana":"いう","kanji":"言う","meaning":"say","mnemonic":"Words vibrating out of a mouth (口) at the bottom."},{"romaji":"iku","kana":"いく","kanji":"行く","meaning":"go","mnemonic":"Looks like a crossroad or steps moving forward."},{"romaji":"utau","kana":"うたう","kanji":"歌う","meaning":"sing","mnemonic":"Two open mouths (欠) singing a song together."},{"romaji":"uru","kana":"うる","kanji":"売る","meaning":"sell","mnemonic":"A samurai (士【し】) managing goods under a roof."},{"romaji":"kau","kana":"かう","kanji":"買う","meaning":"buy","mnemonic":"An eye or net looking over a shell (貝【かい】 = money/currency)."},{"romaji":"oku","kana":"おく","kanji":"置く","meaning":"put","mnemonic":"An eye (目) looking at a straight (直) placement."},{"romaji":"osu","kana":"おす","kanji":"押す","meaning":"push","mnemonic":"A hand (扌) pressing against a hard shield (甲【こう】)."},{"romaji":"hiku","kana":"ひく","kanji":"引く","meaning":"pull","mnemonic":"A bow (弓【ゆみ】) drawn back tightly by a vertical line."},{"romaji":"hiku","kana":"ひく","kanji":"弾く","meaning":"play (music)","mnemonic":"A bow (弓【ゆみ】) striking a single (単) musical note."},{"romaji":"oyogu","kana":"およぐ","kanji":"泳ぐ","meaning":"swim","mnemonic":"Water (氵) and everlasting (永【えい】) fluid movement."},{"romaji":"owaru","kana":"おわる","kanji":"終わる","meaning":"finish","mnemonic":"A thread (糸【いと】) tied to winter (冬) — the end of the year."},{"romaji":"hajimaru","kana":"はじまる","kanji":"始まる","meaning":"begin","mnemonic":"A woman (女) taking the stage on a pedestal (台)."},{"romaji":"kaesu","kana":"かえす","kanji":"返す","meaning":"return","mnemonic":"Anti/Reverse (反) movement on a path (辶)."},{"romaji":"kaeru","kana":"かえる","kanji":"帰る","meaning":"go back","mnemonic":"An apron and a broom returning home."},{"romaji":"kakaru","kana":"かかる","kanji":"掛かる","meaning":"take time","mnemonic":"A hand (扌) holding up a divination/measure (卦【け】)."},{"romaji":"kaku","kana":"かく","kanji":"書く","meaning":"write","mnemonic":"A brush held in a hand writing over paper (日)."},{"romaji":"yomu","kana":"よむ","kanji":"読む","meaning":"read","mnemonic":"Words (言) being sold (売) as stories to read."},{"romaji":"kiku","kana":"きく","kanji":"聞く","meaning":"hear","mnemonic":"An ear (耳) listening closely inside a gate (門【もん】)."},{"romaji":"hanasu","kana":"はなす","kanji":"話す","meaning":"speak","mnemonic":"Words (言) being spoken by the tongue (舌【した】)."},{"romaji":"kasu","kana":"かす","kanji":"貸す","meaning":"lend","mnemonic":"Generations (代) sharing money/shells (貝【かい】)."},{"romaji":"kiru","kana":"きる","kanji":"切る","meaning":"cut","mnemonic":"A sword (刀【かたな】) making seven (七) cuts."},{"romaji":"kumoru","kana":"くもる","kanji":"曇る","meaning":"get cloudy","mnemonic":"The sun (日) totally hidden beneath a heavy cloud (雲【くも】)."},{"romaji":"kesu","kana":"けす","kanji":"消す","meaning":"erase","mnemonic":"Water (氵) washing away a spark (肖【しょう】)."},{"romaji":"komaru","kana":"こまる","kanji":"困る","meaning":"worry","mnemonic":"A tree (木) trapped inside a box (囗), unable to grow."},{"romaji":"saku","kana":"さく","kanji":"咲く","meaning":"bloom","mnemonic":"A mouth (口) smiling wide like an open blossom."},{"romaji":"sasu","kana":"さす","kanji":"差す","meaning":"open (umbrella)","mnemonic":"Hands opening up a canopy or framework."},{"romaji":"shinu","kana":"しぬ","kanji":"死ぬ","meaning":"die","mnemonic":"Bare bones (歹) and a fallen person (匕)."},{"romaji":"shiru","kana":"しる","kanji":"知る","meaning":"know","mnemonic":"An arrow (矢【や】) hitting its target in the mouth (口)."},{"romaji":"suu","kana":"すう","kanji":"吸う","meaning":"inhale","mnemonic":"A mouth (口) breathing in until air reaches (及【およ】) the lungs."},{"romaji":"sumu","kana":"すむ","kanji":"住む","meaning":"live","mnemonic":"A person (亻) standing as the master (主) of a house."},{"romaji":"suwaru","kana":"すわる","kanji":"座る","meaning":"sit","mnemonic":"Two people (人人) sitting together in an enclosure (广)."},{"romaji":"tatsu","kana":"たつ","kanji":"立つ","meaning":"stand","mnemonic":"A person standing firmly on the ground."},{"romaji":"dasu","kana":"だす","kanji":"出す","meaning":"put out","mnemonic":"Two mountains (山) stacked, pushing upward and outward."},{"romaji":"tanomu","kana":"たのむ","kanji":"頼む","meaning":"ask favor","mnemonic":"Binding (束) one's head (頁【けつ】) in a bowing request."},{"romaji":"chigau","kana":"ちがう","kanji":"違う","meaning":"differ","mnemonic":"Stepping (辶) in opposite directions (韋【い】)."},{"romaji":"tsukau","kana":"つかう","kanji":"使う","meaning":"use","mnemonic":"A person (亻) using an official/tool (吏【り】)."},{"romaji":"tsuku","kana":"つく","kanji":"着く","meaning":"arrive","mnemonic":"A sheep (羊【ひつじ】) arriving directly at an eye (目)."},{"romaji":"tsukuru","kana":"つくる","kanji":"作る","meaning":"make","mnemonic":"A person (亻) quickly (乍【さ】) making something."},{"romaji":"tobu","kana":"とぶ","kanji":"飛ぶ","meaning":"fly","mnemonic":"Looks exactly like wings flapping upward in the sky."},{"romaji":"tomaru","kana":"とまる","kanji":"止まる","meaning":"stop","mnemonic":"A footprint firmly halted on the ground."},{"romaji":"toru","kana":"とる","kanji":"取る","meaning":"take","mnemonic":"An ear (耳) grabbed by a hand (又【また】)."},{"romaji":"naku","kana":"なく","kanji":"泣く","meaning":"cry","mnemonic":"Water (氵) standing (立) in the eyes."},{"romaji":"nakusu","kana":"なくす","kanji":"無くす","meaning":"lose","mnemonic":"A fire (灬) at the bottom burning everything to nothing."},{"romaji":"narau","kana":"ならう","kanji":"習う","meaning":"learn","mnemonic":"Feathers (羽【はね】) practicing flight over a white (白) sun."},{"romaji":"narabu","kana":"ならぶ","kanji":"並ぶ","meaning":"line up","mnemonic":"Two people standing perfectly side by side."},{"romaji":"naru","kana":"なる","kanji":"成る","meaning":"become","mnemonic":"A weapon swinging to complete a task."},{"romaji":"noboru","kana":"のぼる","kanji":"登る","meaning":"climb","mnemonic":"Two feet climbing up toward a peak or tent."},{"romaji":"nomu","kana":"のむ","kanji":"飲む","meaning":"drink","mnemonic":"Food/Eat (食) and lack (欠) — lacking food, you drink."},{"romaji":"noru","kana":"のる","kanji":"乗る","meaning":"ride","mnemonic":"A person standing confidently on top of a tree."},{"romaji":"hairu","kana":"はいる","kanji":"入る","meaning":"enter","mnemonic":"An arrow plunging downward and inward."},{"romaji":"haku","kana":"はく","kanji":"履く","meaning":"put on shoes","mnemonic":"A body (尸) stepping forward into footwear."},{"romaji":"nugu","kana":"ぬぐ","kanji":"脱ぐ","meaning":"take off","mnemonic":"Flesh (月) escaping (兌【えつ】) its clothes."},{"romaji":"hataraku","kana":"はたらく","kanji":"働く","meaning":"work","mnemonic":"A person (亻) moving (動) with heavy labor."},{"romaji":"haru","kana":"はる","kanji":"貼る","meaning":"stick","mnemonic":"Shell/money (貝【かい】) used to secure a fortune (占【せん】)."},{"romaji":"fuku","kana":"ふく","kanji":"吹く","meaning":"blow","mnemonic":"A mouth (口) exhaling wind/lack (欠)."},{"romaji":"furu","kana":"ふる","kanji":"降る","meaning":"fall (rain)","mnemonic":"Moving heavily down a steep hill (阝)."},{"romaji":"magaru","kana":"まがる","kanji":"曲がる","meaning":"turn","mnemonic":"A completely bent or curved structural frame."},{"romaji":"matsu","kana":"まつ","kanji":"待つ","meaning":"wait","mnemonic":"Stepping (彳) at a temple (寺【てら】) patiently."},{"romaji":"migaku","kana":"みがく","kanji":"磨く","meaning":"brush","mnemonic":"Hands polishing a stone (石) under a cliff (广)."},{"romaji":"motsu","kana":"もつ","kanji":"持つ","meaning":"hold","mnemonic":"A hand (扌) gripping a temple (寺【てら】) firmly."},{"romaji":"yasumu","kana":"やすむ","kanji":"休む","meaning":"rest","mnemonic":"A person (亻) leaning against a tree (木) to rest."},{"romaji":"yaru","kana":"やる","kanji":"遣る","meaning":"do","mnemonic":"Casual “to do / to give” (= する / あげる). Usually written in kana."},{"romaji":"yobu","kana":"よぶ","kanji":"呼ぶ","meaning":"call out","mnemonic":"A mouth (口) exhaling heavily (乎【こ】) to shout."},{"romaji":"wakaru","kana":"わかる","kanji":"分かる","meaning":"understand","mnemonic":"A knife (刀【かたな】) dividing (八) a problem to understand it."},{"romaji":"watasu","kana":"わたす","kanji":"渡す","meaning":"hand over","mnemonic":"Water (氵) flowing across a span or degree (度)."},{"romaji":"wataru","kana":"わたる","kanji":"渡る","meaning":"go across","mnemonic":"氵 (water) + 度 (a span / degree) → to cross over water = go across."}],"level":"N5"},{"name":"Ru-verbs & Irregulars","cards":[{"romaji":"akeru","kana":"あける","kanji":"開ける","meaning":"open","mnemonic":"Two gate doors (門【もん】) opening up."},{"romaji":"shimeru","kana":"しめる","kanji":"閉める","meaning":"close","mnemonic":"A gate (門【もん】) closed tight with a lock (オ)."},{"romaji":"shimeru","kana":"しめる","kanji":"締める","meaning":"tie","mnemonic":"Thread (糸【いと】) pulling tight around a ruler (帝【てい】)."},{"romaji":"ageru","kana":"あげる","kanji":"上げる","meaning":"give / raise","mnemonic":"Pointing up (上)."},{"romaji":"abiru","kana":"あびる","kanji":"浴びる","meaning":"shower","mnemonic":"Water (氵) pouring down in a valley (谷【たに】)."},{"romaji":"iru","kana":"いる","kanji":"居る","meaning":"exist","mnemonic":"A body (尸) resting in an ancient place (古)."},{"romaji":"ireru","kana":"いれる","kanji":"入れる","meaning":"put in","mnemonic":"An arrow plunging downward and inward."},{"romaji":"umareru","kana":"うまれる","kanji":"生まれる","meaning":"be born","mnemonic":"A sprout emerging from the ground."},{"romaji":"okiru","kana":"おきる","kanji":"起きる","meaning":"get up","mnemonic":"Running (走) to oneself (己【おのれ】)."},{"romaji":"neru","kana":"ねる","kanji":"寝る","meaning":"sleep","mnemonic":"A roof covering a bed and a resting body."},{"romaji":"oshieru","kana":"おしえる","kanji":"教える","meaning":"teach","mnemonic":"Filial piety (孝【こう】) driven by action (攵)."},{"romaji":"oboeru","kana":"おぼえる","kanji":"覚える","meaning":"remember","mnemonic":"Seeing (見) with awakened learning at the top."},{"romaji":"oriru","kana":"おりる","kanji":"降りる","meaning":"get off","mnemonic":"Moving heavily down a steep hill (阝)."},{"romaji":"kakeru","kana":"かける","kanji":"掛ける","meaning":"call (phone)","mnemonic":"A hand (扌) holding up a divination measure (卦【け】)."},{"romaji":"kariru","kana":"かりる","kanji":"借りる","meaning":"borrow","mnemonic":"A person (亻) needing days (昔) to repay."},{"romaji":"kieru","kana":"きえる","kanji":"消える","meaning":"disappear","mnemonic":"Water (氵) washing away a spark (肖【しょう】)."},{"romaji":"kiru","kana":"きる","kanji":"着る","meaning":"wear","mnemonic":"Sheep wool draped over eyes."},{"romaji":"kotaeru","kana":"こたえる","kanji":"答える","meaning":"answer","mnemonic":"Bamboo combined with a perfectly matching fit (合)."},{"romaji":"taberu","kana":"たべる","kanji":"食べる","meaning":"eat","mnemonic":"A person gathering good food under a roof."},{"romaji":"tsukareru","kana":"つかれる","kanji":"疲れる","meaning":"get tired","mnemonic":"Sickness covering a person suffering skin (皮【かわ】) deep."},{"romaji":"tsukeru","kana":"つける","kanji":"点ける","meaning":"turn on","mnemonic":"Black points of fire (灬) igniting."},{"romaji":"tsutomeru","kana":"つとめる","kanji":"勤める","meaning":"work","mnemonic":"Yellow clay power working extremely hard."},{"romaji":"dekakeru","kana":"でかける","kanji":"出かける","meaning":"go out","mnemonic":"Going out (出) + hanging/starting (掛)."},{"romaji":"dekiru","kana":"できる","kanji":"出来る","meaning":"be able","mnemonic":"Coming out (出) to come (来)."},{"romaji":"deru","kana":"でる","kanji":"出る","meaning":"exit","mnemonic":"Two mountains stacked, pushing outward."},{"romaji":"naraberu","kana":"ならべる","kanji":"並べる","meaning":"line up","mnemonic":"Two people standing perfectly side by side."},{"romaji":"hareru","kana":"はれる","kanji":"晴れる","meaning":"be sunny","mnemonic":"The sun (日) over blue (青)."},{"romaji":"miseru","kana":"みせる","kanji":"見せる","meaning":"show","mnemonic":"An eye (目) on legs showing itself."},{"romaji":"miru","kana":"みる","kanji":"見る","meaning":"watch","mnemonic":"目 (eye) + 儿 (legs) → an eye up on legs, walking around looking = to see / watch."},{"romaji":"wasureru","kana":"わすれる","kanji":"忘れる","meaning":"forget","mnemonic":"The death/loss (亡) of the heart/mind (心)."},{"romaji":"kuru","kana":"くる","kanji":"来る","meaning":"come","mnemonic":"A tree showing a person arriving under it."},{"romaji":"suru","kana":"する","meaning":"do","mnemonic":"Irregular verb “to do.” Pure kana — attaches to nouns: 勉強する = “to study.”"},{"romaji":"kopiisuru","kana":"コピーする","meaning":"copy","mnemonic":"Katakana コピー (“copy”) + する (to do)."}],"level":"N5"},{"name":"I-Adjectives","cards":[{"romaji":"akarui","kana":"あかるい","kanji":"明るい","meaning":"bright","mnemonic":"Sun (日) + Moon (月) = extremely bright."},{"romaji":"kurai","kana":"くらい","kanji":"暗い","meaning":"dark","mnemonic":"Sun (日) goes down, only hearing sound (音)."},{"romaji":"wakai","kana":"わかい","kanji":"若い","meaning":"young","mnemonic":"Grass (艹) leaning to the right (右) like a young shoot."},{"romaji":"atarashii","kana":"あたらしい","kanji":"新しい","meaning":"new","mnemonic":"Standing (立) near a tree (木) with an axe (斤【きん】) to cut new wood."},{"romaji":"furui","kana":"ふるい","kanji":"古い","meaning":"old","mnemonic":"A story told ten (十) times by mouth (口) is old."},{"romaji":"atsui","kana":"あつい","kanji":"暑い","meaning":"hot (weather)","mnemonic":"Sun (日) beating down on a person (者)."},{"romaji":"atatakai","kana":"あたたかい","kanji":"暖かい","meaning":"warm (weather)","mnemonic":"Sun (日) providing gentle, loving (爰【えん】) warmth."},{"romaji":"samui","kana":"さむい","kanji":"寒い","meaning":"cold (weather)","mnemonic":"Ice (冫) freezing the bottom of a house."},{"romaji":"suzushii","kana":"すずしい","kanji":"涼しい","meaning":"cool","mnemonic":"Water (氵) flowing near a capital city (京)."},{"romaji":"atsui","kana":"あつい","kanji":"熱い","meaning":"hot (touch)","mnemonic":"Fire (灬) burning intensely at the bottom."},{"romaji":"tsumetai","kana":"つめたい","kanji":"冷たい","meaning":"cold (touch)","mnemonic":"Ice (冫) freezing a command (令【れい】)."},{"romaji":"nurui","kana":"ぬるい","kanji":"温い","meaning":"lukewarm","mnemonic":"Water (氵) warmed by the sun (日) on a plate (皿【さら】)."},{"romaji":"atsui","kana":"あつい","kanji":"厚い","meaning":"thick","mnemonic":"A generous cliff/rock face sheltering a child (子)."},{"romaji":"usui","kana":"うすい","kanji":"薄い","meaning":"thin","mnemonic":"Water (氵) spread thinly over grass (艹)."},{"romaji":"abunai","kana":"あぶない","kanji":"危ない","meaning":"dangerous","mnemonic":"A person kneeling precariously on a cliff."},{"romaji":"amai","kana":"あまい","kanji":"甘い","meaning":"sweet","mnemonic":"A mouth with a piece of sweet candy inside."},{"romaji":"karai","kana":"からい","kanji":"辛い","meaning":"spicy","mnemonic":"Standing (立) on ten (十) needles."},{"romaji":"yoi / ii","kana":"よい / いい","kanji":"良い","meaning":"good","mnemonic":"良 = “good.” いい is the colloquial form of よい (same 良)."},{"romaji":"warui","kana":"わるい","kanji":"悪い","meaning":"bad","mnemonic":"An evil/asian cross (亜【あ】) over a heart (心)."},{"romaji":"isogashii","kana":"いそがしい","kanji":"忙しい","meaning":"busy","mnemonic":"A heart (忄) that has lost (亡) itself to work."},{"romaji":"itai","kana":"いたい","kanji":"痛い","meaning":"painful","mnemonic":"The sickness radical (疒) covering a path/tunnel."},{"romaji":"urusai","kana":"うるさい","kanji":"煩い","meaning":"noisy","mnemonic":"Often written in Kana at N5."},{"romaji":"oishii","kana":"おいしい","kanji":"美味しい","meaning":"delicious","mnemonic":"Beauty (美) + Flavor (味)."},{"romaji":"mazui","kana":"まずい","kanji":"不味い","meaning":"gross","mnemonic":"Un- (不) + Flavor (味)."},{"romaji":"ooi","kana":"おおい","kanji":"多い","meaning":"many","mnemonic":"Two evening moons (夕) stacked up."},{"romaji":"ookii","kana":"おおきい","kanji":"大きい","meaning":"big","mnemonic":"A person stretching their arms and legs wide."},{"romaji":"chiisai","kana":"ちいさい","kanji":"小さい","meaning":"small","mnemonic":"Three little drops of water."},{"romaji":"osoi","kana":"おそい","kanji":"遅い","meaning":"slow","mnemonic":"A sheep walking slowly on a path (辶)."},{"romaji":"hayai","kana":"はやい","kanji":"速い","meaning":"quick","mnemonic":"Moving (辶) rapidly as a bundle (束)."},{"romaji":"hayai","kana":"はやい","kanji":"早い","meaning":"early","mnemonic":"The sun (日) rising over a cross (十) early in the day."},{"romaji":"omoi","kana":"おもい","kanji":"重い","meaning":"heavy","mnemonic":"A thousand (千) villages (里) stacked up."},{"romaji":"karui","kana":"かるい","kanji":"軽い","meaning":"light","mnemonic":"A car (車) driving lightly next to a water channel."},{"romaji":"kawaii","kana":"かわいい","kanji":"可愛い","meaning":"cute","mnemonic":"Possible (可) to love (愛)."},{"romaji":"kitanai","kana":"きたない","kanji":"汚い","meaning":"dirty","mnemonic":"Water (氵) sitting stagnant in a curved ditch."},{"romaji":"semai","kana":"せまい","kanji":"狭い","meaning":"narrow","mnemonic":"A dog (犭) squeezed into a tight space."},{"romaji":"hiroi","kana":"ひろい","kanji":"広い","meaning":"spacious","mnemonic":"A vast roof (广) covering a private (ム) space."},{"romaji":"takai","kana":"たかい","kanji":"高い","meaning":"tall / expensive","mnemonic":"Looks exactly like a tall pagoda or building."},{"romaji":"hikui","kana":"ひくい","kanji":"低い","meaning":"low","mnemonic":"A person (亻) working at the foundation (氏【し】)."},{"romaji":"yasui","kana":"やすい","kanji":"安い","meaning":"cheap / safe","mnemonic":"A woman (女) relaxing safely under a roof (宀)."},{"romaji":"omoshiroi","kana":"おもしろい","kanji":"面白い","meaning":"interesting","mnemonic":"A face (面) turning white (白) with excitement."},{"romaji":"tanoshii","kana":"たのしい","kanji":"楽しい","meaning":"enjoyable","mnemonic":"White (白) over wood (木) representing musical instruments."},{"romaji":"tsumaranai","kana":"つまらない","meaning":"boring","mnemonic":"Negative-shaped adjective: “nothing comes of it” → trivial, boring, dull. Usually kana."},{"romaji":"chikai","kana":"ちかい","kanji":"近い","meaning":"near","mnemonic":"Taking an axe (斤【きん】) on a short path (辶)."},{"romaji":"tooi","kana":"とおい","kanji":"遠い","meaning":"far","mnemonic":"Carrying heavy garments on a long path (辶)."},{"romaji":"tsuyoi","kana":"つよい","kanji":"強い","meaning":"powerful","mnemonic":"A strong bow (弓【ゆみ】) snapping a bug (虫【むし】)."},{"romaji":"yowai","kana":"よわい","kanji":"弱い","meaning":"weak","mnemonic":"Two limp, unstrung bows side by side."},{"romaji":"nagai","kana":"ながい","kanji":"長い","meaning":"long","mnemonic":"Looks like a person with very long, flowing hair."},{"romaji":"mijikai","kana":"みじかい","kanji":"短い","meaning":"short","mnemonic":"An arrow (矢【や】) next to a small bean (豆【まめ】)."},{"romaji":"futoi","kana":"ふとい","kanji":"太い","meaning":"thick (cylindrical)","mnemonic":"A big (大) object given an extra drop of weight."},{"romaji":"hosoi","kana":"ほそい","kanji":"細い","meaning":"thin (cylindrical)","mnemonic":"A delicate thread (糸【いと】) running through a field (田)."},{"romaji":"muzukashii","kana":"むずかしい","kanji":"難しい","meaning":"difficult","mnemonic":"A bird (隹【すい】) struggling in yellow clay."},{"romaji":"yasashii","kana":"やさしい","kanji":"易しい","meaning":"easy","mnemonic":"The sun (日) shining on a bird — clear and easy."},{"romaji":"hoshii","kana":"ほしい","kanji":"欲しい","meaning":"want","mnemonic":"A valley (谷【たに】) that lacks (欠) water, desiring it."}],"level":"N5"},{"name":"Na-Adjectives","cards":[{"romaji":"iroirona","kana":"いろいろな","kanji":"色々な","meaning":"various","mnemonic":"色 (color) repeated.","breakdown":{"word":"色々","means":"various, all sorts","hook":"A doubled kanji — 色 written twice via the repeat-mark 々, “colours upon colours.”","parts":[{"k":"色","pos":"base","text":"“colour.” Pictured as one person bending over another — where mood, passion and colour show."},{"k":"々","pos":"right","text":"the repetition mark: it simply means “say the kanji before me again.”"}],"visualize":"Take one 色 (colour), then 々 says “again!” so you stack shade on shade until every hue is there. 色 (colour) + 々 (repeat) = all kinds, various (色々)!"}},{"romaji":"juubunna","kana":"じゅうぶんな","kanji":"十分な","meaning":"enough","mnemonic":"十 (ten) + 分 (parts) = 100%, enough.","breakdown":{"word":"十分","means":"enough, sufficient","hook":"Literally “ten parts” — and ten parts out of ten is the whole thing.","parts":[{"k":"十","pos":"left","text":"“ten.” One vertical stroke crossing one horizontal stroke: the complete set, 1 through 10."},{"k":"分","pos":"right","text":"“part, to divide.” 八 (a splitting motion) sitting above 刀【かたな】 (a blade) — cut into shares."}],"visualize":"Lay out ten (十) full parts (分) and nothing at all is missing — you have ten-tenths. 十 (ten) + 分 (parts) = a complete measure = enough (十分)!"}},{"romaji":"genkina","kana":"げんきな","kanji":"元気な","meaning":"healthy","mnemonic":"元 (origin) + 気 (spirit/energy).","breakdown":{"word":"元気","means":"energy, spirit, good health","hook":"Your “original ki” — the life-force you were born with.","parts":[{"k":"元","pos":"left","text":"“origin, source.” Two strokes (二) resting on a pair of legs (儿): a person traced back to their root."},{"k":"気","pos":"right","text":"“spirit, air, ki.” Rising vapour (气【き】) curled around 米 (rice) — the steam that lifts off hot rice."}],"visualize":"Picture life-force welling up from the base (元) of a person while warm steam rises off a bowl of rice (気). That root vitality IS your spirit. 元 (origin) + 気 (energy) = vigour (元気)!"}},{"romaji":"shizukana","kana":"しずかな","kanji":"静かな","meaning":"quiet","mnemonic":"青 (blue) + 争 (conflict) = cooling down a conflict.","breakdown":{"word":"静","means":"quiet, calm, still","hook":"The image of a heated argument being cooled right down.","parts":[{"k":"青","pos":"left","text":"“blue / green; cool, fresh.” The colour of clear sky and young plants."},{"k":"争","pos":"right","text":"“to fight, contend.” A hand straining to pull something away in a struggle."}],"visualize":"Take a hot 争 (quarrel) and pour cool 青 (blue) over it until tempers settle and everything goes still. 青 (cool) + 争 (conflict) = calmed down = quiet (静か)!"}},{"romaji":"jouzuna","kana":"じょうずな","kanji":"上手な","meaning":"skillful","mnemonic":"上 (up/good) + 手 (hand).","breakdown":{"word":"上手","means":"skillful, good at","hook":"Literally “the upper hand.”","parts":[{"k":"上","pos":"top","text":"“up, above, upper.” A mark placed above a baseline."},{"k":"手","pos":"bottom","text":"“hand.” A pictograph of a palm with spread fingers and a wrist."}],"visualize":"Whoever holds the 上 (upper) 手 (hand) is the one in control — the skilled one. 上 (upper) + 手 (hand) = the upper hand = skillful (上手)!"}},{"romaji":"joubuna","kana":"じょうぶな","kanji":"丈夫な","meaning":"strong","mnemonic":"丈【じょう】 (sturdy) + 夫 (man).","breakdown":{"word":"丈夫","means":"sturdy, durable, healthy","hook":"Originally “a full-grown man” — and a grown man is tough.","parts":[{"k":"丈【じょう】","pos":"top","text":"“height, stature.” A hand measuring out a tall span."},{"k":"夫","pos":"bottom","text":"“grown man, husband.” 大 (a big person) with a hairpin (一) laid across the top: an adult male."}],"visualize":"Stand a full-height (丈) grown man (夫) in front of you — solid, robust, hard to break. 丈【じょう】 (stature) + 夫 (man) = sturdy, durable (丈夫)!"}},{"romaji":"sukina","kana":"すきな","kanji":"好きな","meaning":"like","mnemonic":"女 (woman) + 子 (child) = something you naturally like.","breakdown":{"word":"好","means":"to like, fond of","hook":"The most natural bond there is — a mother and her child.","parts":[{"k":"女","pos":"left","text":"“woman.” A figure kneeling gracefully."},{"k":"子","pos":"right","text":"“child.” A baby in swaddling with its arms thrown out."}],"visualize":"A 女 (woman) leaning toward her 子 (child) — the very picture of tenderness and liking. 女 (woman) + 子 (child) = to be fond of = like (好き)!"}},{"romaji":"daisukina","kana":"だいすきな","kanji":"大好きな","meaning":"love","mnemonic":"大 (big) + 好き (like).","breakdown":{"word":"大好き","means":"to love, to like a lot","hook":"Just “like” (好) blown up “big” (大).","parts":[{"k":"大","pos":"top","text":"“big, great.” A person standing with arms and legs flung wide."},{"k":"好","pos":"bottom","text":"“to like.” A 女 (woman) drawn close to her 子 (child)."}],"visualize":"Take ordinary liking (好) and stretch it as 大 (big) as someone spreading their arms wide. 大 (big) + 好き (like) = to love (大好き)!"}},{"romaji":"kiraina","kana":"きらいな","kanji":"嫌いな","meaning":"hate","mnemonic":"女 (woman) + 兼【けん】 (concurrent) = complicated feelings.","breakdown":{"word":"嫌","means":"dislike, hate, distasteful","hook":"A tangle of mixed, uneasy feelings.","parts":[{"k":"女","pos":"left","text":"“woman” — here standing in for emotion and feeling."},{"k":"兼【けん】","pos":"right","text":"“to hold two things at once.” A hand grasping two stalks of grain together."}],"visualize":"When too many feelings are 兼【けん】 (held at once) they curdle into suspicion and distaste. 女 (feeling) + 兼 (combined) = conflicted, fed up = to dislike (嫌い)!"}},{"romaji":"kireina","kana":"きれいな","kanji":"綺麗な","meaning":"beautiful","mnemonic":"糸【いと】 (thread) + 奇【き】 (wonderful/strange).","breakdown":{"word":"綺麗","means":"beautiful, pretty, clean","hook":"Two ornate kanji so fancy the word is usually written in kana (きれい).","parts":[{"k":"綺【き】","pos":"left","text":"“fine figured silk.” 糸【いと】 (thread) beside 奇【き】 (rare, wonderful): rare, gorgeous cloth."},{"k":"麗【れい】","pos":"right","text":"“lovely, resplendent.” A 鹿【しか】 (deer) crowned with a matched pair of ornaments — elegance itself."}],"visualize":"Drape someone in rare patterned silk (綺) and crown them like an adorned deer (麗) — dazzling and spotless. 綺 (fine silk) + 麗 (lovely) = gorgeous, clean (綺麗)!"}},{"romaji":"taisetsuna","kana":"たいせつな","kanji":"大切な","meaning":"important","mnemonic":"大 (big) + 切 (cut) = sharply important.","breakdown":{"word":"大切","means":"important, precious","hook":"Picture a cut so big it really matters.","parts":[{"k":"大","pos":"left","text":"“big, great.” A person with arms outstretched."},{"k":"切","pos":"right","text":"“to cut; keen, pressing.” 七 (a cutting stroke) beside 刀【かたな】 (a sword) — slicing sharply."}],"visualize":"Something so 大 (big) and so 切 (sharply pressing) that it cuts straight to what counts. 大 (big) + 切 (sharp/pressing) = of great importance (大切)!"}},{"romaji":"taihenna","kana":"たいへんな","kanji":"大変な","meaning":"tough","mnemonic":"大 (big) + 変 (change/strange) = a big deal.","breakdown":{"word":"大変","means":"tough, awful, serious; very","hook":"A “big change” — and big changes are hard work.","parts":[{"k":"大","pos":"top","text":"“big, great.” A person with arms and legs spread wide."},{"k":"変","pos":"bottom","text":"“change, strange.” A form turning over a trailing foot (夂): things becoming something else."}],"visualize":"When a 大 (big) 変 (upheaval) lands on you, life turns rough and overwhelming. 大 (big) + 変 (change) = a serious ordeal (大変)!"}},{"romaji":"nigiyakana","kana":"にぎやかな","kanji":"賑やかな","meaning":"bustling","mnemonic":"貝【かい】 (money) + 辰【たつ】 (dragon) = a loud, busy market.","breakdown":{"word":"賑","means":"bustling, lively, prosperous","hook":"A marketplace booming with money and motion.","parts":[{"k":"貝【かい】","pos":"left","text":"“shell; money.” Ancient cowrie shells were used as currency."},{"k":"辰【たつ】","pos":"right","text":"“dragon; a stirring.” A great writhing creature, full of movement."}],"visualize":"Money (貝【かい】) changing hands as fast as a thrashing dragon (辰【たつ】) — a packed, noisy, prosperous market. 貝 (money) + 辰 (stirring) = bustling, lively (賑やか)!"}},{"romaji":"himana","kana":"ひまな","kanji":"暇な","meaning":"free (time)","mnemonic":"日 (sun/time) next to a relaxing enclosure.","breakdown":{"word":"暇","means":"free time, leisure, idleness","hook":"Empty days where the sun just drifts past.","parts":[{"k":"日","pos":"left","text":"“sun, day.” A pictograph of the sun."},{"k":"叚【か】","pos":"right","text":"a “borrowed / spare” element — the same shape that sits inside 借りる, “to borrow.”"}],"visualize":"Days (日) that feel borrowed and unclaimed — hours with nothing booked into them. 日 (day) + 叚【か】 (spare time) = idle hours = free time (暇)!"}},{"romaji":"hetana","kana":"へたな","kanji":"下手な","meaning":"bad at","mnemonic":"下 (down/poor) + 手 (hand).","breakdown":{"word":"下手","means":"unskillful, bad at","hook":"The opposite of 上手 — “the lower hand.”","parts":[{"k":"下","pos":"top","text":"“down, below, lower.” A mark hanging below a baseline."},{"k":"手","pos":"bottom","text":"“hand.” A palm with spread fingers."}],"visualize":"If the upper hand is skill, then the 下 (lower) 手 (hand) is the clumsy, losing one. 下 (lower) + 手 (hand) = the lower hand = bad at (下手)!"}},{"romaji":"benrina","kana":"べんりな","kanji":"便利な","meaning":"convenient","mnemonic":"便 (convenience) + 利 (profit/benefit).","breakdown":{"word":"便利","means":"convenient, handy","hook":"A person who makes things flow — at a tidy profit.","parts":[{"k":"便","pos":"left","text":"“convenience, ease.” A person (亻) who smooths things along and keeps them running."},{"k":"利","pos":"right","text":"“profit, advantage; sharp.” 禾【か】 (grain) beside 刂 (a knife): cutting the harvest = gain."}],"visualize":"A handy person (便) who reaps a clean profit (利) makes everything quick and easy. 便 (ease) + 利 (advantage) = convenient (便利)!"}},{"romaji":"massuguna","kana":"まっすぐな","kanji":"真っ直ぐな","meaning":"straight","mnemonic":"真 (true) + 直 (straight).","breakdown":{"word":"真っ直ぐ","means":"straight, direct, upright","hook":"Two “true / straight” kanji stacked for emphasis.","parts":[{"k":"真","pos":"left","text":"“true, real, genuine.” A spoon (匕) over an 目 (eye) over a stand: seeing things exactly as they are."},{"k":"直","pos":"right","text":"“straight, direct; to fix.” Ten (十) 目 (eyes) lined up along one corner — looking dead straight."}],"visualize":"Line up a 真 (true) gaze with a 直 (straight) edge and you get a path with no bends and no lies. 真 (true) + 直 (straight) = perfectly straight (真っ直ぐ)!"}},{"romaji":"yuumeina","kana":"ゆうめいな","kanji":"有名な","meaning":"famous","mnemonic":"有 (exist) + 名 (name).","breakdown":{"word":"有名","means":"famous, well-known","hook":"Literally “to have a name.”","parts":[{"k":"有","pos":"top","text":"“to have, possess, exist.” A hand holding a piece of 月 (meat): having something in hand."},{"k":"名","pos":"bottom","text":"“name.” 夕 (evening) over 口 (mouth): in the dark you call out your name aloud."}],"visualize":"To 有 (have) a 名 (name) on everyone’s lips is exactly what it is to be famous. 有 (to have) + 名 (name) = famous (有名)!"}},{"romaji":"rippana","kana":"りっぱな","kanji":"立派な","meaning":"splendid","mnemonic":"立 (stand) + 派【は】 (faction/splendid).","breakdown":{"word":"立派","means":"splendid, fine, respectable","hook":"Standing tall at the head of your own school.","parts":[{"k":"立","pos":"left","text":"“to stand.” A person planted firmly on the ground (the bottom line)."},{"k":"派【は】","pos":"right","text":"“faction, school; distinguished.” 氵 (water) beside a branching stream: a fine offshoot."}],"visualize":"Someone who can 立 (stand) at the head of their own 派 (faction) cuts an impressive, respectable figure. 立 (stand) + 派 (faction) = splendid (立派)!"}},{"romaji":"onaji","kana":"おなじ","kanji":"同じ","meaning":"same","mnemonic":"A single (一) mouth (口) under a cover (冂) saying the same thing.","breakdown":{"word":"同","means":"same, identical, together","hook":"Everyone under one roof speaking with a single voice.","parts":[{"k":"冂","pos":"outer","text":"an enclosure / cover — a boundary drawn around a group."},{"k":"一口","pos":"inside","text":"“one (一) mouth (口)” — a single speaking mouth."}],"visualize":"Gather people under one 冂 (cover) and have them speak with 一 (one) 口 (mouth) — all saying the very same thing. 冂 (together) + 一口 (one voice) = the same (同じ)!"}},{"romaji":"daijoubu","kana":"だいじょうぶ","kanji":"大丈夫","meaning":"okay","mnemonic":"大 (big) + 丈【じょう】 (sturdy) + 夫 (man).","breakdown":{"word":"大丈夫","means":"okay, alright, safe; no problem","hook":"Literally “a great, full-grown man” — i.e. dependable and fine.","parts":[{"k":"大","pos":"top","text":"“big, great.” A person with arms spread wide."},{"k":"丈【じょう】","pos":"middle","text":"“height, stature.” A measured, tall span."},{"k":"夫","pos":"bottom","text":"“grown man.” 大 with a hairpin (一): a full adult male."}],"visualize":"A 大 (great) man of full 丈【じょう】 (stature), a real 夫 (grown man) — strong and reliable, so everything is fine. 大 + 丈 + 夫 = sturdy & safe = it’s okay (大丈夫)!"}}],"level":"N5"},{"name":"Adverbs, Conjunctions & Expressions","cards":[{"romaji":"ikaga","kana":"いかが","kanji":"如何","meaning":"how about","mnemonic":"Polite version of どう (“how”). Usually written in kana いかが."},{"romaji":"ichiban","kana":"いちばん","kanji":"一番","meaning":"best / first","mnemonic":"一 (one) + 番 (number/turn)."},{"romaji":"itsumo","kana":"いつも","kanji":"何時も","meaning":"always","mnemonic":"何時 (“what time”) + も (“even”) → “at any/every time” = always. Usually kana."},{"romaji":"yoku","kana":"よく","kanji":"良く","meaning":"often / well","mnemonic":"良く — the adverb form of 良い/いい (“good”): “well,” and by extension “often.”"},{"romaji":"tokidoki","kana":"ときどき","kanji":"時々","meaning":"sometimes","mnemonic":"時 (time) repeated."},{"romaji":"hajimete","kana":"はじめて","kanji":"初めて","meaning":"first time","mnemonic":"衤 (clothing) + 刀【かたな】 (knife) cutting cloth for the first time."},{"romaji":"suguni","kana":"すぐに","kanji":"直ぐに","meaning":"immediately","mnemonic":"直 (straight/direct)."},{"romaji":"sukoshi","kana":"すこし","kanji":"少し","meaning":"a little","mnemonic":"小 (small) with an extending line sliding out."},{"romaji":"chotto","kana":"ちょっと","kanji":"一寸","meaning":"a little bit","mnemonic":"一寸【すん】 = “one 寸 (sun),” an old unit (~3 cm) → a tiny bit. Usually kana ちょっと."},{"romaji":"motto","kana":"もっと","meaning":"more","mnemonic":"Adverb “more, even more”: もっと + adjective raises the degree."},{"romaji":"taihen","kana":"たいへん","kanji":"大変","meaning":"very","mnemonic":"大 (big) + 変 (change)."},{"romaji":"totemo","kana":"とても","meaning":"very","mnemonic":"Intensifier “very, extremely”: とても + adjective."},{"romaji":"amari","kana":"あまり","kanji":"余り","meaning":"not very","mnemonic":"余 (surplus / remainder) → with a negative, あまり〜ない = “not very.” Usually kana."},{"romaji":"tabun","kana":"たぶん","kanji":"多分","meaning":"probably","mnemonic":"多 (many) + 分 (parts/chances)."},{"romaji":"choudo","kana":"ちょうど","kanji":"丁度","meaning":"exactly","mnemonic":"丁【ちょう】 (exact) + 度 (degree)."},{"romaji":"dou","kana":"どう","meaning":"how","mnemonic":"Question adverb “how? / in what way?” (polite form: いかが)."},{"romaji":"doushite","kana":"どうして","kanji":"如何して","meaning":"why","mnemonic":"どう (“how”) + して (“doing”) → “how come?” = why. Usually written in kana."},{"romaji":"naze","kana":"なぜ","kanji":"何故","meaning":"why","mnemonic":"何 (what) + 故【こ】 (reason) → “for what reason?” = why. Usually kana なぜ."},{"romaji":"mata","kana":"また","kanji":"又","meaning":"again","mnemonic":"Looks like a folding stool you use over and over."},{"romaji":"mouichido","kana":"もういちど","kanji":"もう一度","meaning":"once more","mnemonic":"もう (already) + 一 (one) + 度 (degree/time)."},{"romaji":"mada","kana":"まだ","kanji":"未だ","meaning":"yet","mnemonic":"未 means “not yet”; まだ〜 = “still / not yet.” Usually kana."},{"romaji":"mou","kana":"もう","meaning":"already","mnemonic":"Adverb “already / (with neg.) not any more.” もう一つ = “one more.”"},{"romaji":"yukkurito","kana":"ゆっくりと","meaning":"slowly","mnemonic":"ゆっくり (“slowly, at ease”) + と (adverb marker) → “slowly, leisurely.”"},{"romaji":"ano","kana":"あの","meaning":"um","mnemonic":"Filler “um…, er…” — buys thinking time. Same shape as あの (“that over there”)."},{"romaji":"hai","kana":"はい","meaning":"yes","mnemonic":"Polite “yes” (also “here!” when answering a roll call)."},{"romaji":"iie","kana":"いいえ","meaning":"no","mnemonic":"Polite “no.” Pairs with はい (“yes”)."},{"romaji":"iya","kana":"いや","meaning":"no (casual)","mnemonic":"Casual / blunt “no, nah.” More informal than いいえ."},{"romaji":"kudasai","kana":"ください","kanji":"下さい","meaning":"please","mnemonic":"下 (down/give)."},{"romaji":"konna","kana":"こんな","meaning":"such","mnemonic":"こ-series: “this kind of, such (like this)”; こんな + noun."},{"romaji":"eeto","kana":"ええと","meaning":"well","mnemonic":"Hesitation filler: “well…, let me see…” (stalling for thought)."},{"romaji":"shikashi","kana":"しかし","kanji":"然し","meaning":"however","mnemonic":"Contrastive conjunction “however, but” (formal). 然し is usually written in kana."},{"romaji":"jaa","kana":"じゃあ","meaning":"well then","mnemonic":"Casual transition “well then, so” — a contraction of では."},{"romaji":"soreto","kana":"それと","meaning":"and","mnemonic":"Conjunction “and also, and with that” (adds an item)."},{"romaji":"sorekara","kana":"それから","meaning":"after that","mnemonic":"それ (that) + から (after) → “after that, and then.”"},{"romaji":"soredewa","kana":"それでは","meaning":"then","mnemonic":"“Well then, in that case” (formal); leads into a conclusion. Casual: それじゃ."},{"romaji":"dewa","kana":"では","meaning":"then (formal)","mnemonic":"Formal “well then / in that case.” Casual form: じゃあ."},{"romaji":"demo","kana":"でも","meaning":"but","mnemonic":"Conjunction “but, however” (casual); also “…or something” after a noun."},{"romaji":"douzo","kana":"どうぞ","meaning":"here you go","mnemonic":"Offering word: “please, go ahead, here you go.”"},{"romaji":"doumo","kana":"どうも","meaning":"thanks","mnemonic":"“Thanks” (short for どうもありがとう); also “somehow, really.”"},{"romaji":"nado","kana":"など","kanji":"等","meaning":"etc.","mnemonic":"竹【たけ】 (bamboo) + 寺【てら】 (temple)."},{"romaji":"yori","kana":"より","meaning":"than","mnemonic":"Comparison particle “than”: A は B より … = “A is more … than B.”"}],"level":"N5"},{"name":"Daily Life, Objects & Vehicles","cards":[{"romaji":"nagasa","kana":"ながさ","kanji":"長さ","meaning":"length","mnemonic":"長 (long) + さ (degree suffix)."},{"romaji":"hajime","kana":"はじめ","kanji":"始め","meaning":"beginning","mnemonic":"女 (woman) + 台 (pedestal)."},{"romaji":"ongaku","kana":"おんがく","kanji":"音楽","meaning":"music","mnemonic":"音 (sound) + 楽 (enjoy/music)."},{"romaji":"uta","kana":"うた","kanji":"歌","meaning":"song","mnemonic":"Two singing mouths (欠) at the right."},{"romaji":"gitaa","kana":"ギター","meaning":"guitar","mnemonic":"Katakana loanword from English “guitar.”"},{"romaji":"rajio","kana":"ラジオ","meaning":"radio","mnemonic":"Katakana loanword from English “radio.”"},{"romaji":"rajikase","kana":"ラジカセ","meaning":"boombox","mnemonic":"Katakana loanword: blend of ラジオ (radio) + カセット (cassette)."},{"romaji":"teepurekoodaa","kana":"テープレコーダー","meaning":"tape recorder","mnemonic":"Katakana loanword from English “tape recorder.”"},{"romaji":"rekoodo","kana":"レコード","meaning":"record","mnemonic":"Katakana loanword from English “record.”"},{"romaji":"e","kana":"え","kanji":"絵","meaning":"picture","mnemonic":"Thread (糸【いと】) meeting (会) to form an image."},{"romaji":"kami","kana":"かみ","kanji":"紙","meaning":"paper","mnemonic":"Thread (糸【いと】) + Clan/Root (氏【し】)."},{"romaji":"kamera","kana":"カメラ","meaning":"camera","mnemonic":"Katakana loanword from English “camera.”"},{"romaji":"shashin","kana":"しゃしん","kanji":"写真","meaning":"photo","mnemonic":"写 (copy) + 真 (truth)."},{"romaji":"firumu","kana":"フィルム","meaning":"film","mnemonic":"Katakana loanword from English “film.”"},{"romaji":"hagaki","kana":"はがき","kanji":"葉書","meaning":"postcard","mnemonic":"葉 (leaf) + 書 (write)."},{"romaji":"tegami","kana":"てがみ","kanji":"手紙","meaning":"letter","mnemonic":"手 (hand) + 紙 (paper)."},{"romaji":"fuutou","kana":"ふうとう","kanji":"封筒","meaning":"envelope","mnemonic":"封【ふう】 (seal) + 筒【つつ】 (cylinder/tube)."},{"romaji":"kitte","kana":"きって","kanji":"切手","meaning":"stamp","mnemonic":"切 (cut) + 手 (hand)."},{"romaji":"posuto","kana":"ポスト","meaning":"postbox","mnemonic":"Katakana loanword from English “post (box).”"},{"romaji":"hikouki","kana":"ひこうき","kanji":"飛行機","meaning":"airplane","mnemonic":"飛 (fly) + 行 (go) + 機 (machine)."},{"romaji":"kuruma","kana":"くるま","kanji":"車","meaning":"car","mnemonic":"Looks like an axle with two wheels."},{"romaji":"jidousha","kana":"じどうしゃ","kanji":"自動車","meaning":"automobile","mnemonic":"自 (self) + 動 (move) + 車 (car)."},{"romaji":"jitensha","kana":"じてんしゃ","kanji":"自転車","meaning":"bicycle","mnemonic":"自 (self) + 転 (revolve) + 車 (car)."},{"romaji":"basu","kana":"バス","meaning":"bus","mnemonic":"Katakana loanword from English “bus.”"},{"romaji":"takushii","kana":"タクシー","meaning":"taxi","mnemonic":"Katakana loanword from English “taxi.”"},{"romaji":"chikatetsu","kana":"ちかてつ","kanji":"地下鉄","meaning":"subway","mnemonic":"地 (ground) + 下 (under) + 鉄【てつ】 (iron)."},{"romaji":"densha","kana":"でんしゃ","kanji":"電車","meaning":"train","mnemonic":"電 (electricity) + 車 (car)."},{"romaji":"kippu","kana":"きっぷ","kanji":"切符","meaning":"ticket","mnemonic":"切 (cut) + 符【ふ】 (token)."},{"romaji":"tsukue","kana":"つくえ","kanji":"机","meaning":"desk","mnemonic":"Wood (木) + Wind (几)."},{"romaji":"zasshi","kana":"ざっし","kanji":"雑誌","meaning":"magazine","mnemonic":"雑 (mixed) + 誌【し】 (document)."},{"romaji":"shinbun","kana":"しんぶん","kanji":"新聞","meaning":"newspaper","mnemonic":"新 (new) + 聞 (hear/listen)."},{"romaji":"nyuusu","kana":"ニュース","meaning":"news","mnemonic":"Katakana loanword from English “news.”"},{"romaji":"shigoto","kana":"しごと","kanji":"仕事","meaning":"job","mnemonic":"仕 (serve) + 事 (matter)."},{"romaji":"sentaku","kana":"せんたく","kanji":"洗濯","meaning":"washing","mnemonic":"洗 (wash) + 濯【たく】 (rinse)."},{"romaji":"souji","kana":"そうじ","kanji":"掃除","meaning":"cleaning","mnemonic":"掃【そう】 (sweep) + 除 (remove)."},{"romaji":"eiga","kana":"えいが","kanji":"映画","meaning":"movie","mnemonic":"映 (reflect) + 画 (picture)."},{"romaji":"kaimono","kana":"かいもの","kanji":"買い物","meaning":"shopping","mnemonic":"買 (buy) + 物 (thing)."},{"romaji":"supootsu","kana":"スポーツ","meaning":"sports","mnemonic":"Katakana loanword from English “sports.”"},{"romaji":"paatii","kana":"パーティー","meaning":"party","mnemonic":"Katakana loanword from English “party.”"},{"romaji":"sanpo","kana":"さんぽ","kanji":"散歩","meaning":"stroll","mnemonic":"散 (scatter) + 歩 (walk)."},{"romaji":"teeburu","kana":"テーブル","meaning":"table","mnemonic":"Katakana loanword from English “table.”"},{"romaji":"isu","kana":"いす","kanji":"椅子","meaning":"chair","mnemonic":"木 (wood) + 奇【き】 (strange/wonderful) + 子 (object suffix)."},{"romaji":"kabin","kana":"かびん","kanji":"花瓶","meaning":"vase","mnemonic":"花 (flower) + 瓶【びん】 (bottle)."},{"romaji":"macchi","kana":"マッチ","meaning":"match","mnemonic":"Katakana loanword from English “match.”"},{"romaji":"haizara","kana":"はいざら","kanji":"灰皿","meaning":"ashtray","mnemonic":"灰【はい】 (ashes) + 皿【さら】 (plate)."},{"romaji":"hako","kana":"はこ","kanji":"箱","meaning":"box","mnemonic":"Bamboo (竹【たけ】) + Mutually (相)."},{"romaji":"reizouko","kana":"れいぞうこ","kanji":"冷蔵庫","meaning":"fridge","mnemonic":"冷 (cold) + 蔵【ぞう】 (storehouse) + 庫【こ】 (warehouse)."},{"romaji":"terebi","kana":"テレビ","meaning":"television","mnemonic":"Katakana loanword, clipped from English “television.”"},{"romaji":"denwa","kana":"でんわ","kanji":"電話","meaning":"telephone","mnemonic":"電 (electricity) + 話 (speak)."},{"romaji":"beddo","kana":"ベッド","meaning":"bed","mnemonic":"Katakana loanword from English “bed.”"},{"romaji":"shawaa","kana":"シャワー","meaning":"shower","mnemonic":"Katakana loanword from English “shower.”"},{"romaji":"mado","kana":"まど","kanji":"窓","meaning":"window","mnemonic":"A hole (穴【あな】) with a heart (心) looking out."},{"romaji":"sutoobu","kana":"ストーブ","meaning":"stove","mnemonic":"Katakana loanword from English “stove” (a heater)."},{"romaji":"denki","kana":"でんき","kanji":"電気","meaning":"electricity","mnemonic":"電 (electricity/lightning) + 気 (spirit)."},{"romaji":"jisho","kana":"じしょ","kanji":"辞書","meaning":"dictionary","mnemonic":"辞 (word) + 書 (write)."},{"romaji":"teepu","kana":"テープ","meaning":"tape","mnemonic":"Katakana loanword from English “tape.”"},{"romaji":"ki","kana":"き","kanji":"木","meaning":"tree","mnemonic":"A simple drawing of a tree with roots."},{"romaji":"hana","kana":"はな","kanji":"花","meaning":"flower","mnemonic":"Grass (艹) over a changing (化) bud."},{"romaji":"hontou","kana":"ほんとう","kanji":"本当","meaning":"True","mnemonic":"本 (book/origin) + 当 (hit/right)."},{"romaji":"hoka","kana":"ほか","kanji":"他","meaning":"other","mnemonic":"A person (亻) next to a scorpion/snake (也【や】)."},{"romaji":"mono","kana":"もの","kanji":"物","meaning":"thing","mnemonic":"A cow (牛) next to a flag (勿【ぶつ】)."}],"level":"N5"},{"name":"Demonstratives & Interrogatives","cards":[{"romaji":"kore","kana":"これ","kanji":"此れ","meaning":"this (noun)","mnemonic":"こ-series (near me): これ = “this (thing).” Usually written in kana."},{"romaji":"are","kana":"あれ","kanji":"彼れ","meaning":"that (over there)","mnemonic":"あ-series (far from both): あれ = “that (over there).” Usually kana."},{"romaji":"kono","kana":"この","kanji":"此の","meaning":"this (adj)","mnemonic":"こ-series adj (near me): この + noun = “this ___.” Usually kana."},{"romaji":"sono","kana":"その","kanji":"其の","meaning":"that (adj)","mnemonic":"そ-series adj (near you): その + noun = “that ___ (by you).” Usually kana."},{"romaji":"ano","kana":"あの","meaning":"that (over there)","mnemonic":"あ-series adj (far): あの + noun = “that ___ over there.” Usually kana."},{"romaji":"dono","kana":"どの","meaning":"which (adj)","mnemonic":"ど-series question adj: どの + noun = “which ___?”"},{"romaji":"dore","kana":"どれ","kanji":"何れ","meaning":"which (noun)","mnemonic":"ど-series question: どれ = “which one?” Usually written in kana."},{"romaji":"docchi","kana":"どっち","kanji":"何方","meaning":"which one","mnemonic":"Casual ど-series: どっち = “which one / which way?” Usually kana."},{"romaji":"doko","kana":"どこ","kanji":"何処","meaning":"where","mnemonic":"ど-series question: どこ = “where?” Usually written in kana."},{"romaji":"nani","kana":"なに","kanji":"何","meaning":"what","mnemonic":"A person (亻) carrying a heavy box (可)."},{"romaji":"itsu","kana":"いつ","kanji":"何時","meaning":"when","mnemonic":"何 (what) + 時 (time)."}],"level":"N5"},{"name":"Interiors, Travel & Missed Words","cards":[{"romaji":"kaze","kana":"かぜ","kanji":"風邪","meaning":"a cold","mnemonic":"風 (wind) + 邪【じゃ】 (wicked). A wicked wind makes you sick."},{"romaji":"iriguchi","kana":"いりぐち","kanji":"入り口","meaning":"entrance","mnemonic":"入 (enter) + 口 (mouth/opening)."},{"romaji":"heya","kana":"へや","kanji":"部屋","meaning":"room","mnemonic":"部 (section) + 屋 (roof/shop)."},{"romaji":"erebeetaa","kana":"エレベーター","meaning":"elevator","mnemonic":"Katakana loanword from English “elevator.”"},{"romaji":"otearai","kana":"おてあらい","kanji":"お手洗い","meaning":"bathroom","mnemonic":"手 (hand) + 洗 (wash). The hand-washing room."},{"romaji":"toire","kana":"トイレ","meaning":"toilet","mnemonic":"Katakana loanword, clipped from “toilet” (トイレット)."},{"romaji":"ofuro","kana":"おふろ","kanji":"お風呂","meaning":"bath","mnemonic":"風 (wind) + 呂【ろ】 (stacked stones) → a bath. Usually written in kana お風呂."},{"romaji":"furo","kana":"ふろ","kanji":"風呂","meaning":"bath","mnemonic":"Same as お風呂【ろ】 without the polite お: 風 (wind) + 呂 (stacked stones) → a bath."},{"romaji":"kaidan","kana":"かいだん","kanji":"階段","meaning":"stairs","mnemonic":"階【かい】 (story/floor) + 段 (steps)."},{"romaji":"shokudou","kana":"しょくどう","kanji":"食堂","meaning":"dining hall","mnemonic":"食 (eat) + 堂 (hall)."},{"romaji":"daidokoro","kana":"だいどころ","kanji":"台所","meaning":"kitchen","mnemonic":"台 (pedestal/stand) + 所 (place)."},{"romaji":"rouka","kana":"ろうか","kanji":"廊下","meaning":"corridor","mnemonic":"廊【ろう】 (corridor) + 下 (down/under)."},{"romaji":"to","kana":"と","kanji":"戸","meaning":"Japanese style door","mnemonic":"Looks like a single door swinging open."},{"romaji":"doa","kana":"ドア","meaning":"Western style door","mnemonic":"Katakana loanword from English “door.”"},{"romaji":"mon","kana":"もん","kanji":"門","meaning":"gate","mnemonic":"Looks exactly like two swinging gate doors."},{"romaji":"deguchi","kana":"でぐち","kanji":"出口","meaning":"exit","mnemonic":"出 (exit/out) + 口 (mouth/opening)."},{"romaji":"ryokou","kana":"りょこう","kanji":"旅行","meaning":"travel","mnemonic":"旅 (trip) + 行 (go)."},{"romaji":"chizu","kana":"ちず","kanji":"地図","meaning":"map","mnemonic":"地 (ground) + 図 (diagram)."}],"level":"N5"},{"name":"Time, Eras & Extents","level":"N4","cards":[{"romaji":"jidai","kana":"じだい","kanji":"時代","meaning":"era","mnemonic":"時 (time) + 代 (generation)."},{"romaji":"mukashi","kana":"むかし","kanji":"昔","meaning":"olden days","mnemonic":"昔 (days gone by)."},{"romaji":"shourai","kana":"しょうらい","kanji":"将来","meaning":"future","mnemonic":"将【しょう】 (leader/future) + 来 (come)."},{"romaji":"asu","kana":"あす","kanji":"明日","meaning":"tomorrow","mnemonic":"明 (bright) + 日 (day)."},{"romaji":"konya","kana":"こんや","kanji":"今夜","meaning":"tonight","mnemonic":"今 (now) + 夜 (night)."},{"romaji":"kondo","kana":"こんど","kanji":"今度","meaning":"next time","mnemonic":"今 (now) + 度 (degree/time)."},{"romaji":"sakki","kana":"さっき","kanji":"先程","meaning":"some time ago","mnemonic":"Usually written in Kana."},{"romaji":"korekara","kana":"これから","kanji":"此れから","meaning":"after this","mnemonic":"これ (this) + から (from)."},{"romaji":"konoaida","kana":"このあいだ","kanji":"この間","meaning":"recently","mnemonic":"この (this) + 間 (interval)."},{"romaji":"konogoro","kana":"このごろ","kanji":"この頃","meaning":"nowadays","mnemonic":"頃【ころ】 (time/about)."},{"romaji":"saikin","kana":"さいきん","kanji":"最近","meaning":"nowadays","mnemonic":"最 (most) + 近 (recent/near)."},{"romaji":"saraishuu","kana":"さらいしゅう","kanji":"再来週","meaning":"week after next","mnemonic":"再【さい】 (again) + 来 (come) + 週 (week)."},{"romaji":"saraigetsu","kana":"さらいげつ","kanji":"再来月","meaning":"month after next","mnemonic":"再【さい】 (again) + 来 (come) + 月 (month)."},{"romaji":"hiruma","kana":"ひるま","kanji":"昼間","meaning":"daytime","mnemonic":"昼 (noon) + 間 (interval)."},{"romaji":"hiruyasumi","kana":"ひるやすみ","kanji":"昼休み","meaning":"noon break","mnemonic":"昼 (noon) + 休 (rest)."},{"romaji":"saisho","kana":"さいしょ","kanji":"最初","meaning":"first","mnemonic":"最 (most) + 初 (first)."},{"romaji":"saigo","kana":"さいご","kanji":"最後","meaning":"last","mnemonic":"最 (most) + 後 (after/behind)."},{"romaji":"owari","kana":"おわり","kanji":"終わり","meaning":"the end","mnemonic":"終 (end)."},{"romaji":"ichido","kana":"いちど","kanji":"一度","meaning":"once","mnemonic":"一 (one) + 度 (degree/time)."},{"romaji":"ijou","kana":"いじょう","kanji":"以上","meaning":"more than","mnemonic":"以 (by means of) + 上 (up)."},{"romaji":"ika","kana":"いか","kanji":"以下","meaning":"less than","mnemonic":"以 (by means of) + 下 (down)."},{"romaji":"igai","kana":"いがい","kanji":"以外","meaning":"exception of","mnemonic":"以 (by means of) + 外 (outside)."},{"romaji":"inai","kana":"いない","kanji":"以内","meaning":"within","mnemonic":"以 (by means of) + 内 (inside)."},{"romaji":"uchi","kana":"うち","kanji":"内","meaning":"within","mnemonic":"内 (inside)."},{"romaji":"hodo","kana":"ほど","kanji":"程","meaning":"extent","mnemonic":"程 (degree/extent)."},{"romaji":"bai","kana":"ばい","kanji":"倍","meaning":"double","mnemonic":"倍【ばい】 (double/times)."},{"romaji":"ryouhou","kana":"りょうほう","kanji":"両方","meaning":"both sides","mnemonic":"両 (both) + 方 (direction/side)."}]},{"name":"Body, Health & Feelings","level":"N4","cards":[{"romaji":"ude","kana":"うで","kanji":"腕","meaning":"arm","mnemonic":"月 (flesh) + 宛【あて】 (address)."},{"romaji":"yubi","kana":"ゆび","kanji":"指","meaning":"finger","mnemonic":"手 (hand) + 旨【むね】 (delicious/meaning)."},{"romaji":"kubi","kana":"くび","kanji":"首","meaning":"neck","mnemonic":"首 (neck/head)."},{"romaji":"nodo","kana":"のど","kanji":"喉","meaning":"throat","mnemonic":"口 (mouth) + 侯【こう】 (marquis)."},{"romaji":"senaka","kana":"せなか","kanji":"背中","meaning":"back of body","mnemonic":"背 (back) + 中 (middle)."},{"romaji":"kami","kana":"かみ","kanji":"髪","meaning":"hair","mnemonic":"髟 (hair) + 友 (friend)."},{"romaji":"ke","kana":"け","kanji":"毛","meaning":"hair","mnemonic":"毛【け】 (fur/hair)."},{"romaji":"hige","kana":"ひげ","kanji":"髭","meaning":"beard","mnemonic":"髟 (hair) + 此【この】 (this)."},{"romaji":"chi","kana":"ち","kanji":"血","meaning":"blood","mnemonic":"血【ち】 (blood)."},{"romaji":"chikara","kana":"ちから","kanji":"力","meaning":"strength","mnemonic":"力 (power/strength)."},{"romaji":"ki","kana":"き","kanji":"気","meaning":"spirit / mood","mnemonic":"気 (spirit)."},{"romaji":"kibun","kana":"きぶん","kanji":"気分","meaning":"mood","mnemonic":"気 (spirit) + 分 (part)."},{"romaji":"kimochi","kana":"きもち","kanji":"気持ち","meaning":"feeling / mood","mnemonic":"気 (spirit) + 持 (hold)."},{"romaji":"uso","kana":"うそ","kanji":"嘘","meaning":"lie","mnemonic":"口 (mouth) + 虚【きょ】 (void)."},{"romaji":"un","kana":"うん","meaning":"yes","mnemonic":"Casual “yes / uh-huh” (the informal はい). Usually kana."},{"romaji":"futsuu","kana":"ふつう","kanji":"普通","meaning":"normal","mnemonic":"普【ふ】 (universal) + 通 (pass)."},{"romaji":"hen","kana":"へん","kanji":"変","meaning":"strange","mnemonic":"変 (strange/change)."},{"romaji":"hantai","kana":"はんたい","kanji":"反対","meaning":"opposition","mnemonic":"反 (anti) + 対 (opposite)."},{"romaji":"kokoro","kana":"こころ","kanji":"心","meaning":"heart","mnemonic":"心 (heart)."},{"romaji":"yume","kana":"ゆめ","kanji":"夢","meaning":"dream","mnemonic":"夢 (dream)."},{"romaji":"shumi","kana":"しゅみ","kanji":"趣味","meaning":"hobby","mnemonic":"趣【しゅ】 (gist) + 味 (flavor)."},{"romaji":"kyoumi","kana":"きょうみ","kanji":"興味","meaning":"interest","mnemonic":"興【きょう】 (entertain) + 味 (flavor)."},{"romaji":"chuui","kana":"ちゅうい","kanji":"注意","meaning":"caution","mnemonic":"注 (pour) + 意 (idea)."},{"romaji":"guai","kana":"ぐあい","kanji":"具合","meaning":"condition","mnemonic":"具 (tool) + 合 (fit)."},{"romaji":"netsu","kana":"ねつ","kanji":"熱","meaning":"fever","mnemonic":"熱 (heat/fever)."},{"romaji":"gozonji","kana":"ごぞんじ","kanji":"ご存じ","meaning":"knowing","mnemonic":"存 (exist) + じ (polite suffix)."},{"romaji":"hazu","kana":"はず","kanji":"筈","meaning":"should be","mnemonic":"筈【はず】 (notch/expectation)."},{"romaji":"tsumori","kana":"つもり","meaning":"intention","mnemonic":"Noun “intention, plan”: 〜つもり = “I intend to…”. Usually kana."},{"romaji":"okage","kana":"おかげ","kanji":"お陰","meaning":"owing to","mnemonic":"陰【かげ】 (shade/shadow)."},{"romaji":"tame","kana":"ため","kanji":"為","meaning":"in order to","mnemonic":"為【ため】 (do/cause)."},{"romaji":"orei","kana":"おれい","kanji":"お礼","meaning":"gratitude","mnemonic":"礼 (thanks/bow)."}]},{"name":"People & Occupations","level":"N4","cards":[{"romaji":"josei","kana":"じょせい","kanji":"女性","meaning":"woman","mnemonic":"女 (woman) + 性 (gender/nature)."},{"romaji":"dansei","kana":"だんせい","kanji":"男性","meaning":"male","mnemonic":"男 (man) + 性 (gender/nature)."},{"romaji":"kankei","kana":"かんけい","kanji":"関係","meaning":"relationship","mnemonic":"関 (connection) + 係 (person in charge)."},{"romaji":"boku","kana":"ぼく","kanji":"僕","meaning":"I (males)","mnemonic":"僕【ぼく】 (servant/I)."},{"romaji":"kimi","kana":"きみ","kanji":"君","meaning":"you (informal)","mnemonic":"君 (ruler/you)."},{"romaji":"kanojo","kana":"かのじょ","kanji":"彼女","meaning":"she / girlfriend","mnemonic":"彼 (he) + 女 (woman)."},{"romaji":"kare","kana":"かれ","kanji":"彼","meaning":"he / boyfriend","mnemonic":"彼 (he/that)."},{"romaji":"karera","kana":"かれら","kanji":"彼ら","meaning":"they","mnemonic":"彼 (he) + ら (plural)."},{"romaji":"chan","kana":"ちゃん","meaning":"dear (suffix)","mnemonic":"Affectionate name suffix — a softer 〜さん for kids, friends, pets."},{"romaji":"kun","kana":"くん","kanji":"君","meaning":"Mr. (suffix)","mnemonic":"君 (ruler/suffix)."},{"romaji":"akanbou","kana":"あかんぼう","kanji":"赤ん坊","meaning":"baby","mnemonic":"赤 (red) + 坊【ぼう】 (boy)."},{"romaji":"youji","kana":"ようじ","kanji":"幼児","meaning":"infant","mnemonic":"幼【おさな】 (infancy) + 児【じ】 (child)."},{"romaji":"ko","kana":"こ","kanji":"子","meaning":"child","mnemonic":"子 (child)."},{"romaji":"oya","kana":"おや","kanji":"親","meaning":"parents","mnemonic":"親 (parent)."},{"romaji":"otto","kana":"おっと","kanji":"夫","meaning":"husband","mnemonic":"夫 (husband)."},{"romaji":"tsuma","kana":"つま","kanji":"妻","meaning":"wife","mnemonic":"妻 (wife)."},{"romaji":"kanai","kana":"かない","kanji":"家内","meaning":"my wife","mnemonic":"家 (house) + 内 (inside)."},{"romaji":"sofu","kana":"そふ","kanji":"祖父","meaning":"grandfather","mnemonic":"祖 (ancestor) + 父 (father)."},{"romaji":"sobo","kana":"そぼ","kanji":"祖母","meaning":"grandmother","mnemonic":"祖 (ancestor) + 母 (mother)."},{"romaji":"musuko","kana":"むすこ","kanji":"息子","meaning":"son","mnemonic":"息 (breath) + 子 (child)."},{"romaji":"musume","kana":"むすめ","kanji":"娘","meaning":"daughter","mnemonic":"娘 (daughter)."},{"romaji":"ojousan","kana":"おじょうさん","kanji":"お嬢さん","meaning":"young lady","mnemonic":"嬢【じょう】 (miss/lady)."},{"romaji":"goshujin","kana":"ごしゅじん","kanji":"ご主人","meaning":"your husband","mnemonic":"主 (master) + 人 (person)."},{"romaji":"anaunsaa","kana":"アナウンサー","meaning":"announcer","mnemonic":"Katakana loanword from English “announcer.”"},{"romaji":"untenshu","kana":"うんてんしゅ","kanji":"運転手","meaning":"driver","mnemonic":"運 (carry) + 転 (revolve) + 手 (hand)."},{"romaji":"kangoshi","kana":"かんごし","kanji":"看護師","meaning":"nurse","mnemonic":"看【み】 (watch) + 護【まも】 (protect) + 師 (expert)."},{"romaji":"haisha","kana":"はいしゃ","kanji":"歯医者","meaning":"dentist","mnemonic":"歯 (tooth) + 医 (medicine) + 者 (person)."},{"romaji":"ten'in","kana":"てんいん","kanji":"店員","meaning":"shop assistant","mnemonic":"店 (shop) + 員 (employee)."},{"romaji":"kyaku","kana":"きゃく","kanji":"客","meaning":"guest","mnemonic":"客 (guest)."},{"romaji":"suri","kana":"すり","kanji":"掏摸","meaning":"pickpocket","mnemonic":"Usually written in Kana."},{"romaji":"dorobou","kana":"どろぼう","kanji":"泥棒","meaning":"thief","mnemonic":"泥【どろ】 (mud) + 棒【ぼう】 (stick)."},{"romaji":"shimin","kana":"しみん","kanji":"市民","meaning":"citizen","mnemonic":"市 (city) + 民 (people)."},{"romaji":"keisatsu","kana":"けいさつ","kanji":"警察","meaning":"police","mnemonic":"警 (guard) + 察 (inspect)."},{"romaji":"koumuin","kana":"こうむいん","kanji":"公務員","meaning":"gov worker","mnemonic":"公 (public) + 務 (task) + 員 (member)."},{"romaji":"kanemochi","kana":"かねもち","kanji":"金持ち","meaning":"rich man","mnemonic":"金 (gold/money) + 持 (hold)."},{"romaji":"shachou","kana":"しゃちょう","kanji":"社長","meaning":"company president","mnemonic":"社 (company) + 長 (long/leader)."},{"romaji":"buchou","kana":"ぶちょう","kanji":"部長","meaning":"section head","mnemonic":"部 (section) + 長 (leader)."},{"romaji":"kachou","kana":"かちょう","kanji":"課長","meaning":"section manager","mnemonic":"課【か】 (chapter/section) + 長 (leader)."},{"romaji":"senpai","kana":"せんぱい","kanji":"先輩","meaning":"senior","mnemonic":"先 (before) + 輩【はい】 (comrade)."},{"romaji":"mina","kana":"みな","kanji":"皆","meaning":"everybody","mnemonic":"皆 (all)."}]},{"name":"Nature, Weather, Geography & Phenomena","level":"N4","cards":[{"romaji":"tenkiyohou","kana":"てんきよほう","kanji":"天気予報","meaning":"weather forecast","mnemonic":"天気 (weather) + 予 (beforehand) + 報 (report)."},{"romaji":"taifuu","kana":"たいふう","kanji":"台風","meaning":"typhoon","mnemonic":"台 (pedestal) + 風 (wind)."},{"romaji":"kumo","kana":"くも","kanji":"雲","meaning":"cloud","mnemonic":"雲【くも】 (cloud)."},{"romaji":"hi","kana":"ひ","kanji":"日","meaning":"sun","mnemonic":"日 (sun)."},{"romaji":"hi","kana":"ひ","kanji":"火","meaning":"fire","mnemonic":"火 (fire)."},{"romaji":"kaji","kana":"かじ","kanji":"火事","meaning":"fire (accident)","mnemonic":"火 (fire) + 事 (matter)."},{"romaji":"jishin","kana":"じしん","kanji":"地震","meaning":"earthquake","mnemonic":"地 (ground) + 震【ふる】 (quake)."},{"romaji":"kuuki","kana":"くうき","kanji":"空気","meaning":"air","mnemonic":"空 (sky/empty) + 気 (spirit)."},{"romaji":"kusa","kana":"くさ","kanji":"草","meaning":"grass","mnemonic":"草 (grass)."},{"romaji":"ha","kana":"は","kanji":"葉","meaning":"leaf","mnemonic":"葉 (leaf)."},{"romaji":"eda","kana":"えだ","kanji":"枝","meaning":"branch","mnemonic":"枝【えだ】 (branch)."},{"romaji":"ishi","kana":"いし","kanji":"石","meaning":"stone","mnemonic":"石 (stone)."},{"romaji":"suna","kana":"すな","kanji":"砂","meaning":"sand","mnemonic":"砂【すな】 (sand)."},{"romaji":"tsuki","kana":"つき","kanji":"月","meaning":"moon","mnemonic":"月 (moon)."},{"romaji":"hoshi","kana":"ほし","kanji":"星","meaning":"star","mnemonic":"星【ほし】 (star)."},{"romaji":"hikari","kana":"ひかり","kanji":"光","meaning":"light","mnemonic":"光 (light)."},{"romaji":"oto","kana":"おと","kanji":"音","meaning":"sound","mnemonic":"音 (sound)."},{"romaji":"mushi","kana":"むし","kanji":"虫","meaning":"insect","mnemonic":"虫【むし】 (bug)."},{"romaji":"kotori","kana":"ことり","kanji":"小鳥","meaning":"small bird","mnemonic":"小 (small) + 鳥 (bird)."},{"romaji":"sekai","kana":"せかい","kanji":"世界","meaning":"the world","mnemonic":"世 (generation) + 界 (boundary)."},{"romaji":"jinkou","kana":"じんこう","kanji":"人口","meaning":"population","mnemonic":"人 (person) + 口 (mouth)."},{"romaji":"ajia","kana":"アジア","meaning":"Asia","mnemonic":"Katakana loanword from English “Asia.”"},{"romaji":"afurika","kana":"アフリカ","meaning":"Africa","mnemonic":"Katakana loanword from English “Africa.”"},{"romaji":"amerika","kana":"アメリカ","meaning":"America","mnemonic":"Katakana loanword from English “America.”"},{"romaji":"seiyou","kana":"せいよう","kanji":"西洋","meaning":"western countries","mnemonic":"西 (west) + 洋 (ocean)."},{"romaji":"sensou","kana":"せんそう","kanji":"戦争","meaning":"war","mnemonic":"戦 (war) + 争 (conflict)."},{"romaji":"kokusai","kana":"こくさい","kanji":"国際","meaning":"international","mnemonic":"国 (country) + 際 (occasion)."},{"romaji":"shi","kana":"し","kanji":"市","meaning":"city","mnemonic":"市 (city)."},{"romaji":"to","kana":"と","kanji":"都","meaning":"metropolitan","mnemonic":"都 (metropolis)."},{"romaji":"basho","kana":"ばしょ","kanji":"場所","meaning":"location","mnemonic":"場 (place) + 所 (place)."},{"romaji":"kyoukai","kana":"きょうかい","kanji":"教会","meaning":"church","mnemonic":"教 (teach) + 会 (meet)."},{"romaji":"koujou","kana":"こうじょう","kanji":"工場","meaning":"factory","mnemonic":"工 (craft) + 場 (place)."},{"romaji":"jimusho","kana":"じむしょ","kanji":"事務所","meaning":"office","mnemonic":"事 (matter) + 務 (task) + 所 (place)."},{"romaji":"shinbunsha","kana":"しんぶんしゃ","kanji":"新聞社","meaning":"newspaper company","mnemonic":"新聞 (newspaper) + 社 (company)."},{"romaji":"jinja","kana":"じんじゃ","kanji":"神社","meaning":"Shinto shrine","mnemonic":"神 (god) + 社 (shrine)."},{"romaji":"tera","kana":"てら","kanji":"寺","meaning":"temple","mnemonic":"寺【てら】 (temple)."},{"romaji":"doubutsuen","kana":"どうぶつえん","kanji":"動物園","meaning":"zoo","mnemonic":"動物 (animal) + 園 (garden)."},{"romaji":"bijutsukan","kana":"びじゅつかん","kanji":"美術館","meaning":"art gallery","mnemonic":"美 (beauty) + 術 (art) + 館 (building)."},{"romaji":"tokoya","kana":"とこや","kanji":"床屋","meaning":"barber","mnemonic":"床【ゆか】 (floor) + 屋 (shop)."},{"romaji":"ryokan","kana":"りょかん","kanji":"旅館","meaning":"Japanese hotel","mnemonic":"旅 (travel) + 館 (building)."},{"romaji":"keshiki","kana":"けしき","kanji":"景色","meaning":"landscape","mnemonic":"景 (scenery) + 色 (color)."},{"romaji":"inaka","kana":"いなか","kanji":"田舎","meaning":"countryside","mnemonic":"田 (field) + 舎【しゃ】 (cottage)."},{"romaji":"kougai","kana":"こうがい","kanji":"郊外","meaning":"outskirts","mnemonic":"郊【こう】 (suburbs) + 外 (outside)."},{"romaji":"kaigan","kana":"かいがん","kanji":"海岸","meaning":"coast","mnemonic":"海 (sea) + 岸【きし】 (beach)."},{"romaji":"minato","kana":"みなと","kanji":"港","meaning":"harbor","mnemonic":"港 (harbor)."},{"romaji":"shima","kana":"しま","kanji":"島","meaning":"island","mnemonic":"島【しま】 (island)."},{"romaji":"mizuumi","kana":"みずうみ","kanji":"湖","meaning":"lake","mnemonic":"湖【みずうみ】 (lake)."},{"romaji":"hayashi","kana":"はやし","kanji":"林","meaning":"woods","mnemonic":"林【はやし】 (woods/grove)."},{"romaji":"mori","kana":"もり","kanji":"森","meaning":"forest","mnemonic":"森【もり】 (forest/trees)."},{"romaji":"saka","kana":"さか","kanji":"坂","meaning":"slope","mnemonic":"坂【さか】 (slope)."},{"romaji":"tochuu","kana":"とちゅう","kanji":"途中","meaning":"halfway","mnemonic":"途 (route) + 中 (middle)."},{"romaji":"mawari","kana":"まわり","kanji":"周り","meaning":"surroundings","mnemonic":"周【しゅう】 (circumference)."},{"romaji":"aida","kana":"あいだ","kanji":"間","meaning":"a space","mnemonic":"間 (interval)."},{"romaji":"mannaka","kana":"まんなか","kanji":"真ん中","meaning":"middle","mnemonic":"真 (true) + 中 (middle)."},{"romaji":"aida","kana":"あいだ","kanji":"間","meaning":"a space","mnemonic":"間 (interval)."},{"romaji":"mannaka","kana":"まんなか","kanji":"真ん中","meaning":"middle","mnemonic":"真 (true) + 中 (middle)."}]},{"name":"Vehicles, Traffic & Facilities","level":"N4","cards":[{"romaji":"norimono","kana":"のりもの","kanji":"乗り物","meaning":"vehicle","mnemonic":"乗 (ride) + 物 (thing)."},{"romaji":"ootobai","kana":"オートバイ","meaning":"motorcycle","mnemonic":"Wasei (Japan-made) word from “auto” + “bi(ke)” → motorcycle."},{"romaji":"kisha","kana":"きしゃ","kanji":"汽車","meaning":"steam train","mnemonic":"汽【き】 (steam) + 車 (car)."},{"romaji":"tokkyuu","kana":"とっきゅう","kanji":"特急","meaning":"limited express","mnemonic":"特 (special) + 急 (hurry)."},{"romaji":"kyuukou","kana":"きゅうこう","kanji":"急行","meaning":"speedy express","mnemonic":"急 (hurry) + 行 (go)."},{"romaji":"fune","kana":"ふね","kanji":"船","meaning":"ship","mnemonic":"船 (ship)."},{"romaji":"koutsuu","kana":"こうつう","kanji":"交通","meaning":"traffic","mnemonic":"交 (mix) + 通 (pass)."},{"romaji":"jiko","kana":"じこ","kanji":"事故","meaning":"accident","mnemonic":"事 (matter) + 故【こ】 (circumstance)."},{"romaji":"kuukou","kana":"くうこう","kanji":"空港","meaning":"airport","mnemonic":"空 (sky) + 港 (harbor)."},{"romaji":"hikoujou","kana":"ひこうじょう","kanji":"飛行場","meaning":"airport","mnemonic":"飛 (fly) + 行 (go) + 場 (place)."},{"romaji":"gasorinsutando","kana":"ガソリンスタンド","meaning":"petrol station","mnemonic":"Wasei word from “gasoline” + “stand” → petrol station."},{"romaji":"chuushajou","kana":"ちゅうしゃじょう","kanji":"駐車場","meaning":"parking lot","mnemonic":"駐【ちゅう】 (park) + 車 (car) + 場 (place)."},{"romaji":"uketsuke","kana":"うけつけ","kanji":"受付","meaning":"reception","mnemonic":"受 (receive) + 付 (attach)."},{"romaji":"uriba","kana":"うりば","kanji":"売り場","meaning":"selling area","mnemonic":"売 (sell) + 場 (place)."},{"romaji":"kaijou","kana":"かいじょう","kanji":"会場","meaning":"assembly hall","mnemonic":"会 (meet) + 場 (place)."},{"romaji":"kaigishitsu","kana":"かいぎしつ","kanji":"会議室","meaning":"meeting room","mnemonic":"会 (meet) + 議 (debate) + 室 (room)."},{"romaji":"koudou","kana":"こうどう","kanji":"講堂","meaning":"auditorium","mnemonic":"講【こう】 (lecture) + 堂 (hall)."},{"romaji":"esukareetaa","kana":"エスカレーター","meaning":"escalator","mnemonic":"Katakana loanword from English “escalator.”"},{"romaji":"okujou","kana":"おくじょう","kanji":"屋上","meaning":"rooftop","mnemonic":"屋 (roof) + 上 (up)."},{"romaji":"nikaidate","kana":"にかいだて","kanji":"二階建て","meaning":"two storied","mnemonic":"二 (two) + 階【かい】 (floor) + 建 (build)."}]},{"name":"Daily Items, Clothes, Food & Home","level":"N4","cards":[{"romaji":"arukooru","kana":"アルコール","meaning":"alcohol","mnemonic":"Katakana loanword from Dutch “alcohol.”"},{"romaji":"gochisou","kana":"ごちそう","kanji":"ご馳走","meaning":"a feast","mnemonic":"馳【は】 (run) + 走 (run)."},{"romaji":"suteeki","kana":"ステーキ","meaning":"steak","mnemonic":"Katakana loanword from English “steak.”"},{"romaji":"keeki","kana":"ケーキ","meaning":"cake","mnemonic":"Katakana loanword from English “cake.”"},{"romaji":"sarada","kana":"サラダ","meaning":"salad","mnemonic":"Katakana loanword from English “salad.”"},{"romaji":"sandoicchi","kana":"サンドイッチ","meaning":"sandwich","mnemonic":"Katakana loanword from English “sandwich.”"},{"romaji":"shokuryouhin","kana":"しょくりょうひん","kanji":"食料品","meaning":"groceries","mnemonic":"食 (eat) + 料 (materials) + 品 (goods)."},{"romaji":"kome","kana":"こめ","kanji":"米","meaning":"uncooked rice","mnemonic":"米 (rice)."},{"romaji":"miso","kana":"みそ","kanji":"味噌","meaning":"bean paste","mnemonic":"味 (flavor) + 噌【そ】 (boisterous/paste)."},{"romaji":"jamu","kana":"ジャム","meaning":"jam","mnemonic":"Katakana loanword from English “jam.”"},{"romaji":"budou","kana":"ぶどう","kanji":"葡萄","meaning":"grapes","mnemonic":"Usually written in Kana."},{"romaji":"aji","kana":"あじ","kanji":"味","meaning":"flavour","mnemonic":"味 (flavor)."},{"romaji":"nioi","kana":"におい","kanji":"匂い","meaning":"smell","mnemonic":"匂【にお】 (scent)."},{"romaji":"akusesarii","kana":"アクセサリー","meaning":"accessory","mnemonic":"Katakana loanword from English “accessory.”"},{"romaji":"yubiwa","kana":"ゆびわ","kanji":"指輪","meaning":"finger ring","mnemonic":"指 (finger) + 輪【わ】 (ring)."},{"romaji":"tebukuro","kana":"てぶくろ","kanji":"手袋","meaning":"glove","mnemonic":"手 (hand) + 袋【ふくろ】 (sack)."},{"romaji":"handobaggu","kana":"ハンドバッグ","meaning":"handbag","mnemonic":"Katakana loanword from English “handbag.”"},{"romaji":"kagami","kana":"かがみ","kanji":"鏡","meaning":"mirror","mnemonic":"鏡【かがみ】 (mirror)."},{"romaji":"kakkou","kana":"かっこう","kanji":"格好","meaning":"appearance","mnemonic":"格 (status) + 好 (like)."},{"romaji":"kimono","kana":"きもの","kanji":"着物","meaning":"kimono","mnemonic":"着 (wear) + 物 (thing)."},{"romaji":"suutsu","kana":"スーツ","meaning":"suit","mnemonic":"Katakana loanword from English “suit.”"},{"romaji":"shitagi","kana":"したぎ","kanji":"下着","meaning":"underwear","mnemonic":"下 (under) + 着 (wear)."},{"romaji":"sandaru","kana":"サンダル","meaning":"sandal","mnemonic":"Katakana loanword from English “sandal.”"},{"romaji":"ito","kana":"いと","kanji":"糸","meaning":"thread","mnemonic":"糸【いと】 (thread)."},{"romaji":"kinu","kana":"きぬ","kanji":"絹","meaning":"silk","mnemonic":"絹【きぬ】 (silk)."},{"romaji":"momen","kana":"もめん","kanji":"木綿","meaning":"cotton","mnemonic":"木 (wood) + 綿【わた】 (cotton)."},{"romaji":"reji","kana":"レジ","meaning":"register","mnemonic":"Katakana loanword, clipped from English “register” (cash register)."},{"romaji":"nedan","kana":"ねだん","kanji":"値段","meaning":"price","mnemonic":"値 (value) + 段 (step)."},{"romaji":"otsuri","kana":"おつり","kanji":"お釣り","meaning":"change (money)","mnemonic":"釣【つ】 (fish/change)."},{"romaji":"omiyage","kana":"おみやげ","kanji":"お土産","meaning":"souvenir","mnemonic":"土 (earth) + 産 (produce)."},{"romaji":"shinamono","kana":"しなもの","kanji":"品物","meaning":"goods","mnemonic":"品 (goods) + 物 (thing)."},{"romaji":"omocha","kana":"おもちゃ","kanji":"玩具","meaning":"toy","mnemonic":"Usually written in Kana."},{"romaji":"ningyou","kana":"にんぎょう","kanji":"人形","meaning":"doll","mnemonic":"人 (person) + 形 (shape)."},{"romaji":"beru","kana":"ベル","meaning":"bell","mnemonic":"Katakana loanword from English “bell.”"},{"romaji":"manga","kana":"まんが","kanji":"漫画","meaning":"comic","mnemonic":"漫【まん】 (cartoon) + 画 (picture)."},{"romaji":"nikki","kana":"にっき","kanji":"日記","meaning":"journal","mnemonic":"日 (day) + 記 (record)."},{"romaji":"denpou","kana":"でんぽう","kanji":"電報","meaning":"telegram","mnemonic":"電 (electricity) + 報 (report)."},{"romaji":"gasu","kana":"ガス","meaning":"gas/petrol","mnemonic":"Katakana loanword from Dutch “gas.”"},{"romaji":"gasorin","kana":"ガソリン","meaning":"petrol","mnemonic":"Katakana loanword from English “gasoline.”"},{"romaji":"piano","kana":"ピアノ","meaning":"piano","mnemonic":"Katakana loanword from Italian “piano.”"},{"romaji":"fakkusu","kana":"ファックス","meaning":"fax","mnemonic":"Katakana loanword from English “fax.”"},{"romaji":"sutereo","kana":"ステレオ","meaning":"stereo","mnemonic":"Katakana loanword from English “stereo.”"},{"romaji":"suutsukeesu","kana":"スーツケース","meaning":"suitcase","mnemonic":"Katakana loanword from English “suitcase.”"},{"romaji":"dentou","kana":"でんとう","kanji":"電灯","meaning":"electric light","mnemonic":"電 (electricity) + 灯【あかり】 (lamp)."},{"romaji":"tatami","kana":"たたみ","kanji":"畳","meaning":"Japanese mat","mnemonic":"畳【たた】 (tatami)."},{"romaji":"futon","kana":"ふとん","kanji":"布団","meaning":"bedding","mnemonic":"布【ぬの】 (cloth) + 団【だん】 (group)."},{"romaji":"kaaten","kana":"カーテン","meaning":"curtain","mnemonic":"Katakana loanword from English “curtain.”"},{"romaji":"garasu","kana":"ガラス","meaning":"glass pane","mnemonic":"Katakana loanword from Dutch “glas” (glass)."},{"romaji":"tana","kana":"たな","kanji":"棚","meaning":"shelves","mnemonic":"棚【たな】 (shelf)."},{"romaji":"hikidashi","kana":"ひきだし","kanji":"引き出し","meaning":"drawer","mnemonic":"引 (pull) + 出 (out)."},{"romaji":"danbou","kana":"だんぼう","kanji":"暖房","meaning":"heating","mnemonic":"暖【あたた】 (warm) + 房【ふさ】 (room)."},{"romaji":"reibou","kana":"れいぼう","kanji":"冷房","meaning":"air conditioning","mnemonic":"冷 (cold) + 房【ふさ】 (room)."},{"romaji":"suidou","kana":"すいどう","kanji":"水道","meaning":"water supply","mnemonic":"水 (water) + 道 (path)."},{"romaji":"yu","kana":"ゆ","kanji":"湯","meaning":"hot water","mnemonic":"湯【ゆ】 (hot water)."},{"romaji":"dougu","kana":"どうぐ","kanji":"道具","meaning":"tool","mnemonic":"道 (path) + 具 (tool)."},{"romaji":"geshuku","kana":"げしゅく","kanji":"下宿","meaning":"lodging","mnemonic":"下 (down) + 宿 (lodge)."},{"romaji":"gomi","kana":"ごみ","kanji":"ゴミ","meaning":"rubbish","mnemonic":"“Rubbish, trash.” Written ごみ / ゴミ in kana, no kanji."},{"romaji":"wasuremono","kana":"わすれもの","kanji":"忘れ物","meaning":"lost article","mnemonic":"忘 (forget) + 物 (thing)."},{"romaji":"oshiire","kana":"おしいれ","kanji":"押し入れ","meaning":"closet","mnemonic":"押 (push) + 入 (enter)."},{"romaji":"kabe","kana":"かべ","kanji":"壁","meaning":"wall","mnemonic":"壁【かべ】 (wall)."},{"romaji":"juusho","kana":"じゅうしょ","kanji":"住所","meaning":"address","mnemonic":"住 (reside) + 所 (place)."},{"romaji":"otaku","kana":"おたく","kanji":"お宅","meaning":"your house","mnemonic":"宅 (house)."},{"romaji":"kinjo","kana":"きんじょ","kanji":"近所","meaning":"neighbourhood","mnemonic":"近 (near) + 所 (place)."},{"romaji":"sumi","kana":"すみ","kanji":"隅","meaning":"corner","mnemonic":"隅【すみ】 (corner)."}]},{"name":"Education, Concepts & Society","level":"N4","cards":[{"romaji":"katachi","kana":"かたち","kanji":"形","meaning":"shape","mnemonic":"形 (shape)."},{"romaji":"kata","kana":"かた","kanji":"型","meaning":"type","mnemonic":"型【かた】 (mold/type)."},{"romaji":"sen","kana":"せん","kanji":"線","meaning":"line","mnemonic":"線【せん】 (line)."},{"romaji":"ten","kana":"てん","kanji":"点","meaning":"dot","mnemonic":"点 (point/dot)."},{"romaji":"omote","kana":"おもて","kanji":"表","meaning":"the front","mnemonic":"表 (surface)."},{"romaji":"ura","kana":"うら","kanji":"裏","meaning":"reverse side","mnemonic":"裏【うら】 (back)."},{"romaji":"kyouiku","kana":"きょういく","kanji":"教育","meaning":"education","mnemonic":"教 (teach) + 育 (raise)."},{"romaji":"shougakkou","kana":"しょうがっこう","kanji":"小学校","meaning":"elementary school","mnemonic":"小 (small) + 学校 (school)."},{"romaji":"chuugakkou","kana":"ちゅうがっこう","kanji":"中学校","meaning":"junior high school","mnemonic":"中 (middle) + 学校 (school)."},{"romaji":"koukou","kana":"こうこう","kanji":"高校","meaning":"high school","mnemonic":"高 (high) + 校 (school)."},{"romaji":"koutougakkou","kana":"こうとうがっこう","kanji":"高等学校","meaning":"high school","mnemonic":"高 (high) + 等 (class) + 学校 (school)."},{"romaji":"koukousei","kana":"こうこうせい","kanji":"高校生","meaning":"high school student","mnemonic":"高校 (high school) + 生 (student)."},{"romaji":"daigakusei","kana":"だいがくせい","kanji":"大学生","meaning":"university student","mnemonic":"大学 (university) + 生 (student)."},{"romaji":"kouchou","kana":"こうちょう","kanji":"校長","meaning":"headmaster","mnemonic":"校 (school) + 長 (leader)."},{"romaji":"igaku","kana":"いがく","kanji":"医学","meaning":"medical science","mnemonic":"医 (medicine) + 学 (study)."},{"romaji":"kagaku","kana":"かがく","kanji":"科学","meaning":"science","mnemonic":"科 (department) + 学 (study)."},{"romaji":"kenkyuushitsu","kana":"けんきゅうしつ","kanji":"研究室","meaning":"laboratory","mnemonic":"研 (polish) + 究 (research) + 室 (room)."},{"romaji":"suugaku","kana":"すうがく","kanji":"数学","meaning":"mathematics","mnemonic":"数 (number) + 学 (study)."},{"romaji":"chiri","kana":"ちり","kanji":"地理","meaning":"geography","mnemonic":"地 (ground) + 理 (logic)."},{"romaji":"rekishi","kana":"れきし","kanji":"歴史","meaning":"history","mnemonic":"歴【れき】 (curriculum) + 史【し】 (history)."},{"romaji":"bungaku","kana":"ぶんがく","kanji":"文学","meaning":"literature","mnemonic":"文 (text) + 学 (study)."},{"romaji":"ji","kana":"じ","kanji":"字","meaning":"character","mnemonic":"字 (character)."},{"romaji":"bunpou","kana":"ぶんぽう","kanji":"文法","meaning":"grammar","mnemonic":"文 (text) + 法 (law)."},{"romaji":"hatsuon","kana":"はつおん","kanji":"発音","meaning":"pronunciation","mnemonic":"発 (emit) + 音 (sound)."},{"romaji":"yoshuu","kana":"よしゅう","kanji":"予習","meaning":"preparation","mnemonic":"予 (beforehand) + 習 (learn)."},{"romaji":"fukushuu","kana":"ふくしゅう","kanji":"復習","meaning":"revision","mnemonic":"復【ふく】 (return) + 習 (learn)."},{"romaji":"shiken","kana":"しけん","kanji":"試験","meaning":"examination","mnemonic":"試 (test) + 験 (verify)."},{"romaji":"sotsugyou","kana":"そつぎょう","kanji":"卒業","meaning":"graduation","mnemonic":"卒【そつ】 (graduate) + 業 (business/study)."},{"romaji":"gijutsu","kana":"ぎじゅつ","kanji":"技術","meaning":"technology/skill","mnemonic":"技【わざ】 (skill) + 術 (art)."},{"romaji":"boueki","kana":"ぼうえき","kanji":"貿易","meaning":"trade","mnemonic":"貿【ぼう】 (trade) + 易 (easy/exchange)."},{"romaji":"houritsu","kana":"ほうりつ","kanji":"法律","meaning":"law","mnemonic":"法 (law) + 律【りつ】 (rhythm/law)."},{"romaji":"seiji","kana":"せいじ","kanji":"政治","meaning":"politics","mnemonic":"政 (politics) + 治 (govern)."},{"romaji":"keizai","kana":"けいざい","kanji":"経済","meaning":"economy","mnemonic":"経 (manage) + 済 (settle)."},{"romaji":"sangyou","kana":"さんぎょう","kanji":"産業","meaning":"industry","mnemonic":"産 (produce) + 業 (business)."},{"romaji":"kougyou","kana":"こうぎょう","kanji":"工業","meaning":"manufacturing","mnemonic":"工 (craft) + 業 (business)."},{"romaji":"shakai","kana":"しゃかい","kanji":"社会","meaning":"society","mnemonic":"社 (company/society) + 会 (meet)."},{"romaji":"bunka","kana":"ぶんか","kanji":"文化","meaning":"culture","mnemonic":"文 (text) + 化 (change)."},{"romaji":"keshigomu","kana":"けしゴム","kanji":"消しゴム","meaning":"eraser","mnemonic":"消 (erase) + ゴム (rubber)."},{"romaji":"seki","kana":"せき","kanji":"席","meaning":"seat","mnemonic":"席 (seat)."},{"romaji":"konpyuutaa","kana":"コンピューター","meaning":"computer","mnemonic":"Katakana loanword from English “computer.”"},{"romaji":"pasokon","kana":"パソコン","meaning":"personal computer","mnemonic":"Wasei clip of “personal computer.”"},{"romaji":"sofuto","kana":"ソフト","meaning":"software","mnemonic":"Katakana loanword, clipped from English “software.”"},{"romaji":"waapuro","kana":"ワープロ","meaning":"word processor","mnemonic":"Wasei clip of “word processor.”"},{"romaji":"repooto","kana":"レポート","meaning":"report","mnemonic":"Katakana loanword from English “report.”"},{"romaji":"tekisuto","kana":"テキスト","meaning":"text book","mnemonic":"Katakana loanword from English “text(book).”"},{"romaji":"jiten","kana":"じてん","kanji":"辞典","meaning":"dictionary","mnemonic":"辞 (word) + 典【てん】 (code)."},{"romaji":"shousetsu","kana":"しょうせつ","kanji":"小説","meaning":"novel","mnemonic":"小 (small) + 説 (theory/story)."},{"romaji":"sukuriin","kana":"スクリーン","meaning":"screen","mnemonic":"Katakana loanword from English “screen.”"},{"romaji":"iken","kana":"いけん","kanji":"意見","meaning":"opinion","mnemonic":"意 (idea) + 見 (see)."},{"romaji":"kisoku","kana":"きそく","kanji":"規則","meaning":"regulations","mnemonic":"規 (rule) + 則【そく】 (rule)."},{"romaji":"gen'in","kana":"げんいん","kanji":"原因","meaning":"cause / source","mnemonic":"原 (origin) + 因 (cause)."},{"romaji":"riyuu","kana":"りゆう","kanji":"理由","meaning":"reason","mnemonic":"理 (logic) + 由 (reason)."},{"romaji":"wake","kana":"わけ","kanji":"訳","meaning":"reason","mnemonic":"訳【わけ】 (translate/reason)."},{"romaji":"kotae","kana":"こたえ","kanji":"答え","meaning":"response","mnemonic":"答 (answer)."},{"romaji":"shikata","kana":"しかた","kanji":"仕方","meaning":"method","mnemonic":"仕 (serve) + 方 (method)."},{"romaji":"youi","kana":"ようい","kanji":"用意","meaning":"preparation","mnemonic":"用 (use) + 意 (idea)."},{"romaji":"wariai","kana":"わりあい","kanji":"割合","meaning":"rate","mnemonic":"割 (divide) + 合 (fit)."},{"romaji":"arubaito","kana":"アルバイト","meaning":"part-time job","mnemonic":"Katakana loanword from German “Arbeit” → a part-time job."},{"romaji":"paato","kana":"パート","meaning":"part time","mnemonic":"Katakana loanword, clipped from English “part(-time).”"},{"romaji":"oiwai","kana":"おいわい","kanji":"お祝い","meaning":"congratulation","mnemonic":"祝【いわ】 (celebrate)."},{"romaji":"okurimono","kana":"おくりもの","kanji":"贈り物","meaning":"gift","mnemonic":"贈【おく】 (present) + 物 (thing)."},{"romaji":"purezento","kana":"プレゼント","meaning":"present","mnemonic":"Katakana loanword from English “present” (gift)."},{"romaji":"omimai","kana":"おみまい","kanji":"お見舞い","meaning":"enquiry (health)","mnemonic":"見 (see) + 舞 (dance)."},{"romaji":"kaigi","kana":"かいぎ","kanji":"会議","meaning":"meeting","mnemonic":"会 (meet) + 議 (debate)."},{"romaji":"tenrankai","kana":"てんらんかい","kanji":"展覧会","meaning":"exhibition","mnemonic":"展【てん】 (expand) + 覧【らん】 (view) + 会 (meet)."},{"romaji":"kaiwa","kana":"かいわ","kanji":"会話","meaning":"conversation","mnemonic":"会 (meet) + 話 (speak)."},{"romaji":"kyousou","kana":"きょうそう","kanji":"競争","meaning":"competition","mnemonic":"競【きそ】 (compete) + 争 (conflict)."},{"romaji":"shiai","kana":"しあい","kanji":"試合","meaning":"game","mnemonic":"試 (test) + 合 (fit)."},{"romaji":"juudou","kana":"じゅうどう","kanji":"柔道","meaning":"judo","mnemonic":"柔【やわ】 (soft) + 道 (path)."},{"romaji":"suiei","kana":"すいえい","kanji":"水泳","meaning":"swimming","mnemonic":"水 (water) + 泳 (swim)."},{"romaji":"oyogikata","kana":"およぎかた","kanji":"泳ぎ方","meaning":"way of swimming","mnemonic":"泳 (swim) + 方 (method)."},{"romaji":"tenisu","kana":"テニス","meaning":"tennis","mnemonic":"Katakana loanword from English “tennis.”"},{"romaji":"odori","kana":"おどり","kanji":"踊り","meaning":"dance","mnemonic":"踊【おど】 (dance)."},{"romaji":"asobi","kana":"あそび","kanji":"遊び","meaning":"play","mnemonic":"遊 (play)."},{"romaji":"tsugou","kana":"つごう","kanji":"都合","meaning":"circumstances","mnemonic":"都 (metropolis) + 合 (fit)."},{"romaji":"youji","kana":"ようじ","kanji":"用事","meaning":"things to do","mnemonic":"用 (use) + 事 (matter)."},{"romaji":"yotei","kana":"よてい","kanji":"予定","meaning":"arrangement","mnemonic":"予 (beforehand) + 定 (decide)."},{"romaji":"kikai","kana":"きかい","kanji":"機会","meaning":"opportunity","mnemonic":"機 (machine/chance) + 会 (meet)."},{"romaji":"shuukan","kana":"しゅうかん","kanji":"習慣","meaning":"custom","mnemonic":"習 (learn) + 慣 (accustomed)."},{"romaji":"baai","kana":"ばあい","kanji":"場合","meaning":"situation","mnemonic":"場 (place) + 合 (fit)."},{"romaji":"kenkyuu","kana":"けんきゅう","kanji":"研究","meaning":"reserch","mnemonic":"研 (polish) + 究 (research)."},{"romaji":"kougi","kana":"こうぎ","kanji":"講義","meaning":"lecture","mnemonic":"講【こう】 (lecture) + 義【ぎ】 (righteousness)."},{"romaji":"omatsuri","kana":"おまつり","kanji":"お祭り","meaning":"festival","mnemonic":"祭【まつり】 (festival)."},{"romaji":"hanami","kana":"はなみ","kanji":"花見","meaning":"blossom viewing","mnemonic":"花 (flower) + 見 (see)."},{"romaji":"kenbutsu","kana":"けんぶつ","kanji":"見物","meaning":"sightseeing","mnemonic":"見 (see) + 物 (thing)."},{"romaji":"konsaato","kana":"コンサート","meaning":"concert","mnemonic":"Katakana loanword from English “concert.”"},{"romaji":"shippai","kana":"しっぱい","kanji":"失敗","meaning":"mistake","mnemonic":"失 (lose) + 敗 (fail)."},{"romaji":"shoukai","kana":"しょうかい","kanji":"紹介","meaning":"introduction","mnemonic":"紹【しょう】 (introduce) + 介【かい】 (mediate)."},{"romaji":"setsumei","kana":"せつめい","kanji":"説明","meaning":"explanation","mnemonic":"説 (theory) + 明 (bright/clear)."},{"romaji":"yakusoku","kana":"やくそく","kanji":"約束","meaning":"promise","mnemonic":"約 (promise) + 束 (bundle)."},{"romaji":"henji","kana":"へんじ","kanji":"返事","meaning":"reply","mnemonic":"返 (return) + 事 (matter)."},{"romaji":"hon'yaku","kana":"ほんやく","kanji":"翻訳","meaning":"translation","mnemonic":"翻【ほん】 (flip) + 訳【わけ】 (translate)."},{"romaji":"bangumi","kana":"ばんぐみ","kanji":"番組","meaning":"television program","mnemonic":"番 (number) + 組 (group)."},{"romaji":"yoyaku","kana":"よやく","kanji":"予約","meaning":"reservation","mnemonic":"予 (beforehand) + 約 (promise)."},{"romaji":"renraku","kana":"れんらく","kanji":"連絡","meaning":"contact","mnemonic":"連 (connect) + 絡【から】 (entwine)."},{"romaji":"riyou","kana":"りよう","kanji":"利用","meaning":"utilization","mnemonic":"利 (profit) + 用 (use)."},{"romaji":"chuusha","kana":"ちゅうしゃ","kanji":"注射","meaning":"injection","mnemonic":"注 (pour) + 射【しゃ】 (shoot)."},{"romaji":"nebou","kana":"ねぼう","kanji":"寝坊","meaning":"oversleeping","mnemonic":"寝 (sleep) + 坊【ぼう】 (boy)."},{"romaji":"rusu","kana":"るす","kanji":"留守","meaning":"absence","mnemonic":"留 (detain) + 守 (protect)."},{"romaji":"kaeri","kana":"かえり","kanji":"帰り","meaning":"return","mnemonic":"帰 (return)."},{"romaji":"koto","kana":"こと","kanji":"事","meaning":"thing (abstract)","mnemonic":"事 (matter)."},{"romaji":"youto","kana":"ようと","kanji":"用途","meaning":"use","mnemonic":"用 (use) + 途 (route)."}]},{"name":"Verbs · Group 1 (U-verbs)","level":"N4","cards":[{"romaji":"au","kana":"あう","kanji":"合う","meaning":"to match","mnemonic":"合 (fit/suit)."},{"romaji":"agaru","kana":"あがる","kanji":"上がる","meaning":"to rise","mnemonic":"上 (up)."},{"romaji":"sagaru","kana":"さがる","kanji":"下がる","meaning":"to get down","mnemonic":"下 (down)."},{"romaji":"aku","kana":"あく","kanji":"空く","meaning":"to open (empty)","mnemonic":"空 (empty/sky)."},{"romaji":"atsumaru","kana":"あつまる","kanji":"集まる","meaning":"to gather","mnemonic":"集 (gather)."},{"romaji":"ayamaru","kana":"あやまる","kanji":"謝る","meaning":"to apologize","mnemonic":"謝【あやま】 (apologize)."},{"romaji":"isogu","kana":"いそぐ","kanji":"急ぐ","meaning":"to hurry","mnemonic":"急 (hurry)."},{"romaji":"inoru","kana":"いのる","kanji":"祈る","meaning":"to pray","mnemonic":"祈【いの】 (pray)."},{"romaji":"ugoku","kana":"うごく","kanji":"動く","meaning":"to move","mnemonic":"動 (move)."},{"romaji":"utsu","kana":"うつ","kanji":"打つ","meaning":"to hit","mnemonic":"打 (hit)."},{"romaji":"utsusu","kana":"うつす","kanji":"写す","meaning":"to copy","mnemonic":"写 (copy)."},{"romaji":"utsuru","kana":"うつる","kanji":"移る","meaning":"to move house","mnemonic":"移【うつ】 (shift)."},{"romaji":"erabu","kana":"えらぶ","kanji":"選ぶ","meaning":"to choose","mnemonic":"選 (choose)."},{"romaji":"okuru","kana":"おくる","kanji":"送る","meaning":"to send","mnemonic":"送 (send)."},{"romaji":"okosu","kana":"おこす","kanji":"起こす","meaning":"to wake","mnemonic":"起 (rouse/wake)."},{"romaji":"okonau","kana":"おこなう","kanji":"行う","meaning":"to do","mnemonic":"行 (go/conduct)."},{"romaji":"okoru","kana":"おこる","kanji":"怒る","meaning":"to get angry","mnemonic":"怒 (angry)."},{"romaji":"otosu","kana":"おとす","kanji":"落とす","meaning":"to drop","mnemonic":"落 (fall/drop)."},{"romaji":"odoru","kana":"おどる","kanji":"踊る","meaning":"to dance","mnemonic":"踊【おど】 (dance)."},{"romaji":"odoroku","kana":"おどろく","kanji":"驚く","meaning":"to be surprised","mnemonic":"驚【おどろ】 (surprise)."},{"romaji":"omoidasu","kana":"おもいだす","kanji":"思い出す","meaning":"to remember","mnemonic":"思 (think) + 出 (out)."},{"romaji":"omou","kana":"おもう","kanji":"思う","meaning":"to think / feel","mnemonic":"思 (think)."},{"romaji":"oru","kana":"おる","kanji":"折る","meaning":"to break (fold)","mnemonic":"折 (fold/break)."},{"romaji":"kazaru","kana":"かざる","kanji":"飾る","meaning":"to decorate","mnemonic":"飾【かざ】 (decorate)."},{"romaji":"katsu","kana":"かつ","kanji":"勝つ","meaning":"to win","mnemonic":"勝 (win)."},{"romaji":"kamau","kana":"かまう","kanji":"構う","meaning":"to mind","mnemonic":"構 (posture/mind)."},{"romaji":"kamu","kana":"かむ","kanji":"噛む","meaning":"to bite / chew","mnemonic":"噛【か】 (bite)."},{"romaji":"kayou","kana":"かよう","kanji":"通う","meaning":"to commute","mnemonic":"通 (pass/commute)."},{"romaji":"kawaku","kana":"かわく","kanji":"乾く","meaning":"to get dry","mnemonic":"乾【かわ】 (dry)."},{"romaji":"kawaru","kana":"かわる","kanji":"変わる","meaning":"to change","mnemonic":"変 (change)."},{"romaji":"kimaru","kana":"きまる","kanji":"決まる","meaning":"to be decided","mnemonic":"決 (decide)."},{"romaji":"komu","kana":"こむ","kanji":"込む","meaning":"to be crowded","mnemonic":"込 (crowded)."},{"romaji":"kowasu","kana":"こわす","kanji":"壊す","meaning":"to break","mnemonic":"壊【こわ】 (break)."},{"romaji":"sagasu","kana":"さがす","kanji":"探す","meaning":"to look for","mnemonic":"探 (search)."},{"romaji":"sawagu","kana":"さわぐ","kanji":"騒ぐ","meaning":"to be excited","mnemonic":"騒【さわ】 (boisterous)."},{"romaji":"sawaru","kana":"さわる","kanji":"触る","meaning":"to touch","mnemonic":"触【さわ】 (touch)."},{"romaji":"shikaru","kana":"しかる","kanji":"叱る","meaning":"to scold (particular)","mnemonic":"叱【しか】 (scold)."},{"romaji":"suku","kana":"すく","kanji":"空く","meaning":"to become empty","mnemonic":"空 (empty)."},{"romaji":"susumu","kana":"すすむ","kanji":"進む","meaning":"to make progress","mnemonic":"進 (advance)."},{"romaji":"suberu","kana":"すべる","kanji":"滑る","meaning":"to slip","mnemonic":"滑【すべ】 (slide/slip)."},{"romaji":"sumu","kana":"すむ","kanji":"済む","meaning":"to finish","mnemonic":"済 (settle/finish)."},{"romaji":"tasu","kana":"たす","kanji":"足す","meaning":"to add a number","mnemonic":"足 (leg/add)."},{"romaji":"tanoshimu","kana":"たのしむ","kanji":"楽しむ","meaning":"to enjoy oneself","mnemonic":"楽 (music/enjoy)."},{"romaji":"tsuku","kana":"つく","kanji":"付く","meaning":"to be attached","mnemonic":"付 (attach)."},{"romaji":"tsudzuku","kana":"つづく","kanji":"続く","meaning":"to be continued","mnemonic":"続 (continue)."},{"romaji":"tsutsumu","kana":"つつむ","kanji":"包む","meaning":"to wrap","mnemonic":"包【つつ】 (wrap)."},{"romaji":"tsuru","kana":"つる","kanji":"釣る","meaning":"to fish","mnemonic":"釣【つ】 (fish)."},{"romaji":"tetsudau","kana":"てつだう","kanji":"手伝う","meaning":"to help","mnemonic":"手 (hand) + 伝 (transmit)."},{"romaji":"tooru","kana":"とおる","kanji":"通る","meaning":"to go through","mnemonic":"通 (pass)."},{"romaji":"tomaru","kana":"とまる","kanji":"泊まる","meaning":"to lodge at","mnemonic":"泊【と】 (overnight)."},{"romaji":"naosu","kana":"なおす","kanji":"直す","meaning":"to fix","mnemonic":"直 (straight/fix)."},{"romaji":"naoru","kana":"なおる","kanji":"直る","meaning":"to be fixed","mnemonic":"直 (straight/fix)."},{"romaji":"naoru","kana":"なおる","kanji":"治る","meaning":"to be cured","mnemonic":"治 (cure)."},{"romaji":"naku","kana":"なく","kanji":"泣く","meaning":"cry","mnemonic":"泣【な】 (cry)."},{"romaji":"nakunaru","kana":"なくなる","kanji":"無くなる","meaning":"to disappear","mnemonic":"無【む】 (nothing) + 成る."},{"romaji":"nakunaru","kana":"なくなる","kanji":"亡くなる","meaning":"to die","mnemonic":"亡 (deceased)."},{"romaji":"naru","kana":"なる","kanji":"鳴る","meaning":"to sound","mnemonic":"鳴 (chirp/sound)."},{"romaji":"nusumu","kana":"ぬすむ","kanji":"盗む","meaning":"to steal","mnemonic":"盗 (steal)."},{"romaji":"nuru","kana":"ぬる","kanji":"塗る","meaning":"to paint","mnemonic":"塗【ぬ】 (paint)."},{"romaji":"nemuru","kana":"ねむる","kanji":"眠る","meaning":"to sleep","mnemonic":"眠 (sleep)."},{"romaji":"nokoru","kana":"のこる","kanji":"残る","meaning":"to remain","mnemonic":"残 (remain)."},{"romaji":"hakobu","kana":"はこぶ","kanji":"運ぶ","meaning":"to transport","mnemonic":"運 (carry)."},{"romaji":"harau","kana":"はらう","kanji":"払う","meaning":"to pay","mnemonic":"払 (pay)."},{"romaji":"hikaru","kana":"ひかる","kanji":"光る","meaning":"to shine","mnemonic":"光 (light)."},{"romaji":"hikidasu","kana":"ひきだす","kanji":"引き出す","meaning":"to withdraw","mnemonic":"引 (pull) + 出 (out)."},{"romaji":"hikkosu","kana":"ひっこす","kanji":"引っ越す","meaning":"to move house","mnemonic":"引 (pull) + 越 (cross)."},{"romaji":"hiraku","kana":"ひらく","kanji":"開く","meaning":"to open an event","mnemonic":"開 (open)."},{"romaji":"hirou","kana":"ひろう","kanji":"拾う","meaning":"to pick up","mnemonic":"拾【ひろ】 (pick up)."},{"romaji":"futoru","kana":"ふとる","kanji":"太る","meaning":"to become fat","mnemonic":"太 (fat)."},{"romaji":"fumu","kana":"ふむ","kanji":"踏む","meaning":"to step on","mnemonic":"踏【ふ】 (step)."},{"romaji":"furidasu","kana":"ふりだす","kanji":"降り出す","meaning":"to start to rain","mnemonic":"降 (fall) + 出 (out)."},{"romaji":"maniau","kana":"まにあう","kanji":"間に合う","meaning":"to be in time","mnemonic":"間 (interval) + 合 (fit)."},{"romaji":"mawaru","kana":"まわる","kanji":"回る","meaning":"to go around","mnemonic":"回 (revolve)."},{"romaji":"mitsukaru","kana":"みつかる","kanji":"見つかる","meaning":"to be discovered","mnemonic":"見 (see)."},{"romaji":"mukau","kana":"むかう","kanji":"向かう","meaning":"to face","mnemonic":"向 (face/direction)."},{"romaji":"modoru","kana":"もどる","kanji":"戻る","meaning":"to turn back","mnemonic":"戻 (return)."},{"romaji":"morau","kana":"もらう","kanji":"貰う","meaning":"to receive","mnemonic":"貰【もら】 (receive)."},{"romaji":"yaku","kana":"やく","kanji":"焼く","meaning":"to bake","mnemonic":"焼【や】 (bake/burn)."},{"romaji":"yakunitatsu","kana":"やくにたつ","kanji":"役に立つ","meaning":"to be helpful","mnemonic":"役 (duty) + 立 (stand)."},{"romaji":"yamu","kana":"やむ","kanji":"止む","meaning":"to stop","mnemonic":"止 (stop)."},{"romaji":"yoru","kana":"よる","kanji":"寄る","meaning":"to visit / drop in","mnemonic":"寄 (draw near)."},{"romaji":"yorokobu","kana":"よろこぶ","kanji":"喜ぶ","meaning":"to be delighted","mnemonic":"喜 (rejoice)."},{"romaji":"wakasu","kana":"わかす","kanji":"沸かす","meaning":"to boil","mnemonic":"沸【わ】 (boil)."},{"romaji":"waku","kana":"わく","kanji":"沸く","meaning":"to boil","mnemonic":"沸【わ】 (boil)."},{"romaji":"warau","kana":"わらう","kanji":"笑う","meaning":"to laugh","mnemonic":"笑 (laugh)."}]},{"name":"Verbs · Group 2 (Ru-verbs)","level":"N4","cards":[{"romaji":"ageru","kana":"あげる","kanji":"上げる","meaning":"to give (raise)","mnemonic":"上 (up)."},{"romaji":"sashiageru","kana":"さしあげる","kanji":"差し上げる","meaning":"polite to give","mnemonic":"差 (distinction) + 上 (up)."},{"romaji":"atsumeru","kana":"あつめる","kanji":"集める","meaning":"to collect","mnemonic":"集 (gather)."},{"romaji":"ikiru","kana":"いきる","kanji":"生きる","meaning":"to live","mnemonic":"生 (life)."},{"romaji":"ijimeru","kana":"いじめる","kanji":"苛める","meaning":"to tease","mnemonic":"Usually written in Kana."},{"romaji":"ueru","kana":"うえる","kanji":"植える","meaning":"to plant / grow","mnemonic":"植【う】 (plant)."},{"romaji":"ukeru","kana":"うける","kanji":"受ける","meaning":"to take a test","mnemonic":"受 (receive)."},{"romaji":"okureru","kana":"おくれる","kanji":"遅れる","meaning":"to be late","mnemonic":"遅 (slow/late)."},{"romaji":"ochiru","kana":"おちる","kanji":"落ちる","meaning":"to fall / drop","mnemonic":"落 (fall/drop)."},{"romaji":"oriru","kana":"おりる","kanji":"降りる","meaning":"to get off","mnemonic":"降 (descend)."},{"romaji":"norikaeru","kana":"のりかえる","kanji":"乗り換える","meaning":"to change trains","mnemonic":"乗 (ride) + 換【か】 (exchange)."},{"romaji":"oreru","kana":"おれる","kanji":"折れる","meaning":"to break (fold)","mnemonic":"折 (fold/break)."},{"romaji":"kaeru","kana":"かえる","kanji":"変える","meaning":"to change","mnemonic":"変 (change)."},{"romaji":"kakeru","kana":"かける","kanji":"掛ける","meaning":"to hang something","mnemonic":"掛 (hang)."},{"romaji":"katadzukeru","kana":"かたづける","kanji":"片付ける","meaning":"to tidy up","mnemonic":"片【かた】 (one-sided) + 付 (attach)."},{"romaji":"kangaeru","kana":"かんがえる","kanji":"考える","meaning":"to consider","mnemonic":"考 (consider)."},{"romaji":"kikoeru","kana":"きこえる","kanji":"聞こえる","meaning":"to be heard","mnemonic":"聞 (hear)."},{"romaji":"kimeru","kana":"きめる","kanji":"決める","meaning":"to decide","mnemonic":"決 (decide)."},{"romaji":"kuraberu","kana":"くらべる","kanji":"比べる","meaning":"to compare","mnemonic":"比【くら】 (compare)."},{"romaji":"kureru","kana":"くれる","meaning":"to give","mnemonic":"“To give (to me / us)” — the speaker-inward giving verb. Usually kana."},{"romaji":"kureru","kana":"くれる","kanji":"暮れる","meaning":"to get dark","mnemonic":"暮 (livelihood/darken)."},{"romaji":"kowareru","kana":"こわれる","kanji":"壊れる","meaning":"to be broken","mnemonic":"壊【こわ】 (break)."},{"romaji":"sageru","kana":"さげる","kanji":"下げる","meaning":"to lower","mnemonic":"下 (down)."},{"romaji":"shiraseru","kana":"しらせる","kanji":"知らせる","meaning":"to notify","mnemonic":"知 (know)."},{"romaji":"shiraberu","kana":"しらべる","kanji":"調べる","meaning":"to investigate","mnemonic":"調 (investigate/tone)."},{"romaji":"sugiru","kana":"すぎる","kanji":"過ぎる","meaning":"to exceed","mnemonic":"過 (overdo/exceed)."},{"romaji":"suteru","kana":"すてる","kanji":"捨てる","meaning":"to throw away","mnemonic":"捨【す】 (discard)."},{"romaji":"sodateru","kana":"そだてる","kanji":"育てる","meaning":"to bring up","mnemonic":"育 (raise)."},{"romaji":"taoreru","kana":"たおれる","kanji":"倒れる","meaning":"to break down","mnemonic":"倒 (collapse)."},{"romaji":"tazuneru","kana":"たずねる","kanji":"訪ねる","meaning":"to visit","mnemonic":"訪 (visit)."},{"romaji":"tazuneru","kana":"たずねる","kanji":"尋ねる","meaning":"to ask","mnemonic":"尋【たず】 (inquire)."},{"romaji":"tateru","kana":"たてる","kanji":"立てる","meaning":"to stand something up","mnemonic":"立 (stand)."},{"romaji":"tateru","kana":"たてる","kanji":"建てる","meaning":"to build","mnemonic":"建 (build)."},{"romaji":"tariru","kana":"たりる","kanji":"足りる","meaning":"to be enough","mnemonic":"足 (leg/suffice)."},{"romaji":"tsukamaeru","kana":"つかまえる","kanji":"捕まえる","meaning":"to seize","mnemonic":"捕 (catch)."},{"romaji":"tsukeru","kana":"つける","kanji":"漬ける","meaning":"to soak","mnemonic":"漬【つ】 (pickling)."},{"romaji":"tsutaeru","kana":"つたえる","kanji":"伝える","meaning":"to report","mnemonic":"伝 (transmit)."},{"romaji":"tsudzukeru","kana":"つづける","kanji":"続ける","meaning":"to continue","mnemonic":"続 (continue)."},{"romaji":"tsureru","kana":"つれる","kanji":"連れる","meaning":"to lead","mnemonic":"連 (connect/take along)."},{"romaji":"todokeru","kana":"とどける","kanji":"届ける","meaning":"to reach / deliver","mnemonic":"届【とど】 (deliver)."},{"romaji":"tomeru","kana":"とめる","kanji":"止める","meaning":"to stop something","mnemonic":"止 (stop)."},{"romaji":"torikaeru","kana":"とりかえる","kanji":"取り替える","meaning":"to exchange","mnemonic":"取 (take) + 替【か】 (exchange)."},{"romaji":"nageru","kana":"なげる","kanji":"投げる","meaning":"to throw","mnemonic":"投 (throw)."},{"romaji":"nareru","kana":"なれる","kanji":"慣れる","meaning":"get used to","mnemonic":"慣 (accustomed)."},{"romaji":"nigeru","kana":"にげる","kanji":"逃げる","meaning":"to escape","mnemonic":"逃 (escape)."},{"romaji":"niru","kana":"にる","kanji":"似る","meaning":"to be similar","mnemonic":"似 (resemble)."},{"romaji":"nureru","kana":"ぬれる","kanji":"濡れる","meaning":"to get wet","mnemonic":"濡【ぬ】 (wet)."},{"romaji":"hajimeru","kana":"はじめる","kanji":"始める","meaning":"to begin","mnemonic":"始 (begin)."},{"romaji":"hieru","kana":"ひえる","kanji":"冷える","meaning":"to grow cold","mnemonic":"冷 (cold)."},{"romaji":"fueru","kana":"ふえる","kanji":"増える","meaning":"to increase","mnemonic":"増 (increase)."},{"romaji":"homeru","kana":"ほめる","kanji":"褒める","meaning":"to praise","mnemonic":"褒【ほ】 (praise)."},{"romaji":"makeru","kana":"まける","kanji":"負ける","meaning":"to lose","mnemonic":"負 (defeat)."},{"romaji":"machigaeru","kana":"まちがえる","kanji":"間違える","meaning":"to make a mistake","mnemonic":"間 (interval) + 違 (differ)."},{"romaji":"mieru","kana":"みえる","kanji":"見える","meaning":"to be in sight","mnemonic":"見 (see)."},{"romaji":"mitsukeru","kana":"みつける","kanji":"見つける","meaning":"to discover","mnemonic":"見 (see)."},{"romaji":"mukaeru","kana":"むかえる","kanji":"迎える","meaning":"to go out to meet","mnemonic":"迎 (welcome)."},{"romaji":"yakeru","kana":"やける","kanji":"焼ける","meaning":"to burn","mnemonic":"焼【や】 (burn)."},{"romaji":"yaseru","kana":"やせる","kanji":"痩せる","meaning":"to become thin","mnemonic":"痩【や】 (thin)."},{"romaji":"yameru","kana":"やめる","kanji":"辞める","meaning":"to stop / quit","mnemonic":"辞 (resign)."},{"romaji":"yureru","kana":"ゆれる","kanji":"揺れる","meaning":"to shake","mnemonic":"揺【ゆ】 (shake)."},{"romaji":"yogoreru","kana":"よごれる","kanji":"汚れる","meaning":"to get dirty","mnemonic":"汚【きたな】 (dirty)."},{"romaji":"wakareru","kana":"わかれる","kanji":"別れる","meaning":"to separate","mnemonic":"別 (separate)."},{"romaji":"wareru","kana":"われる","kanji":"割れる","meaning":"to break","mnemonic":"割 (divide/crack)."}]},{"name":"Verbs · Group 3 & Keigo","level":"N4","cards":[{"romaji":"anshinna","kana":"あんしんな","kanji":"安心な","meaning":"relief","mnemonic":"安 (relax) + 心 (heart)."},{"romaji":"anzenna","kana":"あんぜんな","kanji":"安全な","meaning":"safety","mnemonic":"安 (relax) + 全 (whole)."},{"romaji":"isshoukenmei","kana":"いっしょうけんめい","kanji":"一生懸命","meaning":"with utmost effort","mnemonic":"一生 (whole life) + 懸【か】 (suspend) + 命 (life)."},{"romaji":"kantanna","kana":"かんたんな","kanji":"簡単な","meaning":"simple","mnemonic":"簡【かん】 (simplicity) + 単 (simple)."},{"romaji":"kyuuna","kana":"きゅうな","kanji":"急な","meaning":"urgent / steep","mnemonic":"急 (hurry)."},{"romaji":"sakanna","kana":"さかんな","kanji":"盛んな","meaning":"popularity","mnemonic":"盛【も】 (boom/prosper)."},{"romaji":"zannenna","kana":"ざんねんな","kanji":"残念な","meaning":"disappointment","mnemonic":"残 (remain) + 念 (thought)."},{"romaji":"jamana","kana":"じゃまな","kanji":"邪魔な","meaning":"hindrance","mnemonic":"邪【じゃ】 (wicked) + 魔【ま】 (demon)."},{"romaji":"jiyuuna","kana":"じゆうな","kanji":"自由な","meaning":"freedom","mnemonic":"自 (self) + 由 (reason)."},{"romaji":"juubunna","kana":"じゅうぶんな","kanji":"十分な","meaning":"enough","mnemonic":"十 (ten) + 分 (part)."},{"romaji":"shinsetsuna","kana":"しんせつな","kanji":"親切な","meaning":"kindness","mnemonic":"親 (intimate) + 切 (cut)."},{"romaji":"daijina","kana":"だいじな","kanji":"大事な","meaning":"important","mnemonic":"大 (big) + 事 (matter)."},{"romaji":"tashikana","kana":"たしかな","kanji":"確かな","meaning":"definite","mnemonic":"確 (certain)."},{"romaji":"tanoshimina","kana":"たのしみな","kanji":"楽しみな","meaning":"joy","mnemonic":"楽 (music/enjoy)."},{"romaji":"damena","kana":"だめな","kanji":"駄目な","meaning":"no good","mnemonic":"駄【だ】 (burdensome) + 目 (eye)."},{"romaji":"teineina","kana":"ていねいな","kanji":"丁寧な","meaning":"polite","mnemonic":"丁【ちょう】 (courteous) + 寧【ねい】 (peaceful)."},{"romaji":"tekitouna","kana":"てきとうな","kanji":"適当な","meaning":"suitability","mnemonic":"適 (suitable) + 当 (hit)."},{"romaji":"tokubetsuna","kana":"とくべつな","kanji":"特別な","meaning":"special","mnemonic":"特 (special) + 別 (separate)."},{"romaji":"nesshinna","kana":"ねっしんな","kanji":"熱心な","meaning":"enthusiasm","mnemonic":"熱 (heat) + 心 (heart)."},{"romaji":"hitsuyouna","kana":"ひつような","kanji":"必要な","meaning":"necessary","mnemonic":"必 (certain) + 要 (need)."},{"romaji":"fukuzatsuna","kana":"ふくざつな","kanji":"複雑な","meaning":"complexity","mnemonic":"複【ふく】 (duplicate) + 雑 (mixed)."},{"romaji":"fubenna","kana":"ふべんな","kanji":"不便な","meaning":"inconvenience","mnemonic":"不 (un-) + 便 (convenience)."},{"romaji":"majimena","kana":"まじめな","kanji":"真面目な","meaning":"serious","mnemonic":"真 (true) + 面 (face) + 目 (eye)."},{"romaji":"murina","kana":"むりな","kanji":"無理な","meaning":"impossible","mnemonic":"無【む】 (nothing) + 理 (logic)."},{"romaji":"hisashiburi","kana":"ひさしぶり","kanji":"久しぶり","meaning":"after a long time","mnemonic":"久【ひさ】 (long time) + 振【ふ】 (shake)."},{"romaji":"betsu","kana":"べつ","kanji":"別","meaning":"different","mnemonic":"別 (separate)."},{"romaji":"asai","kana":"あさい","kanji":"浅い","meaning":"shallow","mnemonic":"浅【あさ】 (shallow)."},{"romaji":"fukai","kana":"ふかい","kanji":"深い","meaning":"deep","mnemonic":"深 (deep)."},{"romaji":"utsukushii","kana":"うつくしい","kanji":"美しい","meaning":"beautiful","mnemonic":"美 (beauty)."},{"romaji":"mezurashii","kana":"めずらしい","kanji":"珍しい","meaning":"rare","mnemonic":"珍【めずら】 (rare)."},{"romaji":"katai","kana":"かたい","kanji":"固い","meaning":"hard","mnemonic":"固【かた】 (harden)."},{"romaji":"yawarakai","kana":"やわらかい","kanji":"柔らかい","meaning":"soft","mnemonic":"柔【やわ】 (soft)."},{"romaji":"komakai","kana":"こまかい","kanji":"細かい","meaning":"small","mnemonic":"細【こま】 (dainty)."},{"romaji":"umai","kana":"うまい","kanji":"上手い","meaning":"delicious/skilled","mnemonic":"上 (up) + 手 (hand)."},{"romaji":"nigai","kana":"にがい","kanji":"苦い","meaning":"bitter","mnemonic":"苦 (suffering/bitter)."},{"romaji":"hidoi","kana":"ひどい","kanji":"酷い","meaning":"awful","mnemonic":"酷【ひど】 (cruel)."},{"romaji":"ureshii","kana":"うれしい","kanji":"嬉しい","meaning":"glad","mnemonic":"嬉【うれ】 (glad)."},{"romaji":"kanashii","kana":"かなしい","kanji":"悲しい","meaning":"sad","mnemonic":"悲 (sad)."},{"romaji":"okashii","kana":"おかしい","meaning":"funny","mnemonic":"“Funny, strange, odd.” The kanji 可笑しい is rare — usually written in kana."},{"romaji":"sabishii","kana":"さびしい","kanji":"寂しい","meaning":"lonely","mnemonic":"寂【さび】 (loneliness)."},{"romaji":"hazukashii","kana":"はずかしい","kanji":"恥ずかしい","meaning":"embarrassed","mnemonic":"恥 (shame)."},{"romaji":"kowai","kana":"こわい","kanji":"怖い","meaning":"frightening","mnemonic":"怖 (dread)."},{"romaji":"nemui","kana":"ねむい","kanji":"眠い","meaning":"sleepy","mnemonic":"眠 (sleep)."},{"romaji":"kibishii","kana":"きびしい","kanji":"厳しい","meaning":"strict","mnemonic":"厳【げん】 (strict)."},{"romaji":"yasashii","kana":"やさしい","kanji":"優しい","meaning":"kind","mnemonic":"優 (tenderness/excel)."},{"romaji":"sugoi","kana":"すごい","kanji":"凄い","meaning":"terrific","mnemonic":"凄【すご】 (uncanny)."},{"romaji":"subarashii","kana":"すばらしい","kanji":"素晴らしい","meaning":"wonderful","mnemonic":"晴 (clear up)."},{"romaji":"tadashii","kana":"ただしい","kanji":"正しい","meaning":"correct","mnemonic":"正 (correct)."},{"romaji":"yoroshii","kana":"よろしい","kanji":"宜しい","meaning":"respectful OK","mnemonic":"宜【よろ】 (best regards)."}]},{"name":"Adverbs, Conjunctions & Expressions","level":"N4","cards":[{"romaji":"kanarazu","kana":"かならず","kanji":"必ず","meaning":"necessarily","mnemonic":"必 (certain)."},{"romaji":"kitto","kana":"きっと","meaning":"surely","mnemonic":"Adverb “surely, certainly” — strong confidence."},{"romaji":"kesshite","kana":"けっして","kanji":"決して","meaning":"never","mnemonic":"決 (decide)."},{"romaji":"shikkari","kana":"しっかり","meaning":"firmly","mnemonic":"Adverb “firmly, solidly, properly.”"},{"romaji":"shibaraku","kana":"しばらく","kanji":"暫く","meaning":"little while","mnemonic":"暫【しばら】 (temporarily)."},{"romaji":"zuibun","kana":"ずいぶん","kanji":"随分","meaning":"extremely","mnemonic":"随【ずい】 (follow) + 分 (part)."},{"romaji":"sukkari","kana":"すっかり","meaning":"completely","mnemonic":"Adverb “completely, thoroughly” — a state fully reached."},{"romaji":"sutto","kana":"すっと","meaning":"all of a sudden","mnemonic":"Adverb “smoothly, swiftly, in one motion.”"},{"romaji":"ippai","kana":"いっぱい","kanji":"一杯","meaning":"full","mnemonic":"一 (one) + 杯 (cup)."},{"romaji":"zenzen","kana":"ぜんぜん","kanji":"全然","meaning":"at all","mnemonic":"全 (whole) + 然 (sort of thing)."},{"romaji":"sorehodo","kana":"それほど","kanji":"それ程","meaning":"to that extent","mnemonic":"それ (that) + 程 (extent)."},{"romaji":"sonnani","kana":"そんなに","meaning":"so much","mnemonic":"“(Not) that much / so much” — そんな + に, often with a negative."},{"romaji":"daitai","kana":"だいたい","kanji":"大体","meaning":"generally","mnemonic":"大 (big) + 体 (body)."},{"romaji":"taitei","kana":"たいてい","kanji":"大抵","meaning":"usually","mnemonic":"大 (big) + 抵【てい】 (resist)."},{"romaji":"tamani","kana":"たまに","kanji":"偶に","meaning":"occasionally","mnemonic":"偶 (accidentally)."},{"romaji":"sorosoro","kana":"そろそろ","meaning":"soon","mnemonic":"Adverb “soon; about time to…” (a gentle approach)."},{"romaji":"mousugu","kana":"もうすぐ","kanji":"もう直ぐ","meaning":"soon","mnemonic":"もう (already) + 直 (straight)."},{"romaji":"daibu","kana":"だいぶ","kanji":"大分","meaning":"greatly","mnemonic":"大 (big) + 分 (part)."},{"romaji":"zehi","kana":"ぜひ","kanji":"是非","meaning":"I'd love to","mnemonic":"是【ぜ】 (just so) + 非 (un-)."},{"romaji":"tashika","kana":"たしか","kanji":"確か","meaning":"surely","mnemonic":"確 (certain)."},{"romaji":"tatoeba","kana":"たとえば","kanji":"例えば","meaning":"for example","mnemonic":"例 (example)."},{"romaji":"chittomo","kana":"ちっとも","kanji":"些とも","meaning":"not at all","mnemonic":"Usually written in Kana."},{"romaji":"dekirudake","kana":"できるだけ","kanji":"出来るだけ","meaning":"as much as possible","mnemonic":"出 (exit) + 来 (come)."},{"romaji":"toutou","kana":"とうとう","kanji":"到頭","meaning":"finally","mnemonic":"到 (arrive) + 頭 (head)."},{"romaji":"tokuni","kana":"とくに","kanji":"特に","meaning":"particularly","mnemonic":"特 (special)."},{"romaji":"dondon","kana":"どんどん","meaning":"more and more","mnemonic":"Mimetic adverb “rapidly, more and more, steadily.”"},{"romaji":"nakanaka","kana":"なかなか","kanji":"中々","meaning":"considerably","mnemonic":"中 (middle)."},{"romaji":"narubeku","kana":"なるべく","kanji":"成るべく","meaning":"as much as possible","mnemonic":"成 (become)."},{"romaji":"hakkiri","kana":"はっきり","meaning":"clearly","mnemonic":"Adverb “clearly, plainly, distinctly.”"},{"romaji":"hijouni","kana":"ひじょうに","kanji":"非常に","meaning":"extremely","mnemonic":"非 (un-) + 常 (usual)."},{"romaji":"hotondo","kana":"ほとんど","kanji":"殆ど","meaning":"mostly","mnemonic":"殆【ほとん】 (almost)."},{"romaji":"mazu","kana":"まず","kanji":"先ず","meaning":"first of all","mnemonic":"先 (before)."},{"romaji":"moshi","kana":"もし","kanji":"若し","meaning":"if","mnemonic":"若 (young/if)."},{"romaji":"mochiron","kana":"もちろん","kanji":"勿論","meaning":"of course","mnemonic":"勿【ぶつ】 (must not) + 論 (argument)."},{"romaji":"mottomo","kana":"もっとも","kanji":"最も","meaning":"extremely","mnemonic":"最 (most)."},{"romaji":"yatto","kana":"やっと","meaning":"at last","mnemonic":"Adverb “at last, finally; barely.”"},{"romaji":"yahari","kana":"やはり","kanji":"矢張り","meaning":"as I thought","mnemonic":"矢【や】 (arrow) + 張【は】 (stretch)."},{"romaji":"a","kana":"あ","meaning":"Ah","mnemonic":"Interjection “Ah! / Oh!” — a sudden realization."},{"romaji":"aa","kana":"ああ","meaning":"like that","mnemonic":"あ-series “like that, that way”; also “ah / oh.”"},{"romaji":"kou","kana":"こう","meaning":"this way","mnemonic":"こ-series adverb “this way, like this.”"},{"romaji":"sou","kana":"そう","meaning":"really","mnemonic":"“So, really, that way” — echo / agreement (そうです = “that’s right”)."},{"romaji":"anna","kana":"あんな","meaning":"such","mnemonic":"あ-series “that sort of (over there)” — like あの + な."},{"romaji":"sonna","kana":"そんな","meaning":"that sort of","mnemonic":"そ-series “that sort of (by you)” — like その + な."},{"romaji":"sorede","kana":"それで","kanji":"其れで","meaning":"because of that","mnemonic":"Learn as it is."},{"romaji":"soreni","kana":"それに","kanji":"其れに","meaning":"moreover","mnemonic":"Learn as it is."},{"romaji":"keredo","kana":"けれど","kanji":"希れど","meaning":"however","mnemonic":"Usually written in Kana."},{"romaji":"dakara","kana":"だから","meaning":"so","mnemonic":"Conjunction “so, therefore” (だ + から, “because it is”)."},{"romaji":"suruto","kana":"すると","meaning":"then","mnemonic":"Conjunction “thereupon, and then” — what happened next."},{"romaji":"mataha","kana":"または","kanji":"又は","meaning":"or","mnemonic":"又【また】 (again/or)."},{"romaji":"naruhodo","kana":"なるほど","kanji":"成程","meaning":"now I understand","mnemonic":"成 (become) + 程 (extent)."}]}];

/* ----- flatten deck into addressable cards ----- */
const SECTIONS = DECK.map((s) => s.name);
const LEVELS = [...new Set(DECK.map((s) => s.level || "N5"))]; // e.g. ["N5","N4"]
const CARDS = [];
DECK.forEach((s, si) =>
  s.cards.forEach((c, ci) => CARDS.push({ ...c, id: si + "." + ci, si, level: s.level || "N5" }))
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
    () =>
      scope.type === "all"
        ? CARDS
        : scope.type === "level"
        ? CARDS.filter((c) => c.level === scope.level)
        : CARDS.filter((c) => c.si === scope.si),
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
              {LEVELS.join(" · ")}
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

          {LEVELS.map((lv) => {
            const idxs = DECK.map((_, i) => i).filter((i) => (DECK[i].level || "N5") === lv);
            const lvWords = CARDS.filter((c) => c.level === lv).length;
            return (
              <div key={lv}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 4px 9px" }}>
                  <span style={{ fontSize: 11, letterSpacing: 2, color: C.faint, fontFamily: FJP }}>
                    {lv} · {lvWords} WORDS
                  </span>
                  <button
                    onClick={() => startStudy({ type: "level", level: lv })}
                    style={{
                      background: hexA(C.seal, 0.14),
                      border: "1px solid " + hexA(C.seal, 0.5),
                      color: C.seal,
                      borderRadius: 20,
                      padding: "4px 13px",
                      fontFamily: FJP,
                      fontWeight: 700,
                      fontSize: 11.5,
                      cursor: "pointer",
                    }}
                  >
                    Study all {lv}
                  </button>
                </div>
                {idxs.map((si) => {
                  const s = DECK[si];
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
              </div>
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
            {scope.type === "all" ? "All sections" : scope.type === "level" ? scope.level + " · all sections" : SECTIONS[scope.si]}
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
            ) : scope.type === "level" ? (
              <>Every {scope.level} card has been introduced. 🎉</>
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
