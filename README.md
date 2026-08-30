# Personal Academic Website

Jian-Gang Kong (孔建刚) 的个人学术主页。

**在线网址:** https://harrykjg-physics.github.io/

纯静态网站（HTML + CSS + JS，无构建步骤），通过 GitHub Pages 部署。

## 页面

| 文件 | 内容 |
|------|------|
| `index.html` | 主页：简介、研究兴趣、教育经历、链接 |
| `publications.html` | 论文列表（按年份分组，含 arXiv/DOI/PDF 链接） |
| `teaching.html` | 教学 |
| `presentations.html` | 报告 |
| `useful-links.html` | 私人项目入口（Physicist's homepage、Notepad，需密码） |
| `private/` | 私人区域：物理学家名单、日记（密码：见 `assets/js/auth.js`） |
| `assets/` | 样式、脚本、图片 |

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 更新部署

```bash
git add -A
git commit -m "update"
git push origin main
```
