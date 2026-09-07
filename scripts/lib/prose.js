const HIGHLIGHT_SUFFIX = '.highlights';

function listItems(text) {
  if (!text) return [];
  return text
    .split(/\n(?=- )/)
    .map((item) => item.replace(/^- /, '').trim())
    .filter(Boolean);
}

function bilingual(en, sv) {
  return { en: en || '', sv: sv || '' };
}

function parseProse(markdown) {
  const sections = {};
  const parts = markdown.replace(/^\uFEFF/, '').split(/^# /m).slice(1);
  for (const part of parts) {
    const newline = part.indexOf('\n');
    const id = (newline === -1 ? part : part.slice(0, newline)).trim();
    if (!id) continue;
    const body = newline === -1 ? '' : part.slice(newline + 1);
    const langs = { en: '', sv: '' };
    const blocks = body.split(/^### (en|sv)[ \t]*$/m);
    for (let i = 1; i < blocks.length; i += 2) {
      langs[blocks[i]] = (blocks[i + 1] || '').replace(/^\n+/, '').replace(/\n+$/, '');
    }
    sections[id] = id.endsWith(HIGHLIGHT_SUFFIX)
      ? { en: listItems(langs.en), sv: listItems(langs.sv) }
      : langs;
  }
  return sections;
}

function formatBlock(id, en, sv) {
  return [`# ${id}`, '', '### en', '', en || '', '', '### sv', '', sv || '', ''].join('\n');
}

function formatHighlights(id, highlights) {
  const en = (highlights || []).map((item) => `- ${item.en}`).join('\n\n');
  const sv = (highlights || []).map((item) => `- ${item.sv}`).join('\n\n');
  return formatBlock(id, en, sv);
}

function serializeProse(source) {
  const chunks = [
    '<!--',
    'Human-written copy. Compile reads this file and writes it into public/data/profile.json.',
    'Keep English verbatim. Translate Swedish from that English.',
    'Each section is "# path", then "### en" / "### sv". Role highlights are markdown lists.',
    '-->',
    '',
  ];

  const person = source.person;
  chunks.push(formatBlock('person.headline', person.headline.en, person.headline.sv));
  chunks.push(formatBlock('person.summary', person.summary.en, person.summary.sv));
  chunks.push(formatBlock('person.ai', person.ai.en, person.ai.sv));
  chunks.push(formatBlock('person.availability', person.availability.en, person.availability.sv));
  chunks.push(formatBlock('workRights.citizenship', source.workRights.citizenship.en, source.workRights.citizenship.sv));
  for (const right of source.workRights.rights) {
    chunks.push(formatBlock(`workRights.rights.${right.id}`, right.label.en, right.label.sv));
  }
  for (const language of source.languages) {
    chunks.push(formatBlock(`languages.${language.id}.level`, language.level.en, language.level.sv));
  }

  for (const company of source.experience) {
    for (const role of company.roles) {
      chunks.push(formatBlock(`role.${role.id}.summary`, role.summary.en, role.summary.sv));
      if (role.highlights?.length) {
        chunks.push(formatHighlights(`role.${role.id}.highlights`, role.highlights));
      }
    }
  }

  chunks.push(formatBlock('education.structure', source.education.structure.en, source.education.structure.sv));
  chunks.push(formatBlock('education.result', source.education.result.en, source.education.result.sv));

  for (const project of source.educationProjects) {
    chunks.push(formatBlock(`educationProject.${project.id}.description`, project.description.en, project.description.sv));
  }
  for (const project of source.projects) {
    chunks.push(formatBlock(`project.${project.id}.description`, project.description.en, project.description.sv));
  }
  for (const item of source.showcase) {
    chunks.push(formatBlock(`showcase.${item.id}.description`, item.description.en, item.description.sv));
  }

  return `${chunks.join('\n').replace(/\n{3,}/g, '\n\n')}\n`;
}

function requireSection(sections, id) {
  const section = sections[id];
  if (!section || typeof section.en !== 'string' || typeof section.sv !== 'string') {
    throw new Error(`Missing prose section: ${id}`);
  }
  return bilingual(section.en, section.sv);
}

function applyProse(source, sections) {
  const out = structuredClone(source);
  out.person.headline = requireSection(sections, 'person.headline');
  out.person.summary = requireSection(sections, 'person.summary');
  out.person.ai = requireSection(sections, 'person.ai');
  out.person.availability = requireSection(sections, 'person.availability');
  out.workRights.citizenship = requireSection(sections, 'workRights.citizenship');
  out.workRights.rights = out.workRights.rights.map((right) => ({
    ...right,
    label: requireSection(sections, `workRights.rights.${right.id}`),
  }));
  out.languages = out.languages.map((language) => ({
    ...language,
    level: requireSection(sections, `languages.${language.id}.level`),
  }));

  out.experience = out.experience.map((company) => ({
    ...company,
    roles: company.roles.map((role) => {
      const highlightId = `role.${role.id}.highlights`;
      const highlights = sections[highlightId];
      return {
        ...role,
        summary: requireSection(sections, `role.${role.id}.summary`),
        highlights: highlights
          ? highlights.en.map((en, index) => bilingual(en, highlights.sv[index] || ''))
          : [],
      };
    }),
  }));

  out.education = {
    ...out.education,
    structure: requireSection(sections, 'education.structure'),
    result: requireSection(sections, 'education.result'),
  };
  out.educationProjects = out.educationProjects.map((project) => ({
    ...project,
    description: requireSection(sections, `educationProject.${project.id}.description`),
  }));
  out.projects = out.projects.map((project) => ({
    ...project,
    description: requireSection(sections, `project.${project.id}.description`),
  }));
  out.showcase = out.showcase.map((item) => ({
    ...item,
    description: requireSection(sections, `showcase.${item.id}.description`),
  }));
  return out;
}

function stripProse(source) {
  const out = structuredClone(source);
  delete out.person.headline;
  delete out.person.summary;
  delete out.person.ai;
  delete out.person.availability;
  delete out.workRights.citizenship;
  out.workRights.rights = out.workRights.rights.map(({ label, ...right }) => right);
  out.languages = out.languages.map(({ level, ...language }) => language);
  out.experience = out.experience.map((company) => ({
    ...company,
    roles: company.roles.map(({ summary, highlights, ...role }) => role),
  }));
  delete out.education.structure;
  delete out.education.result;
  out.educationProjects = out.educationProjects.map(({ description, ...project }) => project);
  out.projects = out.projects.map(({ description, ...project }) => project);
  out.showcase = out.showcase.map(({ description, ...item }) => item);
  return out;
}

module.exports = { parseProse, serializeProse, applyProse, stripProse };
