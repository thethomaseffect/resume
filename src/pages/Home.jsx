import { useState } from 'react';
import { useProfile } from '../App';
import { pick, mailtoHref, telHref, formatRange, formatLivedMeta } from '../lib/format';
import { skillBarColor } from '../lib/colors';
import { SkillIcon } from '../lib/SkillIcon';
import './Home.css';

function asset(path) {
  if (!path) return null;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

function shortUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

function EnvelopeIcon({ size = 16 }) {
  return (
    <svg className="contact-envelope" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.75" y="5.75" width="18.5" height="12.5" rx="1.4" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.6 7.1 12 13.1 20.4 7.1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ContactChip({ href, emoji, icon, value, copyValue }) {
  const [copied, setCopied] = useState(false);
  const copy = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await navigator.clipboard.writeText(copyValue || value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <span className="contact-chip-wrap">
      <a className="contact-chip" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        <span className="contact-media" aria-hidden="true">
          {icon || emoji}
        </span>
        <span className="contact-value">{value}</span>
      </a>
      <button type="button" className="copy-btn" onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </span>
  );
}

const SKILL_PREVIEW = 10;

function PalmTreeMark() {
  return (
    <span className="career-break-mark" aria-hidden="true">
      <svg viewBox="0 0 72 40" width="72" height="40">
        <rect width="72" height="40" rx="10" fill="#f4efe4" />
        <circle cx="55" cy="13" r="6.5" fill="#f2c14e" />
        <ellipse cx="36" cy="33" rx="13" ry="2.6" fill="#e6c48a" />
        <path d="M36 32.2c.3-4.8.5-9.6.5-14.4" fill="none" stroke="#8a5a2b" strokeWidth="2.3" strokeLinecap="round" />
        <path d="M36.4 18.2c-7-1.4-12.2-5.6-14.2-10.2 6.2 1.6 11.2 5.2 14.2 10.2z" fill="#2f8f56" />
        <path d="M36.4 18.2c-1.6-6.4.6-11.6 4.2-14.4-.2 5.4-1.4 9.8-4.2 14.4z" fill="#247a47" />
        <path d="M36.4 18.2c7.2-1 12.4-4.8 14.8-9.2-5.6.8-10.8 4-14.8 9.2z" fill="#36a05f" />
        <path d="M36.4 19c5.8 2.4 9 6.4 10 10.4-4.6-1.8-8.2-5.2-10-10.4z" fill="#2f8f56" />
        <path d="M36.4 19c-6 2.2-9.4 6-10.6 10 4.4-1.6 8-5.2 10.6-10z" fill="#247a47" />
      </svg>
    </span>
  );
}

function CompanyLogo({ company, language }) {
  const name = pick(company.company, language);
  if (company.kind === 'career-break') {
    return <PalmTreeMark />;
  }
  if (!company.logo) {
    return <span className="logo-fallback">{name.slice(0, 1)}</span>;
  }
  return (
    <img
      className="company-logo"
      src={asset(company.logo)}
      alt=""
      width="72"
      height="40"
    />
  );
}

export default function Home() {
  const { profile, language, ui, skillFilter, setSkillFilter, includeExtras } = useProfile();
  const person = profile.person;
  const selectedSkill = profile.skills.find((skill) => skill.id === skillFilter);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const selectedSkillIndex = profile.skills.findIndex((skill) => skill.id === skillFilter);
  const skillsForcedOpen = selectedSkillIndex >= SKILL_PREVIEW;
  const skillsExpanded = skillsOpen || skillsForcedOpen;
  const visibleSkills = skillsExpanded ? profile.skills : profile.skills.slice(0, SKILL_PREVIEW);

  const visibleExperience = profile.experience.filter((company) => {
    if (!skillFilter) return true;
    return company.skills.includes(skillFilter);
  });

  return (
    <div className="home">
      <section className="hero card">
        <img
          className="portrait"
          src={asset(person.photo)}
          alt={person.name}
          width="280"
          height="340"
        />
        <div className="hero-copy">
          <p className="eyebrow">{pick(person.location, language)}</p>
          <h1>{person.name}</h1>
          <p className="headline">{pick(person.headline, language)}</p>
          <p className="summary">{pick(person.summary, language)}</p>
          {person.ai ? <p className="summary">{pick(person.ai, language)}</p> : null}
          <p className="availability">{pick(person.availability, language)}</p>
          <div className="contact-row">
            <ContactChip
              href={mailtoHref(person.email, person.emailSubject)}
              icon={<EnvelopeIcon />}
              value={person.email}
            />
            <ContactChip
              href={telHref(person.phone)}
              emoji="📞"
              value={person.phoneDisplay}
              copyValue={person.phone}
            />
            <ContactChip
              href={person.github}
              icon={
                <span className="contact-github">
                  <SkillIcon slug="github" label="GitHub" size={16} />
                </span>
              }
              value={shortUrl(person.github)}
              copyValue={person.github}
            />
            <ContactChip
              href={person.linkedin}
              icon={<SkillIcon slug="linkedin" label="LinkedIn" size={16} />}
              value={shortUrl(person.linkedin)}
              copyValue={person.linkedin}
            />
          </div>
        </div>
      </section>

      <section className="split">
        <article className="card">
          <h2>{ui.workRightsTitle}</h2>
          <p className="citizenship">{pick(profile.workRights.citizenship, language)}</p>
          <ul className="plain-list">
            {profile.workRights.rights.map((item) => (
              <li key={item.id}>{pick(item.label, language)}</li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h2>{ui.languagesTitle}</h2>
          <ul className="plain-list">
            {profile.languages.map((item) => (
              <li key={item.id}>
                <strong>{pick(item.name, language)}</strong>
                {' — '}
                {pick(item.level, language)}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card">
        <h2>{ui.livedTitle}</h2>
        <ol className="location-path">
          {profile.locations.map((place, index) => {
            const meta = formatLivedMeta(place, language, ui);
            return (
            <li key={place.id}>
              {index > 0 ? <span className="path-arrow" aria-hidden="true">→</span> : null}
              <span className="place">
                <strong>{pick(place.city, language)}</strong>
                {meta ? <span className="place-meta">{meta}</span> : null}
              </span>
            </li>
            );
          })}
        </ol>
      </section>

      <section className="card" id="skills">
        <h2>{ui.skillsTitle}</h2>
        <p className="section-intro">{ui.skillsIntro}</p>
        {selectedSkill ? (
          <div className="filter-bar">
            <span>
              {ui.filteredBy} <strong>{pick(selectedSkill.label, language)}</strong>
            </span>
            <button type="button" onClick={() => setSkillFilter('')}>
              {ui.clearFilter}
            </button>
          </div>
        ) : null}
        <div className={`skill-list-wrap ${skillsExpanded ? 'open' : ''}`}>
          <ul className="skill-list">
            {visibleSkills.map((skill) => (
              <li key={skill.id}>
                <button
                  type="button"
                  className={`skill-row ${skillFilter === skill.id ? 'active' : ''}`}
                  onClick={() => setSkillFilter(skill.id)}
                  aria-pressed={skillFilter === skill.id}
                >
                  <SkillIcon slug={skill.icon} label={pick(skill.label, language)} />
                  <span className="skill-name">{pick(skill.label, language)}</span>
                  <span className="skill-years">{pick(skill.duration, language)}</span>
                  <span className="skill-bar" aria-hidden="true">
                    <span
                      className="skill-bar-fill"
                      style={{
                        width: `${Math.max(8, skill.ratio * 100)}%`,
                        background: skillBarColor(skill.ratio),
                      }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {profile.skills.length > SKILL_PREVIEW && (skillsOpen || !skillsForcedOpen) ? (
            <button
              type="button"
              className="skill-more"
              onClick={() => setSkillsOpen((value) => !value)}
            >
              {skillsExpanded ? ui.fewerSkills : ui.moreSkills}
            </button>
          ) : null}
        </div>
      </section>

      <section className="card" id="experience">
        <h2>{ui.experienceTitle}</h2>
        <div className="experience-list">
          {visibleExperience.map((company) => (
            <article className="job" key={company.id}>
              <div className="job-header">
                <CompanyLogo company={company} language={language} />
                <div>
                  <h3>
                    {company.url ? (
                      <a href={company.url} target="_blank" rel="noreferrer">
                        {pick(company.company, language)}
                      </a>
                    ) : (
                      pick(company.company, language)
                    )}
                  </h3>
                  <p className="job-meta">{pick(company.location, language)}</p>
                </div>
              </div>
              {company.roles.map((role) => (
                <div className="role" key={role.id}>
                  <h4>{pick(role.title, language)}</h4>
                  <p className="role-dates">
                    {formatRange(role.start, role.end, ui.present, language)} · {pick(role.duration, language)}
                  </p>
                  <p className="role-summary">{pick(role.summary, language)}</p>
                  {role.highlights?.length ? (
                    <ul>
                      {role.highlights.map((item, index) => (
                        <li key={index}>{pick(item, language)}</li>
                      ))}
                    </ul>
                  ) : null}
                  {(role.skills || []).length ? (
                    <div className="tag-row">
                      {role.skills.map((skillId) => {
                        const skill = profile.skillCatalog[skillId];
                        return (
                          <button
                            type="button"
                            className={`tag ${skillFilter === skillId ? 'active' : ''}`}
                            key={skillId}
                            onClick={() => setSkillFilter(skillId)}
                          >
                            <SkillIcon slug={skill?.icon} label={pick(skill?.label, language)} size={14} />
                            {pick(skill?.label, language) || skillId}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="card" id="education">
        <h2>{ui.educationTitle}</h2>
        <article className="education">
          <div className="job-header">
            {profile.education.logo ? (
              <img className="company-logo" src={asset(profile.education.logo)} alt="" width="40" height="40" />
            ) : null}
            <div>
              <h3>{pick(profile.education.award, language)}</h3>
              <p className="job-meta">
                {pick(profile.education.institutionAtAward, language)}
                {' · '}
                {pick(profile.education.institutionCurrent, language)} ({ui.currentTitle})
                {' · '}
                {pick(profile.education.campus, language)}
              </p>
            </div>
          </div>
          <p>{pick(profile.education.structure, language)}</p>
          <p>
            {formatRange(profile.education.start, profile.education.end, ui.present, language)} · {pick(profile.education.result, language)}
          </p>
        </article>
        <h3 className="subhead">{ui.educationProjectsTitle}</h3>
        <div className="project-grid">
          {profile.educationProjects.map((project) => {
            const inner = (
              <>
                <h4>{project.name}</h4>
                <p className="job-meta">
                  {project.language} · {ui.grade} {project.grade}
                </p>
                <p>{pick(project.description, language)}</p>
              </>
            );
            return project.url ? (
              <a className="project-card" key={project.id} href={project.url} target="_blank" rel="noreferrer">
                {inner}
              </a>
            ) : (
              <article className="project-card static" key={project.id}>
                {inner}
              </article>
            );
          })}
        </div>
      </section>

      {includeExtras ? (
        <>
          <section className="card" id="projects">
            <h2>{ui.projectsTitle}</h2>
            <div className="project-grid">
              {profile.projects.map((project) => (
                <article className="project-card static" key={project.id}>
                  <h3>
                    {project.url ? (
                      <a href={project.url} target="_blank" rel="noreferrer">
                        {project.name}
                      </a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  <p>{pick(project.description, language)}</p>
                  <div className="tag-row">
                    {(project.skills || []).map((skillId) => {
                      const skill = profile.skillCatalog[skillId];
                      return (
                        <span className="tag inert" key={skillId}>
                          <SkillIcon slug={skill?.icon} label={pick(skill?.label, language)} size={14} />
                          {pick(skill?.label, language) || skillId}
                        </span>
                      );
                    })}
                  </div>
                  {project.url || project.live ? (
                    <div className="project-links">
                      {project.url ? (
                        <a href={project.url} target="_blank" rel="noreferrer">
                          {ui.openRepo}
                        </a>
                      ) : null}
                      {project.live ? (
                        <a href={project.live} target="_blank" rel="noreferrer">
                          {ui.openLive}
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="card" id="showcase">
            <h2>{ui.showcaseTitle}</h2>
            <p className="section-intro">{ui.showcaseIntro}</p>
            <div className="project-grid">
              {profile.showcase.map((item) => (
                <article className="project-card static" key={item.id}>
                  <h3>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer">
                        {pick(item.name, language)}
                      </a>
                    ) : (
                      pick(item.name, language)
                    )}
                  </h3>
                  {item.status === 'planned' ? <p className="planned">{ui.planned}</p> : null}
                  <p>{pick(item.description, language)}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
