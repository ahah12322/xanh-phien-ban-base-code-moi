import axios from "axios";

const CACHE_KEY = "translation_cache";

const countryToLanguage: Record<string, string> = {
  // Middle East & Arabic
  AE: "ar",
  SA: "ar",
  QA: "ar",
  KW: "ar",
  BH: "ar",
  OM: "ar",
  JO: "ar",
  IQ: "ar",
  EG: "ar",
  MA: "ar",
  DZ: "ar",
  TN: "ar",
  LB: "ar",
  SY: "ar",
  YE: "ar",
  LY: "ar",
  SD: "ar",
  MR: "ar",
  SO: "ar",
  PS: "ar",

  // Europe
  AD: "ca",
  AL: "sq",
  AT: "de",
  BA: "bs",
  BE: "nl",
  BG: "bg",
  BY: "be",
  CH: "de",
  CY: "el",
  CZ: "cs",
  DE: "de",
  DK: "da",
  EE: "et",
  ES: "es",
  FI: "fi",
  FR: "fr",
  GB: "en",
  GR: "el",
  HR: "hr",
  HU: "hu",
  IE: "ga",
  IS: "is",
  IT: "it",
  LI: "de",
  LT: "lt",
  LU: "lb",
  LV: "lv",
  MC: "fr",
  MD: "ro",
  ME: "sr",
  MK: "mk",
  MT: "mt",
  NL: "nl",
  NO: "no",
  PL: "pl",
  PT: "pt",
  RO: "ro",
  RS: "sr",
  RU: "ru",
  SE: "sv",
  SI: "sl",
  SK: "sk",
  SM: "it",
  UA: "uk",
  VA: "it",
  XK: "sq",

  // Asia
  AF: "ps",
  AM: "hy",
  AZ: "az",
  BD: "bn",
  BT: "dz",
  CN: "zh-CN",
  GE: "ka",
  HK: "zh-TW",
  ID: "id",
  IL: "he",
  IN: "hi",
  JP: "ja",
  KH: "km",
  KR: "ko",
  KZ: "kk",
  LA: "lo",
  LK: "si",
  MM: "my",
  MN: "mn",
  MO: "zh-TW",
  MV: "dv",
  MY: "ms",
  NP: "ne",
  PH: "fil",
  PK: "ur",
  SG: "en",
  TH: "th",
  TJ: "tg",
  TL: "pt",
  TM: "tk",
  TR: "tr",
  TW: "zh-TW",
  UZ: "uz",
  VN: "vi",

  // Americas
  AR: "es",
  BO: "es",
  BR: "pt",
  CA: "en",
  CL: "es",
  CO: "es",
  CR: "es",
  CU: "es",
  DO: "es",
  EC: "es",
  GT: "es",
  GY: "en",
  HN: "es",
  HT: "ht",
  JM: "en",
  MX: "es",
  NI: "es",
  PA: "es",
  PE: "es",
  PR: "es",
  PY: "es",
  SV: "es",
  TT: "en",
  US: "en",
  UY: "es",
  VE: "es",

  // Africa
  AO: "pt",
  BJ: "fr",
  BF: "fr",
  BI: "fr",
  CD: "fr",
  CF: "fr",
  CG: "fr",
  CI: "fr",
  CM: "fr",
  CV: "pt",
  DJ: "fr",
  ET: "am",
  GA: "fr",
  GH: "en",
  GM: "en",
  GN: "fr",
  GQ: "es",
  GW: "pt",
  KE: "sw",
  KM: "ar",
  LR: "en",
  LS: "en",
  MG: "mg",
  ML: "fr",
  MW: "en",
  MZ: "pt",
  NA: "en",
  NE: "fr",
  NG: "en",
  RW: "rw",
  SC: "fr",
  SL: "en",
  SN: "fr",
  SS: "en",
  ST: "pt",
  SZ: "en",
  TD: "fr",
  TG: "fr",
  TZ: "sw",
  UG: "en",
  ZA: "en",
  ZM: "en",
  ZW: "en",

  // Oceania
  AU: "en",
  FJ: "en",
  FM: "en",
  NZ: "en",
  PG: "en",
  PW: "en",
  SB: "en",
  TO: "en",
  VU: "fr",
  WS: "en",
};

const translateText = async (
  text: string,
  countryCode: string,
): Promise<string> => {
  const normalizedCountryCode = countryCode?.toUpperCase?.() || "";
  const targetLang = countryToLanguage[normalizedCountryCode] || "en";

  if (targetLang === "en") {
    return text;
  }
  const cached = localStorage.getItem(CACHE_KEY);
  const cache = cached ? JSON.parse(cached) : {};
  const cacheKey = `auto:${targetLang}:${text}`;

  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    const response = await axios.get(
      "https://translate.googleapis.com/translate_a/single",
      {
        params: {
          client: "gtx",
          sl: "auto",
          tl: targetLang,
          dt: "t",
          q: text,
        },
      },
    );

    const data = response.data;

    const translatedText = data[0]
      ?.map((item: unknown[]) => item[0])
      .filter(Boolean)
      .join("");

    const result = translatedText || text;

    cache[cacheKey] = result;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

    return result;
  } catch {
    return text;
  }
};

/**
 * Batch translate — gộp nhiều text vào 1 request Google Translate.
 * Đọc cache 1 lần, ghi cache 1 lần, tránh 132 request riêng lẻ blocking main thread.
 */
export const translateBatch = async (
  texts: string[],
  countryCode: string,
): Promise<string[]> => {
  const normalizedCountryCode = countryCode?.toUpperCase?.() || "";
  const targetLang = countryToLanguage[normalizedCountryCode] || "en";

  // Không cần translate nếu target là en
  if (targetLang === "en") {
    return texts;
  }

  // Đọc cache 1 lần
  const cached = localStorage.getItem(CACHE_KEY);
  const cache = cached ? JSON.parse(cached) : {};

  const results: string[] = new Array(texts.length);
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];

  // Check từng text trong cache
  texts.forEach((text, i) => {
    const cacheKey = `auto:${targetLang}:${text}`;
    if (cache[cacheKey]) {
      results[i] = cache[cacheKey];
    } else {
      uncachedIndices.push(i);
      uncachedTexts.push(text);
    }
  });

  if (uncachedTexts.length > 0) {
    try {
      // Gộp tất cả text chưa cache vào 1 request, ngăn cách bởi \n
      // Google Translate API giữ nguyên newline trong response
      const joinedText = uncachedTexts.join("\n");
      const response = await axios.get(
        "https://translate.googleapis.com/translate_a/single",
        {
          params: {
            client: "gtx",
            sl: "auto",
            tl: targetLang,
            dt: "t",
            q: joinedText,
          },
        },
      );

      const data = response.data;
      const translatedLines: string[] = (data[0] || [])
        .slice(0, uncachedTexts.length)
        .map((item: unknown[]) => (item[0] as string) || "")
        .filter(Boolean);

      // Map kết quả về đúng vị trí & ghi cache
      translatedLines.forEach((translated, idx) => {
        const originalIdx = uncachedIndices[idx];
        const originalText = uncachedTexts[idx];
        const result = translated || originalText;
        results[originalIdx] = result;
        cache[`auto:${targetLang}:${originalText}`] = result;
      });
    } catch {
      // Fallback về text gốc nếu request lỗi
      uncachedIndices.forEach((idx, i) => {
        results[idx] = uncachedTexts[i];
      });
    }
  }

  // Ghi cache 1 lần
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

  return results;
};

export default translateText;
