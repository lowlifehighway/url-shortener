import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router';
import { Lock, AlertTriangle, Unlink, LoaderCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export function RedirectPage() {
  const { shortCode } = useParams();
  const loaderRef = useRef();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [requiresPin, setRequiresPin] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!shortCode) {
      navigate('/');
      return;
    }

    fetch(`${API_URL}/api/${shortCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setNotFound(true);
          return;
        }

        if (data.requiresPin) {
          setRequiresPin(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [shortCode, navigate]);

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/${shortCode}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Incorrect PIN');
        setPin('');
        return;
      }
      window.location.href = data.long_url;
    } catch (err) {
      console.log(err.code);
      setError('Failed to connect to server');
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-8 px-4 py-8N">
        <Unlink className="h-36 w-36 text-[#DC2626] mb-4" />
        <div className="bg-[#1a1a1a]/30 backdrop-blur border border-[rgba(220,38,38,0.2)] rounded-lg p-8 text-center">
          <h1 className="text-2xl font-semibold text-white mb-2">
            404 - Not Found
          </h1>
          <p className="text-[#a3a3a3] text-sm mb-6">
            Hmm, seems the link you followed is broken or isn't here anymore
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-[#DC2626] text-white rounded-md hover:bg-[#DC2626]/90 font-bold"
          >
            Let's Go Home
          </a>
        </div>
      </div>
    );
  }

  if (loading || (!requiresPin && !notFound)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1a1a] rounded-lg border border-[rgba(220,38,38,0.2)]">
          <div className="p-8">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full  bg-opacity-10 mb-4">
                <LoaderCircle
                  className="h-12 w-12 text-[#DC2626] animate-spin"
                  ref={loaderRef}
                />
              </div>
              <p className="text-white">Redirecting...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-lg border border-[rgba(220,38,38,0.2)]">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-6 w-6 text-[#78350F]" />
            <h2 className="text-xl font-semibold text-white">PIN Required</h2>
          </div>
          <p className="text-[#a3a3a3] text-sm mb-6">
            This link is protected. Enter the 4-digit PIN to continue.
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            {error && (
              <div className="bg-[#DC2626] bg-opacity-10 border border-[#DC2626] border-opacity-50 text-white p-3 rounded-md flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium text-white">
                Enter PIN
              </label>
              <input
                id="pin"
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                maxLength={4}
                autoFocus
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[rgba(220,38,38,0.2)] rounded-md text-white placeholder-[#a3a3a3] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] text-center text-2xl"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-2 bg-transparent border border-[rgba(220,38,38,0.2)] text-white font-medium rounded-md hover:bg-[#262626]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pin.length !== 4}
                className="flex-1 px-4 py-2 bg-[#DC2626] text-white font-medium rounded-md hover:bg-[#DC2626]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
