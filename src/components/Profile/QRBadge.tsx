import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';
import { getUserProfile, rotateQrSlug } from '../../lib/firestore/users';
import { useAuth } from '../AuthProvider';

export default function QRBadge() {
  const { user } = useAuth();
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    loadSlug();
  }, [user]);

  const loadSlug = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const profile = await getUserProfile(user.uid);
      if (profile?.privacy?.slug) {
        setSlug(profile.privacy.slug);
      }
    } catch (error) {
      console.error('Failed to load QR slug:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRotateSlug = async () => {
    if (!user) return;

    setRotating(true);

    try {
      const newSlug = await rotateQrSlug(user.uid);
      setSlug(newSlug);
    } catch (error) {
      console.error('Failed to rotate QR slug:', error);
    } finally {
      setRotating(false);
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `reddyfit-qr-${slug}.png`;
    link.click();
  };

  const handleCopyLink = async () => {
    if (!slug) return;

    const url = `https://reddyfit.club/q/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenProfile = () => {
    if (!slug) return;
    window.open(`https://reddyfit.club/q/${slug}`, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center">QR code not available</p>
      </div>
    );
  }

  const qrUrl = `https://reddyfit.club/q/${slug}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Public QR Profile</h3>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-white border-4 border-gray-900 rounded-xl">
          <QRCodeCanvas
            id="qr-code-canvas"
            value={qrUrl}
            size={200}
            level="H"
            includeMargin={false}
          />
        </div>
      </div>

      {/* URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Public Profile URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={qrUrl}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            title="Copy link"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleDownloadQR}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        <button
          onClick={handleOpenProfile}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Preview
        </button>

        <button
          onClick={handleRotateSlug}
          disabled={rotating}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${rotating ? 'animate-spin' : ''}`} />
          Rotate
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ Rotating your QR code will invalidate the old link. Use this if you want to stop sharing your profile.
        </p>
      </div>
    </div>
  );
}
