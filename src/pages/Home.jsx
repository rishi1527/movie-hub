import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import MoodDiscovery, { MOODS } from '../components/MoodDiscovery';
import MovieRow from '../components/MovieRow';
import { HeroSkeleton, MovieRowSkeleton } from '../components/Skeletons';
import {
  getTrendingMovies,
  getPopularMovies,
  getNowPlayingMovies,
  getTopRatedMovies,
  getPopularSeries,
  getMoviesByMood,
} from '../services/tmdbApi';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active mood state - defaults to Comedy (matching user request) or query param
  const initialMoodId = searchParams.get('mood') || 'comedy';
  const [selectedMood, setSelectedMood] = useState(
    () => MOODS.find((m) => m.id === initialMoodId) || MOODS[1] || MOODS[0]
  );
  const [moodMovies, setMoodMovies] = useState([]);
  const [loadingMood, setLoadingMood] = useState(true);
  const [highlightMoodRow, setHighlightMoodRow] = useState(false);

  const [heroData, setHeroData] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [series, setSeries] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [topRated, setTopRated] = useState([]);

  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [loadingNowPlaying, setLoadingNowPlaying] = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);

  const abortControllerRef = useRef(null);
  const moodAbortRef = useRef(null);
  const moodCacheRef = useRef({});
  const moodRowRef = useRef(null);

  // Synchronize with URL param if it changes externally
  useEffect(() => {
    const param = searchParams.get('mood');
    if (param && param !== selectedMood.id) {
      const match = MOODS.find((m) => m.id === param);
      if (match) {
        setSelectedMood(match);
      }
    }
  }, [searchParams, selectedMood.id]);

  // Fetch Mood Movies dynamically whenever selectedMood changes with client-side caching
  useEffect(() => {
    let isMounted = true;
    const moodId = selectedMood.id;

    // Fast-path: Check in-memory cache for instant switching with zero flicker
    if (moodCacheRef.current[moodId] && moodCacheRef.current[moodId].length > 0) {
      setMoodMovies(moodCacheRef.current[moodId]);
      setLoadingMood(false);
      return;
    }

    setLoadingMood(true);

    if (moodAbortRef.current) {
      moodAbortRef.current.abort();
    }
    const controller = new AbortController();
    moodAbortRef.current = controller;

    getMoviesByMood(moodId, 1, { signal: controller.signal })
      .then((data) => {
        if (!isMounted) return;
        const validList = Array.isArray(data) ? data : [];
        moodCacheRef.current[moodId] = validList;
        setMoodMovies(validList);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(`Error fetching mood movies for ${moodId}:`, err);
        if (isMounted) setMoodMovies([]);
      })
      .finally(() => {
        if (isMounted) setLoadingMood(false);
      });

    return () => {
      isMounted = false;
      if (moodAbortRef.current) {
        moodAbortRef.current.abort();
      }
    };
  }, [selectedMood.id]);

  // Primary categories fetch (15 items each)
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    // 1. Fetch Trending & Hero
    getTrendingMovies('day', { signal })
      .then((list) => {
        if (!isMounted) return;
        const validList = Array.isArray(list) ? list : [];
        setTrending(validList);

        const validBackdrops = validList
          .filter((m) => Boolean(m.backdrop || m.poster))
          .slice(0, 5);
        setHeroData(validBackdrops.length > 0 ? validBackdrops : validList.slice(0, 5));
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error fetching trending:', err);
        if (isMounted) {
          setTrending([]);
          setHeroData([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingHero(false);
          setLoadingTrending(false);
        }
      });

    // 2. Fetch Popular Movies
    getPopularMovies(1, { signal })
      .then((list) => {
        if (!isMounted) return;
        setPopular(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error fetching popular:', err);
        if (isMounted) setPopular([]);
      })
      .finally(() => {
        if (isMounted) setLoadingPopular(false);
      });

    // 3. Fetch Popular Series
    getPopularSeries(1, { signal })
      .then((list) => {
        if (!isMounted) return;
        setSeries(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error fetching series:', err);
        if (isMounted) setSeries([]);
      })
      .finally(() => {
        if (isMounted) setLoadingSeries(false);
      });

    // 4. Fetch Now Playing
    getNowPlayingMovies(1, { signal })
      .then((list) => {
        if (!isMounted) return;
        setNowPlaying(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error fetching now playing:', err);
        if (isMounted) setNowPlaying([]);
      })
      .finally(() => {
        if (isMounted) setLoadingNowPlaying(false);
      });

    // 5. Fetch Top Rated
    getTopRatedMovies(1, { signal })
      .then((list) => {
        if (!isMounted) return;
        setTopRated(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error fetching top rated:', err);
        if (isMounted) setTopRated([]);
      })
      .finally(() => {
        if (isMounted) setLoadingTopRated(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Handler when user clicks any mood button: stay on Home page and smoothly scroll to the mood row
  const handleSelectMood = useCallback(
    (mood) => {
      setSelectedMood(mood);
      setSearchParams({ mood: mood.id }, { replace: true });

      setHighlightMoodRow(true);
      setTimeout(() => {
        moodRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
      setTimeout(() => {
        setHighlightMoodRow(false);
      }, 1500);
    },
    [setSearchParams]
  );

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* 1. Hero Movie Slider (Top TMDB Blockbusters) */}
      {loadingHero && heroData.length === 0 ? (
        <HeroSkeleton />
      ) : heroData.length > 0 ? (
        <HeroSlider movies={heroData} autoplayInterval={5000} />
      ) : null}

      {/* 2. Mood-based Discovery Section ("What's Your Mood?") */}
      <MoodDiscovery
        selectedMood={selectedMood}
        onSelectMood={handleSelectMood}
      />

      {/* 3. Horizontal Content Rows */}
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Trending Movies (15 cards) */}
        {loadingTrending && trending.length === 0 ? (
          <MovieRowSkeleton count={6} />
        ) : trending.length > 0 ? (
          <MovieRow
            title="Trending Movies"
            badge="HOT"
            subtitle="Top streamed today on TMDB"
            movies={trending}
            seeAllLink="/movies"
          />
        ) : null}

        {/* Popular Movies (15 cards) */}
        {loadingPopular && popular.length === 0 ? (
          <MovieRowSkeleton count={6} />
        ) : popular.length > 0 ? (
          <MovieRow
            title="Popular Movies"
            subtitle="Global fan favorites"
            movies={popular}
            seeAllLink="/movies"
          />
        ) : null}

        {/* 🍿 Comedy Movies (or active selected mood) (15 cards) */}
        <div
          ref={moodRowRef}
          id="mood-movies-row"
          className={`scroll-mt-24 transition-all duration-500 rounded-2xl ${
            highlightMoodRow
              ? 'ring-2 ring-[#FF1A24]/50 bg-[#FF1A24]/5 shadow-lg shadow-[#FF1A24]/10 p-2 -m-2'
              : ''
          }`}
        >
          {loadingMood && moodMovies.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : moodMovies.length > 0 ? (
            <MovieRow
              title={`${selectedMood.emoji || '🍿'} ${selectedMood.name} Movies`}
              badge="MOOD"
              subtitle={selectedMood.subtitle || `Top curated ${selectedMood.name.toLowerCase()} picks`}
              movies={moodMovies}
              seeAllLink={`/movies?mood=${selectedMood.id}`}
            />
          ) : !loadingMood ? (
            <div className="glass-panel p-6 rounded-2xl text-center text-zinc-400 text-sm">
              No {selectedMood.name.toLowerCase()} movies found at this moment.
            </div>
          ) : null}
        </div>

        {/* Popular Web Series (15 cards) */}
        {loadingSeries && series.length === 0 ? (
          <MovieRowSkeleton count={6} />
        ) : series.length > 0 ? (
          <MovieRow
            title="Popular Web Series"
            badge="BINGE"
            subtitle="Trending multi-season sagas"
            movies={series}
            seeAllLink="/web-series"
          />
        ) : null}

        {/* Latest Releases (15 cards) */}
        {loadingNowPlaying && nowPlaying.length === 0 ? (
          <MovieRowSkeleton count={6} />
        ) : nowPlaying.length > 0 ? (
          <MovieRow
            title="Latest Releases"
            badge="NOW PLAYING"
            subtitle="Freshly released in cinemas & digital"
            movies={nowPlaying}
            seeAllLink="/movies"
          />
        ) : null}

        {/* Top Rated (15 cards) */}
        {loadingTopRated && topRated.length === 0 ? (
          <MovieRowSkeleton count={6} />
        ) : topRated.length > 0 ? (
          <MovieRow
            title="Top Rated Movies"
            badge="★ 8.0+"
            subtitle="Critically acclaimed all-time cinema"
            movies={topRated}
            seeAllLink="/movies"
          />
        ) : null}
      </div>
    </div>
  );
};

export default Home;
