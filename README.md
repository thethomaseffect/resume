# Personal resume site

React + Vite + TypeScript static site for Thomas Geraghty’s CV, experience, and side projects.

## What this repo is

A high-quality public profile aimed at both consultancy and permanent hiring. Document copy lives in `data/prose.md`; ids, dates, skills, and other structure live in `data/source.json`. Compile merges them into `public/data/profile.json` on every build. GitHub Actions deploys the site to GitHub Pages on push to `main`.

## Local development

Requires Node.js 20+ and npm.

```bash
npm install
npm run dev
```

The app is served at `http://127.0.0.1:5173/`. GitHub Pages still lives at `/resume/`.

```bash
npm run build      # compiles JSON and CV PDFs, then writes dist/ (and dist/404.html for SPA fallback)
npm run preview    # preview the production build
```

Optional asset helpers (need the original files on this machine):

```bash
npm run process-portrait   # crop the source photo into public/images/
npm run fetch-logos        # download company logos into public/images/logos/
```

## Content

Edit `data/prose.md` for summaries and other written copy, `data/source.json` for roles, dates, skills, and the skill catalogue, and `data/ui.json` for English/Swedish chrome. Then rebuild.

Durations and professional skill-years are calculated at compile time from role start/end dates. `null` end date means current. Clicking a skill on the site filters jobs that used it.

When adding a role, always record technologies actually used (including cloud, CI/CD, and containerisation as skill tags) and a company logo filename under `public/images/logos/`.

Check current and historical job ads at that company for similar titles and ask before tagging anything that is not in the existing CV notes.

## Layout

- Irish citizenship and EU/UK work rights
- Languages: English native; Swedish basic (insufficient for day-to-day work)
- GitHub project links are public repos only
- Lived and worked path: Dublin → Galway → Belfast → Manchester → London → Stockholm
- Education lists GMIT and ATU (current title) beside it
- Degree GitHub projects are embedded
- Mailto subject is `Enquiry about potential future employment`
- `tel:` link on the phone number
- Light/dark theme (blue)
- Swedish via `?lang=sv`, with an auto-translation warning
- Download resume PDF and download current cover letter PDF sit at the top right of the name section. Filenames include the compile month and year (`CV_Thomas_Geraghty_2026_September.pdf`). Extras still changes which CV is linked.

## License

[MIT](LICENSE).
