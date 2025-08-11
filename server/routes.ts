import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDriverSchema, insertRaceSchema, insertRaceResultSchema, insertPointsConfigurationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Driver routes
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const driverData = insertDriverSchema.parse(req.body);
      const driver = await storage.createDriver(driverData);
      res.json(driver);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid driver data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create driver" });
      }
    }
  });

  app.put("/api/drivers/:id", async (req, res) => {
    try {
      const updates = insertDriverSchema.partial().parse(req.body);
      const driver = await storage.updateDriver(req.params.id, updates);
      if (!driver) {
        res.status(404).json({ message: "Driver not found" });
        return;
      }
      res.json(driver);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid driver data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update driver" });
      }
    }
  });

  app.delete("/api/drivers/:id", async (req, res) => {
    try {
      const success = await storage.deleteDriver(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Driver not found" });
        return;
      }
      res.json({ message: "Driver deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete driver" });
    }
  });

  // Race routes
  app.get("/api/races", async (req, res) => {
    try {
      const races = await storage.getRaces();
      res.json(races);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch races" });
    }
  });

  app.post("/api/races", async (req, res) => {
    try {
      const raceData = insertRaceSchema.parse(req.body);
      const race = await storage.createRace(raceData);
      res.json(race);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid race data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create race" });
      }
    }
  });

  // Race results routes
  app.get("/api/race-results", async (req, res) => {
    try {
      const results = await storage.getRaceResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch race results" });
    }
  });

  app.get("/api/race-results/race/:raceId", async (req, res) => {
    try {
      const results = await storage.getRaceResultsByRace(req.params.raceId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch race results" });
    }
  });

  const createRaceResultsSchema = z.object({
    raceId: z.string(),
    results: z.array(insertRaceResultSchema.omit({ raceId: true }))
  });

  app.post("/api/race-results", async (req, res) => {
    try {
      const { raceId, results } = createRaceResultsSchema.parse(req.body);
      
      // Get active points configuration
      const pointsConfig = await storage.getActivePointsConfiguration();
      if (!pointsConfig) {
        res.status(400).json({ message: "No active points configuration found" });
        return;
      }

      const createdResults = [];
      for (const resultData of results) {
        // Calculate base points from position
        let basePoints = 0;
        if (resultData.position && resultData.position > 0 && resultData.position <= pointsConfig.positionPoints.length) {
          basePoints = pointsConfig.positionPoints[resultData.position - 1] || 0;
        }

        const result = await storage.createRaceResult({
          ...resultData,
          raceId,
          basePoints,
        });
        createdResults.push(result);
      }
      
      res.json(createdResults);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid race results data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create race results" });
      }
    }
  });

  // Points configuration routes
  app.get("/api/points-configurations", async (req, res) => {
    try {
      const configurations = await storage.getPointsConfigurations();
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch points configurations" });
    }
  });

  app.get("/api/points-configurations/active", async (req, res) => {
    try {
      const config = await storage.getActivePointsConfiguration();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active points configuration" });
    }
  });

  app.post("/api/points-configurations", async (req, res) => {
    try {
      const configData = insertPointsConfigurationSchema.parse(req.body);
      const config = await storage.createPointsConfiguration(configData);
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid points configuration data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create points configuration" });
      }
    }
  });

  app.put("/api/points-configurations/:id", async (req, res) => {
    try {
      const updates = insertPointsConfigurationSchema.partial().parse(req.body);
      const config = await storage.updatePointsConfiguration(req.params.id, updates);
      if (!config) {
        res.status(404).json({ message: "Points configuration not found" });
        return;
      }
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid points configuration data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update points configuration" });
      }
    }
  });

  app.put("/api/points-configurations/:id/activate", async (req, res) => {
    try {
      const success = await storage.setActivePointsConfiguration(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Points configuration not found" });
        return;
      }
      res.json({ message: "Points configuration activated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to activate points configuration" });
    }
  });

  // Championship standings
  app.get("/api/championship-standings", async (req, res) => {
    try {
      const standings = await storage.getChampionshipStandings();
      res.json(standings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch championship standings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
