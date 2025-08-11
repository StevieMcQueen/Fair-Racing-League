import { type Driver, type InsertDriver, type Race, type InsertRace, type RaceResult, type InsertRaceResult, type PointsConfiguration, type InsertPointsConfiguration, type RaceResultWithDetails, type ChampionshipStanding } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Drivers
  getDrivers(): Promise<Driver[]>;
  getDriver(id: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: string, driver: Partial<InsertDriver>): Promise<Driver | undefined>;
  deleteDriver(id: string): Promise<boolean>;

  // Races
  getRaces(): Promise<Race[]>;
  getRace(id: string): Promise<Race | undefined>;
  createRace(race: InsertRace): Promise<Race>;
  updateRace(id: string, race: Partial<InsertRace>): Promise<Race | undefined>;
  deleteRace(id: string): Promise<boolean>;

  // Race Results
  getRaceResults(): Promise<RaceResult[]>;
  getRaceResultsByRace(raceId: string): Promise<RaceResultWithDetails[]>;
  getRaceResult(id: string): Promise<RaceResult | undefined>;
  createRaceResult(result: InsertRaceResult): Promise<RaceResult>;
  updateRaceResult(id: string, result: Partial<InsertRaceResult>): Promise<RaceResult | undefined>;
  deleteRaceResult(id: string): Promise<boolean>;

  // Points Configuration
  getPointsConfigurations(): Promise<PointsConfiguration[]>;
  getActivePointsConfiguration(): Promise<PointsConfiguration | undefined>;
  createPointsConfiguration(config: InsertPointsConfiguration): Promise<PointsConfiguration>;
  updatePointsConfiguration(id: string, config: Partial<InsertPointsConfiguration>): Promise<PointsConfiguration | undefined>;
  setActivePointsConfiguration(id: string): Promise<boolean>;

  // Championship Standings
  getChampionshipStandings(): Promise<ChampionshipStanding[]>;
}

export class MemStorage implements IStorage {
  private drivers: Map<string, Driver>;
  private races: Map<string, Race>;
  private raceResults: Map<string, RaceResult>;
  private pointsConfigurations: Map<string, PointsConfiguration>;

  constructor() {
    this.drivers = new Map();
    this.races = new Map();
    this.raceResults = new Map();
    this.pointsConfigurations = new Map();
    
    // Initialize with default points configuration
    this.initializeDefaultPointsConfiguration();
  }

  private initializeDefaultPointsConfiguration() {
    const defaultConfig: PointsConfiguration = {
      id: randomUUID(),
      name: "Default F1 Points System",
      isActive: 1,
      positionPoints: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      bonusRules: {
        fastestLap: 1,
        polePosition: 1,
        mostOvertakes: 2,
      },
      penaltyRules: {
        racingIncident: 5,
        trackLimits: 2,
      },
      createdAt: new Date(),
    };
    this.pointsConfigurations.set(defaultConfig.id, defaultConfig);
  }

  async getDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values()).filter(driver => driver.isActive === 1);
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const id = randomUUID();
    const driver: Driver = { 
      ...insertDriver, 
      id,
      createdAt: new Date()
    };
    this.drivers.set(id, driver);
    return driver;
  }

  async updateDriver(id: string, updates: Partial<InsertDriver>): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (!driver) return undefined;
    
    const updatedDriver: Driver = { ...driver, ...updates };
    this.drivers.set(id, updatedDriver);
    return updatedDriver;
  }

  async deleteDriver(id: string): Promise<boolean> {
    const driver = this.drivers.get(id);
    if (!driver) return false;
    
    // Soft delete
    const updatedDriver: Driver = { ...driver, isActive: 0 };
    this.drivers.set(id, updatedDriver);
    return true;
  }

  async getRaces(): Promise<Race[]> {
    return Array.from(this.races.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getRace(id: string): Promise<Race | undefined> {
    return this.races.get(id);
  }

  async createRace(insertRace: InsertRace): Promise<Race> {
    const id = randomUUID();
    const race: Race = { 
      ...insertRace, 
      id,
      createdAt: new Date()
    };
    this.races.set(id, race);
    return race;
  }

  async updateRace(id: string, updates: Partial<InsertRace>): Promise<Race | undefined> {
    const race = this.races.get(id);
    if (!race) return undefined;
    
    const updatedRace: Race = { ...race, ...updates };
    this.races.set(id, updatedRace);
    return updatedRace;
  }

  async deleteRace(id: string): Promise<boolean> {
    return this.races.delete(id);
  }

  async getRaceResults(): Promise<RaceResult[]> {
    return Array.from(this.raceResults.values());
  }

  async getRaceResultsByRace(raceId: string): Promise<RaceResultWithDetails[]> {
    const results = Array.from(this.raceResults.values())
      .filter(result => result.raceId === raceId)
      .sort((a, b) => (a.position || 999) - (b.position || 999));
    
    const resultsWithDetails: RaceResultWithDetails[] = [];
    for (const result of results) {
      const driver = this.drivers.get(result.driverId);
      const race = this.races.get(result.raceId);
      if (driver && race) {
        resultsWithDetails.push({ ...result, driver, race });
      }
    }
    
    return resultsWithDetails;
  }

  async getRaceResult(id: string): Promise<RaceResult | undefined> {
    return this.raceResults.get(id);
  }

  async createRaceResult(insertResult: InsertRaceResult): Promise<RaceResult> {
    const id = randomUUID();
    const totalPoints = insertResult.basePoints + insertResult.bonusPoints - insertResult.penaltyPoints;
    
    const result: RaceResult = { 
      ...insertResult, 
      id,
      totalPoints: Math.max(0, totalPoints), // Ensure points don't go negative
      createdAt: new Date()
    };
    this.raceResults.set(id, result);
    return result;
  }

  async updateRaceResult(id: string, updates: Partial<InsertRaceResult>): Promise<RaceResult | undefined> {
    const result = this.raceResults.get(id);
    if (!result) return undefined;
    
    const updatedResult: RaceResult = { ...result, ...updates };
    const totalPoints = updatedResult.basePoints + updatedResult.bonusPoints - updatedResult.penaltyPoints;
    updatedResult.totalPoints = Math.max(0, totalPoints);
    
    this.raceResults.set(id, updatedResult);
    return updatedResult;
  }

  async deleteRaceResult(id: string): Promise<boolean> {
    return this.raceResults.delete(id);
  }

  async getPointsConfigurations(): Promise<PointsConfiguration[]> {
    return Array.from(this.pointsConfigurations.values());
  }

  async getActivePointsConfiguration(): Promise<PointsConfiguration | undefined> {
    return Array.from(this.pointsConfigurations.values()).find(config => config.isActive === 1);
  }

  async createPointsConfiguration(insertConfig: InsertPointsConfiguration): Promise<PointsConfiguration> {
    const id = randomUUID();
    const config: PointsConfiguration = { 
      ...insertConfig, 
      id,
      createdAt: new Date()
    };
    this.pointsConfigurations.set(id, config);
    return config;
  }

  async updatePointsConfiguration(id: string, updates: Partial<InsertPointsConfiguration>): Promise<PointsConfiguration | undefined> {
    const config = this.pointsConfigurations.get(id);
    if (!config) return undefined;
    
    const updatedConfig: PointsConfiguration = { ...config, ...updates };
    this.pointsConfigurations.set(id, updatedConfig);
    return updatedConfig;
  }

  async setActivePointsConfiguration(id: string): Promise<boolean> {
    const config = this.pointsConfigurations.get(id);
    if (!config) return false;
    
    // Deactivate all configurations
    for (const [configId, config] of this.pointsConfigurations.entries()) {
      config.isActive = 0;
      this.pointsConfigurations.set(configId, config);
    }
    
    // Activate the selected configuration
    config.isActive = 1;
    this.pointsConfigurations.set(id, config);
    return true;
  }

  async getChampionshipStandings(): Promise<ChampionshipStanding[]> {
    const standings = new Map<string, ChampionshipStanding>();
    
    // Initialize standings for all active drivers
    for (const driver of this.drivers.values()) {
      if (driver.isActive === 1) {
        standings.set(driver.id, {
          driver,
          totalPoints: 0,
          position: 0,
          races: 0,
        });
      }
    }
    
    // Calculate points from race results
    for (const result of this.raceResults.values()) {
      const standing = standings.get(result.driverId);
      if (standing) {
        standing.totalPoints += result.totalPoints;
        standing.races += 1;
      }
    }
    
    // Sort by points and assign positions
    const sortedStandings = Array.from(standings.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((standing, index) => ({
        ...standing,
        position: index + 1,
      }));
    
    return sortedStandings;
  }
}

export const storage = new MemStorage();
