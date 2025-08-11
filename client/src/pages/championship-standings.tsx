import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CrownIcon, TrophyIcon, UsersIcon, DownloadIcon } from "lucide-react";
import type { ChampionshipStanding } from "@shared/schema";

export default function ChampionshipStandings() {
  const { data: standings = [], isLoading } = useQuery<ChampionshipStanding[]>({
    queryKey: ["/api/championship-standings"],
  });

  const getPositionBadge = (position: number) => {
    if (position === 1) return "bg-yellow-400 text-gray-900";
    if (position === 2) return "bg-gray-300 text-gray-900";
    if (position === 3) return "bg-orange-400 text-white";
    if (position <= 10) return "bg-racing-blue text-white";
    return "bg-gray-100 text-gray-900";
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <CrownIcon className="w-4 h-4" />;
    if (position <= 3) return <TrophyIcon className="w-4 h-4" />;
    return null;
  };

  if (isLoading) {
    return (
      <div>
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Championship Standings</h2>
                <p className="text-gray-500">Current season driver standings</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="text-center py-12 text-gray-500">
            Loading championship standings...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Championship Standings</h2>
              <p className="text-gray-500">Current season driver standings</p>
            </div>
            <Button variant="outline">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export Standings
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {standings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No championship data</h3>
              <p className="text-gray-500">Add some race results to see championship standings.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Championship Leader Card */}
            {standings[0] && (
              <Card className="border-championship-orange border-2 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CrownIcon className="h-6 w-6 text-championship-orange" />
                    <span>Championship Leader</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-championship-orange rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">1</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{standings[0].driver.name}</h3>
                        <p className="text-lg text-gray-600">{standings[0].driver.team}</p>
                        <p className="text-sm text-gray-500">{standings[0].driver.nationality}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-championship-orange">{standings[0].totalPoints}</div>
                      <div className="text-sm text-gray-500">points</div>
                      <div className="text-sm text-gray-500">{standings[0].races} races</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Standings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Full Championship Standings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nationality</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Races</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {standings.map((standing) => (
                        <tr 
                          key={standing.driver.id} 
                          className={`hover:bg-gray-50 ${standing.position <= 3 ? 'bg-yellow-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Badge className={getPositionBadge(standing.position)}>
                                {standing.position}
                              </Badge>
                              {getPositionIcon(standing.position)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <UsersIcon className="text-gray-600 h-5 w-5" />
                              </div>
                              <div className="text-sm font-medium text-gray-900">{standing.driver.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{standing.driver.team}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{standing.driver.nationality}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{standing.races}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{standing.totalPoints}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {standing.races > 0 ? (standing.totalPoints / standing.races).toFixed(1) : "0.0"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Championship Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Drivers</p>
                      <p className="text-2xl font-bold text-gray-900">{standings.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UsersIcon className="text-racing-blue h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Points Gap</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {standings.length >= 2 ? standings[0].totalPoints - standings[1].totalPoints : 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrophyIcon className="text-championship-orange h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Highest Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {standings.length > 0 ? standings[0].totalPoints : 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <CrownIcon className="text-championship-orange h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
