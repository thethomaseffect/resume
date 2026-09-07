const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ROOT = path.join(__dirname, '..');
const PROFILE = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'data', 'profile.json'), 'utf8'));

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MX = 46;
const CONTENT_W = PAGE_W - MX * 2;
const BOTTOM = PAGE_H - 50;
const HEADER_H = 36;
const PAGE_TOP = 54;
const BLUE = '#4a7391';
const BLUE_DEEP = '#355a73';
const INK = '#243039';
const MUTED = '#5d6b76';

const SIZE = {
  name: 28,
  headline: 13,
  contact: 10,
  body: 11,
  section: 13,
  company: 13,
  role: 12,
  meta: 10.5,
  skillLabel: 10,
  skill: 11,
  small: 10,
};

const FONT_DIR = 'C:/Windows/Fonts';
const FONTS = {
  regular: ['calibri.ttf', 'Calibri.ttf', 'segoeui.ttf'],
  bold: ['calibrib.ttf', 'Calibri Bold.ttf', 'segoeuib.ttf'],
  italic: ['calibrii.ttf', 'Calibri Italic.ttf', 'segoeuii.ttf'],
};

function resolveFont(names) {
  for (const name of names) {
    const full = path.join(FONT_DIR, name);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

function pick(value, language) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[language] || value.en || '';
}

function yearMonthOf(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthsBetween(start, endInclusive) {
  const [sy, sm] = start.split('-').map(Number);
  const [ey, em] = endInclusive.split('-').map(Number);
  return Math.max(0, (ey - sy) * 12 + (em - sm));
}

function formatDuration(months, language) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (language === 'sv') {
    if (years && rest) return `${years} år ${rest} mån`;
    if (years) return years === 1 ? '1 år' : `${years} år`;
    if (rest === 1) return '1 mån';
    return `${rest} mån`;
  }
  if (years && rest) return `${years} yr ${rest} mo`;
  if (years) return years === 1 ? '1 year' : `${years} years`;
  if (rest === 1) return '1 month';
  return `${months} months`;
}

function formatMonth(yearMonth, language) {
  const [year, month] = yearMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString(language === 'sv' ? 'sv-SE' : 'en-GB', { month: 'short', year: 'numeric' });
}

function formatRange(start, end, presentLabel, language) {
  return `${formatMonth(start, language)} – ${end ? formatMonth(end, language) : presentLabel}`;
}

function shortUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

function skillGroups(profile, language) {
  const labels = {
    language: language === 'sv' ? 'Språk' : 'Languages',
    frontend: 'Frontend',
    backend: 'Backend',
    cloud: language === 'sv' ? 'Moln & DevOps' : 'Cloud & DevOps',
    data: 'Data',
    tooling: language === 'sv' ? 'Verktyg' : 'Tooling',
    quality: language === 'sv' ? 'Kvalitet' : 'Quality',
    architecture: language === 'sv' ? 'Arkitektur' : 'Architecture',
    platform: language === 'sv' ? 'Plattform' : 'Platform',
  };
  const merge = { runtime: 'backend', devops: 'cloud' };
  const grouped = {};
  for (const skill of profile.skills) {
    const key = merge[skill.category] || skill.category || 'other';
    if (!grouped[key]) grouped[key] = { label: labels[key] || key, names: [] };
    grouped[key].names.push(pick(skill.label, language));
  }
  return ['language', 'frontend', 'backend', 'cloud', 'data', 'tooling', 'quality', 'architecture', 'platform']
    .map((key) => grouped[key])
    .filter(Boolean);
}

function writePdf(language, outPath, { includeExtras = false } = {}) {
  const ui = PROFILE.ui[language] || PROFILE.ui.en;
  const person = PROFILE.person;
  const t = (value) => pick(value, language);
  const regular = resolveFont(FONTS.regular);
  const bold = resolveFont(FONTS.bold);
  const italic = resolveFont(FONTS.italic);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      bufferPages: true,
      margins: { top: 0, left: 0, right: 0, bottom: 0 },
      info: {
        Title: `${person.name} — CV`,
        Author: person.name,
        Subject: t(person.headline),
      },
    });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);
    stream.on('finish', resolve);
    stream.on('error', reject);

    if (regular) doc.registerFont('Body', regular);
    if (bold) doc.registerFont('Body-Bold', bold);
    if (italic) doc.registerFont('Body-Italic', italic);
    const BODY = regular ? 'Body' : 'Helvetica';
    const BOLD = bold ? 'Body-Bold' : 'Helvetica-Bold';
    const ITALIC = italic ? 'Body-Italic' : 'Helvetica-Oblique';

    let y = 0;

    function heightOf(text, size, width = CONTENT_W, font = BODY) {
      if (!text) return 0;
      doc.font(font).fontSize(size);
      return doc.heightOfString(text, { width, lineGap: 2 });
    }

    function paintPageBackground() {
      doc.rect(0, 0, PAGE_W, PAGE_H).fill('#ffffff');
    }

    function runningHeader() {
      paintPageBackground();
      doc.rect(0, 0, PAGE_W, HEADER_H).fill(BLUE);
      doc.font(BODY).fontSize(10).fillColor('#f7fafc');
      doc.text(person.name, MX, 12, { width: CONTENT_W * 0.42, lineBreak: false });
      doc.text(t(person.headline), MX, 12, { width: CONTENT_W, align: 'right' });
      y = PAGE_TOP;
    }

    function addPage() {
      doc.addPage();
      runningHeader();
    }

    function startBlock(height) {
      const room = BOTTOM - y;
      const pageRoom = BOTTOM - PAGE_TOP;
      if (height <= room) return;
      if (height <= pageRoom || room < 90) addPage();
    }

    function forceNewPage() {
      if (y > PAGE_TOP + 2) addPage();
    }

    function sectionTitle(label) {
      startBlock(36);
      y += 8;
      doc.font(BOLD).fontSize(SIZE.section).fillColor(BLUE_DEEP);
      doc.text(label, MX, y, { width: CONTENT_W });
      y += 18;
      doc.save();
      doc.rect(MX, y, 40, 2.5).fill(BLUE);
      doc.restore();
      y += 12;
    }

    function paragraph(text, { size = SIZE.body, font = BODY, color = INK, width = CONTENT_W, x = MX, gap = 7 } = {}) {
      if (!text) return;
      const h = heightOf(text, size, width, font);
      if (y + h + gap > BOTTOM) addPage();
      doc.font(font).fontSize(size).fillColor(color);
      doc.text(text, x, y, { width, lineGap: 2, underline: false });
      y += h + gap;
    }

    function measureRole(role) {
      const summary = t(role.summary);
      const highlights = (role.highlights || []).map((item) => t(item)).filter(Boolean);
      const skillLine = (role.skills || []).map((id) => t(PROFILE.skillCatalog[id]?.label) || id).join('  ·  ');
      let h = 16 + heightOf(summary, SIZE.body) + 7;
      for (const item of highlights) h += heightOf(`–  ${item}`, SIZE.body, CONTENT_W - 10) + 4;
      if (skillLine) h += heightOf(skillLine, SIZE.small) + 14;
      else h += 10;
      return h;
    }

    function measureCompany(company) {
      return 18 + 16 + company.roles.reduce((sum, role) => sum + measureRole(role), 0);
    }

    function drawRole(role) {
      const summary = t(role.summary);
      const highlights = (role.highlights || []).map((item) => t(item)).filter(Boolean);
      const skillLine = (role.skills || []).map((id) => t(PROFILE.skillCatalog[id]?.label) || id).join('  ·  ');
      startBlock(measureRole(role));

      doc.font(BOLD).fontSize(SIZE.role).fillColor(BLUE_DEEP);
      doc.text(t(role.title), MX, y, { width: CONTENT_W - 140 });
      doc.font(BODY).fontSize(SIZE.meta).fillColor(MUTED);
      doc.text(formatRange(role.start, role.end, ui.present, language), MX, y, { width: CONTENT_W, align: 'right' });
      y += 16;
      paragraph(summary, { size: SIZE.body, gap: 7 });
      for (const item of highlights) {
        const bullet = `–  ${item}`;
        const h = heightOf(bullet, SIZE.body, CONTENT_W - 10);
        if (y + h + 4 > BOTTOM) addPage();
        doc.font(BODY).fontSize(SIZE.body).fillColor(INK);
        doc.text(bullet, MX + 10, y, { width: CONTENT_W - 10, lineGap: 2 });
        y += h + 4;
      }
      if (skillLine) paragraph(skillLine, { size: SIZE.small, color: MUTED, gap: 14 });
      else y += 10;
    }

    function drawCompany(company) {
      startBlock(measureCompany(company));
      const logoPath = company.logo ? path.join(ROOT, 'public', company.logo) : null;
      const hasLogo = logoPath && fs.existsSync(logoPath);
      const indent = hasLogo ? 24 : 0;
      if (hasLogo) doc.image(logoPath, MX, y + 2, { fit: [18, 18] });

      doc.font(BOLD).fontSize(SIZE.company).fillColor(INK);
      doc.text(t(company.company), MX + indent, y, { width: CONTENT_W - indent - 130 });
      if (company.roles.length > 1) {
        doc.font(BODY).fontSize(SIZE.meta).fillColor(MUTED);
        doc.text(formatRange(company.start, company.end, ui.present, language), MX, y, {
          width: CONTENT_W,
          align: 'right',
        });
      }
      y += 17;
      doc.font(ITALIC).fontSize(SIZE.meta).fillColor(MUTED);
      doc.text(t(company.location), MX + indent, y, { width: CONTENT_W - indent });
      y += 16;
      for (const role of company.roles) drawRole(role);
    }

    paintPageBackground();
    const heroH = 138;
    doc.rect(0, 0, PAGE_W, heroH).fill(BLUE);

    const photoPath = path.join(ROOT, 'public', person.photoSquare || person.photo);
    const photoR = 38;
    const photoCx = PAGE_W - MX - photoR;
    const photoCy = heroH / 2 + 2;
    const textW = CONTENT_W - photoR * 2 - 16;

    doc.font(BOLD).fontSize(SIZE.name).fillColor('#ffffff');
    doc.text(person.name, MX, 26, { width: textW });
    doc.font(BODY).fontSize(SIZE.headline).fillColor('#d7e4ee');
    doc.text(t(person.headline), MX, 60, { width: textW });
    doc.fontSize(SIZE.contact).fillColor('#e8f0f5');
    doc.text(t(person.location), MX, 80, { width: textW });
    doc.fontSize(SIZE.contact).fillColor('#f7fafc');
    doc.text(
      [person.email, person.phoneDisplay, shortUrl(person.github), shortUrl(person.linkedin)].join('   ·   '),
      MX,
      100,
      { width: textW, lineGap: 1.4 }
    );

    if (fs.existsSync(photoPath)) {
      doc.save();
      doc.circle(photoCx, photoCy, photoR + 2).fill('#ffffff');
      doc.circle(photoCx, photoCy, photoR).clip();
      doc.image(photoPath, photoCx - photoR, photoCy - photoR, {
        width: photoR * 2,
        height: photoR * 2,
        cover: [photoR * 2, photoR * 2],
      });
      doc.restore();
    }

    y = heroH + 18;
    paragraph(t(person.summary), { size: SIZE.body, gap: 9 });
    if (person.ai) {
      paragraph(t(person.ai), { size: SIZE.body, gap: 9 });
    }
    paragraph(
      [
        t(PROFILE.workRights.citizenship),
        language === 'sv' ? 'EU/EES och Storbritannien utan arbetstillstånd' : 'May work in the EU/EEA and UK without restriction',
        PROFILE.languages.map((item) => `${t(item.name)} — ${t(item.level)}`).join('; '),
      ].join('  ·  '),
      { size: SIZE.small, color: MUTED, gap: 4 }
    );

    sectionTitle(ui.livedTitle);
    (function drawLocations() {
      const places = PROFILE.locations;
      const n = places.length;
      const colW = CONTENT_W / n;
      const citySize = 10;
      const metaSize = SIZE.small;
      const columns = places.map((place) => {
        const city = t(place.city);
        const year = place.start ? place.start.slice(0, 4) : '';
        const extra = !place.end && place.start
          ? `${ui.currentCity} · ${formatDuration(monthsBetween(place.start, yearMonthOf()), language)}`
          : '';
        return {
          city,
          year,
          extra,
          cityH: heightOf(city, citySize, colW, BOLD),
          yearH: heightOf(year, metaSize, colW),
          extraH: extra ? heightOf(extra, metaSize, colW) : 0,
        };
      });
      const cityRow = Math.max(...columns.map((col) => col.cityH));
      const yearRow = Math.max(...columns.map((col) => col.yearH));
      const extraRow = Math.max(...columns.map((col) => col.extraH));
      const blockH = 16 + cityRow + yearRow + extraRow + 6;
      startBlock(blockH);

      const centers = columns.map((_, index) => MX + colW * index + colW / 2);
      doc.save();
      doc.strokeColor(BLUE).lineWidth(1.2);
      doc.moveTo(centers[0], y + 4).lineTo(centers[centers.length - 1], y + 4).stroke();
      for (const cx of centers) {
        doc.circle(cx, y + 4, 2.6).fillAndStroke(BLUE, BLUE);
      }
      doc.restore();
      y += 14;

      columns.forEach((col, index) => {
        const x = MX + colW * index;
        doc.font(BOLD).fontSize(citySize).fillColor(INK);
        doc.text(col.city, x, y, { width: colW, align: 'center' });
        doc.font(BODY).fontSize(metaSize).fillColor(MUTED);
        doc.text(col.year, x, y + cityRow + 1, { width: colW, align: 'center' });
        if (col.extra) {
          doc.text(col.extra, x, y + cityRow + yearRow + 2, { width: colW, align: 'center' });
        }
      });
      y += cityRow + yearRow + extraRow + 8;
    })();

    sectionTitle(ui.skillsTitle);
    const labelW = 108;
    for (const group of skillGroups(PROFILE, language)) {
      const names = group.names.join('  ·  ');
      const h = Math.max(14, heightOf(names, SIZE.skill, CONTENT_W - labelW));
      startBlock(h + 6);
      doc.font(BOLD).fontSize(SIZE.skillLabel).fillColor(BLUE);
      doc.text(group.label, MX, y, { width: labelW });
      doc.font(BODY).fontSize(SIZE.skill).fillColor(INK);
      doc.text(names, MX + labelW, y, { width: CONTENT_W - labelW, lineGap: 1.8 });
      y += h + 7;
    }

    forceNewPage();
    sectionTitle(ui.experienceTitle);
    for (const company of PROFILE.experience) drawCompany(company);

    function measureEducation() {
      const institution = `${t(PROFILE.education.institutionAtAward)}  ·  ${t(PROFILE.education.institutionCurrent)} (${ui.currentTitle})`;
      const meta = `${t(PROFILE.education.campus)}  ·  ${formatRange(PROFILE.education.start, PROFILE.education.end, ui.present, language)}  ·  ${t(PROFILE.education.result)}`;
      let h = 38;
      h += heightOf(t(PROFILE.education.award), SIZE.company, CONTENT_W, BOLD) + 4;
      h += heightOf(institution, SIZE.body) + 4;
      h += heightOf(meta, SIZE.meta) + 5;
      h += heightOf(t(PROFILE.education.structure), SIZE.body) + 8;
      h += 38;
      for (const project of PROFILE.educationProjects) {
        h += heightOf(`${project.name}  ·  ${project.language}  ·  ${ui.grade} ${project.grade}`, SIZE.role, CONTENT_W, BOLD) + 3;
        h += heightOf(t(project.description), SIZE.body) + 3;
        if (project.url) h += heightOf(project.url, SIZE.small) + 10;
      }
      return h + 8;
    }

    startBlock(measureEducation());
    sectionTitle(ui.educationTitle);
    paragraph(t(PROFILE.education.award), { size: SIZE.company, font: BOLD, gap: 4 });
    paragraph(
      `${t(PROFILE.education.institutionAtAward)}  ·  ${t(PROFILE.education.institutionCurrent)} (${ui.currentTitle})`,
      { size: SIZE.body, gap: 4 }
    );
    paragraph(
      `${t(PROFILE.education.campus)}  ·  ${formatRange(PROFILE.education.start, PROFILE.education.end, ui.present, language)}  ·  ${t(PROFILE.education.result)}`,
      { size: SIZE.meta, color: MUTED, gap: 5 }
    );
    paragraph(t(PROFILE.education.structure), { size: SIZE.body, gap: 8 });

    sectionTitle(ui.educationProjectsTitle);
    for (const project of PROFILE.educationProjects) {
      paragraph(`${project.name}  ·  ${project.language}  ·  ${ui.grade} ${project.grade}`, {
        size: SIZE.role,
        font: BOLD,
        gap: 3,
      });
      paragraph(t(project.description), { size: SIZE.body, color: MUTED, gap: 3 });
      if (project.url) paragraph(project.url, { size: SIZE.small, color: BLUE, gap: 10 });
    }

    if (includeExtras) {
      sectionTitle(ui.projectsTitle);
      for (const project of PROFILE.projects) {
        const block = heightOf(project.name, SIZE.role, CONTENT_W, BOLD) + heightOf(t(project.description), SIZE.body) + 24;
        startBlock(block);
        paragraph(project.name, { size: SIZE.role, font: BOLD, gap: 3 });
        paragraph(t(project.description), { size: SIZE.body, color: MUTED, gap: 3 });
        if (project.url) paragraph(project.url, { size: SIZE.small, color: BLUE, gap: 10 });
      }

      const liveShowcase = PROFILE.showcase.filter((item) => item.status !== 'planned');
      if (liveShowcase.length) {
        sectionTitle(ui.showcaseTitle);
        for (const item of liveShowcase) {
          startBlock(heightOf(t(item.name), SIZE.role, CONTENT_W, BOLD) + heightOf(t(item.description), SIZE.body) + 16);
          paragraph(t(item.name), { size: SIZE.role, font: BOLD, gap: 3 });
          paragraph(t(item.description), { size: SIZE.body, color: MUTED, gap: 10 });
        }
      }
    }

    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i += 1) {
      doc.switchToPage(range.start + i);
      doc.font(BODY).fontSize(9).fillColor(MUTED);
      doc.text(`${i + 1} / ${range.count}`, MX, PAGE_H - 32, { width: CONTENT_W, align: 'center' });
    }

    doc.end();
  });
}

async function run() {
  const files = [
    ['en', 'thomas-geraghty.pdf', false],
    ['sv', 'thomas-geraghty-sv.pdf', false],
    ['en', 'thomas-geraghty-extras.pdf', true],
    ['sv', 'thomas-geraghty-sv-extras.pdf', true],
  ];
  for (const [language, filename, includeExtras] of files) {
    await writePdf(language, path.join(ROOT, 'public', filename), { includeExtras });
    console.log('Wrote public/' + filename);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
