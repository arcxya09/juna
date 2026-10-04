# JUNA · 锦屏深地核天体物理实验

新版 JUNA 官方网站的可编辑源码。深黑蓝色、真实天文影像及装置照片，支持中文/英文、滚动与视差动画、四反应切换、深度滑块、装置组成探索和公开论文详情。

## 分支

- `website`：新版网站源码。
- `gh-pages`：可直接用于 GitHub Pages 的静态产物。
- 原有 `master`、`dev`：保留原网站代码与历史。

## 构建

需要 Node.js 22.13 或更新版本。使用 pnpm 11.25.0 和本仓库锁文件：

```sh
pnpm install --frozen-lockfile
pnpm build
```

构建会生成 `out/`，并检查首页正文及本地资源完整性。将该目录的全部内容（含 `.nojekyll`）更新到 `gh-pages` 分支根目录。

GitHub Pages 设置：`Deploy from a branch`，分支 `gh-pages`，目录 `/ (root)`。这是预渲染的静态网站，无需服务器，所有交互在浏览器中执行。

项目路径 `/juna/` 在 `lib/asset-path.ts`、`vite.config.ts` 与 `next.config.ts` 中配置。

## 内容维护

- `app/page.tsx`：页面结构、中英文文案与交互。
- `app/reaction-explorer.tsx`：分步核反应示意、播放与无动画交互。
- `app/site-data.ts`：公开论文、DOI、来源与影像署名。
- `app/globals.css`：视觉、响应式布局与动画。
- `public/images/`：影像资源。

## 影像与资料

面纱星云：ESA/Hubble & NASA, Z. Levay，CC BY 4.0；来源 https://esahubble.org/images/potw2113a/ 。图片转换为 WebP，不改变观测图像内容。

JUNA 装置实景：INRIO / 中国原子能科学研究院；来源 https://inrio.net/facilities 。原权利人保留版权。

项目事实与研究成果以公开机构资料及已发表论文为依据，来源可在网站页脚查看。

静态输出使用 `out/`，避免被框架误识别为 Pages Router 源码。构建前后请运行 `pnpm check`。论文检索支持普通数字与上标核素匹配，可组合年份筛选。交互示意不表示真实轨迹、尺度、截面或实验数据。
