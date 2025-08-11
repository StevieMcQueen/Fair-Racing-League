import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Drivers from "@/pages/drivers";
import RaceResults from "@/pages/race-results";
import QualifyingResults from "@/pages/qualifying-results";
import ChampionshipStandings from "@/pages/championship-standings";
import RaceSchedule from "@/pages/race-schedule";
import PointsConfiguration from "@/pages/points-configuration";
import Sidebar from "@/components/sidebar";

function Router() {
  return (
    <div className="min-h-screen flex bg-gray-50 font-inter">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/drivers" component={Drivers} />
          <Route path="/race-results" component={RaceResults} />
          <Route path="/qualifying-results" component={QualifyingResults} />
          <Route path="/championship-standings" component={ChampionshipStandings} />
          <Route path="/race-schedule" component={RaceSchedule} />
          <Route path="/points-configuration" component={PointsConfiguration} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
