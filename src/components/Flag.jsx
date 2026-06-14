// Real circular flag chip — replaces the old emoji flags. Loads from flagcdn
// by FIFA 3-letter code (TLA → ISO), with a chalk ring so it reads on pitch or
// paper. Falls back to a neutral disc when a code is unknown.
const TLA_TO_ISO = {
  ALG: 'dz', ARG: 'ar', AUS: 'au', AUT: 'at', BEL: 'be', BIH: 'ba', BRA: 'br',
  CAN: 'ca', CIV: 'ci', COD: 'cd', COL: 'co', CPV: 'cv', CRO: 'hr', CUW: 'cw',
  CZE: 'cz', ECU: 'ec', EGY: 'eg', ENG: 'gb-eng', ESP: 'es', FRA: 'fr', GER: 'de',
  GHA: 'gh', HAI: 'ht', IRN: 'ir', IRQ: 'iq', JOR: 'jo', JPN: 'jp', KOR: 'kr',
  KSA: 'sa', MAR: 'ma', MEX: 'mx', NED: 'nl', NOR: 'no', NZL: 'nz', PAN: 'pa',
  PAR: 'py', POR: 'pt', QAT: 'qa', RSA: 'za', SCO: 'gb-sct', SEN: 'sn', SUI: 'ch',
  SWE: 'se', TUN: 'tn', TUR: 'tr', URY: 'uy', USA: 'us', UZB: 'uz', WAL: 'gb-wls',
}

export function isoFor(tla) {
  return TLA_TO_ISO[(tla || '').toUpperCase()] || null
}

export default function Flag({ tla, size = 26 }) {
  const iso = isoFor(tla)
  const style = {
    width: size,
    height: size,
    backgroundImage: iso ? `url(https://flagcdn.com/w160/${iso}.png)` : 'none',
  }
  return <span className="flag" role="img" aria-label={tla || 'flag'} style={style} />
}
