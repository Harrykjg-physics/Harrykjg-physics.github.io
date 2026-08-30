# Personal Academic Website

A minimal static academic homepage — plain HTML + CSS, no frameworks,
no build step. Inspired by [Shinichiro Akiyama's homepage](https://akiyama-es.github.io/).

## Pages

| File                 | Content                              |
|----------------------|--------------------------------------|
| `index.html`         | Home: bio, affiliation, research interests, education, career, links |
| `publications.html`  | Publication list (grouped by year, with arXiv/DOI/PDF links) |
| `teaching.html`      | Courses taught / TA'd, students      |
| `presentations.html` | Invited talks, seminars, posters     |
| `assets/css/style.css` | Shared stylesheet                  |

All personal data is marked with `<!-- TODO: -->` comments — search for
`TODO` and replace with your real information.

## Deploy to GitHub Pages (`<username>.github.io`)

### Option A — user/org site (repo named `<username>.github.io`)

1. Create a new (empty) repository named exactly `<username>.github.io`
   on GitHub.
2. Push the site:

   ```bash
   git init
   git add .
   git commit -m "Initial website"
   git branch -M main
   git remote add origin https://github.com/<username>/<username>.github.io.git
   git push -u origin main
   ```

3. Go to **Settings → Pages** and set Source to
   `Deploy from a branch` → branch `main`, folder `/ (root)`.
4. Wait ~1 minute, then visit `https://<username>.github.io/`.

### Option B — project site (repo under a subpath, e.g. `homepage`)

1. Create a repository (e.g. `homepage`).
2. Same git steps as above, pushing to that repo.
3. In **Settings → Pages**, set the source branch to `main` `/ (root)`.
4. Visit `https://<username>.github.io/homepage/`.

> Note: with a project site, all internal links must be prefixed with the
> repo name (e.g. `href="homepage/publications.html"`), or use relative
> paths carefully. If you plan to use a subpath, edit the `<link>` and
> `<nav>` hrefs accordingly.

## Local preview

```bash
# with Python
python3 -m http.server 8000
# then open http://localhost:8000
```

> The "[Last update: ...]" line on the home page is filled in automatically
> by a small inline script (`document.lastModified`), so it always shows the
> date `index.html` was last saved — no need to edit it by hand. For the date
> to be accurate, view the site over HTTP (e.g. the preview command above or
> GitHub Pages), not by double-clicking the file.

## Customization tips

- **Photo**: add `assets/img/photo.jpg` and an `<img>` in the header of `index.html`.
- **CV**: add `assets/cv.pdf` and a link in the Home "Links" section.
- **New page**: copy an existing page, update the `<title>`, the active
  nav class, and add a nav entry on every page.
- **Syntax/fonts**: everything lives in `assets/css/style.css` (single file,
  responsive, mobile-friendly).
