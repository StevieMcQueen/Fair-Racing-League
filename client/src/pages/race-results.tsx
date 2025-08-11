import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrophyIcon, PlusIcon } from "lucide-react";
import { Link } from "wouter";
import type { Race, RaceResultWithDetails } from "@shared/schema";
import RaceEntryForm from "@/components/race-entry-form";

export default function RaceResults() {
  const [selectedRaceId, setSelectedRaceId] = useState<string>("");
  const [showEntryForm, setShowEntryForm] = useState(false);

  const { data: races = [] } = useQuery<Race[]>({
    queryKey: ["/api/races"],
  });

  const { data: raceResults = [] } = useQuery<RaceResultWithDetails[]>({
    queryKey: ["/api/race-results/race", selectedRaceId],
    enabled: !!selectedRaceId,
  });

  const selectedRace = races.find(race => race.id === selectedRaceId);

  const getPositionBadge = (position: number | null) => {
    if (!position) return "bg-gray-100 text-gray-900";
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

  if (showEntryForm) {
    return <RaceEntryForm onBack={() => setShowEntryForm(false)} />;
  }

  return (
    <div>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Race Results</h2>
              <p className="text-gray-500">View and manage race results</p>
            </div>
            <Button 
              className="bg-racing-blue hover:bg-blue-700"
              onClick={() => setShowEntryForm(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Race Result
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Race</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedRaceId} onValueChange={setSelectedRaceId}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Choose a race" />
                </SelectTrigger>
                <SelectContent>
                  {races.map((race) => (
                    <SelectItem key={race.id} value={race.id}>
                      {race.name} - {new Date(race.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedRaceId && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <TrophyIcon className="h-5 w-5" />
                      <span>{selectedRace?.name}</span>
                    </CardTitle>
                    <p className="text-gray-500 mt-1">
                      {selectedRace && new Date(selectedRace.date).toLocaleDateString()} 
                      {selectedRace?.weather && ` • ${selectedRace.weather} conditions`}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {raceResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Points</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fairness</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {raceResults.map((result) => (
                          <tr key={result.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getPositionBadge(result.position)}>
                                {result.position || "DNF"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{result.driver.name}</div>
                              <div className="text-sm text-gray-500">{result.driver.nationality}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.driver.team}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{result.basePoints}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+{result.bonusPoints}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">+{result.fairnessPoints || 5}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">-{result.penaltyPoints}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{result.totalPoints}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusBadge(result.status)}>
                                {result.status.toUpperCase()}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No results available for this race
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!selectedRaceId && races.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No races found</h3>
                <p className="text-gray-500 mb-4">Create a race schedule first, then add results.</p>
                <Link href="/race-schedule">
                  <Button variant="outline">Go to Race Schedule</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {!selectedRaceId && races.length > 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a race to view results</h3>
                <p className="text-gray-500">Choose a race from the dropdown above to see its results.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
