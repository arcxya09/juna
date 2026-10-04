# JUNA · 锦屏深地核天体物理实验

公开网站：https://arcxya09.github.io/juna/

深黑蓝色、真实装置与天文影像。中英文内容，装置流程联动、四步核反应探测演示、研究方向与论文关联、可分享详情页、论文检索与引用导出。

## 分支与构建

- `website`：可编辑源码。
- `gh-pages`：静态发布文件。
- 原有 `master`、`dev`：保留代码与历史。

需要 Node.js 22.13+，pnpm 11.25.0。使用锁文件：

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

构建生成 `out/`，验证首页、四个研究页面、五篇论文详情以及内部链接和资源。将 `out/` 的全部内容（含 `.nojekyll`）提交到 `gh-pages` 根目录。发布时保留至少前两次发布的 `_next/static/` 哈希资源，保证浏览器缓存旧 HTML 时仍可加载脚本与样式。GitHub Pages 使用 `Deploy from a branch` → `gh-pages` → `/ (root)`。

项目部署路径 `/juna/` 由 `lib/asset-path.ts`、`vite.config.ts`、`next.config.ts` 配置。Vinext beta 的动态预渲染在 `trailingSlash: true` 时会收到 308，因此使用 `false` 构建，再由 `scripts/prepare-pages.mjs` 生成目录索引；线上地址始终为 `/research/<id>/` 和 `/publications/<slug>/`。

## 维护入口

| 文件 | 内容 |
| --- | --- |
| `app/site-data.ts` | 双语科学内容、公开进展、论文元数据、DOI、BibTeX、来源 |
| `app/page.tsx`、`app/globals.css` | 首页结构、响应式排版、语言与筛选状态 |
| `app/facility-explorer.tsx`、`.css` | 真实照片与可选择装置功能流程 |
| `app/reaction-explorer.tsx`、`.css` | 入射、反应、产物、探测四步概念演示 |
| `app/research/[id]/page.tsx` | 四个预渲染研究方向详情 |
| `app/publications/[slug]/page.tsx` | 论文预渲染、分享元数据与结构化数据 |
| `scripts/prepare-pages.mjs` | 输出验证、站点地图、错误页 |
| `docs/maintenance.md` | 内容核验、视觉规范与发布流程 |

`app/static-history.tsx` 保持同一静态页面内的历史导航在浏览器本地完成，避免把 `/juna/` 的锚点或筛选变化作为服务端 RSC 路由请求。首页查询参数保存语言、反应、搜索、方向与年份。详情返回时恢复主页状态。搜索支持普通数字与上标核素匹配。所有实验示意均标注概念属性；无真实计数、伪实验数据或虚构运行状态。

影像：面纱星云为 ESA/Hubble & NASA, Z. Levay，CC BY 4.0（https://esahubble.org/images/potw2113a/）；JUNA 实景为 INRIO / 中国原子能科学研究院（https://inrio.net/facilities），原权利人保留版权。图像仅压缩为 WebP。
