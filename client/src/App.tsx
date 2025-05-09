import { Switch, Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import PriestMode from "@/pages/PriestMode";
import Explore from "@/pages/Explore";
import Calendar from "@/pages/Calendar";
import Contribute from "@/pages/Contribute";
import Preferences from "@/pages/Preferences";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, checkSession } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return <Component />;
}

function App() {
  const { checkSession } = useAuth();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <Layout>
          <ProtectedRoute component={Home} />
        </Layout>
      </Route>
      
      <Route path="/priest-mode">
        <Layout>
          <ProtectedRoute component={PriestMode} />
        </Layout>
      </Route>
      
      <Route path="/explore">
        <Layout>
          <ProtectedRoute component={Explore} />
        </Layout>
      </Route>
      
      <Route path="/calendar">
        <Layout>
          <ProtectedRoute component={Calendar} />
        </Layout>
      </Route>
      
      <Route path="/contribute">
        <Layout>
          <ProtectedRoute component={Contribute} />
        </Layout>
      </Route>
      
      <Route path="/preferences">
        <Layout>
          <ProtectedRoute component={Preferences} />
        </Layout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
