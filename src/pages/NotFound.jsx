import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#E50914]/15 blur-2xl" />
        <div className="w-24 h-24 rounded-3xl bg-[#111111] border border-white/10 flex items-center justify-center text-[#FF1A24] shadow-xl relative">
          <Film className="w-12 h-12 stroke-[1.5]" />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-sm font-bold uppercase tracking-widest text-[#FF1A24]">
          Error 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          The scene you are looking for doesn’t exist or has been moved to another reel.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/movies">
          <Button variant="outline" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
            Browse Movies
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
