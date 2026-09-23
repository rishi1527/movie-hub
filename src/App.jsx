import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { PageSkeleton } from './components/Skeletons';
import ScrollToTop from './components/ScrollToTop';

// Route Pages (Lazy loaded with smooth code-splitting)
const Home = lazy(() => import('./pages/Home'));
const Movies = lazy(() => import('./pages/Movies'));
const WebSeries = lazy(() => import('./pages/WebSeries'));
const Anime = lazy(() => import('./pages/Anime'));
const TvShows = lazy(() => import('./pages/TvShows'));
const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <>
      {/* Global Route Change Scroll-to-Top Handler */}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AppLayout />}>

        {/* Main Navigation Routes with immediate non-blocking page skeletons */}
        <Route
          index
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="movies"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Movies />
            </Suspense>
          }
        />
        <Route
          path="web-series"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <WebSeries />
            </Suspense>
          }
        />
        <Route
          path="anime"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Anime />
            </Suspense>
          }
        />
        <Route
          path="tv-shows"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <TvShows />
            </Suspense>
          }
        />

        {/* Dynamic Movie Details Route */}
        <Route
          path="movies/:id"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <MovieDetails />
            </Suspense>
          }
        />

        {/* User Account & Favorites Routes */}
        <Route
          path="favorites"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Favorites />
            </Suspense>
          }
        />
        <Route
          path="login"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Profile />
            </Suspense>
          }
        />

        {/* 404 Catch-All Route */}
        <Route
          path="*"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <NotFound />
            </Suspense>
          }
        />
      </Route>
    </Routes>
    </>
  );
}

export default App;


