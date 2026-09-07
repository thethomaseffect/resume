import {
  siTypescript,
  siJavascript,
  siNodedotjs,
  siReact,
  siRedux,
  siSvelte,
  siAngular,
  siNextdotjs,
  siVite,
  siCss3,
  siStyledcomponents,
  siStorybook,
  siJest,
  siCypress,
  siTailwindcss,
  siMui,
  siExpress,
  siAmazonwebservices,
  siAwslambda,
  siAmazoncloudwatch,
  siDocker,
  siKubernetes,
  siTerraform,
  siGrafana,
  siGithubactions,
  siArgo,
  siGit,
  siSentry,
  siPostgresql,
  siMysql,
  siXmpp,
  siMongodb,
  siElasticsearch,
  siApachekafka,
  siPython,
  siOpenjdk,
  siDotnet,
  siCplusplus,
  siRust,
  siPhp,
  siBabel,
  siJsonwebtokens,
  siWordpress,
  siFacebook,
  siProtractor,
  siHtml5,
  siJquery,
  siSelenium,
  siJenkins,
  siGulp,
  siLinux,
  siVercel,
  siAnthropic,
  siGithub,
  siLinkedin,
  siFigma,
  siBitbucket,
} from 'simple-icons';

const ICONS = {
  typescript: siTypescript,
  javascript: siJavascript,
  nodedotjs: siNodedotjs,
  react: siReact,
  redux: siRedux,
  svelte: siSvelte,
  angular: siAngular,
  nextdotjs: siNextdotjs,
  vite: siVite,
  css3: siCss3,
  styledcomponents: siStyledcomponents,
  storybook: siStorybook,
  jest: siJest,
  cypress: siCypress,
  tailwindcss: siTailwindcss,
  mui: siMui,
  express: siExpress,
  amazonaws: siAmazonwebservices,
  awslambda: siAwslambda,
  amazoncloudwatch: siAmazoncloudwatch,
  docker: siDocker,
  kubernetes: siKubernetes,
  terraform: siTerraform,
  grafana: siGrafana,
  githubactions: siGithubactions,
  argo: siArgo,
  git: siGit,
  sentry: siSentry,
  postgresql: siPostgresql,
  mysql: siMysql,
  xmpp: siXmpp,
  mongodb: siMongodb,
  elasticsearch: siElasticsearch,
  apachekafka: siApachekafka,
  python: siPython,
  openjdk: siOpenjdk,
  dotnet: siDotnet,
  cplusplus: siCplusplus,
  rust: siRust,
  php: siPhp,
  babel: siBabel,
  jsonwebtokens: siJsonwebtokens,
  wordpress: siWordpress,
  facebook: siFacebook,
  protractor: siProtractor,
  html5: siHtml5,
  jquery: siJquery,
  selenium: siSelenium,
  jenkins: siJenkins,
  gulp: siGulp,
  linux: siLinux,
  vercel: siVercel,
  anthropic: siAnthropic,
  github: siGithub,
  linkedin: siLinkedin,
  figma: siFigma,
  bitbucket: siBitbucket,
};

const CURSOR_PATH =
  'M4.2 2.8 19.6 12.1c.7.4.4 1.4-.4 1.4h-6.3c-.3 0-.5.1-.7.3l-4.6 5.8c-.6.7-1.8.3-1.8-.6V3.6c0-.8.9-1.2 1.4-.8z';

function IconPlate({ size, children }) {
  return (
    <span className="skill-icon-plate" style={{ width: size + 4, height: size + 4 }} aria-hidden="true">
      {children}
    </span>
  );
}

export function SkillIcon({ slug, label, size = 16 }) {
  if (slug === 'cursor') {
    return (
      <IconPlate size={size}>
        <svg className="skill-icon" width={size} height={size} viewBox="0 0 24 24" role="img">
          <title>Cursor</title>
          <path d={CURSOR_PATH} fill="#000" />
        </svg>
      </IconPlate>
    );
  }

  const icon = slug ? ICONS[slug] : null;
  if (!icon) {
    return (
      <span className="skill-fallback" aria-hidden="true">
        {(label || '?').slice(0, 1)}
      </span>
    );
  }

  const fill = icon.hex.toLowerCase() === '000000' ? '#111' : `#${icon.hex}`;

  return (
    <IconPlate size={size}>
      <svg
        className="skill-icon"
        role="img"
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 24 24"
      >
        <title>{icon.title}</title>
        <path d={icon.path} fill={fill} />
      </svg>
    </IconPlate>
  );
}
