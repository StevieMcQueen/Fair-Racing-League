import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlagIcon, UsersIcon, CrownIcon, CalendarIcon, PlusIcon, DownloadIcon } from "lucide-react";
import { Link } from "wouter";
import type { ChampionshipStanding, Race, RaceResultWithDetails } from "@shared/schema";

export default function Dashboard() {
  const { data: standings = [], isLoading: standingsLoading } = useQuery<ChampionshipStanding[]>({
    queryKey: ["/api/championship-standings"],
  });

  const { data: races = [] } = useQuery<Race[]>({
    queryKey: ["/api/races"],
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
  });

  // Get the most recent race results
  const latestRace = races[0];
  const { data: recentResults = [] } = useQuery<RaceResultWithDetails[]>({
    queryKey: ["/api/race-results/race", latestRace?.id],
    enabled: !!latestRace,
  });

  const leader = standings[0];
  const nextRace = races.find(race => new Date(race.date) > new Date());

  const getPositionBadge = (position: number) => {
    if (position === 1) return "bg-yellow-400 text-gray-900";
    if (position === 2) return "bg-gray-300 text-gray-900";
    if (position === 3) return "bg-orange-400 text-white";
    return "bg-gray-100 text-gray-900";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "finished":
        return "bg-green-100 text-green-800";
      case "dnf":
        return "bg-red-100 text-red-800";
      case "dsq":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-500">Season 2024 Overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/race-results">
                <Button className="bg-racing-blue hover:bg-blue-700">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Race Result
                </Button>
              </Link>
              <Button variant="outline">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Races</p>
                  <p className="text-2xl font-bold text-gray-900">{races.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FlagIcon className="text-racing-blue h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="text-green-600 h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Championship Leader</p>
                  <p className="text-lg font-bold text-gray-900">{leader?.driver.name || "No data"}</p>
                  <p className="text-sm text-gray-500">{leader?.totalPoints || 0} points</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <CrownIcon className="text-championship-orange h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Race</p>
                  <p className="text-lg font-bold text-gray-900">{nextRace?.name || "TBD"}</p>
                  <p className="text-sm text-gray-500">
                    {nextRace ? new Date(nextRace.date).toLocaleDateString() : "No races scheduled"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="text-purple-600 h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Race Results */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Race Results</h3>
                  <Link href="/race-results">
                    <Button variant="ghost" size="sm" className="text-racing-blue hover:text-blue-700">
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                {recentResults.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentResults.slice(0, 5).map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getPositionBadge(result.position || 0)}>
                              {result.position || "N/A"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <UsersIcon className="text-gray-600 h-4 w-4" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{result.driver.name}</div>
                                <div className="text-sm text-gray-500">{result.driver.nationality}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.driver.team}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{result.totalPoints}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusBadge(result.status)}>
                              {result.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No race results available
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Championship Standings */}
          <div>
            <Card>
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Championship Standings</h3>
              </div>
              <div className="p-6 space-y-4">
                {standingsLoading ? (
                  <div className="text-center text-gray-500">Loading standings...</div>
                ) : standings.length > 0 ? (
                  standings.slice(0, 5).map((standing) => (
                    <div key={standing.driver.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Badge className={getPositionBadge(standing.position)}>
                          {standing.position}
                        </Badge>
                        <div>
                          <p className="font-medium text-gray-900">{standing.driver.name}</p>
                          <p className="text-sm text-gray-500">{standing.driver.team}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{standing.totalPoints}</p>
                        <p className="text-sm text-gray-500">pts</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    No standings data available
                  </div>
                )}
              </div>
              {standings.length > 5 && (
                <div className="p-6 pt-0">
                  <Link href="/championship-standings">
                    <Button variant="outline" className="w-full">
                      View Full Standings
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
