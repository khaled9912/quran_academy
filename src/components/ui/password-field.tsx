"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const PasswordField = ({ className, ...rest }: Props) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative">
      <input
        {...rest}
        type={revealed ? "text" : "password"}
        className={cn(className, "pr-11")}
      />
      <button
        type="button"
        onClick={() => setRevealed((value) => !value)}
        aria-label={revealed ? "Hide password" : "Show password"}
        aria-pressed={revealed}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground opacity-60 transition hover:opacity-100"
      >
        {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};
