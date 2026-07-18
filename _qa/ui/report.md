# Game Visual QA Report

## Context

- Game/build：`ume-last-cup` 本地 Vite build。
- Review target：初始探索、六段真实 MP4、5/5 高潮按钮、兔子接杯高潮、顾客接杯结算、320 × 568 英文窄屏。
- Requirements and visual bible：`doc/requirements.md`、`doc/visual.md`。
- Viewports/devices：390 × 844 主目标；320 × 568 窄屏。
- Evidence paths：`_qa/ui/first-pass/*.png`、`_qa/video-contact-sheets/*.jpg`、`_qa/ui/poster-160.png`。

## Executive assessment

- Decision：正式视频垂直切片通过。
- Strongest quality：粉色兔子主场景与五张单角色分支均为完整场景生成，角色、地面、阴影、反光和景深统一，不再有透明 PNG 粘贴感。
- Largest risk：生成模型在分支中段有短暂运动模糊，但首尾锚点稳定且不影响角色揭示与交互理解。
- P0/P1/P2 counts：最终复检为 0 / 0 / 0。

## Scorecard

| Category | Score 1–5 | Evidence | Required action |
|---|---:|---|---|
| Hierarchy | 5 | 入口只有粉色兔子、杯子和五个物件热点；高潮按钮为唯一主行动 | 无 |
| Coherence | 4 | 六段视频共享奶油车厢、暖日光和 3D 商业动画语言；首尾帧锚定稳定 | 无 |
| Readability | 5 | 中英文标题、字幕、进度和结果在两种视口清晰 | 无 |
| Game feel | 5 | 热点即时反馈、5.04 秒喜剧动作、1.5 秒尾帧保持、珍珠进度和高潮完整 | 无 |
| Asset quality | 5 | 角色不再以透明层拼贴；1024 海报和 160 缩略图均清晰 | 无 |
| Responsive UX | 5 | 320 宽无溢出；所有按钮实测宽高均大于 44 px | 无 |
| Polish | 4 | 高潮按钮不遮脸，真实视频无黑闪，结算使用独立接杯微距 | 无 |

## Findings and fixes

### P1 — 旧拼贴资产缺少场景融合

- Screen/location：初始画面与分支尾帧第一版。
- Observation：透明角色 PNG 与生成车厢没有共享接触阴影、反光与景深，看起来像贴纸。
- Impact：直接破坏合作品牌角色可信度和产品完成度。
- Concrete fix：废弃拼贴脚本；从品牌手册裁出六张单角色官方参考，每个镜头用对应单一参考直接生成完整场景；初始画面只保留粉色兔子，其他角色仅在分支出现。
- Verification evidence：`entry-390x844.png`、`fallback-melon-390x844.png`。

### P1 — 高潮按钮覆盖主角脸部

- Screen/location：5/5 高潮待命。
- Observation：第一版中央按钮压住粉色兔子脸部和杯子。
- Impact：主行动与核心叙事主体互相竞争。
- Concrete fix：高潮面板改为底部对齐，按钮位于进度条上方，保留脸部和杯子的完整阅读。
- Verification evidence：`climax-ready-390x844.png`。

### P2 — 英文提示仍描述“点击队员”

- Screen/location：英文入口。
- Observation：交互改成物件热点后，提示仍是 `Tap the crew`。
- Impact：文案与实际点击对象不一致。
- Concrete fix：更新为 `Tap the clues. See who shows up.`。
- Verification evidence：`entry-en-320x568.png`。

## Foundation audit

- Functional emoji icons：无；声音控制使用自绘圆角线性 SVG。
- Icon-family consistency：当前只有同一套声音开/关图标。
- Touch targets：320 × 568 实测声音按钮 48 × 48；五个热点最小 70.39 × 130.63。
- Contrast and color independence：热点以颜色、波纹和完成编号共同表达；正文深棕/奶油对比清晰。
- Focus and input behavior：按钮有 `:focus-visible`；Pointer 与 Enter/Space 均可操作。
- State coverage：入口、真实分支视频、回退错误、5/5、真实高潮视频和结算均已覆盖。
- Localization and overflow：320 × 568 英文 `scrollWidth === clientWidth === 320`。

## Art-direction audit

- Palette and typography：奶油、天空蓝、兔粉、芒果黄和深棕一致；圆润标题与玩具按钮匹配世界。
- Composition：初始只有兔子与杯子；五件物品沿边缘分布；高潮与结算主体明确。
- Asset perspective/lighting/detail：最终静态素材均为单角色完整场景生成；右上暖光和左侧蓝色补光基本一致。
- UI/world integration：按钮使用奶油底、深棕硬边与黄色动作色，没有玻璃拟态或霓虹手游层。
- Motion and VFX：六段 H.264 视频均为 768 × 1024、24 fps、5.041667 秒；SHA-256 各不相同，首中尾接触表已人工检查。

## Iteration evidence

- First-pass observations：角色拼贴感；高潮按钮遮脸；英文入口提示过时；结算自动化截图过早。
- Fixes completed：单角色完整场景生成；物件热点重排；高潮按钮下移；英文提示更新；自动化等待真实状态。
- Matched recheck captures：`entry-390x844.png`、`climax-ready-390x844.png`、`result-390x844.png`、`entry-en-320x568.png`。
- Remaining exceptions and reasons：无阻断项；分支中段的生成式运动模糊属于模型风格，不影响首尾角色识别。

## Final recommendation

- Final average：4.71（正式视频切片）。
- Categories below 3：无。
- Decision：正式视频、交互、响应式与回退路径均通过，可进入发布门禁。
