import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ChevronLeft, Bell } from 'lucide-react';
import { MODULES, MODULE_NAV, moduleFromPath, type ModuleKey, type NavGroup } from '../lib/module-meta';
import { BRANDS } from '../lib/brand';
import { useAppStore } from '../store/useAppStore';
import { classNames } from '../lib/picsum';

export default function AppShell() {
  const location = useLocation();
  const currentKey = moduleFromPath(location.pathname);
  const isHome = currentKey === 'home';
  const drawerOpen = useAppStore((s) => s.drawerOpen);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname, setDrawerOpen]);

  if (isHome) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-100">
        <HomeTopBar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100">
      <ModuleTopBar currentKey={currentKey} />
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex gap-5 lg:gap-7">
        <ModuleSidebar currentKey={currentKey} />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
      <MobileDrawer open={drawerOpen} currentKey={currentKey} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

function HomeTopBar() {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-zinc-200">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-zinc-900">
          <span className="w-6 h-6 rounded-md bg-zinc-900 text-white text-xs flex items-center justify-center font-extrabold">A</span>
          <span className="text-sm tracking-tight">Atelier</span>
        </Link>
        <span className="hidden sm:inline text-xs text-zinc-500 ml-1">· 内容创作工作台</span>
        <div className="flex-1" />
        <button className="hidden sm:inline-flex btn-ghost !p-2" aria-label="通知">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 ring-2 ring-white" />
      </div>
    </header>
  );
}

function ModuleTopBar({ currentKey }: { currentKey: ModuleKey }) {
  const m = MODULES[currentKey];
  const toggleDrawer = useAppStore((s) => s.toggleDrawer);
  const drawerOpen = useAppStore((s) => s.drawerOpen);

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-zinc-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-zinc-900">
          <span className="w-6 h-6 rounded-md bg-zinc-900 text-white text-xs flex items-center justify-center font-extrabold">A</span>
          <span className="text-sm tracking-tight hidden xs:inline">Atelier</span>
        </Link>
        <span className="text-xs text-zinc-300">/</span>
        <span className={classNames('text-sm font-semibold', m.text)}>{m.name}</span>
        <div className="flex-1" />
        <Link to="/" className="hidden sm:inline-flex btn-ghost !text-xs gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> 回首页
        </Link>
        <button className="hidden sm:inline-flex btn-ghost !p-2" aria-label="通知">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 ring-2 ring-white" />
        <button
          className="lg:hidden btn-ghost !p-2"
          onClick={toggleDrawer}
          aria-label="菜单"
        >
          {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}

function ModuleSidebar({ currentKey }: { currentKey: ModuleKey }) {
  if (currentKey === 'home') return null;
  const m = MODULES[currentKey];
  const Icon = m.icon;
  const groups = MODULE_NAV[currentKey as Exclude<ModuleKey, 'home'>];

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0">
      <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 mb-3">
        <ChevronLeft className="w-3.5 h-3.5" /> 回首页
      </Link>
      <div className="card p-4 mb-3">
        <div className={classNames('w-9 h-9 rounded-lg flex items-center justify-center text-white', m.bg)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <p className={classNames('mt-2.5 text-sm font-bold', m.text)}>{m.name}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{m.description}</p>
      </div>
      <nav className="space-y-4">
        {groups.map((g) => (
          <NavGroupBlock key={g.label} group={g} accent={m} />
        ))}
      </nav>
    </aside>
  );
}

function NavGroupBlock({ group, accent }: { group: NavGroup; accent: typeof MODULES.library }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-zinc-400 px-3 pb-1.5 font-semibold">
        {group.label}
      </p>
      <ul className="space-y-0.5">
        {group.items.map((it) => {
          const brand = it.brand ? BRANDS[it.brand] : null;
          const BrandIcon = brand?.Icon;
          if (it.to) {
            return (
              <li key={it.label}>
                <NavLink
                  to={it.to}
                  className={({ isActive }) =>
                    classNames(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition',
                      isActive ? `${accent.tint} ${accent.text} font-semibold` : 'text-zinc-600 hover:bg-white hover:text-zinc-900',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {BrandIcon ? (
                        <BrandIcon className={classNames('w-3.5 h-3.5', brand!.text)} />
                      ) : (
                        <span className={classNames('w-1.5 h-1.5 rounded-full', isActive ? accent.bg : 'bg-zinc-300')} />
                      )}
                      <span className="flex-1">{it.label}</span>
                      {it.badge !== undefined && (
                        <span className={classNames(
                          'text-[10px] font-semibold tabular',
                          isActive ? accent.text : 'text-zinc-400',
                        )}>{it.badge}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          }
          return (
            <li key={it.label}>
              <span className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-zinc-400 cursor-not-allowed">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                <span className="flex-1">{it.label}</span>
                <span className="text-[9px] tracking-wider font-semibold text-zinc-300">SOON</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MobileDrawer({
  open,
  currentKey,
  onClose,
}: {
  open: boolean;
  currentKey: ModuleKey;
  onClose: () => void;
}) {
  if (currentKey === 'home') return null;
  const m = MODULES[currentKey];
  const Icon = m.icon;
  const groups = MODULE_NAV[currentKey as Exclude<ModuleKey, 'home'>];

  return (
    <>
      <div
        className={classNames(
          'lg:hidden fixed inset-0 z-40 bg-zinc-900/40 transition-opacity',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />
      <div
        className={classNames(
          'lg:hidden fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl flex flex-col transition-transform',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="h-14 px-5 flex items-center justify-between border-b border-zinc-200">
          <span className="text-sm font-bold">导航</span>
          <button onClick={onClose} className="btn-ghost !p-2" aria-label="关闭">
            <X className="w-5 h-5" />
          </button>
        </div>
        <Link to="/" className="px-5 py-3 text-xs text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> 回首页
        </Link>
        <div className="px-5 pb-2">
          <div className="card p-3">
            <div className={classNames('w-8 h-8 rounded-lg flex items-center justify-center text-white', m.bg)}>
              <Icon className="w-4 h-4" />
            </div>
            <p className={classNames('mt-2 text-sm font-bold', m.text)}>{m.name}</p>
            <p className="text-xs text-zinc-500">{m.description}</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {groups.map((g) => (
            <NavGroupBlock key={g.label} group={g} accent={m} />
          ))}
        </nav>
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 text-xs text-zinc-500 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span>© Atelier 原型</span>
        <span className="text-zinc-300">·</span>
        <span>所有数据均为 mock · AI 生成为模拟流式</span>
      </div>
    </footer>
  );
}
