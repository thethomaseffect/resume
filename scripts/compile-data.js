const fs = require('fs');
const path = require('path');
const { parseProse, applyProse } = require('./lib/prose');

const ROOT = path.join(__dirname, '..');
const SOURCE_STRUCT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'source.json'), 'utf8'));
const PROSE = parseProse(fs.readFileSync(path.join(ROOT, 'data', 'prose.md'), 'utf8'));
const SOURCE = applyProse(SOURCE_STRUCT, PROSE);
const UI = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ui.json'), 'utf8'));
const OUT_DIR = path.join(ROOT, 'public', 'data');

function parseYearMonth(value) {
  if (!value) return null;
  const [year, month] = value.split('-').map(Number);
  return { year, month };
}

function monthsBetween(start, endInclusive) {
  const from = parseYearMonth(start);
  const to = parseYearMonth(endInclusive);
  if (!from || !to) return 0;
  return Math.max(0, (to.year - from.year) * 12 + (to.month - from.month));
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

function mergeRanges(ranges) {
  const sorted = ranges
    .filter((range) => range.start && range.end)
    .map((range) => ({
      start: range.start,
      end: range.end,
      startIndex: yearMonthIndex(range.start),
      endIndex: yearMonthIndex(range.end),
    }))
    .sort((a, b) => a.startIndex - b.startIndex);

  const merged = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (!last || range.startIndex > last.endIndex) {
      merged.push({ ...range });
    } else {
      last.endIndex = Math.max(last.endIndex, range.endIndex);
      last.end = indexToYearMonth(last.endIndex);
    }
  }
  return merged.reduce((total, range) => total + monthsBetween(range.start, range.end), 0);
}

function yearMonthIndex(value) {
  const parsed = parseYearMonth(value);
  return parsed.year * 12 + (parsed.month - 1);
}

function indexToYearMonth(index) {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function collectRoles(experience) {
  const roles = [];
  for (const company of experience) {
    for (const role of company.roles) {
      roles.push({ company, role });
    }
  }
  return roles;
}

function compile(asOf) {
  const asOfMonth = asOf.slice(0, 7);

  const experience = SOURCE.experience.map((company) => {
    const roles = company.roles.map((role) => {
      const end = role.end || asOfMonth;
      const months = monthsBetween(role.start, end);
      return {
        ...role,
        end: role.end,
        current: !role.end,
        durationMonths: months,
        duration: {
          en: formatDuration(months, 'en'),
          sv: formatDuration(months, 'sv'),
        },
      };
    });

    const companyStart = roles.reduce((min, role) => (role.start < min ? role.start : min), roles[0].start);
    const openEnded = roles.some((role) => !role.end);
    const companyEnd = openEnded
      ? null
      : roles.reduce((max, role) => (role.end > max ? role.end : max), roles[0].end);
    const companyMonths = roles.reduce((sum, role) => sum + role.durationMonths, 0);

    return {
      ...company,
      start: companyStart,
      end: companyEnd,
      current: openEnded,
      durationMonths: companyMonths,
      duration: {
        en: formatDuration(companyMonths, 'en'),
        sv: formatDuration(companyMonths, 'sv'),
      },
      roles,
      skills: [...new Set(roles.flatMap((role) => role.skills || []))],
    };
  });

  const skillRanges = {};
  for (const { company, role } of collectRoles(SOURCE.experience)) {
    if (company.kind === 'career-break') continue;
    const end = role.end || asOfMonth;
    for (const skillId of role.skills || []) {
      if (!skillRanges[skillId]) skillRanges[skillId] = [];
      skillRanges[skillId].push({ start: role.start, end });
    }
  }

  const maxMonths = Math.max(1, ...Object.values(skillRanges).map((ranges) => mergeRanges(ranges)));
  const skills = Object.keys(skillRanges)
    .map((id) => {
      const months = mergeRanges(skillRanges[id]);
      const years = Math.round((months / 12) * 10) / 10;
      const ratio = months / maxMonths;
      const meta = SOURCE.skillCatalog[id] || { label: { en: id, sv: id }, icon: null };
      return {
        id,
        label: meta.label,
        icon: meta.icon,
        category: meta.category || 'other',
        months,
        years,
        ratio,
        duration: {
          en: formatDuration(months, 'en'),
          sv: formatDuration(months, 'sv'),
        },
      };
    })
    .sort((a, b) => b.months - a.months || a.id.localeCompare(b.id));

  const locations = SOURCE.locations.map((place) => {
    if (!place.start) {
      return { ...place, durationMonths: null, duration: null };
    }
    const end = place.end || asOfMonth;
    const months = monthsBetween(place.start, end);
    return {
      ...place,
      current: !place.end,
      durationMonths: months,
      duration: {
        en: formatDuration(months, 'en'),
        sv: formatDuration(months, 'sv'),
      },
    };
  });

  const projects = SOURCE.projects.map((project) => ({
    ...project,
    skills: project.skills || [],
  }));

  return {
    generatedAt: asOf,
    person: SOURCE.person,
    workRights: SOURCE.workRights,
    languages: SOURCE.languages,
    locations,
    experience,
    education: SOURCE.education,
    skills,
    skillCatalog: SOURCE.skillCatalog,
    projects,
    educationProjects: SOURCE.educationProjects,
    showcase: SOURCE.showcase,
    ui: UI,
  };
}

const asOf = new Date().toISOString();
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'profile.json'), `${JSON.stringify(compile(asOf), null, 2)}\n`);
console.log('Wrote public/data/profile.json');
