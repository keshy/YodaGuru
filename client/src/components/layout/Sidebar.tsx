import { Link, useLocation } from "wouter";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className={`hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 shadow-lg h-screen sticky top-0 px-4 py-6 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <span className="material-icons text-primary text-3xl">auto_awesome</span>
          <h1 className="font-heading font-semibold text-xl ml-2">Spiritual Connect</h1>
        </div>
        <ThemeToggle />
      </div>
      
      {/* User Profile Section */}
      {user && (
        <div className="flex items-center mb-8 px-4">
          <img 
            src={user.profilePicture || "https://ui-avatars.com/api/?name=" + user.firstName} 
            alt="User profile" 
            className="w-10 h-10 rounded-full object-cover border"
          />
          <div className="ml-3">
            <p className="font-heading font-medium text-sm">{user.firstName} {user.lastName}</p>
            <p className="text-neutral-darker text-xs">{user.email}</p>
          </div>
        </div>
      )}
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a 
                  className={`flex items-center px-4 py-3 rounded-lg ${
                    location === item.path
                      ? "bg-primary-light/10 dark:bg-primary-dark/30 text-primary-dark dark:text-primary-light font-medium"
                      : "text-neutral-darker hover:bg-neutral-light dark:hover:bg-gray-700 transition-colors"
                  }`}
                >
                  <span className="material-icons mr-3">{item.icon}</span>
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="pt-6 border-t border-neutral-DEFAULT dark:border-gray-700 mt-6">
        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-3 rounded-lg text-neutral-darker hover:bg-neutral-light dark:hover:bg-gray-700 transition-colors"
          onClick={logout}
        >
          <span className="material-icons mr-3">logout</span>
          Logout
        </Button>
      </div>
    </aside>
  );
}
