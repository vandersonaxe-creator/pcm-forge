import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  collapsed?: boolean;
}

export function BrandLogo({ className, collapsed }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "transition-all duration-300",
          collapsed ? "h-8 w-8" : "h-10 w-10"
        )}
      >
        {/* Modern Gear Arc */}
        <path
          d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15V22C34.54 22 22 34.54 22 50C22 65.46 34.54 78 50 78C65.46 78 78 65.46 78 50H85Z"
          fill="currentColor"
          className="text-white/20"
        />
        
        {/* Stylized Anvil (Modern Tech style) */}
        <path
          d="M35 40H65C68 40 70 42 70 45V50L75 65H25L30 50V45C30 42 32 40 35 40Z"
          fill="currentColor"
          className="text-white"
        />
        
        {/* Amber Precision Point */}
        <rect x="42" y="32" width="16" height="4" rx="2" fill="currentColor" className="text-amber-500" />
        <path
          d="M48 68V75H52V68H48Z"
          fill="currentColor"
          className="text-amber-500"
        />
        
        {/* Glow Element */}
        <circle cx="50" cy="45" r="4" fill="currentColor" className="text-amber-500 blur-[2px] opacity-60" />
        <circle cx="50" cy="45" r="2" fill="currentColor" className="text-amber-500" />
      </svg>
    </div>
  );
}
