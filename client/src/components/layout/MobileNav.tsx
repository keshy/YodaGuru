import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="md:hidden bg-white shadow-md sticky top-0 z-10">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center">
          <span className="material-icons text-primary">auto_awesome</span>
          <h1 className="font-heading font-semibold text-lg ml-2">Spiritual Connect</h1>
        </div>
        <div className="flex items-center">
          <button className="p-2" onClick={onMenuClick}>
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden">
      <div ref={menuRef} className="bg-white w-64 h-full overflow-y-auto p-4 transform transition-transform">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <span className="material-icons text-primary">auto_awesome</span>
            <h1 className="font-heading font-semibold text-lg ml-2">Spiritual Connect</h1>
          </div>
          <button onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {/* User Profile Section */}
        {user && (
          <div className="flex items-center mb-6 px-2">
            <img 
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}`}
              alt="User profile" 
              className="w-10 h-10 rounded-full object-cover border"
            />
            <div className="ml-3">
              <p className="font-heading font-medium text-sm">{user.firstName} {user.lastName}</p>
              <p className="text-neutral-darker text-xs">{user.email}</p>
            </div>
          </div>
        )}
        
        <nav>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link href={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg ${
                    location === item.path
                      ? "bg-primary-light/10 text-primary-dark font-medium"
                      : "text-neutral-darker hover:bg-neutral-light transition-colors"
                  }`}
                  onClick={onClose}
                >
                  <span className="material-icons mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pt-6 border-t border-neutral-DEFAULT mt-6">
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-3 rounded-lg text-neutral-darker hover:bg-neutral-light transition-colors"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            <span className="material-icons mr-3">logout</span>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MobileBottomNavProps {
  onMoreClick: () => void;
}

function MobileBottomNav({ onMoreClick }: MobileBottomNavProps) {
  const [location] = useLocation();
  
  const mainNavItems = NAV_ITEMS.slice(0, 4); // Home, Priest, Explore, Calendar
  
  return (
    <nav className="md:hidden bg-white shadow-lg py-2 px-4 fixed bottom-0 w-full flex justify-between items-center z-10">
      {mainNavItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <a className={`flex flex-col items-center ${
            location === item.path ? "text-primary" : "text-neutral-darker"
          }`}>
            <span className="material-icons">{item.icon}</span>
            <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
          </a>
        </Link>
      ))}
      
      <button 
        className="flex flex-col items-center text-neutral-darker"
        onClick={onMoreClick}
      >
        <span className="material-icons">menu</span>
        <span className="text-xs mt-1">More</span>
      </button>
    </nav>
  );
}

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);
  
  return (
    <>
      <MobileHeader onMenuClick={openMenu} />
      <MobileMenu isOpen={menuOpen} onClose={closeMenu} />
      <MobileBottomNav onMoreClick={openMenu} />
    </>
  );
}
