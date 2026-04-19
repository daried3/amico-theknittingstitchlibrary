/* ============================================================
   amico stitch library — main.js
   ============================================================ */
'use strict';

// ── State ─────────────────────────────────────────────────
let allSymbols  = [];
let currentLang = 'ja';
let currentFilter = 'all';
let currentQuery  = '';

// ── i18n ──────────────────────────────────────────────────
const i18n = {
  ja: {
    heroTitle: '編み図記号辞書',
    heroDesc: '記号の「なぜ？」に静かに答える場所。日本語・英語・韓国語で検索できます。',
    searchPlaceholder: '記号を検索… 例: M1R、掛け目、Knit',
    filterAll: 'すべて', filterBasic: '基本', filterIncrease: '増し目',
    filterDecrease: '減らし目', filterOther: 'その他',
    groupBasic: '基本', groupIncrease: '増し目', groupDecrease: '減らし目', groupOther: 'その他',
    labelHow: '編み方', labelEffect: '編み地への作用', labelWhy: 'なぜ使うの？',
    labelTags: 'タグ', labelRelated: 'これも覚えたい',
    labelFabric: '編み地の仕上がり', labelUseCase: '使いどころのイメージ',
    labelVideo: 'YouTube 動画', videoComingSoon: '動画は近日公開予定です',
    noResults: '一致する記号が見つかりませんでした。',
  },
  en: {
    heroTitle: 'Knitting Stitch Library',
    heroDesc: 'A quiet place to understand the "why" behind every stitch symbol.',
    searchPlaceholder: 'Search… e.g. M1R, Yarn Over, 掛け目',
    filterAll: 'All', filterBasic: 'Basic', filterIncrease: 'Increase',
    filterDecrease: 'Decrease', filterOther: 'Other',
    groupBasic: 'Basic', groupIncrease: 'Increase', groupDecrease: 'Decrease', groupOther: 'Other',
    labelHow: 'How to knit', labelEffect: 'Effect on fabric', labelWhy: 'Why use it?',
    labelTags: 'Tags', labelRelated: 'Also learn',
    labelFabric: 'Fabric result', labelUseCase: 'Where to use',
    labelVideo: 'YouTube Video', videoComingSoon: 'Video coming soon',
    noResults: 'No symbols found.',
  },
  ko: {
    heroTitle: '뜨개 기호 사전',
    heroDesc: '기호의 "왜?"에 조용히 답하는 곳.',
    searchPlaceholder: '기호 검색… 예: M1R, 걸기코, Knit',
    filterAll: '전체', filterBasic: '기본', filterIncrease: '늘리기',
    filterDecrease: '줄이기', filterOther: '기타',
    groupBasic: '기본', groupIncrease: '늘리기', groupDecrease: '줄이기', groupOther: '기타',
    labelHow: '뜨는 방법', labelEffect: '편물에 미치는 영향', labelWhy: '왜 사용하나요?',
    labelTags: '태그', labelRelated: '함께 알아보기',
    labelFabric: '편물 결과', labelUseCase: '활용 예시',
    labelVideo: 'YouTube 동영상', videoComingSoon: '동영상 준비 중',
    noResults: '일치하는 기호가 없습니다.',
  },
};

// ── SVG Illustration Library ──────────────────────────────
const SYMBOL_SVGS = (() => {
  const v  = (x,y,c='#C8D4CC',w=1.5) =>
    `<path d="M${x-6},${y+8}L${x},${y-8}L${x+6},${y+8}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const pb = (x,y,c='#C8D4CC',w=1.5) =>
    `<path d="M${x-7},${y}Q${x},${y+9}${x+7},${y}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const tx = (x,y,t,c='#989E90',s=9) =>
    `<text x="${x}" y="${y}" fill="${c}" font-size="${s}" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif">${t}</text>`;
  const W  = (inner, bg='#E4F2EE') =>
    `<svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;border-radius:8px"><rect width="240" height="140" rx="8" fill="${bg}" stroke="#B0D4CA" stroke-width="1.5"/>${inner}</svg>`;

  const GX = [24,60,96,132,168,204];
  const GY = [28,60,92,124];
  const G  = (hl={}) => GY.flatMap(y => GX.map(x => {
    const h = hl[`${x},${y}`];
    return h ? v(x,y,h[0],h[1]||2.5) : v(x,y,'#C8D4CC',1.5);
  })).join('');

  return {

    K: {
      fabric: W(
        G({'96,60':['#343830'],'132,60':['#343830'],'96,92':['#343830'],'132,92':['#343830']}) +
        tx(120,137,'V字が規則正しく並ぶ（表側）')
      ),
      useCase: W(
        `<rect x="50" y="22" width="140" height="90" rx="4" fill="none" stroke="#7DB8A8" stroke-width="2"/>` +
        [72,102,132,162].flatMap(x=>[38,58,78,98].map(y=>v(x,y,'#7DB8A8',1.5))).join('') +
        tx(120,130,'メリヤス編み（表側）','#7DB8A8',10)
      ,'#F0EFE8'),
    },

    P: {
      fabric: W(
        GY.slice(0,2).flatMap(y=>GX.map(x=>v(x,y,'#C8D4CC',1.5))).join('') +
        GY.slice(2).flatMap(y=>GX.map(x=>pb(x,y,'#343830',2.5))).join('') +
        tx(120,137,'裏目は横向きの弧が並ぶ（凸凹面）')
      ),
      useCase: W(
        [45,80,115,150,185].map((x,i)=>
          [30,52,74,96,118].map(y=> i%2===0 ? v(x,y,'#7DB8A8',2) : pb(x,y,'#626858',2)).join('')
        ).join('') +
        tx(120,133,'K1 P1 ゴム編み（リブ）','#626858',10)
      ,'#F0EFE8'),
    },

    CO: {
      fabric: W(
        `<line x1="18" y1="72" x2="215" y2="72" stroke="#626858" stroke-width="3" stroke-linecap="round"/>` +
        `<polygon points="222,72 214,67 214,77" fill="#626858"/>` +
        GX.map(x=>`<path d="M${x-8},72Q${x},90${x+8},72" stroke="#C8D4CC" stroke-width="2" fill="none"/>`).join('') +
        GX.map(x=>v(x,46,'#7DB8A8',2)).join('') +
        tx(120,137,'針に目を作る — 編み物の始まり')
      ),
      useCase: W(
        `<circle cx="40" cy="70" r="22" fill="none" stroke="#C8D4CC" stroke-width="2"/>` +
        `<circle cx="40" cy="70" r="8"  fill="none" stroke="#C8D4CC" stroke-width="2"/>` +
        `<path d="M62,70 C80,55 95,60 110,70" stroke="#C8D4CC" stroke-width="1.5" fill="none" stroke-dasharray="5,3"/>` +
        `<line x1="110" y1="70" x2="222" y2="70" stroke="#626858" stroke-width="3" stroke-linecap="round"/>` +
        [130,155,175,195].map(x=>`<circle cx="${x}" cy="70" r="7" fill="none" stroke="#7DB8A8" stroke-width="2"/>`).join('') +
        tx(120,132,'作り目 — すべての起点','#7DB8A8',9)
      ,'#F0EFE8'),
    },

    BO: {
      fabric: W(
        GY.slice(1).flatMap(y=>GX.map(x=>v(x,y,'#C8D4CC',1.5))).join('') +
        GX.map(x=>`<path d="M${x-9},28Q${x},16${x+9},28" stroke="#343830" stroke-width="2.5" fill="none"/>`).join('') +
        `<line x1="15" y1="28" x2="225" y2="28" stroke="#343830" stroke-width="1" opacity="0.3"/>` +
        tx(120,137,'鎖目が目を固定して端を閉じる')
      ),
      useCase: W(
        `<rect x="50" y="30" width="140" height="72" rx="4" fill="none" stroke="#C8D4CC" stroke-width="1.5"/>` +
        Array.from({length:8},(_,i)=>
          `<path d="M${50+i*18},30Q${59+i*18},20${68+i*18},30" stroke="#343830" stroke-width="2.5" fill="none"/>`
        ).join('') +
        tx(120,128,'目がほどけない安定した端','#343830',10)
      ,'#F0EFE8'),
    },

    YO: {
      fabric: W(
        GY.flatMap(y=>GX.map(x=>{
          if(x===132&&y===60)
            return `<circle cx="132" cy="60" r="8" stroke="#343830" stroke-width="2.5" fill="#E4F2EE"/>`;
          return v(x,y,'#C8D4CC',1.5);
        })).join('') +
        tx(120,137,'穴（ホール）が開く増し目')
      ),
      useCase: W(
        [60,90,150,180].flatMap(x=>[30,55,80,105].map(y=>v(x,y,'#C8D4CC',1.5))).join('') +
        `<polygon points="120,22 155,62 120,102 85,62" fill="none" stroke="#C8D4CC" stroke-width="1" stroke-dasharray="4,3"/>` +
        [[120,22],[155,62],[120,102],[85,62],[120,62]].map(([x,y])=>
          `<circle cx="${x}" cy="${y}" r="8" stroke="#7DB8A8" stroke-width="2.5" fill="#E4F2EE"/>`
        ).join('') +
        tx(120,132,'透かし編み・レース・ボタン穴','#7DB8A8',9)
      ,'#F0EFE8'),
    },

    M1: {
      fabric: W(
        [60,96,132,168].map(x=>v(x,120,'#C8D4CC',1.5)).join('') +
        `<line x1="96" y1="95" x2="132" y2="95" stroke="#7DB8A8" stroke-width="3" stroke-linecap="round"/>` +
        `<circle cx="114" cy="95" r="5" fill="#7DB8A8"/>` +
        `<line x1="114" y1="90" x2="114" y2="73" stroke="#7DB8A8" stroke-width="2" stroke-dasharray="3,2"/>` +
        `<polygon points="114,63 109,75 119,75" fill="#7DB8A8"/>` +
        [48,84,114,150,186].map((x,i)=>v(x,56,i===2?'#343830':'#C8D4CC',i===2?2.5:1.5)).join('') +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'シンカーループ → 新しい目')
      ),
      useCase: W(
        `<line x1="120" y1="15" x2="120" y2="125" stroke="#C8D4CC" stroke-width="1.5" stroke-dasharray="5,3"/>` +
        [60,84,108,132,156,180].map(x=>v(x,110,'#C8D4CC',1.5)).join('') +
        [42,70,98,120,148,176,204].map((x,i)=>v(x,82,i===3?'#7DB8A8':'#C8D4CC',i===3?2.5:1.5)).join('') +
        `<path d="M120,68 L80,46" stroke="#7DB8A8" stroke-width="2"/>` +
        `<polygon points="80,46 88,52 86,40" fill="#7DB8A8"/>` +
        `<path d="M120,68 L160,46" stroke="#7DB8A8" stroke-width="2"/>` +
        `<polygon points="160,46 152,52 154,40" fill="#7DB8A8"/>` +
        tx(120,132,'目数を増やして幅を広げる','#7DB8A8',10)
      ,'#F0EFE8'),
    },

    M1R: {
      fabric: W(
        [60,96,132,168].map(x=>v(x,120,'#C8D4CC',1.5)).join('') +
        `<line x1="96" y1="95" x2="132" y2="95" stroke="#7DB8A8" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M114,92 L138,68" stroke="#7DB8A8" stroke-width="2" stroke-dasharray="3,2"/>` +
        `<polygon points="138,68 128,72 132,60" fill="#7DB8A8"/>` +
        [48,84,120,150,186].map((x,i)=>v(x,56,i===3?'#343830':'#C8D4CC',i===3?2.5:1.5)).join('') +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'右に傾く・穴なし増し目')
      ),
      useCase: W(
        `<polygon points="120,18 192,88 120,124 48,88" fill="none" stroke="#C8D4CC" stroke-width="1.5"/>` +
        `<line x1="120" y1="18" x2="192" y2="88" stroke="#7DB8A8" stroke-width="2.5"/>` +
        `<line x1="192" y1="88" x2="120" y2="124" stroke="#7DB8A8" stroke-width="2.5"/>` +
        `<circle cx="192" cy="88" r="7" fill="#7DB8A8"/>` +
        tx(185,77,'M1R','#7DB8A8',9) +
        tx(120,136,'ラグランライン — 右側','#7DB8A8',10)
      ,'#F0EFE8'),
    },

    M1L: {
      fabric: W(
        [60,96,132,168].map(x=>v(x,120,'#C8D4CC',1.5)).join('') +
        `<line x1="96" y1="95" x2="132" y2="95" stroke="#7DB8A8" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M114,92 L90,68" stroke="#7DB8A8" stroke-width="2" stroke-dasharray="3,2"/>` +
        `<polygon points="90,68 100,72 96,60" fill="#7DB8A8"/>` +
        [48,84,96,150,186].map((x,i)=>v(x,56,i===2?'#343830':'#C8D4CC',i===2?2.5:1.5)).join('') +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'左に傾く・穴なし増し目')
      ),
      useCase: W(
        `<polygon points="120,18 192,88 120,124 48,88" fill="none" stroke="#C8D4CC" stroke-width="1.5"/>` +
        `<line x1="120" y1="18" x2="48" y2="88" stroke="#7DB8A8" stroke-width="2.5"/>` +
        `<line x1="48"  y1="88" x2="120" y2="124" stroke="#7DB8A8" stroke-width="2.5"/>` +
        `<circle cx="48" cy="88" r="7" fill="#7DB8A8"/>` +
        tx(55,77,'M1L','#7DB8A8',9) +
        tx(120,136,'ラグランライン — 左側','#7DB8A8',10)
      ,'#F0EFE8'),
    },

    RLI: {
      fabric: W(
        GX.map(x=>v(x,124,'#C8D4CC',1.5)).join('') +
        GX.map(x=>v(x,92,x===132?'#7DB8A8':'#C8D4CC',x===132?2:1.5)).join('') +
        `<line x1="132" y1="88" x2="132" y2="68" stroke="#7DB8A8" stroke-width="2" stroke-dasharray="3,2"/>` +
        `<polygon points="132,60 127,70 137,70" fill="#7DB8A8"/>` +
        GX.map((x,i)=>v(x,60,i===4?'#343830':'#C8D4CC',i===4?2.5:1.5)).join('') +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'前段の右側の目を引き上げる')
      ),
      useCase: W(
        `<path d="M30,120 Q55,40 120,25 Q185,40 210,120" fill="none" stroke="#C8D4CC" stroke-width="1.5"/>` +
        [[78,82],[92,57],[106,40],[120,34],[134,40],[148,57],[162,82]].map(([x,y])=>
          `<circle cx="${x}" cy="${y}" r="5" fill="#7DB8A8" opacity="0.85"/>`
        ).join('') +
        tx(120,134,'袖山 — 最も目立たない増し目','#7DB8A8',9)
      ,'#F0EFE8'),
    },

    LLI: {
      fabric: W(
        GX.map(x=>v(x,124,'#C8D4CC',1.5)).join('') +
        GX.map(x=>v(x,92,x===96?'#7DB8A8':'#C8D4CC',x===96?2:1.5)).join('') +
        `<line x1="96" y1="88" x2="96" y2="68" stroke="#7DB8A8" stroke-width="2" stroke-dasharray="3,2"/>` +
        `<polygon points="96,60 91,70 101,70" fill="#7DB8A8"/>` +
        GX.map((x,i)=>v(x,60,i===1?'#343830':'#C8D4CC',i===1?2.5:1.5)).join('') +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'前段の左側の目を引き上げる')
      ),
      useCase: W(
        `<path d="M30,120 Q55,40 120,25 Q185,40 210,120" fill="none" stroke="#C8D4CC" stroke-width="1.5"/>` +
        [[78,82],[92,57],[106,40],[120,34],[134,40],[148,57],[162,82]].map(([x,y])=>
          `<circle cx="${x}" cy="${y}" r="5" fill="#7DB8A8" opacity="0.85"/>`
        ).join('') +
        tx(120,134,'RLI と対で使う（左側）','#7DB8A8',9)
      ,'#F0EFE8'),
    },

    KFB: {
      fabric: W(
        GX.map(x=>v(x,124,'#C8D4CC',1.5)).join('') +
        `<rect x="107" y="85" width="26" height="19" rx="4" fill="#E4F2EE" stroke="#7DB8A8" stroke-width="1.5"/>` +
        `<text x="120" y="98" fill="#7DB8A8" font-size="10" text-anchor="middle" font-family="-apple-system,sans-serif">1目</text>` +
        `<path d="M111,85 L92,68"  stroke="#7DB8A8" stroke-width="1.5" stroke-dasharray="3,2"/>` +
        `<path d="M129,85 L148,68" stroke="#7DB8A8" stroke-width="1.5" stroke-dasharray="3,2"/>` +
        v(92,60,'#343830',2.5) + v(148,60,'#343830',2.5) +
        `<line x1="120" y1="58" x2="120" y2="70" stroke="#E8A898" stroke-width="2.5" stroke-linecap="round"/>` +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'1目から2目を編み出す')
      ),
      useCase: W(
        `<circle cx="120" cy="66" r="44" fill="none" stroke="#C8D4CC" stroke-width="1.5"/>` +
        Array.from({length:8},(_,i)=>{
          const a=(i/8)*Math.PI*2-Math.PI/2;
          const x=(120+44*Math.cos(a)).toFixed(1);
          const y=(66 +44*Math.sin(a)).toFixed(1);
          return `<circle cx="${x}" cy="${y}" r="6" fill="#7DB8A8"/>`;
        }).join('') +
        tx(120,130,'帽子・輪編みの増し目（8か所）','#7DB8A8',9)
      ,'#F0EFE8'),
    },

    K2tog: {
      fabric: W(
        GX.map(x=>v(x,124,'#C8D4CC',1.5)).join('') +
        `<path d="M108,92 L132,60" stroke="#C4786A" stroke-width="3" fill="none" stroke-linecap="round"/>` +
        `<path d="M132,92 L132,60" stroke="#C4786A" stroke-width="2" fill="none" stroke-linecap="round"/>` +
        v(132,60,'#343830',2.5) +
        [24,60,168,204].map(x=>v(x,92,'#C8D4CC',1.5)).join('') +
        [24,60,96,168,204].map(x=>v(x,60,'#C8D4CC',1.5)).join('') +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'右上に傾く2目一度（/）')
      ),
      useCase: W(
        `<path d="M40,28 L200,28 L172,112 L68,112Z" fill="none" stroke="#C8D4CC" stroke-width="1.5"/>` +
        `<line x1="200" y1="28" x2="172" y2="112" stroke="#C4786A" stroke-width="2.5"/>` +
        `<text x="210" y="65" fill="#C4786A" font-size="9" text-anchor="start" font-family="-apple-system,sans-serif">K2tog</text>` +
        `<line x1="40"  y1="28" x2="68"  y2="112" stroke="#C8D4CC" stroke-width="1.5" stroke-dasharray="4,3"/>` +
        tx(120,130,'つま先・袖山の右辺','#C4786A',10)
      ,'#F0EFE8'),
    },

    SSK: {
      fabric: W(
        GX.map(x=>v(x,124,'#C8D4CC',1.5)).join('') +
        `<path d="M132,92 L108,60" stroke="#C4786A" stroke-width="3" fill="none" stroke-linecap="round"/>` +
        `<path d="M108,92 L108,60" stroke="#C4786A" stroke-width="2" fill="none" stroke-linecap="round"/>` +
        v(108,60,'#343830',2.5) +
        [24,60,168,204].map(x=>v(x,92,'#C8D4CC',1.5)).join('') +
        [24,60,132,168,204].map(x=>v(x,60,'#C8D4CC',1.5)).join('') +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'左上に傾く2目一度（\\）')
      ),
      useCase: W(
        `<path d="M40,28 L200,28 L172,112 L68,112Z" fill="none" stroke="#C8D4CC" stroke-width="1.5"/>` +
        `<line x1="40" y1="28" x2="68" y2="112" stroke="#C4786A" stroke-width="2.5"/>` +
        `<text x="30" y="65" fill="#C4786A" font-size="9" text-anchor="end" font-family="-apple-system,sans-serif">SSK</text>` +
        `<line x1="200" y1="28" x2="172" y2="112" stroke="#C8D4CC" stroke-width="1.5" stroke-dasharray="4,3"/>` +
        tx(120,130,'つま先・袖山の左辺','#C4786A',10)
      ,'#F0EFE8'),
    },

    S2KP: {
      fabric: W(
        GX.map(x=>v(x,124,'#C8D4CC',1.5)).join('') +
        `<path d="M96,92  L120,60" stroke="#C4786A" stroke-width="2.5" stroke-linecap="round" fill="none"/>` +
        `<path d="M120,92 L120,60" stroke="#C4786A" stroke-width="2.5" stroke-linecap="round" fill="none"/>` +
        `<path d="M144,92 L120,60" stroke="#C4786A" stroke-width="2.5" stroke-linecap="round" fill="none"/>` +
        v(120,60,'#343830',2.5) +
        [24,60,168,204].map(x=>v(x,92,'#C8D4CC',1.5)).join('') +
        [24,60,96,144,168,204].map(x=>v(x,60,'#C8D4CC',1.5)).join('') +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'中央に3目を集める（左右対称）')
      ),
      useCase: W(
        `<path d="M50,18 L120,102 L190,18" fill="none" stroke="#C8D4CC" stroke-width="1.5"/>` +
        `<line x1="120" y1="25" x2="120" y2="102" stroke="#C4786A" stroke-width="2.5" stroke-dasharray="6,3"/>` +
        [36,52,68,84].map(y=>`<circle cx="120" cy="${y}" r="5" fill="#C4786A"/>`).join('') +
        tx(120,130,'Vネック中央・三角ショールの脊線','#C4786A',9)
      ,'#F0EFE8'),
    },

    K3tog: {
      fabric: W(
        GX.map(x=>v(x,124,'#C8D4CC',1.5)).join('') +
        `<path d="M96,92  L144,60" stroke="#C4786A" stroke-width="2.5" stroke-linecap="round" fill="none"/>` +
        `<path d="M120,92 L144,60" stroke="#C4786A" stroke-width="2.5" stroke-linecap="round" fill="none"/>` +
        `<path d="M144,92 L144,60" stroke="#C4786A" stroke-width="2.5" stroke-linecap="round" fill="none"/>` +
        v(144,60,'#343830',2.5) +
        [24,60,168,204].map(x=>v(x,92,'#C8D4CC',1.5)).join('') +
        [24,60,96,120,168,204].map(x=>v(x,60,'#C8D4CC',1.5)).join('') +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'右上に3目を一度に合わせる')
      ),
      useCase: W(
        `<polygon points="120,22 175,82 120,118 65,82" fill="none" stroke="#C8D4CC" stroke-width="1.5"/>` +
        `<circle cx="120" cy="118" r="9" fill="#C4786A"/>` +
        `<text x="120" y="122" fill="white" font-size="8" text-anchor="middle" font-family="-apple-system,sans-serif">K3tog</text>` +
        [[107,100],[120,100],[133,100]].map(([x,y])=>
          `<circle cx="${x}" cy="${y}" r="4" fill="#C4786A" opacity="0.6"/>`
        ).join('') +
        tx(120,134,'レース先端・急な減らし目','#C4786A',9)
      ,'#F0EFE8'),
    },

    Sl: {
      fabric: W(
        GX.map(x=>v(x,124,'#C8D4CC',1.5)).join('') +
        GX.map(x=>v(x,92,'#C8D4CC',1.5)).join('') +
        `<path d="M114,68L120,52L126,68" stroke="#343830" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="3,2"/>` +
        `<path d="M126,64 L140,57" stroke="#989E90" stroke-width="1.5"/>` +
        `<polygon points="140,57 132,57 134,65" fill="#989E90"/>` +
        [24,60,168,204].map(x=>v(x,60,'#C8D4CC',1.5)).join('') +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'目を編まず右針へ移す')
      ),
      useCase: W(
        `<rect x="60" y="20" width="120" height="100" rx="5" fill="none" stroke="#C8D4CC" stroke-width="1.5"/>` +
        Array.from({length:5},(_,i)=>{
          const y=20+i*20, even=i%2===0;
          return `<rect x="60" y="${y}" width="120" height="20" fill="${even?'#E9F4F0':'#F5F4EF'}"/>` +
            (even
              ? `<text x="120" y="${y+14}" fill="#7DB8A8" font-size="8" text-anchor="middle" font-family="-apple-system,sans-serif">sl wyif, k1 …</text>`
              : `<text x="120" y="${y+14}" fill="#C8D4CC" font-size="8" text-anchor="middle" font-family="-apple-system,sans-serif">p across</text>`);
        }).join('') +
        tx(120,133,'ヒールフラップ — 縦糸で強化','#626858',9)
      ,'#F0EFE8'),
    },

    tbl: {
      fabric: W(
        GX.map(x=>v(x,124,'#C8D4CC',1.5)).join('') +
        GX.map(x=>v(x,92,'#C8D4CC',1.5)).join('') +
        `<path d="M114,68L126,52" stroke="#343830" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M126,68L114,52" stroke="#343830" stroke-width="2.5" stroke-linecap="round"/>` +
        [24,60,168,204].map(x=>v(x,60,'#C8D4CC',1.5)).join('') +
        GX.map(x=>v(x,28,'#C8D4CC',1.5)).join('') +
        tx(120,137,'ループをねじって編む（X形）')
      ),
      useCase: W(
        [42,80,118,156,194].map((x,i)=>
          [28,50,72,94,116].map(y=>
            i%2===0
              ? `<path d="M${x-5},${y+7}L${x+5},${y-7}" stroke="#343830" stroke-width="2" stroke-linecap="round"/>` +
                `<path d="M${x+5},${y+7}L${x-5},${y-7}" stroke="#343830" stroke-width="2" stroke-linecap="round"/>`
              : pb(x,y,'#7DB8A8',1.5)
          ).join('')
        ).join('') +
        tx(120,133,'ねじり目ゴム編み（K1tbl P1）','#343830',9)
      ,'#F0EFE8'),
    },

    PM: {
      fabric: W(
        `<line x1="18" y1="70" x2="218" y2="70" stroke="#626858" stroke-width="3" stroke-linecap="round"/>` +
        GX.map(x=>`<circle cx="${x}" cy="70" r="8" fill="#E4F2EE" stroke="#C8D4CC" stroke-width="1.5"/>`).join('') +
        `<circle cx="118" cy="70" r="13" fill="none" stroke="#E8A898" stroke-width="3"/>` +
        tx(118,44,'◀ marker ▶','#E8A898',9) +
        tx(120,104,'目と目の間に置く','#989E90',9)
      ),
      useCase: W(
        `<circle cx="120" cy="65" r="42" fill="none" stroke="#C8D4CC" stroke-width="2"/>` +
        Array.from({length:16},(_,i)=>{
          const a=(i/16)*Math.PI*2-Math.PI/2;
          const x=(120+42*Math.cos(a)).toFixed(1);
          const y=(65 +42*Math.sin(a)).toFixed(1);
          return `<circle cx="${x}" cy="${y}" r="4" fill="#E4F2EE" stroke="#C8D4CC" stroke-width="1.5"/>`;
        }).join('') +
        `<circle cx="120" cy="23" r="9" fill="none" stroke="#E8A898" stroke-width="3"/>` +
        tx(120,134,'輪編みの段の始まり (BOR)','#E8A898',9)
      ,'#F0EFE8'),
    },
  };
})();

// ── Japanese Chart Symbols (JIS knitting symbols) ─────────
const CHART_SYMBOLS = (() => {
  const S = '#343830';
  const W = inner =>
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="width:46px;height:46px;overflow:visible">${inner}</svg>`;
  const ln = (x1,y1,x2,y2,w=2.5,dash='') =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${S}" stroke-width="${w}" stroke-linecap="round"${dash?` stroke-dasharray="${dash}"`:''}/>`;
  const pd = (d,w=2.5,dash='') =>
    `<path d="${d}" stroke="${S}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"${dash?` stroke-dasharray="${dash}"`:''}/>`;

  return {

    // ── 表目 (Knit): 縦棒 ─────────────────────────────────
    K: W(ln(30,7,30,53)),

    // ── 裏目 (Purl): 横棒 ─────────────────────────────────
    P: W(ln(7,30,53,30)),

    // ── 作り目 (Cast On): 記号なし ────────────────────────
    CO: null,

    // ── 伏せ目 (Bind Off): 塗り潰し楕円 ──────────────────
    BO: W(
      `<ellipse cx="30" cy="33" rx="19" ry="9" fill="${S}" transform="rotate(-10 30 33)"/>`
    ),

    // ── 掛け目 (Yarn Over): 円 ────────────────────────────
    YO: W(
      `<circle cx="30" cy="30" r="17" stroke="${S}" stroke-width="2.5" fill="none"/>`
    ),

    // ── 以下は順次追加予定 ────────────────────────────────
    M1: null, M1R: null, M1L: null,
    RLI: null, LLI: null, KFB: null,
    K2tog: null, SSK: null, S2KP: null, K3tog: null,
    Sl: null, tbl: null,
  };
})();

// ── DOM helpers ───────────────────────────────────────────
const $  = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// ── Load data ─────────────────────────────────────────────
async function loadSymbols() {
  try {
    const res = await fetch('./data/symbols.json');
    allSymbols = await res.json();
    render();
  } catch (e) {
    console.error('Failed to load symbols.json', e);
  }
}

// ── Filter & Search ───────────────────────────────────────
function getFilteredSymbols() {
  const q = currentQuery.toLowerCase().trim();
  return allSymbols.filter(sym => {
    if (currentFilter !== 'all' && sym.group !== currentFilter) return false;
    if (!q) return true;
    const fields = [sym.id, sym.enAbbr, sym.enAlt, sym.jaName, sym.jaAlt,
                    sym.enName, sym.koName, sym.koAlt, sym.yomi, ...(sym.tags||[])];
    return fields.some(f => f && f.toLowerCase().includes(q));
  });
}

// ── Render helpers ────────────────────────────────────────
function groupLabel(group) {
  return i18n[currentLang][`group${capitalize(group)}`] || group;
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function cardNamePrimary(sym) {
  if (currentLang==='ja') return sym.jaName;
  if (currentLang==='en') return sym.enName;
  return sym.koName || sym.enName;
}
function cardNameSecondary(sym) {
  if (currentLang==='ja') return sym.enName;
  if (currentLang==='en') return sym.jaName;
  return sym.jaName;
}
function cardNameTertiary(sym) {
  if (currentLang==='ko') return sym.enName;
  return sym.koName;
}
function cardEffect(sym) {
  return currentLang==='ja' ? sym.jaEffect : sym.enEffect;
}

// ── Render card list ──────────────────────────────────────
function render() {
  const t = i18n[currentLang];
  const filtered = getFilteredSymbols();
  const container = $('#symbol-list');
  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `<div class="no-results">${t.noResults}</div>`;
    return;
  }

  const groups = ['basic','increase','decrease','other'];
  const grouped = {};
  groups.forEach(g => { grouped[g] = []; });
  filtered.forEach(sym => { if (grouped[sym.group]) grouped[sym.group].push(sym); });

  groups.forEach(group => {
    const symbols = grouped[group];
    if (symbols.length === 0) return;

    const section = document.createElement('div');
    section.className = 'symbol-section';

    if (currentFilter === 'all') {
      const heading = document.createElement('h2');
      heading.className = 'section-heading';
      heading.textContent = groupLabel(group);
      section.appendChild(heading);
    }

    const grid = document.createElement('div');
    grid.className = 'symbol-grid';

    symbols.forEach(sym => {
      const card = document.createElement('div');
      card.className = 'symbol-card';
      card.dataset.id = sym.id;
      const chartSym = CHART_SYMBOLS[sym.id];
      card.innerHTML = `
        <div class="card-header">
          <span class="card-abbr">${escHtml(sym.enAbbr||sym.id)}</span>
          <span class="card-group-badge group-${sym.group}">${escHtml(groupLabel(sym.group))}</span>
        </div>
        ${chartSym ? `<div class="card-chart-symbol">${chartSym}</div>` : ''}
        <div class="card-ja-name">${escHtml(cardNamePrimary(sym))}</div>
        <div class="card-en-name">${escHtml(cardNameSecondary(sym))}</div>
        ${cardNameTertiary(sym)?`<div class="card-ko-name">${escHtml(cardNameTertiary(sym))}</div>`:''}
        <p class="card-effect">${escHtml(cardEffect(sym))}</p>
      `;
      card.addEventListener('click', () => openModal(sym.id));
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

// ── Modal ─────────────────────────────────────────────────
function openModal(id) {
  const sym = allSymbols.find(s => s.id === id);
  if (!sym) return;

  const t       = i18n[currentLang];
  const overlay = $('#modal-overlay');
  const modal   = $('#modal');

  const how    = currentLang==='ja' ? sym.jaHow    : sym.enHow;
  const effect = currentLang==='ja' ? sym.jaEffect : sym.enEffect;
  const why    = currentLang==='ja' ? sym.jaWhy    : sym.enWhy;

  // illustrations
  const svgs = SYMBOL_SVGS[sym.id];
  const illustHTML = svgs ? `
    <div class="modal-illustrations">
      <div class="modal-illus-item">
        <div class="modal-illus-label">${escHtml(t.labelFabric)}</div>
        ${svgs.fabric}
      </div>
      <div class="modal-illus-item">
        <div class="modal-illus-label">${escHtml(t.labelUseCase)}</div>
        ${svgs.useCase}
      </div>
    </div>` : '';

  // YouTube embed
  const videoId = extractVideoId(sym.videoUrl);
  const ytHTML = videoId
    ? `<div class="modal-video-section">
        <div class="modal-section-label">${escHtml(t.labelVideo)}</div>
        <div class="yt-thumb-wrap" data-videoid="${escHtml(videoId)}">
          <img class="yt-thumb-img"
               src="https://img.youtube.com/vi/${escHtml(videoId)}/hqdefault.jpg"
               alt="${escHtml(sym.enName)} — YouTube"
               loading="lazy">
          <button class="yt-thumb-btn" aria-label="動画を再生">
            <span class="yt-play-circle">
              <svg viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg">
                <polygon points="4,2 18,10 4,18"/>
              </svg>
            </span>
          </button>
        </div>
      </div>`
    : `<div class="yt-no-video">
        <span class="yt-no-video-icon">
          <svg viewBox="0 0 12 12" fill="rgba(255,255,255,0.4)" xmlns="http://www.w3.org/2000/svg">
            <polygon points="2,1 11,6 2,11"/>
          </svg>
        </span>
        <span class="yt-no-video-text">${escHtml(t.videoComingSoon)}</span>
      </div>`;

  const relatedHTML = (sym.related||[]).length > 0
    ? sym.related.map(r=>`<button class="related-btn" data-id="${escHtml(r)}">${escHtml(r)}</button>`).join('')
    : '—';

  const tagsHTML = (sym.tags||[]).length > 0
    ? sym.tags.map(tag=>`<span class="tag">${escHtml(tag)}</span>`).join('')
    : '';

  modal.innerHTML = `
    <button class="modal-close" id="modal-close-btn" aria-label="閉じる">✕</button>

    <div class="modal-header">
      <div class="modal-abbr-row">
        <span class="modal-abbr">${escHtml(sym.enAbbr||sym.id)}</span>
        <span class="modal-group-badge card-group-badge group-${sym.group}">${escHtml(groupLabel(sym.group))}</span>
      </div>
      <div class="modal-names">
        <div class="modal-name-ja">${escHtml(sym.jaName)}${sym.jaAlt?` <small style="font-size:12px;color:var(--c-text-sub)">／ ${escHtml(sym.jaAlt)}</small>`:''}</div>
        <div class="modal-name-en">${escHtml(sym.enName)}${sym.enAlt?` <span style="color:var(--c-text-sub)">(${escHtml(sym.enAlt)})</span>`:''}</div>
        ${sym.koName?`<div class="modal-name-ko">${escHtml(sym.koName)}${sym.koAlt?` / ${escHtml(sym.koAlt)}`:''}</div>`:''}
      </div>
    </div>

    ${illustHTML}
    ${ytHTML}

    <div class="modal-section">
      <div class="modal-section-label">${escHtml(t.labelHow)}</div>
      <p class="modal-section-text">${escHtml(how)}</p>
    </div>

    <hr class="modal-section-divider">

    <div class="modal-section">
      <div class="modal-section-label">${escHtml(t.labelEffect)}</div>
      <p class="modal-section-text">${escHtml(effect)}</p>
    </div>

    <div class="modal-section">
      <div class="modal-section-label">${escHtml(t.labelWhy)}</div>
      <p class="modal-section-text">${escHtml(why)}</p>
    </div>

    ${tagsHTML?`
    <div class="modal-section">
      <div class="modal-section-label">${escHtml(t.labelTags)}</div>
      <div class="modal-tags">${tagsHTML}</div>
    </div>`:''}

    <hr class="modal-section-divider">

    <div class="modal-section">
      <div class="modal-section-label">${escHtml(t.labelRelated)}</div>
      <div class="related-list">${relatedHTML}</div>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  initYoutubeThumb(modal);
  $('#modal-close-btn').addEventListener('click', closeModal);
  modal.querySelectorAll('.related-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal();
      setTimeout(() => openModal(btn.dataset.id), 180);
    });
  });

  overlay._escHandler = e => { if (e.key==='Escape') closeModal(); };
  document.addEventListener('keydown', overlay._escHandler);
}

function closeModal() {
  const overlay = $('#modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (overlay._escHandler) document.removeEventListener('keydown', overlay._escHandler);
}

// ── YouTube helpers ───────────────────────────────────────
function extractVideoId(url) {
  if (!url) return null;
  // youtu.be/VIDEO_ID  or  youtube.com/watch?v=VIDEO_ID
  const m = url.match(/(?:youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function initYoutubeThumb(modal) {
  const wrap = modal.querySelector('.yt-thumb-wrap');
  if (!wrap) return;
  wrap.addEventListener('click', () => {
    const id = wrap.dataset.videoid;
    wrap.innerHTML =
      `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>`;
  }, { once: true });
}

// ── XSS helper ───────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── UI labels ─────────────────────────────────────────────
function updateUILabels() {
  const t = i18n[currentLang];
  $('#hero-title').textContent   = t.heroTitle;
  $('#hero-desc').textContent    = t.heroDesc;
  $('#search-input').placeholder = t.searchPlaceholder;
  ['all','basic','increase','decrease','other'].forEach(f => {
    const btn = $(`[data-filter="${f}"]`);
    if (btn) btn.textContent = t[`filter${capitalize(f)}`];
  });
  $$('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

// ── Events ────────────────────────────────────────────────
function initEvents() {
  $$('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      updateUILabels();
      render();
    });
  });
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      $$('.filter-btn').forEach(b => b.classList.toggle('active', b===btn));
      render();
    });
  });
  $('#search-input').addEventListener('input', e => {
    currentQuery = e.target.value;
    render();
  });
  $('#modal-overlay').addEventListener('click', e => {
    if (e.target===e.currentTarget) closeModal();
  });
  $('.logo').addEventListener('click', () => {
    window.scrollTo({top:0, behavior:'smooth'});
  });
}

// ── Boot ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  updateUILabels();
  loadSymbols();
});
