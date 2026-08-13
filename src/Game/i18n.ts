export type Locale = 'zh' | 'en';

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'zh';
  try {
    const override = window.localStorage.getItem('game_locale');
    if (override === 'zh' || override === 'en') return override;
  } catch {
    // Local storage can be unavailable in private WebViews; browser language remains a safe fallback.
  }
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

const LOCALE = detectLocale();

const STRINGS: Record<Locale, Record<string, string>> = {
  zh: {
    'title.eyebrow': 'UMe FAMILY 特急配送',
    'title.main': '最后一杯大作战',
    'hint.first': '点点大家，看看谁又添乱了',
    'progress': '配送进度 {n}/5',
    'hotspot.melon': '检查西瓜安全带',
    'hotspot.lemon': '检查黄色制冷拉杆',
    'hotspot.guac': '拿起绿色毛线帽',
    'hotspot.mango': '看看芒果色小票',
    'hotspot.pearl': '碰一下金环珍珠',
    'hotspot.climax': '护住最后一杯',
    'sub.melon': '鼠瓜瓜把安全带当成呼啦圈了！',
    'sub.lemon': '柠檬鲨负责制冷——也负责打滑。',
    'sub.guac': '果泥猪很稳。帽子不太稳。',
    'sub.mango': '芒芒鸡只啄了一下。真的，只一下。',
    'sub.pearl': '珍珠天使会飞，光环还在考驾照。',
    'sub.climax': '一车都乱了。最后一杯，一滴没洒！',
    'climax.ready': '全员就位',
    'climax.button': '护住最后一杯',
    'done.eyebrow': '成功送达',
    'done.title': '刚刚好，一滴没洒',
    'done.body': '过程不重要。杯子到了就好。',
    'done.again': '再送一杯',
    'done.time': '通关时间',
    'rank.title': '通关排行榜',
    'rank.leaders': '排行榜',
    'rank.me': '我',
    'rank.empty': '还没有通关记录，来当第一名吧！',
    'rank.loading': '正在读取通关记录…',
    'rank.openInAlterU': '在 AlterU 中打开即可查看通关排行榜。',
    'rank.getAlterU': '下载 AlterU',
    'rank.close': '关闭排行榜',
    'video.fallback': '视频暂时走丢了，先看事故现场',
    'sound.on': '关闭声音',
    'sound.off': '打开声音',
  },
  en: {
    'title.eyebrow': 'UMe FAMILY EXPRESS',
    'title.main': 'THE LAST CUP RUN',
    'hint.first': 'Tap the clues. See who shows up.',
    'progress': 'Delivery {n}/5',
    'hotspot.melon': 'Check the watermelon strap',
    'hotspot.lemon': 'Check the yellow cooling lever',
    'hotspot.guac': 'Pick up the green knit cap',
    'hotspot.mango': 'Inspect the mango delivery ticket',
    'hotspot.pearl': 'Tap the pearl in the gold ring',
    'hotspot.climax': 'Save the last cup',
    'sub.melon': 'MelonMick mistook the safety belt for a hula hoop.',
    'sub.lemon': 'LemonShark handles cooling. Slipping, too.',
    'sub.guac': 'GuacPiggy is steady. The hat is not.',
    'sub.mango': 'MangoChick pecked it once. Honestly. Once.',
    'sub.pearl': "BubblePearl can fly. The halo is still learning.",
    'sub.climax': 'The whole van lost it. The last cup lost nothing.',
    'climax.ready': 'CREW READY',
    'climax.button': 'SAVE THE LAST CUP',
    'done.eyebrow': 'DELIVERED',
    'done.title': 'Right on time. Not a drop spilled.',
    'done.body': "Don't ask how. The cup made it.",
    'done.again': 'DELIVER ANOTHER',
    'done.time': 'COMPLETION TIME',
    'rank.title': 'Completion leaderboard',
    'rank.leaders': 'LEADERS',
    'rank.me': 'me',
    'rank.empty': 'No completion times yet. Be the first!',
    'rank.loading': 'Loading completion times…',
    'rank.openInAlterU': 'Open in AlterU to view the completion leaderboard.',
    'rank.getAlterU': 'Get AlterU',
    'rank.close': 'Close leaderboard',
    'video.fallback': 'The clip took a wrong turn. Here is the scene.',
    'sound.on': 'Mute sound',
    'sound.off': 'Turn sound on',
  },
};

export function t(key: string, vars?: { n?: number | string }): string {
  let value = STRINGS[LOCALE][key] ?? STRINGS.zh[key] ?? key;
  if (vars?.n !== undefined) value = value.replace('{n}', String(vars.n));
  return value;
}

export function getLocale(): Locale {
  return LOCALE;
}
