import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  X,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Send,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';

export const ForgotPasswordModal = () => {
  const { isForgotPasswordOpen, setIsForgotPasswordOpen, addToast } = useWeather();
  const { t, language } = useLanguage();

  // Mode: 'request' | 'reset' | 'completed'
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isForgotPasswordOpen) return null;

  const handleCopyToken = () => {
    if (!resetToken) return;
    navigator.clipboard.writeText(resetToken);
    setCopied(true);
    addToast('Security token copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.forgotPassword(email.trim());
      const token = response?.resetToken;
      if (token) {
        setResetToken(token);
        setStep('reset');
        addToast(
          language === 'mr'
            ? 'सुरक्षा टोकन तयार झाले! ईमेल तपासा किंवा खाली नवीन पासवर्ड प्रविष्ट करा.'
            : language === 'hi'
            ? 'सुरक्षा टोकन जनरेट हुआ! ईमेल देखें या नीचे नया पासवर्ड दर्ज करें।'
            : 'Security reset token generated! Enter your new password below.',
          'success'
        );
      } else {
        setStep('completed');
        addToast(
          language === 'mr'
            ? `${email} वर अधिकृत पासवर्ड रीसेट ईमेल पाठवले आहे`
            : language === 'hi'
            ? `${email} पर आधिकारिक पासवर्ड रीसेट ईमेल भेजा गया`
            : `Official reset instructions dispatched to ${email}`,
          'info'
        );
      }
    } catch (err) {
      addToast(err.message || 'Failed to request reset token', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken.trim()) {
      addToast('Please enter the security reset token', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters long', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword({
        token: resetToken.trim(),
        password: newPassword,
        confirmPassword
      });
      setStep('completed');
      addToast(
        language === 'mr'
          ? 'पासवर्ड यशस्वीरित्या बदलला!'
          : language === 'hi'
          ? 'पासवर्ड सफलतापूर्वक बदल गया!'
          : 'Password successfully updated! You can now log in.',
        'success'
      );
    } catch (err) {
      addToast(err.message || 'Failed to reset password. Token may have expired.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsForgotPasswordOpen(false);
    setStep('request');
    setEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setCopied(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              {step === 'reset' ? <KeyRound className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {step === 'completed'
                  ? t('checkYourInbox')
                  : step === 'reset'
                  ? 'Verify Token & Set Password'
                  : t('resetPassword')}
              </h3>
              <span className="text-[11px] font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                Official Security Dispatch
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'completed' ? (
            <div className="text-center py-3 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-emerald-200/50 dark:border-emerald-800/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {language === 'mr'
                    ? 'पासवर्ड यशस्वीरित्या बदलला!'
                    : language === 'hi'
                    ? 'पासवर्ड सफलतापूर्वक बदल गया!'
                    : 'Credentials Successfully Updated'}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {language === 'mr'
                    ? 'तुमचा पासवर्ड सुरक्षितपणे अपडेट करण्यात आला आहे. नवीन क्रेडेन्शियलसह साइन इन करा.'
                    : language === 'hi'
                    ? 'आपका पासवर्ड सुरक्षित रूप से अपडेट कर दिया गया है। नए क्रेडेंशियल से साइन इन करें।'
                    : 'Your password has been securely reset. You can now authenticate with your updated credentials.'}
                </p>
              </div>

              {/* Security Advisory Alert Banner */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 text-left flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Security Note:</strong> Never share your credentials or OTP with anyone. All existing sessions have been refreshed.
                </span>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition cursor-pointer"
              >
                {t('backToSignIn')}
              </button>
            </div>
          ) : step === 'reset' ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Token Dispatch Alert Banner */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Security Token Ready</div>
                  <div className="text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    An official verification email has been dispatched. Enter the token below to confirm authorization:
                  </div>
                </div>
              </div>

              {/* Reset Token Input + Quick Copy */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Security Authorization Token
                  </label>
                  {resetToken && (
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy Token'}</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Paste 64-char security reset token"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password (min 8 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Enter strong new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">Passwords do not match</p>
                )}
              </div>

              {/* HTML Email Preview Button */}
              <div className="pt-1">
                <a
                  href="http://localhost:5000/api/auth/email-preview?type=reset"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>Preview Official HTML Email Dispatch</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-70 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Update Password</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Email Request</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRequestToken} className="space-y-4">
              {/* Official Alert Notice */}
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Meteorological Auth Grid:</span> Enter your registered email address to receive an official password reset bulletin with single-use authorization token.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('emailAddress')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Sample Email Template Preview Links */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Live Official Email Dispatch Templates:
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="http://localhost:5000/api/auth/email-preview?type=reset"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    🔒 Password Reset Email <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <a
                    href="http://localhost:5000/api/auth/email-preview?type=alert"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400 hover:underline"
                  >
                    🚨 Emergency Weather Alert <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <a
                    href="http://localhost:5000/api/auth/email-preview?type=welcome&role=farmer"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    🌾 Krishi Welcome Email <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Reset Instructions</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('reset')}
                    className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                  >
                    Have a token? Reset password
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {t('backToSignIn')}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
