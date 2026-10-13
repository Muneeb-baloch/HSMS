"use client";

import { useEffect, useCallback, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAllStates } from "@/lib/hooks/entities/useState";
import { useCitiesByState, useCity } from "@/lib/hooks/entities/useCity";
import { cn } from "@/lib/utils";

export interface StateCitySelectProps {
  value: string; // cityId
  onChange: (cityId: string) => void;
  onStateChange?: (stateId: string | null) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  /** For edit mode: when we have cityId, fetch city to get stateId and pre-select */
  initialCityId?: string | null;
}

export function StateCitySelect({
  value,
  onChange,
  onStateChange,
  disabled = false,
  required = false,
  error,
  className,
  initialCityId,
}: StateCitySelectProps) {
  const [stateId, setStateId] = useState<string | null>(null);
  const { data: states = [], isLoading: statesLoading } = useAllStates();
  const { data: city } = useCity(initialCityId || "");

  const {
    data: cities = [],
    isLoading: citiesLoading,
  } = useCitiesByState(stateId);

  useEffect(() => {
    if (initialCityId && city && !stateId) {
      const sid =
        typeof city.stateId === "object" && city.stateId
          ? (city.stateId as { _id: string })._id
          : typeof city.stateId === "string"
            ? city.stateId
            : null;
      if (sid) {
        setStateId(sid);
        onStateChange?.(sid);
      }
    }
  }, [initialCityId, city, stateId, onStateChange]);

  const handleStateChange = useCallback(
    (newStateId: string) => {
      const sid = newStateId === "__none__" ? null : newStateId;
      setStateId(sid);
      onStateChange?.(sid);
      onChange("");
    },
    [onChange, onStateChange]
  );

  const handleCityChange = useCallback(
    (newCityId: string) => {
      onChange(newCityId === "__none__" ? "" : newCityId);
    },
    [onChange]
  );

  const stateValue = stateId || "__none__";
  const cityValue = value || "__none__";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className={cn(error && "text-destructive")}>
          State
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Select
          value={stateValue}
          onValueChange={handleStateChange}
          disabled={disabled || statesLoading}
        >
          <SelectTrigger
            className={cn(
              "enhanced-input h-11 w-full transition-all duration-200",
              "border-border bg-input/50 hover:bg-input/70",
              "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary",
              error && "border-destructive focus-visible:ring-destructive/50"
            )}
          >
            <SelectValue placeholder="Select state" />
            {statesLoading && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </SelectTrigger>
          <SelectContent className="border-border bg-popover/95 backdrop-blur-sm">
            <SelectItem value="__none__">Select state</SelectItem>
            {states.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.stateName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className={cn(error && "text-destructive")}>
          City
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Select
          value={cityValue}
          onValueChange={handleCityChange}
          disabled={disabled || !stateId || citiesLoading}
        >
          <SelectTrigger
            className={cn(
              "enhanced-input h-11 w-full transition-all duration-200",
              "border-border bg-input/50 hover:bg-input/70",
              "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary",
              (!stateId || citiesLoading) && "opacity-70",
              error && "border-destructive focus-visible:ring-destructive/50"
            )}
          >
            <SelectValue
              placeholder={
                !stateId
                  ? "Select state first"
                  : citiesLoading
                    ? "Loading cities..."
                    : cities.length === 0
                      ? "No cities found"
                      : "Select city"
              }
            />
            {citiesLoading && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </SelectTrigger>
          <SelectContent className="border-border bg-popover/95 backdrop-blur-sm">
            {cities.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No cities found
              </div>
            ) : (
              <>
                <SelectItem value="__none__">Select city</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.cityName}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
