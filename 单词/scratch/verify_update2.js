
var window = this;
var localStorage = {
  getItem: function(k) { return null; },
  setItem: function(k, v) {}
};

function Element(tag) {
  this.tagName = tag.toUpperCase();
  this.children = [];
  this.classList = {
    classes: {},
    toggle: function(c, v) { if (v === undefined) v = !this.classes[c]; if (v) this.classes[c] = true; else delete this.classes[c]; return v; },
    add: function(c) { this.classes[c] = true; },
    remove: function(c) { delete this.classes[c]; }
  };
  this._innerHTML = '';
}
Element.prototype.appendChild = function(el) {
  this.children.push(el);
  return el;
};
Element.prototype.addEventListener = function() {};
Object.defineProperty(Element.prototype, 'innerHTML', {
  get: function() { return this._innerHTML; },
  set: function(val) {
    this._innerHTML = val;
    this.children = [];
    if (val.indexOf('class="half"') !== -1) {
      this.children.push(new Element('div'));
      this.children.push(new Element('div'));
    }
  }
});
Element.prototype.querySelectorAll = function(sel) {
  if (sel === '.half') {
    return this.children.filter(function(c) { return true; });
  }
  return [];
};

var listEl = new Element('div');
var countEl = new Element('b');
var themeBtn = new Element('button');

var document = {
  body: new Element('body'),
  getElementById: function(id) {
    if (id === 'list') return listEl;
    if (id === 'count') return countEl;
    if (id === 'themeBtn') return themeBtn;
    return new Element('div');
  },
  createElement: function(tag) {
    return new Element(tag);
  }
};

// DATA 结构说明:
// id: 独立编号 | aid: 音频编号 (对应 N2_1-2_audio/*.mp3) | asfx: 音频后缀 (如 '-r', 'p')
// s: 章节名 | w: 单词 | k: 假名注音 | en: 外来语英语原型
// m: 中文释义 | p: 词性 | ph: 例句 | phz: 例句中译
// role: 'arr' (相对 ⇄) / 'ant' (竖线反义 |) / 'syn' (横杠同类 —) / '' (独立单卡)
// side: 'L' / 'R' 组内左右 | g: 组号 (同一章节内同组连续渲染) | kind: 'note'=文本卡片
const INITIAL_DATA = [
  {
    "id": 1,
    "aid": 1,
    "asfx": "",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "積極的",
    "k": "せっきょくてき",
    "en": null,
    "m": "积极的，主动的",
    "p": "ナ",
    "ph": "積極的に発言する",
    "phz": "积极发言",
    "role": "arr",
    "side": "L",
    "g": 1
  },
  {
    "id": 2,
    "aid": 1,
    "asfx": "-r",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "消極的",
    "k": "しょうきょくてき",
    "en": null,
    "m": "消极的，被动的",
    "p": "ナ",
    "ph": "消極的な態度をとる",
    "phz": "采取消极态度",
    "role": "arr",
    "side": "R",
    "g": 1
  },
  {
    "id": 3,
    "aid": 2,
    "asfx": "",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "おとなしい",
    "k": "おとなしい",
    "en": null,
    "m": "老实的，文静的",
    "p": "イ",
    "ph": "おとなしい性格だ",
    "phz": "性格文静",
    "role": "arr",
    "side": "L",
    "g": 2
  },
  {
    "id": 4,
    "aid": 2,
    "asfx": "-r",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "やかましい",
    "k": "やかましい",
    "en": null,
    "m": "吵闹的；爱唠叨的，挑剔的",
    "p": "イ",
    "ph": "工事の音がやかましい",
    "phz": "施工的声音很吵闹",
    "role": "arr",
    "side": "R",
    "g": 2
  },
  {
    "id": 5,
    "aid": 3,
    "asfx": "",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "慎重",
    "k": "しんちょう",
    "en": null,
    "m": "谨慎的，慎重的",
    "p": "ナ",
    "ph": "慎重に行動する",
    "phz": "谨慎行事",
    "role": "arr",
    "side": "L",
    "g": 3
  },
  {
    "id": 6,
    "aid": 3,
    "asfx": "-r",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "そそっかしい",
    "k": "そそっかしい",
    "en": null,
    "m": "毛手毛脚的，冒失的",
    "p": "イ",
    "ph": "そそっかしくてよく失敗する",
    "phz": "毛手毛脚容易犯错",
    "role": "arr",
    "side": "R",
    "g": 3
  },
  {
    "id": 7,
    "aid": 4,
    "asfx": "",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "きちんとした",
    "k": "きちんとした",
    "en": null,
    "m": "规整的，一丝不苟的",
    "p": "惯",
    "ph": "きちんとした部屋だ",
    "phz": "房间整洁",
    "role": "arr",
    "side": "L",
    "g": 4
  },
  {
    "id": 8,
    "aid": 4,
    "asfx": "-r",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "だらしない",
    "k": "だらしない",
    "en": null,
    "m": "邋遢的，散漫的",
    "p": "イ",
    "ph": "だらしない生活を送る",
    "phz": "过着散漫的生活",
    "role": "arr",
    "side": "R",
    "g": 4
  },
  {
    "id": 9,
    "aid": 5,
    "asfx": "",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "器用",
    "k": "きよう",
    "en": null,
    "m": "灵巧的，手巧的",
    "p": "ナ",
    "ph": "手先が器用だ",
    "phz": "手很巧",
    "role": "arr",
    "side": "L",
    "g": 5
  },
  {
    "id": 10,
    "aid": 5,
    "asfx": "-r",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "不器用",
    "k": "ぶきよう",
    "en": null,
    "m": "笨拙的，不圆滑的",
    "p": "ナ",
    "ph": "不器用で生き方が下手だ",
    "phz": "为人笨拙不善处世",
    "role": "arr",
    "side": "R",
    "g": 5
  },
  {
    "id": 11,
    "aid": 6,
    "asfx": "",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "要領がいい",
    "k": "ようりょうがいい",
    "en": null,
    "m": "会办事，会抓要领",
    "p": "惯",
    "ph": "要領がいい人だ",
    "phz": "是个会办事的人",
    "role": "arr",
    "side": "L",
    "g": 6
  },
  {
    "id": 12,
    "aid": 6,
    "asfx": "-r",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "要領が悪い",
    "k": "ようりょうがわるい",
    "en": null,
    "m": "不会办事，笨拙",
    "p": "惯",
    "ph": "仕事の要領が悪い",
    "phz": "做工作不得要领",
    "role": "arr",
    "side": "R",
    "g": 6
  },
  {
    "id": 13,
    "aid": 7,
    "asfx": "",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "謙虚",
    "k": "けんきょ",
    "en": null,
    "m": "谦虚的",
    "p": "ナ",
    "ph": "謙虚に学ぶ",
    "phz": "谦虚学习",
    "role": "arr",
    "side": "L",
    "g": 7
  },
  {
    "id": 14,
    "aid": 7,
    "asfx": "-r",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "生意気",
    "k": "なまいき",
    "en": null,
    "m": "狂妄的，自大的",
    "p": "ナ",
    "ph": "生意気な口をきく",
    "phz": "说话狂妄自大",
    "role": "arr",
    "side": "R",
    "g": 7
  },
  {
    "id": 15,
    "aid": 8,
    "asfx": "",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "勘が鋭い",
    "k": "かんがするどい",
    "en": null,
    "m": "直觉敏锐",
    "p": "惯",
    "ph": "勘が鋭い人だ",
    "phz": "直觉敏锐的人",
    "role": "arr",
    "side": "L",
    "g": 8
  },
  {
    "id": 16,
    "aid": 8,
    "asfx": "-r",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "勘が鈍い",
    "k": "かんがにぶい",
    "en": null,
    "m": "直觉迟钝",
    "p": "惯",
    "ph": "人の気持ちに勘が鈍い",
    "phz": "对人的心思直觉迟钝",
    "role": "arr",
    "side": "R",
    "g": 8
  },
  {
    "id": 17,
    "aid": 9,
    "asfx": "",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "弱気",
    "k": "よわき",
    "en": null,
    "m": "怯弱的，气馁的",
    "p": "ナ・N",
    "ph": "弱気になる",
    "phz": "变得怯弱",
    "role": "arr",
    "side": "L",
    "g": 9
  },
  {
    "id": 18,
    "aid": 9,
    "asfx": "-r",
    "s": "1. 対になる表現（反义词左右相对）",
    "w": "強気",
    "k": "つよき",
    "en": null,
    "m": "要强的，态度强硬的",
    "p": "ナ・N",
    "ph": "強気に出る",
    "phz": "态度强硬起来",
    "role": "arr",
    "side": "R",
    "g": 9
  },
  {
    "id": 19,
    "aid": 10,
    "asfx": "",
    "s": "2. 長所（优点）",
    "w": "頼もしい・頼りになる",
    "k": "たのもしい・たよりになる",
    "en": null,
    "m": "可靠的，靠得住的",
    "p": "イ・惯",
    "ph": "頼もしい味方だ",
    "phz": "是可靠的伙伴",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 20,
    "aid": 11,
    "asfx": "",
    "s": "2. 長所（优点）",
    "w": "礼儀正しい",
    "k": "れいぎただしい",
    "en": null,
    "m": "有礼貌的，端庄的",
    "p": "イ",
    "ph": "礼儀正しい挨拶",
    "phz": "礼貌的问候",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 21,
    "aid": 12,
    "asfx": "",
    "s": "2. 長所（优点）",
    "w": "冷静",
    "k": "れいせい",
    "en": null,
    "m": "冷静的，沉着的",
    "p": "ナ",
    "ph": "冷静に判断する",
    "phz": "冷静判断",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 22,
    "aid": 13,
    "asfx": "",
    "s": "2. 長所（优点）",
    "w": "陽気",
    "k": "ようき",
    "en": null,
    "m": "开朗的，爽朗的",
    "p": "ナ・N",
    "ph": "陽気な人だ",
    "phz": "开朗的人",
    "role": "syn",
    "side": "L",
    "g": 10
  },
  {
    "id": 23,
    "aid": 13,
    "asfx": "-b",
    "s": "2. 長所（优点）",
    "w": "ユーモアがある",
    "k": "ユーモアがある",
    "en": "humor",
    "m": "有幽默感",
    "p": "惯",
    "ph": "ユーモアがある話",
    "phz": "幽默风趣的话",
    "role": "syn",
    "side": "R",
    "g": 10
  },
  {
    "id": 24,
    "aid": 14,
    "asfx": "",
    "s": "2. 長所（优点）",
    "w": "はきはき",
    "k": "はきはき",
    "en": null,
    "m": "爽快，干脆，利落",
    "p": "adv・V3",
    "ph": "はきはき話す",
    "phz": "说话爽快",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 25,
    "aid": 15,
    "asfx": "",
    "s": "2. 長所（优点）",
    "w": "にこにこ",
    "k": "にこにこ",
    "en": null,
    "m": "笑眯眯的，面带笑容",
    "p": "adv・V3",
    "ph": "にこにこしている",
    "phz": "笑眯眯的",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 26,
    "aid": 16,
    "asfx": "",
    "s": "2. 長所（优点）",
    "w": "純粋",
    "k": "じゅんすい",
    "en": null,
    "m": "纯真的，纯粹的",
    "p": "ナ",
    "ph": "純粋な心",
    "phz": "纯真的心",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 27,
    "aid": 17,
    "asfx": "",
    "s": "2. 長所（优点）",
    "w": "穏やか",
    "k": "おだやか",
    "en": null,
    "m": "温和的，平和的",
    "p": "ナ",
    "ph": "穏やかな人柄",
    "phz": "温和的人品",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 28,
    "aid": 18,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "わがまま",
    "k": "わがまま",
    "en": null,
    "m": "任性的，放肆的",
    "p": "ナ・N",
    "ph": "わがままを言う",
    "phz": "耍性子",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 29,
    "aid": 19,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "強引",
    "k": "ごういん",
    "en": null,
    "m": "强硬的，强行的",
    "p": "ナ",
    "ph": "強引に進める",
    "phz": "强行推进",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 30,
    "aid": 20,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "厚かましい・ずうずうしい",
    "k": "あつかましい・ずうずうしい",
    "en": null,
    "m": "厚脸皮的，恬不知耻的",
    "p": "イ",
    "ph": "厚かましいお願い",
    "phz": "厚脸皮的请求",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 31,
    "aid": 21,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "けち",
    "k": "けち",
    "en": null,
    "m": "小气的，吝啬的",
    "p": "ナ・N",
    "ph": "けちな人だ",
    "phz": "小气的人",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 32,
    "aid": 22,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "乱暴・気が荒い",
    "k": "らんぼう・きがあらい",
    "en": null,
    "m": "粗暴的／脾气暴躁",
    "p": "ナ・イ",
    "ph": "乱暴な言葉遣い",
    "phz": "粗暴的措辞",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 33,
    "aid": 23,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "ひきょう",
    "k": "ひきょう",
    "en": null,
    "m": "卑鄙的，懦弱的",
    "p": "ナ",
    "ph": "ひきょうな手段",
    "phz": "卑鄙的手段",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 60,
    "aid": 60,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "平気",
    "k": "へいき",
    "en": null,
    "m": "心平气和，若无其事，不在乎",
    "p": "ナ・N",
    "ph": "人を平気で裏切る",
    "phz": "毫不在乎地背叛别人",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 34,
    "aid": 24,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "裏切る",
    "k": "うらぎる",
    "en": null,
    "m": "背叛，辜负",
    "p": "V1他",
    "ph": "友達を裏切る",
    "phz": "背叛朋友",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 35,
    "aid": 25,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "威張っている",
    "k": "いばっている",
    "en": null,
    "m": "逞威风，摆架子",
    "p": "V1自",
    "ph": "威張った態度",
    "phz": "逞威风的态度",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 36,
    "aid": 26,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "ふざけている",
    "k": "ふざけている",
    "en": null,
    "m": "开玩笑，胡闹",
    "p": "V2自",
    "ph": "授業中にふざける",
    "phz": "上课胡闹",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 37,
    "aid": 27,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "すぐ飽きる・飽きっぽい",
    "k": "すぐあきる・あきっぽい",
    "en": null,
    "m": "容易厌倦，没长性",
    "p": "V2・イ",
    "ph": "飽きっぽい性格",
    "phz": "容易厌倦的性格",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 38,
    "aid": 28,
    "asfx": "",
    "s": "3. 短所（缺点）",
    "w": "慌てる",
    "k": "あわてる",
    "en": null,
    "m": "慌张，慌乱，急忙",
    "p": "V2自",
    "ph": "慌てて間違える",
    "phz": "慌张出错",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 39,
    "aid": 29,
    "asfx": "",
    "s": "4. どちらにもなる表現",
    "w": "のん気・のんびりした",
    "k": "のんき・のんびりした",
    "en": null,
    "m": "悠闲的，慢悠悠的",
    "p": "ナ・惯",
    "ph": "のんびり過ごす",
    "phz": "悠闲度过",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 40,
    "aid": 30,
    "asfx": "",
    "s": "4. どちらにもなる表現",
    "w": "しゃれ",
    "k": "しゃれ",
    "en": null,
    "m": "俏皮话，笑话，打趣",
    "p": "N",
    "ph": "よくしゃれを言う",
    "phz": "爱说俏皮话",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 41,
    "aid": 31,
    "asfx": "",
    "s": "5. 心理",
    "w": "率直",
    "k": "そっちょく",
    "en": null,
    "m": "坦率的，直率的",
    "p": "ナ",
    "ph": "率直な意見を言う",
    "phz": "坦率地说出意见",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 42,
    "aid": 32,
    "asfx": "",
    "s": "5. 心理",
    "w": "心理",
    "k": "しんり",
    "en": null,
    "m": "心理，人心",
    "p": "N",
    "ph": "人間の心理は複雑だ",
    "phz": "人心复杂",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 43,
    "aid": 33,
    "asfx": "",
    "s": "5. 心理",
    "w": "緊張",
    "k": "きんちょう",
    "en": null,
    "m": "紧张",
    "p": "N・V3",
    "ph": "緊張してドキドキする",
    "phz": "紧张得心跳加速",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 44,
    "aid": 34,
    "asfx": "",
    "s": "5. 心理",
    "w": "いらいら",
    "k": "いらいら",
    "en": null,
    "m": "焦躁，急躁，心烦",
    "p": "adv・V3",
    "ph": "いらいらする",
    "phz": "急躁心烦",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 45,
    "aid": 35,
    "asfx": "",
    "s": "5. 心理",
    "w": "気楽",
    "k": "きらく",
    "en": null,
    "m": "轻松的，舒畅的，想得开",
    "p": "ナ",
    "ph": "気楽に考える",
    "phz": "想开点，轻松看待",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 46,
    "aid": 36,
    "asfx": "",
    "s": "5. 心理",
    "w": "機嫌がいい",
    "k": "きげんがいい",
    "en": null,
    "m": "心情好",
    "p": "惯",
    "ph": "機嫌がいい",
    "phz": "心情好",
    "role": "arr",
    "side": "L",
    "g": 11
  },
  {
    "id": 47,
    "aid": 36,
    "asfx": "-r",
    "s": "5. 心理",
    "w": "機嫌が悪い",
    "k": "きげんがわるい",
    "en": null,
    "m": "心情差，不痛快",
    "p": "惯",
    "ph": "朝から機嫌が悪い",
    "phz": "从早上起心情就不好",
    "role": "arr",
    "side": "R",
    "g": 11
  },
  {
    "id": 64,
    "aid": 64,
    "asfx": "",
    "s": "6. 様子",
    "w": "見かけ",
    "k": "みかけ",
    "en": null,
    "m": "外表，外观，外貌",
    "p": "N",
    "ph": "見かけによらない人だ",
    "phz": "人不可貌相",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 50,
    "aid": 38,
    "asfx": "",
    "s": "6. 様子",
    "w": "清潔",
    "k": "せいけつ",
    "en": null,
    "m": "干净的，清洁的",
    "p": "ナ・N",
    "ph": "清潔に保つ",
    "phz": "保持清洁",
    "role": "arr",
    "side": "L",
    "g": 13
  },
  {
    "id": 51,
    "aid": 38,
    "asfx": "-r",
    "s": "6. 様子",
    "w": "不潔",
    "k": "ふけつ",
    "en": null,
    "m": "不洁的，肮脏的",
    "p": "ナ・N",
    "ph": "不潔な手で触らないで",
    "phz": "不要用脏手碰",
    "role": "arr",
    "side": "R",
    "g": 13
  },
  {
    "id": 52,
    "aid": 39,
    "asfx": "",
    "s": "6. 様子",
    "w": "派手",
    "k": "はで",
    "en": null,
    "m": "华丽的，花哨的",
    "p": "ナ",
    "ph": "派手な服",
    "phz": "花哨的衣服",
    "role": "arr",
    "side": "L",
    "g": 14
  },
  {
    "id": 53,
    "aid": 39,
    "asfx": "-r",
    "s": "6. 様子",
    "w": "地味",
    "k": "じみ",
    "en": null,
    "m": "朴素的，质朴的",
    "p": "ナ",
    "ph": "地味な色の服を着る",
    "phz": "穿朴素颜色的衣服",
    "role": "arr",
    "side": "R",
    "g": 14
  },
  {
    "id": 66,
    "aid": 1,
    "asfx": "",
    "s": "7. 語形成",
    "w": "積極的",
    "k": "せっきょくてき",
    "en": null,
    "m": "积极的，主动的",
    "p": "ナ",
    "ph": "積極的に参加する",
    "phz": "积极参与",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 69,
    "aid": 1,
    "asfx": "-r",
    "s": "7. 語形成",
    "w": "消極的",
    "k": "しょうきょくてき",
    "en": null,
    "m": "消极的，被动的",
    "p": "ナ",
    "ph": "消極的な態度",
    "phz": "消极的态度",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 70,
    "aid": 70,
    "asfx": "",
    "s": "7. 語形成",
    "w": "心理的",
    "k": "しんりてき",
    "en": null,
    "m": "心理上的",
    "p": "ナ",
    "ph": "心理的な負担",
    "phz": "心理负担",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 71,
    "aid": 5,
    "asfx": "-r",
    "s": "7. 語形成",
    "w": "不器用",
    "k": "ぶきよう",
    "en": null,
    "m": "笨拙的，不圆滑的",
    "p": "ナ",
    "ph": "手先が不器用だ",
    "phz": "手笨拙",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 72,
    "aid": 11,
    "asfx": "",
    "s": "7. 語形成",
    "w": "礼儀正しい",
    "k": "れいぎただしい",
    "en": null,
    "m": "有礼貌的，端庄的",
    "p": "イ",
    "ph": "礼儀正しい若者",
    "phz": "懂礼貌的年轻人",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 73,
    "aid": 73,
    "asfx": "",
    "s": "7. 語形成",
    "w": "規則正しい",
    "k": "きそくただしい",
    "en": null,
    "m": "有规律的，规整的",
    "p": "イ",
    "ph": "規則正しい生活",
    "phz": "有规律的生活",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 68,
    "aid": 68,
    "asfx": "",
    "s": "7. 語形成",
    "w": "忘れっぽい",
    "k": "わすれっぽい",
    "en": null,
    "m": "健忘的，易忘事的",
    "p": "イ",
    "ph": "年を取って忘れっぽくなった",
    "phz": "上了年纪变健忘了",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 67,
    "aid": 41,
    "asfx": "",
    "s": "7. 語形成",
    "w": "怒りっぽい",
    "k": "おこりっぽい",
    "en": null,
    "m": "易怒的，爱发脾气的",
    "p": "イ",
    "ph": "怒りっぽい性格",
    "phz": "爱生气的性格",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 57,
    "aid": 43,
    "asfx": "",
    "s": "8. 例文中的副词",
    "w": "わざと",
    "k": "わざと",
    "en": null,
    "m": "故意",
    "p": "adv",
    "ph": "わざと嫌なことを言う",
    "phz": "故意说讨人厌的话",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 58,
    "aid": 44,
    "asfx": "",
    "s": "8. 例文中的副词",
    "w": "めっきり",
    "k": "めっきり",
    "en": null,
    "m": "明显地，显著地",
    "p": "adv",
    "ph": "めっきり弱気になった",
    "phz": "明显变得怯弱了",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 59,
    "aid": 45,
    "asfx": "",
    "s": "8. 例文中的副词",
    "w": "相変わらず",
    "k": "あいかわらず",
    "en": null,
    "m": "照旧，依旧",
    "p": "adv",
    "ph": "相変わらずおとなしい",
    "phz": "依旧很文静",
    "role": "",
    "side": "",
    "g": 0
  },
  {
    "id": 65,
    "aid": 65,
    "asfx": "",
    "s": "8. 例文中的副词",
    "w": "一切",
    "k": "いっさい",
    "en": null,
    "m": "一切，全部；（接否定）完全不",
    "p": "N・adv",
    "ph": "一切関係ない",
    "phz": "毫无关系",
    "role": "",
    "side": "",
    "g": 0
  }
];

let DATA = [];
const STORAGE_KEY = 'n212editv3';
(function(){
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const o = JSON.parse(s);
      if (o && Array.isArray(o.data) && o.data.length) DATA = o.data;
    }
  } catch(e) {}
  if (!DATA || !DATA.length) DATA = JSON.parse(JSON.stringify(INITIAL_DATA));
})();

let nextId = Math.max(0, ...DATA.map(d => d.id || 0)) + 1;
let editing = false, dragD = null, saveTimer = null;

function save(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({page: 'N2_1-2', data: DATA})); } catch(e) {}
}
function saveSoon(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 400);
}
function resetAll(){
  if (confirm('确定清空所有修改，恢复初始版式与数据吗？')) {
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
    DATA = JSON.parse(JSON.stringify(INITIAL_DATA));
    save();
    render();
  }
}
const byId = id => DATA.find(d => d.id === id);

/* 音频与 Web Speech 朗读兜底 */
let curAudio = null;
function chooseVoice(){
  if (!('speechSynthesis' in window)) return null;
  const vs = speechSynthesis.getVoices().filter(v => /^ja/i.test(v.lang));
  const cleanVs = vs.filter(v => !/eddy|flo|grandma|grandpa|rocko|reed|sandy|shelley/i.test(v.name));
  return cleanVs.find(v => /nanami|kyoko|haruka|ayumi|female|女/i.test(v.name))
      || cleanVs.find(v => /siri|microsoft|edge/i.test(v.name))
      || cleanVs[0]
      || vs.find(v => /kyoko/i.test(v.name))
      || vs[0];
}
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = chooseVoice;
}
function speakTTS(text){
  if (!('speechSynthesis' in window) || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = 0.9;
  const v = chooseVoice();
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
function play(aid, asfx, text){
  if (curAudio) { curAudio.pause(); }
  if (aid) {
    const p = `../audio/N2/N2_1-2_audio/${aid}${asfx || ''}.mp3`;
    curAudio = new Audio(p);
    curAudio.play().catch(() => {
      if (text) speakTTS(text);
    });
  } else if (text) {
    speakTTS(text);
  }
}

function applyTheme(day){
  document.body.classList.toggle('day', day);
  document.getElementById('themeBtn').textContent = day ? '🌙 夜间' : '☀️ 日间';
}
function toggleTheme(){
  const day = !document.body.classList.contains('day');
  applyTheme(day);
  try { localStorage.setItem('n212theme', day ? 'day' : 'night'); } catch(e) {}
}
applyTheme((() => { try { return localStorage.getItem('n212theme') === 'day'; } catch(e) { return false; } })());

function toggleEdit(){
  editing = !editing;
  document.body.classList.toggle('editing', editing);
  document.getElementById('editBtn').textContent = editing ? '✅ 完成' : '✏️ 编辑';
  document.getElementById('expBtn').classList.toggle('hide', !editing);
  document.getElementById('rstBtn').classList.toggle('hide', !editing);
  if (!editing) save();
  render();
}

const posCls = p => !p ? 'N' : (p.includes('惯') ? 'IDM' : (p.includes('V') ? 'V' : (p.includes('イ') ? 'I' : (p.includes('ナ') ? 'NA' : (p.includes('adv') ? 'adv' : 'N')))));
const esc = s => String(s == null ? '' : s);

function rubyHtml(d){
  const w = d.w || '', k = d.k || '', en = d.en || '';
  const same = !k || k === w;
  const kata = w.match(/^([ァ-ヶー]+)/);
  const rtx = same ? '' : (en ? `<rt class="en">${en}</rt>` : `<rt>${k}</rt>`);
  const safeW = w.replace(/'/g, "\\'");
  const click = `onclick="play(${d.aid || 0},'${d.asfx || ''}','${safeW}')"`;
  return same ? `<span class="word" ${click}>${w}</span>`
    : (kata ? `<ruby class="word" ${click}>${kata[1]}${rtx}</ruby>${w.slice(kata[1].length)}`
            : `<ruby class="word" ${click}>${w}${rtx}</ruby>`);
}

const phRead = d => d.ph ? `
  <div class="phrase">
    <span class="jp" onclick="play(${d.aid || 0},'p','${(d.ph || '').replace(/'/g, "\\'")}')">${esc(d.ph)}</span>
    <span class="zh">${esc(d.phz)}</span>
  </div>` : '';

const entryRead = d => `
  <div class="entry">
    <div class="row1">
      <span class="num">${d.aid || d.id}</span>
      ${rubyHtml(d)}
      <span class="pos ${posCls(d.p)}">${esc(d.p)}</span>
    </div>
    <div class="mean">${esc(d.m)}</div>
    ${phRead(d)}
  </div>`;

const edSpan = (d, f, cls, ph) => `<span class="edf ${cls}${d[f] ? '' : ' empty'}" contenteditable="true" data-ph="${ph}" data-f="${f}">${esc(d[f])}</span>`;

const entryEdit = d => `
  <div class="entry" data-did="${d.id}">
    <div class="row1">
      <span class="num">${d.aid || d.id}</span>
      ${edSpan(d,'w','word','词')}
      ${edSpan(d,'k','edk','注音')}
      ${edSpan(d,'en','ede','en')}
      ${edSpan(d,'p','pos ' + posCls(d.p),'词性')}
      <span class="x" data-x="1" title="删除该词">✕</span>
    </div>
    <div class="mean">${edSpan(d,'m','edmean','释义')}</div>
    <div class="phrase">
      ${edSpan(d,'ph','edph','例句')}
      ${edSpan(d,'phz','edphz','中译')}
    </div>
  </div>`;

const noteRead = d => `<div class="notecard note">${esc(d.text)}</div>`;
const noteEdit = d => `<div class="notecard note" data-did="${d.id}">${edSpan(d,'text','','文本')}<span class="x" data-x="1" title="删除备注">✕</span></div>`;

function getBarHtml(role, g){
  const title = editing ? 'title="点击切换符号：⇄ (相对) / | (竖线反义) / — (横杠同类)"' : '';
  if (role === 'ant') {
    return `<div class="bar-wrap" data-bar="${g}" ${title}><span class="vs-ant"></span></div>`;
  } else if (role === 'syn') {
    return `<div class="bar-wrap" data-bar="${g}" ${title}><span class="vs-syn"></span></div>`;
  } else {
    return `<div class="bar-wrap" data-bar="${g}" ${title}><span class="vs-arr">⇄</span></div>`;
  }
}

const list = document.getElementById('list');

function removeD(d){
  const i = DATA.indexOf(d);
  if (i >= 0) { DATA.splice(i, 1); return true; }
  return false;
}
function secLastIdx(s){
  let last = -1;
  DATA.forEach((d, i) => { if (d.s === s) last = i; });
  return last;
}
function addToSecEnd(d, s){
  d.s = s;
  const at = secLastIdx(s);
  DATA.splice(at + 1, 0, d);
}
function newG(){
  return Math.max(0, ...DATA.map(d => d.g || 0)) + 1;
}

function render(){
  list.innerHTML = '';
  let curS = null, row = null, colA = null, colB = null, wrap = null, alt = 0;
  let lastG = null, lastRole = null, gHead = null, halves = null, gRole = null, gG = null;

  for (let i = 0; i < DATA.length; i++){
    const d = DATA[i];
    if (d.s !== curS){
      curS = d.s;
      const h = document.createElement('div'); h.className = 'sec-h';
      const t = document.createElement('span'); t.className = 'sec-title'; t.textContent = curS;
      if (editing){
        const oldS = curS;
        t.contentEditable = 'true';
        t.addEventListener('input', () => {
          const ns = t.textContent;
          DATA.forEach(x => { if (x.s === oldS) x.s = ns; });
          curS = ns;
          saveSoon();
        });
        const bb = document.createElement('span'); bb.className = 'addbtns';
        const mk = (label, fn) => {
          const b = document.createElement('button');
          b.textContent = label;
          b.addEventListener('click', fn);
          bb.appendChild(b);
        };
        mk('+词框', () => {
          addToSecEnd({id: nextId++, aid: 0, asfx: '', s: curS, w: '', k: '', en: '', m: '', p: 'N', ph: '', phz: '', role: '', side: '', g: 0}, curS);
          save(); render();
        });
        mk('+相对组 (⇄)', () => {
          const g = newG();
          addToSecEnd({id: nextId++, aid: 0, asfx: '', s: curS, w: '', k: '', en: '', m: '', p: 'N', ph: '', phz: '', role: 'arr', side: 'L', g}, curS);
          addToSecEnd({id: nextId++, aid: 0, asfx: '-r', s: curS, w: '', k: '', en: '', m: '', p: 'N', ph: '', phz: '', role: 'arr', side: 'R', g}, curS);
          save(); render();
        });
        mk('+反义组 (|)', () => {
          const g = newG();
          addToSecEnd({id: nextId++, aid: 0, asfx: '', s: curS, w: '', k: '', en: '', m: '', p: 'N', ph: '', phz: '', role: 'ant', side: 'L', g}, curS);
          addToSecEnd({id: nextId++, aid: 0, asfx: '-r', s: curS, w: '', k: '', en: '', m: '', p: 'N', ph: '', phz: '', role: 'ant', side: 'R', g}, curS);
          save(); render();
        });
        mk('+同类组 (—)', () => {
          const g = newG();
          addToSecEnd({id: nextId++, aid: 0, asfx: '', s: curS, w: '', k: '', en: '', m: '', p: 'N', ph: '', phz: '', role: 'syn', side: 'L', g}, curS);
          addToSecEnd({id: nextId++, aid: 0, asfx: '-r', s: curS, w: '', k: '', en: '', m: '', p: 'N', ph: '', phz: '', role: 'syn', side: 'R', g}, curS);
          save(); render();
        });
        mk('+文本', () => {
          addToSecEnd({id: nextId++, s: curS, kind: 'note', text: ''}, curS);
          save(); render();
        });
        h.appendChild(bb);
      }
      h.appendChild(t);
      list.appendChild(h);

      if (editing){
        wrap = document.createElement('div'); wrap.className = 'sec-items'; list.appendChild(wrap);
        wrap.addEventListener('dragover', e => e.preventDefault());
        wrap.addEventListener('drop', e => {
          e.preventDefault();
          if (dragD && dragD.s === curS) {
            removeD(dragD); addToSecEnd(dragD, curS); save(); render();
          }
        });
      } else {
        row = document.createElement('div'); row.className = 'row2';
        colA = document.createElement('div'); colA.className = 'col2';
        colB = document.createElement('div'); colB.className = 'col2';
        row.appendChild(colA); row.appendChild(colB);
        list.appendChild(row);
      }
      lastG = null; lastRole = null; alt = 0;
    }

    const isNote = d.kind === 'note';
    const hasRole = !isNote && (d.role === 'arr' || d.role === 'ant' || d.role === 'syn');
    const entryHtml = isNote ? (editing ? noteEdit(d) : noteRead(d)) : (editing ? entryEdit(d) : entryRead(d));

    if (hasRole){
      if (d.role !== lastRole || d.g !== lastG){
        lastRole = d.role; lastG = d.g; gRole = d.role; gG = d.g;
        gHead = document.createElement('div');
        gHead.className = 'item';
        gHead.innerHTML = `
          <div class="card c${posCls(d.p)}">
            <div class="bra">
              <div class="half"></div>
              ${getBarHtml(d.role, d.g)}
              <div class="half"></div>
            </div>
            ${editing ? `<span class="gx" data-gx="${d.g}" data-gs="${esc(d.s)}" title="删除整个成对组">✕</span>` : ''}
          </div>`;
        if (editing){
          const itemEl = gHead;
          itemEl.addEventListener('dragover', e => e.preventDefault());
          attachTopDrop(itemEl, d, curS);
        }
        (editing ? wrap : (alt++ % 2 === 0 ? colA : colB)).appendChild(gHead);
        halves = gHead.querySelectorAll('.half');
        if (editing){
          halves.forEach((h, hi) => {
            h.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation(); h.classList.add('over'); });
            h.addEventListener('dragleave', () => h.classList.remove('over'));
            h.addEventListener('drop', e => {
              e.preventDefault(); e.stopPropagation(); h.classList.remove('over');
              if (!dragD) return;
              removeD(dragD);
              dragD.role = gRole; dragD.g = gG; dragD.side = hi === 1 ? 'R' : 'L'; dragD.s = curS;
              let at = -1;
              DATA.forEach((x, xi) => { if (x.s === curS && x.role === gRole && x.g === gG && x.side === dragD.side) at = xi; });
              if (at < 0) DATA.forEach((x, xi) => { if (x.s === curS && x.role === gRole && x.g === gG && at < 0) at = xi; });
              DATA.splice(at + 1, 0, dragD);
              save(); render();
            });
          });
        }
      }
      (d.side === 'R' ? halves[1] : halves[0]).innerHTML += entryHtml;
    } else {
      const item = document.createElement('div'); item.className = 'item';
      const card = document.createElement('div');
      card.className = 'card c' + posCls(d.p) + (isNote ? ' notecard' : '');
      card.innerHTML = entryHtml;
      if (editing){ attachTopDrop(item, d, curS); }
      item.appendChild(card);
      (editing ? wrap : (alt++ % 2 === 0 ? colA : colB)).appendChild(item);
    }
  }

  if (editing){
    list.querySelectorAll('[data-did]').forEach(el => { el.draggable = true; });
  }
  const words = DATA.filter(d => d.kind !== 'note').length;
  document.getElementById('count').textContent = words;
}

function attachTopDrop(item, d, sec){
  item.addEventListener('dragover', e => {
    if (!dragD) return;
    e.preventDefault();
    const before = e.offsetY < item.offsetHeight / 2;
    item.classList.toggle('ins-top', before); item.classList.toggle('ins-bot', !before);
    item._ins = before ? 'top' : 'bot';
  });
  item.addEventListener('dragleave', () => item.classList.remove('ins-top', 'ins-bot'));
  item.addEventListener('drop', e => {
    e.preventDefault();
    const where = item._ins; item.classList.remove('ins-top', 'ins-bot');
    if (!dragD || !where) return;
    removeD(dragD);
    dragD.role = ''; dragD.side = ''; dragD.g = 0; dragD.s = sec;
    let ti = DATA.indexOf(d);
    DATA.splice(where === 'top' ? ti : ti + 1, 0, dragD);
    save(); render();
  });
}

/* 拖拽委托 */
list.addEventListener('dragstart', e => {
  const h = e.target.closest('[data-did]'); if (!h || !editing) return;
  dragD = byId(+h.dataset.did);
  e.dataTransfer.setData('text/plain', 'x');
  e.target.classList.add('dragging');
});
list.addEventListener('dragend', e => {
  if (e.target.classList) e.target.classList.remove('dragging');
});

/* 事件委托: 文字编辑 / 删除 / 相对符号切换 */
list.addEventListener('input', e => {
  const t = e.target.closest('.edf'); if (!t) return;
  const holder = t.closest('[data-did]'); if (!holder) return;
  const d = byId(+holder.dataset.did); if (!d) return;
  d[t.dataset.f] = t.textContent;
  saveSoon();
});

list.addEventListener('click', e => {
  // 删除单卡
  const x = e.target.closest('.x');
  if (x){
    const holder = x.closest('[data-did]'); if (!holder) return;
    const d = byId(+holder.dataset.did); if (!d) return;
    removeD(d); save(); render(); return;
  }
  // 删除整组
  const gx = e.target.closest('.gx');
  if (gx){
    const g = +gx.dataset.gx, s = gx.dataset.gs;
    for (let i = DATA.length - 1; i >= 0; i--) {
      if (DATA[i].s === s && DATA[i].g === g && DATA[i].role) DATA.splice(i, 1);
    }
    save(); render(); return;
  }
  // 点击符号循环切换: arr (⇄) -> ant (|) -> syn (—) -> arr (⇄)
  const bar = e.target.closest('[data-bar]');
  if (bar && editing){
    const g = +bar.dataset.bar;
    let s = null, currentRole = 'arr';
    DATA.forEach(d => {
      if (d.g === g && d.role && s === null) { s = d.s; currentRole = d.role; }
    });
    const nextRole = currentRole === 'arr' ? 'ant' : (currentRole === 'ant' ? 'syn' : 'arr');
    DATA.forEach(d => {
      if (d.s === s && d.g === g && d.role) d.role = nextRole;
    });
    save(); render();
  }
});

/* 导出 JSON 功能 */
function exportData(){
  const dataStr = JSON.stringify({page: 'N2_1-2', data: DATA}, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'N2_1-2_layout.json';
  a.click();

  document.getElementById('exportText').value = dataStr;
  document.getElementById('exportModal').classList.add('open');
}

function copyExportText(){
  const t = document.getElementById('exportText');
  t.select();
  navigator.clipboard.writeText(t.value).then(() => {
    alert('已成功复制最新 JSON 数据到剪贴板！');
  });
}

render();

print('Render executed successfully! Total items counted:', countEl.textContent);
