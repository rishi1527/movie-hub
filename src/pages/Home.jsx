import { useState, useEffect, useRef } from 'react';
import HeroSlider from '../components/HeroSlider';
import MoodDiscovery from '../components/MoodDiscovery';
import MovieRow from '../components/MovieRow';
import { HeroSkeleton, MovieRowSkeleton } from '../components/Skeletons';
import {
  getTrendingMovies,
  getPopularMovies,
  getNowPlayingMovies,
  getTopRatedMovies,
  getPopularSeries,
} from '../services/tmdbApi';

const Home = () => {
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

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* 1. Hero Movie Slider (Top TMDB Blockbusters) */}
      {loadingHero && heroData.length === 0 ? (
        <HeroSkeleton />
      ) : heroData.length > 0 ? (
        <HeroSlider movies={heroData} autoplayInterval={5000} />
      ) : null}

      {/* 2. Mood-based Discovery Section ("What's Your Mood?") */}
      <MoodDiscovery />

      {/* 3. Horizontal Content Rows */}
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Trending Movies */}
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

        {/* Popular Movies */}
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

        {/* Popular Web Series */}
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

        {/* Latest Releases */}
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

        {/* Top Rated */}
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
