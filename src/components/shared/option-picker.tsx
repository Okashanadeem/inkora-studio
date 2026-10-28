'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatPKR } from '@/lib/money';
import { Label } from '@/components/ui/label';

export interface OptionValue {
  id?: string;
  label: string;
  price_modifier: number;
}

export interface OptionGroup {
  id?: string;
  name: string;
  option_values: OptionValue[];
}

export interface OptionPickerProps {
  options: OptionGroup[];
  selectedValues: Record<string, string>; // groupName -> valueLabel
  onSelectOption: (groupName: string, valueLabel: string) => void;
}

export function OptionPicker({ options, selectedValues, onSelectOption }: OptionPickerProps) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-5">
      {options.map((group) => {
        const currentSelected = selectedValues[group.name];

        return (
          <div key={group.name} className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <Label className="font-semibold text-foreground">{group.name}</Label>
              {currentSelected && (
                <span className="text-xs text-muted-foreground font-medium">{currentSelected}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {group.option_values.map((val) => {
                const isSelected = currentSelected === val.label;
                const hasModifier = val.price_modifier !== 0;

                return (
                  <button
                    key={val.label}
                    type="button"
                    onClick={() => onSelectOption(group.name, val.label)}
                    className={cn(
                      'px-3.5 py-2 rounded-lg border text-xs font-medium transition-all text-left flex items-center gap-2',
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                        : 'border-border bg-card text-foreground hover:bg-muted/50',
                    )}
                  >
                    <span>{val.label}</span>
                    {hasModifier && (
                      <span className="text-[11px] text-muted-foreground">
                        {val.price_modifier > 0
                          ? `+${formatPKR(val.price_modifier)}`
                          : `-${formatPKR(Math.abs(val.price_modifier))}`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
