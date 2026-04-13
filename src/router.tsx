import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
} from '@tanstack/react-router';
import Dashboard from './pages/Dashboard';
import Videos from './pages/Videos';
import VideoDetail from './pages/VideoDetail';
import Browse from './pages/Browse';
import TopPhrases from './pages/TopPhrases';

const rootRoute = createRootRoute({
  component: () => (
    <div className="app-shell">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-logo">📖</span>
          <span className="nav-title">Phrase Explorer</span>
        </div>
        <div className="nav-links">
          <Link to="/" activeProps={{ className: 'active' }}>
            Dashboard
          </Link>
          <Link to="/videos" activeProps={{ className: 'active' }}>
            Videos
          </Link>
          <Link to="/top" activeProps={{ className: 'active' }}>
            Top Phrases
          </Link>
          <Link to="/browse" activeProps={{ className: 'active' }}>
            Browse All
          </Link>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const videosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/videos',
  component: Videos,
});

const videoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/videos/$videoId',
  component: VideoDetail,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: Browse,
});

const topPhrasesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/top',
  component: TopPhrases,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  videosRoute,
  videoDetailRoute,
  browseRoute,
  topPhrasesRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
