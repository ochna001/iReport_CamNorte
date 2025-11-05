import { AlertTriangle } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
}

export function Logo({ size = "md", variant = "default" }: LogoProps) {
  const sizes = {
    sm: { container: "h-8", icon: "w-5 h-5", text: "text-sm" },
    md: { container: "h-12", icon: "w-8 h-8", text: "text-xl" },
    lg: { container: "h-20", icon: "w-12 h-12", text: "text-3xl" }
  };

  const colors = {
    default: { bg: "bg-green-600", text: "text-gray-900", accent: "text-green-600" },
    white: { bg: "bg-white", text: "text-white", accent: "text-white" }
  };

  const s = sizes[size];
  const c = colors[variant];

  return (
    <div className="flex items-center gap-3">
      <div className={`${s.container} ${s.icon} ${c.bg} rounded-lg flex items-center justify-center shadow-md`}>
        <AlertTriangle className={`${s.icon} text-white`} />
      </div>
      <div className="flex flex-col">
        <span className={`${s.text} ${c.text} font-bold leading-tight`}>
          iReport
        </span>
        <span className={`text-xs ${variant === 'white' ? 'text-gray-300' : 'text-gray-600'} leading-tight`}>
          Camarines Norte
        </span>
      </div>
    </div>
  );
}
