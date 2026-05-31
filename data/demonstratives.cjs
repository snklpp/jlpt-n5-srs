module.exports = {
  section: "Demonstratives & Interrogatives",
  byRomaji: {
    kore: {
      word: "此れ", means: "this",
      hook: "A person stopped right at this spot.",
      parts: [
        { k: "止", pos: "top-left", text: "'stop / foot' — a foot planted firmly here." },
        { k: "匕", pos: "top-right", text: "a crouching person right beside that foot." }
      ],
      visualize: "Foot (止) planted next to a person (匕) = this thing right here. 此れ = this!"
    },
    are: {
      word: "彼れ", means: "that (over there)",
      hook: "Footsteps moving away to a distant other.",
      parts: [
        { k: "彳", pos: "left", text: "the 'step' radical — feet moving away." },
        { k: "皮", pos: "right", text: "'skin / peel' — the far, outer side." }
      ],
      visualize: "Steps (彳) going far to the outer side (皮) = that thing over there. 彼れ = that!"
    },
    kono: {
      word: "此の", means: "this (adj)",
      hook: "The same 'this' spot, now reaching forward to a noun.",
      parts: [
        { k: "止", pos: "top-left", text: "'foot' — planted right here." },
        { k: "匕", pos: "top-right", text: "a crouching person present at the spot." }
      ],
      visualize: "Foot (止) + person (匕) here + の = this ___. 此の = this [noun]!"
    },
    sono: {
      word: "其の", means: "that (adj, near you)",
      hook: "A woven basket extended toward the person beside you.",
      parts: [
        { k: "其", pos: "whole", text: "a woven grid — like a basket being held out toward you." }
      ],
      visualize: "The basket-shape (其) pushed your way + の = that ___ (by you). 其の = that [noun]!"
    },
    dore: {
      word: "何れ", means: "which (noun)",
      hook: "A person asking 'which can I have?' then pointing.",
      parts: [
        { k: "亻", pos: "left", text: "person radical — someone asking." },
        { k: "可", pos: "right", text: "'can / permit' — a mouth 口 over a hook, pleading 'which may I?'" }
      ],
      visualize: "Person (亻) asking 'which can?' (可) + れ = which one? 何れ = which!"
    },
    docchi: {
      word: "何方", means: "which one (casual)",
      hook: "Which direction? Which person? You must choose.",
      parts: [
        { k: "何", pos: "left", text: "'what' — a person asking." },
        { k: "方", pos: "right", text: "'direction / person' — a signpost pointing both ways." }
      ],
      visualize: "What (何) + direction (方) = which way / which one? 何方 = which!"
    },
    doko: {
      word: "何処", means: "where",
      hook: "What place is this, exactly?",
      parts: [
        { k: "何", pos: "left", text: "'what'." },
        { k: "処", pos: "right", text: "'place / location' — 夂【にょう】 (going down) over 几 (a low stool)." }
      ],
      visualize: "What (何) + place (処【しょ】) = where? 何処 = where!"
    },
    nani: {
      word: "何", means: "what",
      hook: "A person saying 'Can I have one, please?' — but what?",
      parts: [
        { k: "亻", pos: "left", text: "person radical — someone asking." },
        { k: "可", pos: "right", text: "'can / permit' — a mouth 口 over a curved hook, pleading." }
      ],
      visualize: "Person (亻) asking 'can I?' (可) = what do you want? 何 = what!"
    },
    itsu: {
      word: "何時", means: "when",
      hook: "What time is it? — that's exactly 'when.'",
      parts: [
        { k: "何", pos: "left", text: "'what'." },
        { k: "時", pos: "right", text: "'time / hour' — the sun (日) above the temple (寺)." }
      ],
      visualize: "What (何) + time (時) = at what time = when? 何時 = when!"
    }
  }
};
