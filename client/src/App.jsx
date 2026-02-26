import Form from './Form';
import { Shield, QrCode, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="border-b border-[rgba(220,38,38,0.2)] bg-[#1a1a1a]/30 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#dc2626] rounded-lg flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white">LinkVault</h1>
              <p className="text-sm text-[#a3a3a3]">
                Secure URL Shortener with PIN Protection
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1">
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1a1a1a]/30 backdrop-blur border border-[rgba(220,38,38,0.2)] rounded-lg p-4">
            <Shield className="h-8 w-8 text-[#dc2626] mb-2" />
            <h3 className="text-white mb-1">Gatekeeper</h3>
            <p className="text-sm text-[#a3a3a3]">
              Protect links with 4-digit PIN
            </p>
          </div>
          <div className="bg-[#1a1a1a]/30 backdrop-blur border border-[rgba(220,38,38,0.2)] rounded-lg p-4">
            <Shield className="h-8 w-8 text-[#dc2626] mb-2" />
            <h3 className="text-white mb-1">Malware Filter</h3>
            <p className="text-sm text-[#a3a3a3]">
              Auto-reject suspicious URLs
            </p>
          </div>
          <div className="bg-[#1a1a1a]/30 backdrop-blur border border-[rgba(220,38,38,0.2)] rounded-lg p-4">
            <QrCode className="h-8 w-8 text-[#dc2626] mb-2" />
            <h3 className="text-white mb-1">QR Creator</h3>
            <p className="text-sm text-[#a3a3a3]">
              Generate QR codes instantly
            </p>
          </div>
        </div>
        <Form />
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(220,38,38,0.2)] mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-[#a3a3a3]">
          <p>Secure, fast, and reliable URL shortening</p>
        </div>
      </footer>
    </div>
  );
}
