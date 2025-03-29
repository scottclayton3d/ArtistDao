import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { useAuth, AuthProvider } from "./hooks/use-auth.tsx";
import { AuthResponse } from "./types";

import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Artist from "./pages/artist";
import Artists from "./pages/artists";
import Governance from "./pages/governance";
import CreateProposal from "./pages/create-proposal";
import Portfolio from "./pages/portfolio";
import Login from "./pages/login";
import Register from "./pages/register";
import Checkout from "./pages/checkout";
import NotFound from "./pages/not-found";
import ArtistRegistration from "./pages/artist-registration";
import LegalCompliancePage from "./pages/legal-compliance";
import { Layout } from "./components/layout/Layout";

function AppRoutes() {
  // Use the auth context
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <Layout user={user} onLogout={logout}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard">
          {() => <Dashboard authData={user ? { user, token: "" } : null} />}
        </Route>
        <Route path="/artists">
          {() => <Artists userId={user?.id} />}
        </Route>
        <Route path="/artists/:id">
          {(params) => <Artist id={params.id} userId={user?.id} />}
        </Route>
        <Route path="/artist-registration" component={ArtistRegistration} />
        <Route path="/governance">
          {() => <Governance userId={user?.id} />}
        </Route>
        <Route path="/create-proposal">
          {() => <CreateProposal userId={user?.id} />}
        </Route>
        <Route path="/portfolio">
          {() => <Portfolio userId={user?.id} />}
        </Route>
        <Route path="/login">
          {() => <Login />}
        </Route>
        <Route path="/register">
          {() => <Register />}
        </Route>
        <Route path="/checkout">
          {() => <Checkout />}
        </Route>
        <Route path="/legal-compliance" component={LegalCompliancePage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
