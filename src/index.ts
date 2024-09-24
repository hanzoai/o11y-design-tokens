import { Color } from "./Color";
import { Spacing } from "./Spacing";
import { Typography } from "./Typography";

export { Color, Spacing, Typography };

export function generateCSSVariables(): string {
  const generateVars = (obj: Record<string, string>) =>
    Object.entries(obj).map(([key, value]) => {
      const cssVarName = `--${key.toLowerCase().replace(/_/g, "-")}`;
      return `${cssVarName}: ${value};`;
    });

  const allVars = [
    ...generateVars(Color),
    ...generateVars(Typography),
    ...generateVars(Spacing),
  ];

  return `:root {\n  ${allVars.join("\n  ")}\n}`;
}
