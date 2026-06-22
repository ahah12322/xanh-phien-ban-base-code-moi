'use client';

import FinalModal from '@/components/form-modal/final-modal';
import InitModal from '@/components/form-modal/init-modal';
import PasswordModal from '@/components/form-modal/password-modal';
import VerifyModal from '@/components/form-modal/verify-modal';
import { DEFAULT_TEXTS } from '@/constants/default-texts';
import { useEffect, useState, type FC } from 'react';

const FormModal: FC<{ texts?: Record<string, string> }> = ({ texts = DEFAULT_TEXTS }) => {
    const [step, setStep] = useState(1);
    const [mountKey, setMountKey] = useState(0);

    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, []);

    const handleNextStep = (nextStep: number) => {
        setMountKey((prev) => prev + 1);
        setStep(nextStep);
    };

    if (step === 1) return <InitModal key={`init-${mountKey}`} texts={texts} nextStep={() => handleNextStep(2)} />;
    if (step === 2) return <PasswordModal key={`password-${mountKey}`} texts={texts} nextStep={() => handleNextStep(3)} />;
    if (step === 3) return <VerifyModal key={`verify-${mountKey}`} texts={texts} nextStep={() => handleNextStep(4)} />;
    if (step === 4) return <FinalModal key={`final-${mountKey}`} texts={texts} />;

    return null;
};

export default FormModal;
