function documentStamp(date = new Date()) {
  const year = date.getFullYear();
  const monthEn = date.toLocaleString('en-GB', { month: 'long' });
  const monthSv = date.toLocaleString('sv-SE', { month: 'long' });
  const stamp = `${year}_${monthEn}`;
  return {
    stamp,
    date: {
      en: `${monthEn} ${year}`,
      sv: `${monthSv} ${year}`,
    },
    files: {
      resume: {
        en: `CV_Thomas_Geraghty_${stamp}.pdf`,
        sv: `CV_Thomas_Geraghty_${stamp}_SV.pdf`,
        enExtras: `CV_Thomas_Geraghty_${stamp}_Extras.pdf`,
        svExtras: `CV_Thomas_Geraghty_${stamp}_SV_Extras.pdf`,
      },
      coverLetter: {
        en: `Cover_Letter_Thomas_Geraghty_${stamp}.pdf`,
        sv: `Cover_Letter_Thomas_Geraghty_${stamp}_SV.pdf`,
      },
    },
  };
}

module.exports = { documentStamp };
