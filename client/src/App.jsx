import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Cat, Loader2, AlertTriangle, PartyPopper, RefreshCw } from 'lucide-react';

const fireConfetti = () => {
  const defaults = { spread: 70, ticks: 120, zIndex: 50 };
  confetti({ ...defaults, particleCount: 120, origin: { x: 0.5, y: 0.6 } });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 60, angle: 60, origin: { x: 0, y: 0.7 } });
    confetti({ ...defaults, particleCount: 60, angle: 120, origin: { x: 1, y: 0.7 } });
  }, 250);
};

export default function App() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [image, setImage] = useState(null);

  const fetchCat = async () => {
    setStatus('loading');
    setImage(null);

    try {
      const res = await fetch('/api/cat');

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error(
          `Failed to fetch cat image: HTTP ${res.status} ${body.error || 'Bad Gateway'} — ${body.message || 'upstream request failed'}`,
        );
        setStatus('error');
        return;
      }

      const data = await res.json();
      setImage(data.image);
      setStatus('success');
      fireConfetti();
    } catch (err) {
      console.error('Failed to fetch cat image: upstream request failed', err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-amber-50 flex flex-col items-center px-4">
      <main className="w-full max-w-xl flex flex-col items-center gap-8 pt-20 pb-16">
        {/* Header */}
        <header className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-300 mb-4">
            <Cat className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Get a Cat <span className="align-middle">🐱</span>
          </h1>
          <p className="mt-2 text-slate-500">
            One click. One cat. Straight from AWS S3.
          </p>
        </header>

        {/* Main action */}
        <button
          onClick={fetchCat}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-300 transition hover:bg-indigo-700 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Fetching…
            </>
          ) : (
            <>
              {status === 'idle' ? <Cat className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
              Fetch Cat Image
            </>
          )}
        </button>

        {/* Success banner */}
        {status === 'success' && (
          <div className="w-full flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-sm">
            <PartyPopper className="w-5 h-5 shrink-0 text-emerald-600" />
            <p className="font-medium">Cat retrieved successfully! Bob is a hero</p>
          </div>
        )}

        {/* Error banner */}
        {status === 'error' && (
          <div className="w-full flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <p className="font-medium">Something went wrong</p>
          </div>
        )}

        {/* Cat image */}
        {status === 'success' && image && (
          <figure className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <img src={image} alt="A very good cat" className="w-full object-cover" />
            <figcaption className="px-4 py-3 text-sm text-slate-500 text-center">
              Delivered fresh from <code className="text-slate-700">s3://block-sales-group</code>
            </figcaption>
          </figure>
        )}
      </main>

      <footer className="mt-auto pb-6 text-xs text-slate-400">
        Get a Cat — IT demo · powered by AWS S3
      </footer>
    </div>
  );
}
