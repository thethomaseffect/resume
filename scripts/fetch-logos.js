const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'logos');

const COMPANIES = [
  {
    id: 'sambla',
    urls: [
      'https://www.google.com/s2/favicons?domain=samblagroup.com&sz=128',
      'https://www.google.com/s2/favicons?domain=sambla.se&sz=128',
    ],
  },
  {
    id: 'lolo',
    urls: ['https://www.google.com/s2/favicons?domain=lolo.co&sz=128'],
  },
  {
    id: 'ronja',
    urls: [
      'https://icons.duckduckgo.com/ip3/ronja.tech.ico',
      'https://www.google.com/s2/favicons?domain=ronja.tech&sz=128',
    ],
  },
  {
    id: 'regent',
    urls: ['https://www.google.com/s2/favicons?domain=regent.se&sz=128'],
  },
  {
    id: 'pando',
    urls: ['https://www.google.com/s2/favicons?domain=hellopando.com&sz=128'],
  },
  {
    id: 'apolitical',
    urls: ['https://www.google.com/s2/favicons?domain=apolitical.co&sz=128'],
  },
  {
    id: 'spirable',
    urls: ['https://www.google.com/s2/favicons?domain=spirable.com&sz=128'],
  },
  {
    id: 'thg',
    urls: ['https://www.google.com/s2/favicons?domain=thg.com&sz=128'],
  },
  {
    id: 'bbc',
    urls: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/BBC_Logo_2021.svg?width=640',
    ],
  },
  {
    id: 'neueda',
    urls: ['https://www.google.com/s2/favicons?domain=neueda.com&sz=128'],
  },
  {
    id: 'insight',
    urls: [
      'https://www.google.com/s2/favicons?domain=insight-centre.org&sz=128',
      'https://www.google.com/s2/favicons?domain=universityofgalway.ie&sz=128',
    ],
  },
  {
    id: 'microsoft',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/256px-Microsoft_logo.svg.png',
      'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
    ],
  },
  {
    id: 'atu',
    urls: [
      'https://www.google.com/s2/favicons?domain=atu.ie&sz=128',
      'https://www.google.com/s2/favicons?domain=gmit.ie&sz=128',
    ],
  },
];

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'resume-logo-fetch/1.0',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).toString();
          res.resume();
          fetchBuffer(next).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`${url} -> ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }
    );
    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy(new Error(`timeout ${url}`));
    });
  });
}

async function saveLogo(company) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const dest = path.join(OUT_DIR, `${company.id}.png`);
  for (const url of company.urls) {
    try {
      const buffer = await fetchBuffer(url);
      await sharp(buffer)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .resize(company.id === 'bbc' ? 256 : 128, 128, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toFile(dest);
      console.log('ok', company.id, url);
      return;
    } catch (err) {
      console.warn('fail', company.id, url, err.message);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <rect width="128" height="128" rx="24" fill="#4a7391"/>
    <text x="64" y="80" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="#fff">${company.id[0].toUpperCase()}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(dest);
  console.log('fallback', company.id);
}

async function run() {
  for (const company of COMPANIES) {
    await saveLogo(company);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
