import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/problems', label: 'Problems' },
  { to: '/discuss', label: 'Discuss' },
  { to: '/join-interview', label: 'Interview' },
];

const Header = () => {
  const [user,setuser]=useState(null);

  useEffect(()=>{
    const localuser=localStorage.getItem('user');
    if(localuser)setuser(JSON.parse(localuser));
  },[])

  const navClass = ({ isActive }) =>
    `rounded-full px-5 py-2.5 text-base font-black transition duration-200 ${
      isActive
        ? 'bg-slate-800 text-cyan-200 ring-1 ring-cyan-300/30'
        : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#05070d]/95 text-slate-300 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <NavLink to="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
            <img src="/logoicon.png" alt="CodeRover" className="h-7 w-7 object-contain" />
          </span>
          <span className="text-3xl font-black tracking-wide text-slate-100">CodeRover</span>
        </NavLink>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-800 bg-black/30 p-1 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <Link to="/profile" className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 py-1.5 pl-1.5 pr-4 transition hover:border-cyan-300/30">
              <img src={user.avatar || '/defaultuser.png'} alt="User" className="h-9 w-9 rounded-full border border-slate-700 object-cover"/>
              <span className="hidden text-base font-black text-slate-300 sm:inline">{user.username || 'user'}</span>
            </Link>
          ) : (
            <>
              <NavLink to="/login" className="hidden rounded-full px-4 py-2 text-base font-black text-slate-400 transition hover:bg-slate-900 hover:text-slate-200 sm:inline-flex">Login</NavLink>
              <NavLink to="/register" className="rounded-full bg-slate-200 px-5 py-2 text-base font-black text-slate-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-cyan-200">
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto border-t border-slate-800 px-4 py-3 lg:hidden">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Header;
