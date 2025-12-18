// Account Disabled Modal - Shows when archived user tries to login
import React, { useState } from 'react';
import { HiOutlineExclamationTriangle, HiOutlineXMark, HiOutlineEnvelope, HiOutlinePaperAirplane, HiOutlineCheckCircle } from 'react-icons/hi2';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';

const AccountDisabledModal = ({
    isOpen,
    onClose,
    archiveReason,
    archivedAt,
    hasRequestedReactivation,
    reactivationRequestDate,
    userEmail,
    userName
}) => {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestSent, setRequestSent] = useState(hasRequestedReactivation);

    if (!isOpen) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSubmitRequest = async () => {
        if (!message.trim()) {
            toast.error('Please provide a message for the administrator');
            return;
        }

        try {
            setIsSubmitting(true);
            await apiClient.post('/users/request-reactivation', {
                email: userEmail,
                message: message.trim()
            });

            setRequestSent(true);
            toast.success('Reactivation request sent successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-cherry to-cherry-dark px-6 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <HiOutlineExclamationTriangle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Account Disabled</h2>
                            <p className="text-cherry-100 text-sm">Your account has been temporarily suspended</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <HiOutlineXMark className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* User Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Account</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{userName || userEmail}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{userEmail}</p>
                    </div>

                    {/* Reason */}
                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <HiOutlineEnvelope className="w-4 h-4" />
                            Reason from Administrator
                        </h3>
                        <div className="bg-cherry-50 dark:bg-cherry-900/20 border border-cherry-200 dark:border-cherry-800/50 rounded-xl p-4">
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                {archiveReason || 'No reason provided'}
                            </p>
                            {archivedAt && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                    Disabled on: {formatDate(archivedAt)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Request Reactivation Section */}
                    {requestSent ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <HiOutlineCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                <h3 className="font-semibold text-green-800 dark:text-green-300">
                                    Reactivation Request Submitted
                                </h3>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-400">
                                Your request has been sent to the administrator. You will be able to login once your account is reactivated.
                            </p>
                            {reactivationRequestDate && (
                                <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                                    Requested on: {formatDate(reactivationRequestDate)}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <HiOutlinePaperAirplane className="w-4 h-4" />
                                Request Account Reactivation
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                If you believe this was a mistake or would like your account reactivated, please send a message to the administrator.
                            </p>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Explain why you would like your account reactivated..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-700/50 dark:text-white rounded-xl focus:border-cherry focus:ring-0 focus:outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                            />
                            <button
                                onClick={handleSubmitRequest}
                                disabled={isSubmitting || !message.trim()}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cherry hover:bg-cherry-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending Request...
                                    </>
                                ) : (
                                    <>
                                        <HiOutlinePaperAirplane className="w-5 h-5" />
                                        Send Reactivation Request
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountDisabledModal;
