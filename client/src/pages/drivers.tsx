import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusIcon, UsersIcon, EditIcon, TrashIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDriverSchema, type Driver, type InsertDriver } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Drivers() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const { toast } = useToast();

  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const addDriverForm = useForm<InsertDriver>({
    resolver: zodResolver(insertDriverSchema),
    defaultValues: {
      name: "",
      team: "",
      nationality: "",
      isActive: 1,
    },
  });

  const editDriverForm = useForm<InsertDriver>({
    resolver: zodResolver(insertDriverSchema),
    defaultValues: {
      name: "",
      team: "",
      nationality: "",
      isActive: 1,
    },
  });

  const addDriverMutation = useMutation({
    mutationFn: (data: InsertDriver) => apiRequest("POST", "/api/drivers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setIsAddDialogOpen(false);
      addDriverForm.reset();
      toast({
        title: "Success",
        description: "Driver added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add driver",
        variant: "destructive",
      });
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertDriver> }) =>
      apiRequest("PUT", `/api/drivers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setEditingDriver(null);
      editDriverForm.reset();
      toast({
        title: "Success",
        description: "Driver updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update driver",
        variant: "destructive",
      });
    },
  });

  const deleteDriverMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/drivers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      toast({
        title: "Success",
        description: "Driver deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete driver",
        variant: "destructive",
      });
    },
  });

  const onAddDriver = (data: InsertDriver) => {
    addDriverMutation.mutate(data);
  };

  const onUpdateDriver = (data: InsertDriver) => {
    if (editingDriver) {
      updateDriverMutation.mutate({ id: editingDriver.id, data });
    }
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    editDriverForm.reset({
      name: driver.name,
      team: driver.team,
      nationality: driver.nationality,
      isActive: driver.isActive,
    });
  };

  const handleDeleteDriver = (id: string) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      deleteDriverMutation.mutate(id);
    }
  };

  return (
    <div>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Drivers</h2>
              <p className="text-gray-500">Manage race drivers and teams</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-racing-blue hover:bg-blue-700">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Driver</DialogTitle>
                </DialogHeader>
                <Form {...addDriverForm}>
                  <form onSubmit={addDriverForm.handleSubmit(onAddDriver)} className="space-y-4">
                    <FormField
                      control={addDriverForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Driver Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Lewis Hamilton" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addDriverForm.control}
                      name="team"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Mercedes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addDriverForm.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., United Kingdom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addDriverMutation.isPending}>
                        {addDriverMutation.isPending ? "Adding..." : "Add Driver"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Loading drivers...
            </div>
          ) : drivers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No drivers found. Add your first driver to get started.
            </div>
          ) : (
            drivers.map((driver) => (
              <Card key={driver.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-racing-blue rounded-lg flex items-center justify-center">
                        <UsersIcon className="text-white h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{driver.name}</CardTitle>
                        <p className="text-sm text-gray-500">{driver.nationality}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditDriver(driver)}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDriver(driver.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Team</span>
                      <span className="font-medium">{driver.team}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <Badge variant={driver.isActive ? "default" : "secondary"}>
                        {driver.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Driver Dialog */}
        <Dialog open={!!editingDriver} onOpenChange={() => setEditingDriver(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Driver</DialogTitle>
            </DialogHeader>
            <Form {...editDriverForm}>
              <form onSubmit={editDriverForm.handleSubmit(onUpdateDriver)} className="space-y-4">
                <FormField
                  control={editDriverForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Lewis Hamilton" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editDriverForm.control}
                  name="team"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mercedes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editDriverForm.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., United Kingdom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingDriver(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateDriverMutation.isPending}>
                    {updateDriverMutation.isPending ? "Updating..." : "Update Driver"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
