import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertRaceSchema, type Driver, type Race, type PointsConfiguration, type InsertRace } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const raceResultSchema = z.object({
  driverId: z.string().min(1, "Driver is required"),
  position: z.number().min(1).max(50).optional(),
  status: z.enum(["finished", "dnf", "dsq"]),
  bonusPoints: z.number().min(0).default(0),
  penaltyPoints: z.number().min(0).default(0),
});

const raceEntryFormSchema = z.object({
  raceId: z.string().optional(),
  newRace: z.object({
    name: z.string().min(1, "Race name is required"),
    date: z.date(),
    weather: z.string().optional(),
  }).optional(),
  useNewRace: z.boolean().default(false),
  results: z.array(raceResultSchema).min(1, "At least one driver result is required"),
});

type RaceEntryFormData = z.infer<typeof raceEntryFormSchema>;

interface RaceEntryFormProps {
  onBack: () => void;
}

export default function RaceEntryForm({ onBack }: RaceEntryFormProps) {
  const { toast } = useToast();

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: races = [] } = useQuery<Race[]>({
    queryKey: ["/api/races"],
  });

  const { data: pointsConfig } = useQuery<PointsConfiguration>({
    queryKey: ["/api/points-configurations/active"],
  });

  const form = useForm<RaceEntryFormData>({
    resolver: zodResolver(raceEntryFormSchema),
    defaultValues: {
      useNewRace: false,
      results: [
        {
          driverId: "",
          position: undefined,
          status: "finished",
          bonusPoints: 0,
          penaltyPoints: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "results",
  });

  const createRaceMutation = useMutation({
    mutationFn: (data: InsertRace) => apiRequest("POST", "/api/races", data),
  });

  const createResultsMutation = useMutation({
    mutationFn: (data: { raceId: string; results: any[] }) =>
      apiRequest("POST", "/api/race-results", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/race-results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/championship-standings"] });
      toast({
        title: "Success",
        description: "Race results saved successfully",
      });
      onBack();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save race results",
        variant: "destructive",
      });
    },
  });

  const watchUseNewRace = form.watch("useNewRace");

  const calculateBasePoints = (position: number | undefined): number => {
    if (!position || !pointsConfig || position > pointsConfig.positionPoints.length) {
      return 0;
    }
    return pointsConfig.positionPoints[position - 1] || 0;
  };

  const onSubmit = async (data: RaceEntryFormData) => {
    try {
      let raceId = data.raceId;

      // Create new race if needed
      if (data.useNewRace && data.newRace) {
        const newRace = await createRaceMutation.mutateAsync(data.newRace);
        raceId = newRace.id;
      }

      if (!raceId) {
        toast({
          title: "Error",
          description: "Please select a race or create a new one",
          variant: "destructive",
        });
        return;
      }

      // Prepare results data
      const resultsData = data.results.map((result) => ({
        driverId: result.driverId,
        position: result.position,
        status: result.status,
        basePoints: calculateBasePoints(result.position),
        bonusPoints: result.bonusPoints,
        penaltyPoints: result.penaltyPoints,
      }));

      await createResultsMutation.mutateAsync({
        raceId,
        results: resultsData,
      });
    } catch (error) {
      console.error("Error submitting race results:", error);
    }
  };

  const addDriverRow = () => {
    append({
      driverId: "",
      position: undefined,
      status: "finished",
      bonusPoints: 0,
      penaltyPoints: 0,
    });
  };

  const clearForm = () => {
    form.reset();
  };

  const usedDriverIds = form.watch("results").map(result => result.driverId).filter(Boolean);

  return (
    <div>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Race Entry</h2>
                <p className="text-gray-500">Enter results for a race</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Race Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="useNewRace"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded"
                        />
                        <Label>Create new race</Label>
                      </div>
                    </FormItem>
                  )}
                />

                {watchUseNewRace ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="newRace.name"
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
                      control={form.control}
                      name="newRace.date"
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
                      control={form.control}
                      name="newRace.weather"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weather Conditions</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select weather" />
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
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="raceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Race</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a race" />
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
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Driver Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Position</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Driver</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Status</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Base Points</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Bonus</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Penalty</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => {
                        const position = form.watch(`results.${index}.position`);
                        const basePoints = calculateBasePoints(position);
                        
                        return (
                          <tr key={field.id} className="border-b border-gray-100">
                            <td className="py-2 px-3">
                              <FormField
                                control={form.control}
                                name={`results.${index}.position`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="50"
                                        className="w-20"
                                        placeholder="P1"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="py-2 px-3">
                              <FormField
                                control={form.control}
                                name={`results.${index}.driverId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="min-w-[160px]">
                                          <SelectValue placeholder="Select driver" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {drivers
                                          .filter(driver => !usedDriverIds.includes(driver.id) || driver.id === field.value)
                                          .map((driver) => (
                                            <SelectItem key={driver.id} value={driver.id}>
                                              {driver.name}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="py-2 px-3">
                              <FormField
                                control={form.control}
                                name={`results.${index}.status`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="finished">Finished</SelectItem>
                                        <SelectItem value="dnf">DNF</SelectItem>
                                        <SelectItem value="dsq">DSQ</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Input
                                type="number"
                                className="w-20 bg-gray-100"
                                value={basePoints}
                                readOnly
                              />
                            </td>
                            <td className="py-2 px-3">
                              <FormField
                                control={form.control}
                                name={`results.${index}.bonusPoints`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        className="w-20"
                                        placeholder="0"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="py-2 px-3">
                              <FormField
                                control={form.control}
                                name={`results.${index}.penaltyPoints`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        className="w-20"
                                        placeholder="0"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="py-2 px-3">
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => remove(index)}
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <Button type="button" variant="outline" onClick={addDriverRow}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Driver
                  </Button>
                  <div className="text-sm text-gray-500">
                    Points auto-calculated based on position
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={clearForm}>
                Clear
              </Button>
              <Button 
                type="submit" 
                disabled={createResultsMutation.isPending}
                className="bg-racing-blue hover:bg-blue-700"
              >
                <SaveIcon className="w-4 h-4 mr-2" />
                {createResultsMutation.isPending ? "Saving..." : "Save Race Results"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
