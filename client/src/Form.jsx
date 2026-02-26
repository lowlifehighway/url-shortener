import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2, AlertTriangle, Lock, Download } from 'lucide-react';
import QRCode from 'qrcode';

const forbiddenWords = [
  'virus',
  'malware',
  'scam',
  'phishing',
  'illegal',
  'fraud',
];

export default function Form() {
  const [longUrl, setLongUrl] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [data, setData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setQrCode('');
    setLongUrl('');
    setData(null);
    setLoading(true);

    const forbidden = forbiddenWords.some((word) =>
      longUrl.toLowerCase().includes(word),
    );

    if (forbidden) {
      setError('Potential Malware link detected');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ long_url: longUrl, pin }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Something went wrong');
        return;
      }

      setData(result);

      const generatedShortUrl = `http://localhost:5173/${result.id}`;
      setShortUrl(generatedShortUrl);

      const qrDataUrl = await QRCode.toDataURL(generatedShortUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#DC2626',
          light: '#1a1a1a',
        },
      });

      setQrCode(qrDataUrl);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-[#1a1a1a] rounded-lg border border-[rgba(220,38,38,0.2)]">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="h-6 w-6 text-[#DC2626]" />
            <h2 className="text-xl font-semibold text-white">
              Shorten Your URL
            </h2>
          </div>
          <p className="text-[#a3a3a3] text-sm mb-6">
            Create a secure shortened url code
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[#DC2626] bg-opacity-10 border border-[#DC2626] border-opacity-50 text-white p-3 rounded-md flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="longUrl"
                className="text-sm font-medium text-white"
              >
                Enter your Long URL
              </label>
              <input
                id="longUrl"
                type="url"
                placeholder="https://example.com/a6b2c3"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[rgba(220,38,38,0.2)] rounded-md text-white placeholder-[#a3a3a3] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="pin"
                className="text-sm font-medium text-white flex items-center gap-2"
              >
                <Lock className="h-4 w-4 text-[#78350F]" />
                Enter 4-Digit PIN
              </label>
              <input
                id="pin"
                type="text"
                inputMode="numeric"
                placeholder="1234"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                required
                minLength={4}
                maxLength={4}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[rgba(220,38,38,0.2)] rounded-md text-white placeholder-[#a3a3a3] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
              />
              <p className="text-xs text-[#a3a3a3]">
                Add a PIN to protect your link from unauthorized access
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !longUrl}
              className="w-full px-4 py-2 bg-[#DC2626] text-white font-medium rounded-md hover:bg-[#DC2626]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Shorten URL'}
            </button>
          </form>
        </div>
      </div>
      {shortUrl && (
        <div className="mt-6 text-center space-y-4">
          <p className="text-white gap-4 flex justify-center">
            Short URL:
            <Link
              to={`/${data.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#DC2626] underline"
            >
              {shortUrl}
            </Link>
          </p>
          {qrCode && (
            <>
              <div className="flex items-center justify-center gap-2 text-[#a3a3a3]">
                <p className="text-sm text-[#444] uppercase">Scan to open</p>
                <a
                  href={qrCode}
                  download="qrcode.png"
                  className="p-3 bg-[#DC2626] rounded-md hover:bg-[#DC2626]/90 flex items-center gap-2 text-white text-sm"
                >
                  Download
                  <Download className="h-4 w-4 text-white" />
                </a>
              </div>
              <div className="inline-block bg-[#111] border border-[rgba(220,38,38,0.2)] rounded-xl p-3">
                <img src={qrCode} alt="QR Code" className="block rounded-lg" />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
