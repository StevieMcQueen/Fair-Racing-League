import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SettingsIcon, SaveIcon, RotateCcwIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPointsConfigurationSchema, type PointsConfiguration, type InsertPointsConfiguration } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const defaultPositionPoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const defaultBonusRules = {
  fastestLap: 1,
  polePosition: 1,
  fairnessBonus: 2,
};
const defaultPenaltyRules = {
  racingIncident: 5,
  trackLimits: 2,
};

export default function PointsConfiguration() {
  const [showAllPositions, setShowAllPositions] = useState(false);
  const { toast } = useToast();

  const { data: activeConfig, isLoading } = useQuery<PointsConfiguration>({
    queryKey: ["/api/points-configurations/active"],
  });

  const form = useForm<InsertPointsConfiguration>({
    resolver: zodResolver(insertPointsConfigurationSchema),
    defaultValues: {
      name: "Custom Points System",
      isActive: 1,
      positionPoints: defaultPositionPoints,
      bonusRules: defaultBonusRules,
      penaltyRules: defaultPenaltyRules,
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertPointsConfiguration> }) =>
      apiRequest("PUT", `/api/points-configurations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/points-configurations/active"] });
      toast({
        title: "Success",
        description: "Points configuration updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update points configuration",
        variant: "destructive",
      });
    },
  });

  // Initialize form with active config data
  useEffect(() => {
    if (activeConfig) {
      form.reset({
        name: activeConfig.name,
        isActive: activeConfig.isActive,
        positionPoints: activeConfig.positionPoints,
        bonusRules: activeConfig.bonusRules,
        penaltyRules: activeConfig.penaltyRules,
      });
    }
  }, [activeConfig, form]);

  const onSaveConfiguration = (data: InsertPointsConfiguration) => {
    if (activeConfig) {
      updateConfigMutation.mutate({ id: activeConfig.id, data });
    }
  };

  const resetToDefault = () => {
    form.reset({
      name: "Default F1 Points System",
      isActive: 1,
      positionPoints: defaultPositionPoints,
      bonusRules: defaultBonusRules,
      penaltyRules: defaultPenaltyRules,
    });
    toast({
      title: "Reset",
      description: "Configuration reset to default values",
    });
  };

  const resetPositionToDefault = (position: number) => {
    const currentPoints = form.getValues("positionPoints");
    const newPoints = [...currentPoints];
    newPoints[position - 1] = defaultPositionPoints[position - 1];
    form.setValue("positionPoints", newPoints);
  };

  if (isLoading) {
    return (
      <div>
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Points Configuration</h2>
              <p className="text-gray-500">Configure the points scoring system</p>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="text-center py-12 text-gray-500">
            Loading points configuration...
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
              <h2 className="text-2xl font-bold text-gray-900">Points Configuration</h2>
              <p className="text-gray-500">Configure how points are awarded for race positions</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Current: {activeConfig?.name || "No configuration"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSaveConfiguration)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="h-5 w-5" />
                  <span>Points System Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Position Points */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Position Points</h4>
                    <div className="space-y-3">
                      {(showAllPositions ? Array.from({ length: 24 }, (_, i) => i + 1) : [1, 2, 3, 4, 5]).map((position) => (
                        <div key={position} className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-1">
                              {position === 1 ? "1st" : position === 2 ? "2nd" : position === 3 ? "3rd" : `${position}th`}
                            </Label>
                            <Input value={`P${position}`} className="bg-gray-100" readOnly />
                          </div>
                          <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-1">Points</Label>
                            <FormField
                              control={form.control}
                              name={`positionPoints.${position - 1}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0" 
                                      value={field.value || 0}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm"
                              onClick={() => resetPositionToDefault(position)}
                            >
                              <RotateCcwIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {!showAllPositions && (
                        <div className="text-center pt-4">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowAllPositions(true)}
                          >
                            Configure All Positions (4th-24th)
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bonus & Penalty Points */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Bonus & Penalty Rules</h4>
                    <div className="space-y-6">
                      {/* Bonus Points */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Bonus Points</h5>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Fastest Lap</p>
                              <p className="text-sm text-gray-500">Awarded to driver with fastest lap time</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FormField
                                control={form.control}
                                name="bonusRules.fastestLap"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0" 
                                        className="w-16"
                                        {...field}
                                        value={field.value || 0}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <span className="text-sm text-gray-500">pts</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Pole Position</p>
                              <p className="text-sm text-gray-500">Starting from P1</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FormField
                                control={form.control}
                                name="bonusRules.polePosition"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0" 
                                        className="w-16"
                                        {...field}
                                        value={field.value || 0}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <span className="text-sm text-gray-500">pts</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Fairness Bonus</p>
                              <p className="text-sm text-gray-500">Awarded for fair racing (default: 5 points per driver)</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FormField
                                control={form.control}
                                name="bonusRules.fairnessBonus"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0" 
                                        className="w-16"
                                        {...field}
                                        value={field.value || 0}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <span className="text-sm text-gray-500">pts</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Penalty Points */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Penalty Points</h5>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Racing Incident</p>
                              <p className="text-sm text-gray-500">Avoidable contact or unsafe driving</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FormField
                                control={form.control}
                                name="penaltyRules.racingIncident"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0" 
                                        className="w-16"
                                        {...field}
                                        value={field.value || 0}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <span className="text-sm text-gray-500">pts</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Track Limits</p>
                              <p className="text-sm text-gray-500">Exceeding track boundaries</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FormField
                                control={form.control}
                                name="penaltyRules.trackLimits"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0" 
                                        className="w-16"
                                        {...field}
                                        value={field.value || 0}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <span className="text-sm text-gray-500">pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetToDefault}>
                    <RotateCcwIcon className="w-4 h-4 mr-2" />
                    Reset to Default
                  </Button>
                  <Button type="submit" disabled={updateConfigMutation.isPending}>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </main>
    </div>
  );
}
