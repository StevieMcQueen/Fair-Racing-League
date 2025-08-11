import { Link, useLocation } from "wouter";
import { FlagIcon, TrophyIcon, ListOrderedIcon, UsersIcon, CalendarIcon, SettingsIcon, GaugeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: GaugeIcon },
  { name: "Race Results", href: "/race-results", icon: TrophyIcon },
  { name: "Championship Standings", href: "/championship-standings", icon: ListOrderedIcon },
  { name: "Drivers", href: "/drivers", icon: UsersIcon },
  { name: "Race Schedule", href: "/race-schedule", icon: CalendarIcon },
  { name: "Points Configuration", href: "/points-configuration", icon: SettingsIcon },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg fixed h-full z-10">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-racing-blue rounded-lg flex items-center justify-center">
            <FlagIcon className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Racing League</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      isActive
                        ? "bg-racing-blue text-white"
                        : "text-gray-700 hover:bg-gray-100",
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
