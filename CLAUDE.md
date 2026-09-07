# Personal resume of Thomas Geraghty

React + Vite static site, deployed like `for-sale`: push to `main` builds with GitHub Actions and publishes to GitHub Pages at the site root (`/`).

## Content rules

Human-written document copy lives in `data/prose.md`. Structural data (ids, dates, URLs, logos, skill tags, company names, titles, skill catalogue) stays in `data/source.json`. UI chrome (EN/SV) is in `data/ui.json`. `scripts/compile-data.js` merges the markdown into the JSON, then writes `public/data/profile.json` with:

- role and company durations
- professional skill-years (union of overlapping role date ranges, not double-counted)
- skill order: most years first

Do not invent technologies. When adding a role, check current and historical job ads at that company for similar titles, then ask which of those tools were actually used. Cloud, CI/CD, and containerisation go on the role as skill tags, not as a separate line.

Never rewrite job descriptions. Copy English verbatim from Obsidian `Digital Brain/CV.md`. Translate Swedish from that English. Do not list self-employed. Career breaks go in experience: novel writing between Regent and Ronja; secret startup POC between Pando and Regent.

## Site behaviour that must stay

- Clicking a skill filters jobs that used it
- Irish citizen; can work in the EU and UK without restriction
- Languages: English native; Swedish basic (insufficient for day-to-day work)
- GitHub project URLs must be public; omit `url` when a repo is private
- Section title “Where I have lived and worked”; path is Dublin → Galway → Belfast → Manchester → London → Stockholm. Dublin is the post-college Microsoft year (Jun 2013–Jun 2014). Galway is work only (Insight, Jun–Nov 2014), not university. Stockholm is from March 2022.
- Education is explicit for ATS: BSc (Hons) Software Development, GMIT, with ATU as “(current title)” beside it — no Irish-language name and no rename explanation; ordinary years 2009–2012, honours year 2012–2013; GPA 78 (1:1). Embed the degree GitHub projects
- Mailto subject: `Enquiry about potential future employment`
- Phone uses `tel:`
- Tech icons from Simple Icons; company logos in `public/images/logos/` (Insight Centre logo for the research assistant role)
- Blue theme, light and dark
- Swedish via `?lang=sv` with an auto-translation warning
- Side projects pull their own tech lists from JSON (GitHub URLs on each project)
- Showcase section is for small demo apps; keep planned placeholders until they exist
- A CV PDF is generated on every compile and linked from Download PDF

## Assets

Portrait source: `D:\MEGA\Camera Uploads\ACTUAL PHOTOS AND SELFIES\2024-11-09 21.02.21.jpg`  
`npm run process-portrait` crops it to the head.

CV sources used for the first fill: Obsidian `Digital Brain/CV.md`, the August 2026 PDF/cover letter, LinkedIn, and GitHub (`thethomaseffect`).
