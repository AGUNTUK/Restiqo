'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Heart,
    Share2,
    Copy,
    Check,
    Link2,
    Mail,
    MessageCircle,
    Facebook,
    Twitter,
    X,
    Lock,
    Globe,
    Settings
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface Wishlist {
    id: string
    name: string
    user_id: string
    is_public: boolean
    share_token?: string
    property_count: number
    created_at: string
}

interface WishlistShareProps {
    wishlist: Wishlist
    onUpdate?: (wishlistId: string, updates: Partial<Wishlist>) => Promise<void>
    onCopyLink?: (shareToken: string) => Promise<void>
}

export default function WishlistShare({
    wishlist,
    onUpdate,
    onCopyLink
}: WishlistShareProps) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [wishlistName, setWishlistName] = useState(wishlist.name)
    const [isPublic, setIsPublic] = useState(wishlist.is_public)

    // Generate share URL
    const shareUrl = wishlist.share_token
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/wishlist/shared/${wishlist.share_token}`
        : null

    // Copy link to clipboard
    const handleCopyLink = useCallback(async () => {
        if (!shareUrl) return

        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            onCopyLink?.(wishlist.share_token!)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }, [shareUrl, onCopyLink, wishlist.share_token])

    // Share to social platforms
    const shareToFacebook = () => {
        if (!shareUrl) return
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            '_blank',
            'width=600,height=400'
        )
    }

    const shareToTwitter = () => {
        if (!shareUrl) return
        const text = `Check out my "${wishlist.name}" wishlist on Restiqa!`
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
            '_blank',
            'width=600,height=400'
        )
    }

    const shareViaEmail = () => {
        if (!shareUrl) return
        const subject = `Check out my "${wishlist.name}" wishlist`
        const body = `I thought you might like these properties I found on Restiqa!\n\n${shareUrl}`
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }

    const shareViaWhatsApp = () => {
        if (!shareUrl) return
        const text = `Check out my "${wishlist.name}" wishlist on Restiqa! ${shareUrl}`
        window.open(
            `https://wa.me/?text=${encodeURIComponent(text)}`,
            '_blank'
        )
    }

    // Update wishlist settings
    const handleUpdateSettings = async () => {
        setIsUpdating(true)
        try {
            await onUpdate?.(wishlist.id, {
                name: wishlistName,
                is_public: isPublic,
            })
            setIsSettingsModalOpen(false)
        } catch (err) {
            console.error('Failed to update:', err)
        } finally {
            setIsUpdating(false)
        }
    }

    // Generate share token if not exists
    const generateShareToken = async () => {
        setIsUpdating(true)
        try {
            // Generate a random token
            const token = crypto.randomUUID()
            await onUpdate?.(wishlist.id, {
                is_public: true,
                share_token: token,
            })
            setIsPublic(true)
        } catch (err) {
            console.error('Failed to generate share token:', err)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <>
            {/* Share Button */}
            <Button
                variant="outline"
                size="sm"
                leftIcon={<Share2 className="w-4 h-4" />}
                onClick={() => setIsShareModalOpen(true)}
            >
                Share
            </Button>

            {/* Share Modal */}
            <Modal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title="Share Wishlist"
                size="md"
            >
                <div className="space-y-6">
                    {/* Wishlist Info */}
                    <div className="flex items-center gap-3 p-4 bg-[#EEF2F6] rounded-xl">
                        <div className="w-12 h-12 rounded-xl neu-icon-primary flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#1E293B]">{wishlist.name}</h4>
                            <p className="text-sm text-[#64748B]">
                                {wishlist.property_count} {wishlist.property_count === 1 ? 'property' : 'properties'}
                            </p>
                        </div>
                    </div>

                    {/* Privacy Status */}
                    {!wishlist.is_public && !isPublic ? (
                        <div className="p-4 bg-amber-50 rounded-xl">
                            <div className="flex items-start gap-3">
                                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="font-medium text-amber-800">This wishlist is private</h5>
                                    <p className="text-sm text-amber-600 mt-1">
                                        Make it public to share with others. Only people with the link can view it.
                                    </p>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="mt-3"
                                        onClick={generateShareToken}
                                        isLoading={isUpdating}
                                    >
                                        Make Public & Share
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Share Link */}
                            {shareUrl && (
                                <div>
                                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                                        Share Link
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={shareUrl}
                                            readOnly
                                            className="flex-1 px-4 py-2.5 rounded-xl neu-input text-sm text-[#64748B]"
                                        />
                                        <Button
                                            variant={copied ? 'accent' : 'primary'}
                                            onClick={handleCopyLink}
                                            leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        >
                                            {copied ? 'Copied!' : 'Copy'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Share Options */}
                            <div>
                                <label className="block text-sm font-medium text-[#1E293B] mb-3">
                                    Share via
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    <button
                                        onClick={shareViaWhatsApp}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl neu-button hover:scale-105 transition-transform"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                            <MessageCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs text-[#64748B]">WhatsApp</span>
                                    </button>

                                    <button
                                        onClick={shareToFacebook}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl neu-button hover:scale-105 transition-transform"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                            <Facebook className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs text-[#64748B]">Facebook</span>
                                    </button>

                                    <button
                                        onClick={shareToTwitter}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl neu-button hover:scale-105 transition-transform"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                                            <Twitter className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs text-[#64748B]">Twitter</span>
                                    </button>

                                    <button
                                        onClick={shareViaEmail}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl neu-button hover:scale-105 transition-transform"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs text-[#64748B]">Email</span>
                                    </button>
                                </div>
                            </div>

                            {/* Privacy Settings */}
                            <div className="flex items-center justify-between p-4 bg-[#EEF2F6] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-[#64748B]" />
                                    <div>
                                        <p className="text-sm font-medium text-[#1E293B]">Public wishlist</p>
                                        <p className="text-xs text-[#64748B]">Anyone with the link can view</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    className="p-2 rounded-lg hover:bg-white transition-colors"
                                >
                                    <Settings className="w-5 h-5 text-[#64748B]" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Settings Modal */}
            <Modal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                title="Wishlist Settings"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-[#1E293B] mb-2">
                            Wishlist Name
                        </label>
                        <input
                            type="text"
                            value={wishlistName}
                            onChange={(e) => setWishlistName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl neu-input"
                        />
                    </div>

                    {/* Privacy Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[#EEF2F6] rounded-xl">
                        <div className="flex items-center gap-3">
                            {isPublic ? (
                                <Globe className="w-5 h-5 text-green-600" />
                            ) : (
                                <Lock className="w-5 h-5 text-amber-600" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-[#1E293B]">
                                    {isPublic ? 'Public' : 'Private'}
                                </p>
                                <p className="text-xs text-[#64748B]">
                                    {isPublic
                                        ? 'Anyone with link can view'
                                        : 'Only you can view'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${isPublic ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <motion.div
                                animate={{ x: isPublic ? 24 : 2 }}
                                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                            />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsSettingsModalOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpdateSettings}
                            isLoading={isUpdating}
                            className="flex-1"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
