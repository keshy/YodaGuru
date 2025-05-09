import { Link, useLocation } from "wouter";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className={`hidden md:flex md:flex-col w-64 bg-white shadow-lg h-screen sticky top-0 px-4 py-6 ${className}`}>
      <div className="flex items-center mb-8">
        <span className="material-icons text-primary text-3xl">auto_awesome</span>
        <h1 className="font-heading font-semibold text-xl ml-2">Spiritual Connect</h1>
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
                      ? "bg-primary-light/10 text-primary-dark font-medium"
                      : "text-neutral-darker hover:bg-neutral-light transition-colors"
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
      
      <div className="pt-6 border-t border-neutral-DEFAULT mt-6">
        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-3 rounded-lg text-neutral-darker hover:bg-neutral-light transition-colors"
          onClick={logout}
        >
          <span className="material-icons mr-3">logout</span>
          Logout
        </Button>
      </div>
    </aside>
  );
}
