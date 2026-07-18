# Technical

## 1. 技术栈

- 框架与语言：React 18、TypeScript 5。
- 构建与样式：Vite 5、Less；`vite.config.ts` 使用 `base: './'`，所有发布资源可在任意子路径运行。
- 渲染方式：响应式 DOM/CSS 覆盖层配合全屏图片与 HTML `<video>`；主场景、分支尾帧、高潮尾帧和结算图均随包发布。
- 音频：Web Audio API 程序化合成点击、完成、全员就位和结算反馈；首次交互后才创建或恢复 `AudioContext`。
- 多语言：轻量 `zh/en` 字典，根据 `game_locale` 或浏览器语言选择。
- 平台标识：永久 UUID 为 `d54e9dfe-8b91-4752-9e8b-4e266d33c699`，同时写入 `index.html` meta 与 `window.__GAME_UUID__`。
- 制作期资产：正式静态场景通过 Aigram transit 生图接口制作；角色参考来自用户提供的 UMe 品牌手册单角色页。

## 2. 目录结构

- `index.html`：Vite 入口、viewport、安全区与游戏 UUID meta。
- `meta.json`：平台标题和 `/poster.png` 封面路径。
- `vite.config.ts`：相对路径构建、开发与预览配置。
- `src/main.tsx`：React 挂载入口。
- `src/App.tsx`：游戏根组件入口。
- `src/game-id.ts`：向运行环境注入永久游戏 UUID。
- `src/index.less`：页面级重置与外层背景。
- `src/Game/LastCupRun.tsx`：热点配置、视频/尾帧切换、状态机、计时、高潮和重玩流程。
- `src/Game/LastCupRun.less`：视觉 token、响应式布局、热点、进度、字幕、结算、动效与减少动态模式。
- `src/Game/i18n.ts`：中文和英文界面、字幕与可访问标签。
- `src/Game/sounds.ts`：Web Audio 合成音效。
- `public/hero.png`：只含粉色兔子、最后一杯和五件分支物品的初始主场景。
- `public/frames/end_*.png`：五张单角色完整生成分支尾帧与粉色兔子接杯高潮尾帧。
- `public/frames/result_delivered.png`：顾客接杯与珍珠落稳的结算微距。
- `public/poster.png`：Aigram transit 生成底图并补充精确游戏标题的 1024 × 1024 正式海报。
- `_production/prepare_character_refs.py`：从品牌手册渲染页准备无文字、竖屏的单角色生成参考。
- `_production/generate_videos.py`：使用公开 Aigram CDN 首尾帧调用正式首尾帧视频接口；最多两个 worker、20 秒错峰提交、每任务 15 秒轮询。
- `_production/finish_poster.py`：为 transit 海报底图添加精确标题并输出 160 × 160 检查图。
- `_qa/capture.mjs`：Playwright 状态遍历、截图、窄屏尺寸和触控目标检查。

## 3. 核心模块

- 状态机：`idle → playing → holding → climaxReady → climaxPlaying → revelation → done`。五个物件热点可任意顺序播放，首次完成才增加 `Set<ClipId>` 进度。
- 片段节奏：字幕延迟 700 ms；片段结束保持 1,500 ms，并在最后 450 ms 与主场景交叉淡化；高潮字幕延迟 2,800 ms，高潮结束保持 2,800 ms。
- 视频回退：`<video>` 加载或解码失败时立即切到对应 `public/frames/` 尾帧，3,200 ms 后继续相同完成流程，因此缺少 MP4 不会卡死游戏。
- 响应式：主舞台宽度为 `min(100vw, 480px)`，高度使用 `100dvh`；320 × 568 到 390 × 844 均由内部 DOM 重排，不依赖整页 transform 缩放。
- 输入：高频热点与主要动作使用 `onPointerDown`；键盘通过 `Enter/Space` 触发；声音按钮使用 `onClick`。触控目标均大于 44 × 44 CSS px。
- 视觉反馈：热点波纹、完成编号、五颗彩色珍珠进度、首次完成粒子、高潮按钮和结算切换；`prefers-reduced-motion` 关闭循环波纹与粒子位移。
- 多语言：所有用户可见文字由 `t()` 提供；英文长标签只存在于可访问名称，不挤压画面。
- 数据与后端：本游戏不保存分数、不接排行榜、不在运行时生成图片，也不上传用户内容；重玩只重置当前内存状态。

## 4. 扩展点

- 改热点位置或角色顺序：编辑 `src/Game/LastCupRun.tsx` 的 `CLIPS`。
- 调字幕、保持时间和回退时长：编辑同文件的 `SUBTITLE_DELAY_MS`、`HOLD_AFTER_END_MS`、`FALLBACK_DURATION_MS` 等常量。
- 换分支或高潮素材：替换 `public/frames/` 和未来的 `public/videos/` 同名文件；保持 9:16 构图与相对路径。
- 改故事文案：同步修改 `src/Game/i18n.ts` 的 `zh` 与 `en` 字典。
- 调颜色、按钮、字幕和响应式：修改 `src/Game/LastCupRun.less` 顶部 token 与对应 BEM 区块。
- 调音效：修改 `src/Game/sounds.ts` 的波形、频率、时长和增益。
- 重新生成视频：运行 `_production/generate_videos.py`；脚本直接使用已记录的公开首尾帧 URL，调用 2026-06-29 `gen-video` Skill 确认的正式接口，结果写入 `public/videos/`。
- 视频规格：六段均为 H.264、768 × 1024、24 fps、5.041667 秒；SHA-256 均不同。
- 发布：重新执行 `npm run build`、UI/视频 QA、UUID 校验和发布流程；`base` 必须保持 `./`。
