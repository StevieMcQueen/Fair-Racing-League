import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, PlusIcon, FlagIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRaceSchema, type Race, type InsertRace } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RaceSchedule() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: races = [], isLoading } = useQuery<Race[]>({
    queryKey: ["/api/races"],
  });

  const addRaceForm = useForm<InsertRace>({
    resolver: zodResolver(insertRaceSchema),
    defaultValues: {
      name: "",
      date: new Date(),
      weather: "",
    },
  });

  const addRaceMutation = useMutation({
    mutationFn: (data: InsertRace) => apiRequest("POST", "/api/races", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/races"] });
      setIsAddDialogOpen(false);
      addRaceForm.reset();
      toast({
        title: "Success",
        description: "Race added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add race",
        variant: "destructive",
      });
    },
  });

  const onAddRace = (data: InsertRace) => {
    addRaceMutation.mutate(data);
  };

  const getWeatherBadge = (weather: string | null) => {
    if (!weather) return "bg-gray-100 text-gray-800";
    switch (weather.toLowerCase()) {
      case "dry":
        return "bg-yellow-100 text-yellow-800";
      case "wet":
        return "bg-blue-100 text-blue-800";
      case "mixed":
      case "mixed conditions":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRaceStatus = (date: Date) => {
    const now = new Date();
    const raceDate = new Date(date);
    
    if (raceDate < now) {
      return { status: "Completed", color: "bg-green-100 text-green-800" };
    } else if (raceDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return { status: "Upcoming", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { status: "Scheduled", color: "bg-blue-100 text-blue-800" };
    }
  };

  // Sort races by date (most recent first)
  const sortedRaces = [...races].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Race Schedule</h2>
              <p className="text-gray-500">Manage the racing calendar</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-racing-blue hover:bg-blue-700">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Race
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Race</DialogTitle>
                </DialogHeader>
                <Form {...addRaceForm}>
                  <form onSubmit={addRaceForm.handleSubmit(onAddRace)} className="space-y-4">
                    <FormField
                      control={addRaceForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Race Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Monaco Grand Prix" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addRaceForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Race Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field}
                              value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addRaceForm.control}
                      name="weather"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weather Conditions (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select weather conditions" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dry">Dry</SelectItem>
                              <SelectItem value="wet">Wet</SelectItem>
                              <SelectItem value="mixed conditions">Mixed Conditions</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addRaceMutation.isPending}>
                        {addRaceMutation.isPending ? "Adding..." : "Add Race"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="p-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading race schedule...
          </div>
        ) : races.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No races scheduled</h3>
              <p className="text-gray-500 mb-4">Create your first race to get started with the championship.</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add First Race
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRaces.map((race) => {
              const raceStatus = getRaceStatus(race.date);
              const raceDate = new Date(race.date);
              
              return (
                <Card key={race.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-racing-blue rounded-lg flex items-center justify-center">
                          <FlagIcon className="text-white h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{race.name}</CardTitle>
                          <p className="text-sm text-gray-500">
                            {raceDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge className={raceStatus.color}>
                        {raceStatus.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Date & Time</span>
                      <span className="text-sm font-medium">
                        {raceDate.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    
                    {race.weather && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Weather</span>
                        <Badge className={getWeatherBadge(race.weather)}>
                          {race.weather}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className="text-sm font-medium">
                        {raceStatus.status === "Completed" ? "Results Available" :
                         raceStatus.status === "Upcoming" ? "Starting Soon" : "Future Event"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
