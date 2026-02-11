"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    BriefcaseIcon, 
    HomeIcon, 
    SettingsIcon 
} from "lucide-react"; // Start usage of lucide-react if available or simple SVGs

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "🏠" },
    { label: "Jobs", href: "/jobs", icon: "💼" },
    { label: "Settings", href: "/settings", icon: "⚙️" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white pt-2 pb-6 px-4 dark:bg-black dark:border-gray-800 z-50">
      <div className="mx-auto flex max-w-md justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${
                isActive
                  ? "text-black dark:text-white"
                  : "text-gray-400 dark:text-gray-600 hover:text-gray-600"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
