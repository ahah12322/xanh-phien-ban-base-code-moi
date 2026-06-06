import axios from 'axios';

const CACHE_KEY = 'translation_cache';

const countryToLanguage: Record<string, string> = {
    AD: 'ca',
    AL: 'sq',
    AR: 'es',
    AE: 'ar',
    AT: 'de',
    AU: 'en',
    BA: 'bs',
    BE: 'nl',
    BG: 'bg',
    BO: 'es',
    BR: 'pt',
    CH: 'de',
    CL: 'es',
    CN: 'zh-CN',
    CO: 'es',
    CR: 'es',
    CU: 'es',
    CA: 'en',
    CY: 'el',
    CZ: 'cs',
    DO: 'es',
    DE: 'de',
    DK: 'da',
    EC: 'es',
    EE: 'et',
    EN: 'en',
    EG: 'ar',
    ES: 'es',
    FI: 'fi',
    FR: 'fr',
    GB: 'en',
    GT: 'es',
    GR: 'el',
    HK: 'zh-TW',
    HN: 'es',
    HR: 'hr',
    HU: 'hu',
    ID: 'id',
    IE: 'ga',
    IS: 'is',
    IN: 'hi',
    IT: 'it',
    JM: 'en',
    KE: 'en',
    LT: 'lt',
    LU: 'lb',
    LV: 'lv',
    MA: 'ar',
    MC: 'fr',
    ME: 'sr',
    MT: 'mt',
    MX: 'es',
    MY: 'ms',
    NI: 'es',
    NL: 'nl',
    NO: 'no',
    NZ: 'en',
    OM: 'ar',
    PA: 'es',
    PE: 'es',
    PH: 'tl',
    PK: 'ur',
    PL: 'pl',
    PT: 'pt',
    PY: 'es',
    QA: 'ar',
    RO: 'ro',
    RS: 'sr',
    RU: 'ru',
    SA: 'ar',
    SE: 'sv',
    SI: 'sl',
    SK: 'sk',
    SV: 'es',
    TN: 'ar',
    TH: 'th',
    TR: 'tr',
    TW: 'zh-TW',
    UA: 'uk',
    UY: 'es',
    US: 'en',
    VE: 'es',
    VN: 'vi',
    JO: 'ar',
    LB: 'ar',
    JP: 'ja',
    IQ: 'ar',
    IL: 'iw',
    KR: 'ko'
};

const translateText = async (text: string, countryCode: string): Promise<string> => {
    const normalizedCountryCode = countryCode?.toUpperCase?.() || '';
    const targetLang = countryToLanguage[normalizedCountryCode] || 'en';

    if (targetLang === 'en') {
        return text;
    }
    const cached = localStorage.getItem(CACHE_KEY);
    const cache = cached ? JSON.parse(cached) : {};
    const cacheKey = `auto:${targetLang}:${text}`;

    if (cache[cacheKey]) {
        return cache[cacheKey];
    }

    try {
        const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
            params: {
                client: 'gtx',
                sl: 'auto',
                tl: targetLang,
                dt: 't',
                q: text
            }
        });

        const data = response.data;

        const translatedText = data[0]
            ?.map((item: unknown[]) => item[0])
            .filter(Boolean)
            .join('');

        const result = translatedText || text;

        cache[cacheKey] = result;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

        return result;
    } catch {
        return text;
    }
};

export default translateText;
