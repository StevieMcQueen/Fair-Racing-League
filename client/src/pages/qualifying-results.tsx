import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, Trophy, Users } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Race, Driver, QualifyingResultWithDetails } from "@shared/schema";

const qualifyingFormSchema = z.object({
  raceId: z.string().min(1, "Please select a race"),
  results: z.array(z.object({
    driverId: z.string().min(1, "Driver is required"),
    position: z.coerce.number().min(1).max(30),
    lapTime: z.string().optional(),
  })),
});

type QualifyingFormData = z.infer<typeof qualifyingFormSchema>;

export default function QualifyingResults() {
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch data
  const { data: races = [], isLoading: racesLoading } = useQuery<Race[]>({
    queryKey: ["/api/races"],
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: qualifyingResults = [], isLoading: resultsLoading } = useQuery<QualifyingResultWithDetails[]>({
    queryKey: ["/api/qualifying-results/race", selectedRace],
    enabled: !!selectedRace,
  });

  // Form setup
  const form = useForm<QualifyingFormData>({
    resolver: zodResolver(qualifyingFormSchema),
    defaultValues: {
      raceId: "",
      results: [],
    },
  });

  // Initialize form with drivers when dialog opens
  const handleDialogOpen = () => {
    if (drivers.length > 0) {
      const initialResults = drivers.map((driver, index) => ({
        driverId: driver.id,
        position: index + 1,
        lapTime: "",
      }));
      form.setValue("results", initialResults);
    }
    setIsDialogOpen(true);
  };

  // Submit qualifying results
  const submitQualifyingMutation = useMutation({
    mutationFn: (data: QualifyingFormData) => 
      apiRequest("/api/qualifying-results", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qualifying-results"] });
      toast({
        title: "Success",
        description: "Qualifying results submitted successfully!",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit qualifying results",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QualifyingFormData) => {
    submitQualifyingMutation.mutate(data);
  };

  const formatLapTime = (lapTime: string | null) => {
    if (!lapTime) return "-";
    return lapTime;
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return "bg-yellow-100 text-yellow-800";
    if (position === 2) return "bg-gray-100 text-gray-800";
    if (position === 3) return "bg-orange-100 text-orange-800";
    return "bg-blue-50 text-blue-700";
  };

  if (racesLoading || driversLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Qualifying Results</h1>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Qualifying Results</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleDialogOpen}>
              <Clock className="h-4 w-4 mr-2" />
              Record Qualifying
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Qualifying Results</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="raceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Race</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a race" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {races.map((race) => (
                            <SelectItem key={race.id} value={race.id}>
                              {race.name} - {new Date(race.date).toLocaleDateString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Driver Results</h3>
                  {form.watch("results").map((result, index) => {
                    const driver = drivers.find(d => d.id === result.driverId);
                    return (
                      <div key={result.driverId} className="grid grid-cols-4 gap-4 items-end p-4 border rounded">
                        <div>
                          <label className="text-sm font-medium">Driver</label>
                          <p className="font-semibold">{driver?.name}</p>
                        </div>
                        <FormField
                          control={form.control}
                          name={`results.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" max="30" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`results.${index}.lapTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Best Lap Time</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="1:23.456" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitQualifyingMutation.isPending}>
                    {submitQualifyingMutation.isPending ? "Submitting..." : "Submit Results"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-race">By Race</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Races</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{races.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{drivers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qualifying Sessions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {races.filter(race => 
                    qualifyingResults.some(result => result.raceId === race.id)
                  ).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Qualifying Sessions</CardTitle>
              <CardDescription>Latest qualifying results across all races</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {races.slice(0, 5).map(race => {
                  const raceQualifying = qualifyingResults.filter(result => result.raceId === race.id);
                  return (
                    <div key={race.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{race.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(race.date).toLocaleDateString()}
                        </span>
                      </div>
                      {raceQualifying.length > 0 ? (
                        <div className="text-sm text-green-600">
                          Qualifying completed ({raceQualifying.length} drivers)
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No qualifying results yet
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-race">
          <div className="space-y-6">
            <div>
              <Select value={selectedRace} onValueChange={setSelectedRace}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select a race to view qualifying results" />
                </SelectTrigger>
                <SelectContent>
                  {races.map((race) => (
                    <SelectItem key={race.id} value={race.id}>
                      {race.name} - {new Date(race.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRace && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Qualifying Results - {races.find(r => r.id === selectedRace)?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resultsLoading ? (
                    <div className="text-center py-4">Loading results...</div>
                  ) : qualifyingResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No qualifying results recorded for this race yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {qualifyingResults
                        .sort((a, b) => a.position - b.position)
                        .map((result) => (
                          <div key={result.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center space-x-4">
                              <Badge className={getPositionColor(result.position)}>
                                {result.position}
                              </Badge>
                              <div>
                                <p className="font-semibold">{result.driver.name}</p>
                                {result.driver.team && (
                                  <p className="text-sm text-muted-foreground">{result.driver.team}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono">
                                {formatLapTime(result.lapTime)}
                              </p>
                              {result.position === 1 && (
                                <Badge variant="secondary" className="text-xs">
                                  Pole Position
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}