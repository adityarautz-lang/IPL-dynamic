export const trimTeamName = (name: string, maxLength: number = 12): string => {
  if (name.length <= maxLength) {
    return name;
  }
  return name.slice(0, maxLength) + "...";
};

export const splitTeamName = (
  name: string,
  maxPerLine: number = 8,
): string[] => {
  // First trim if too long
  const trimmed = name.length > 20 ? trimTeamName(name, 15) : name;

  // Split into two lines - try to split at space first
  if (trimmed.length <= maxPerLine) {
    return [trimmed, ""];
  }

  const spaceIndex = trimmed.lastIndexOf(" ", maxPerLine);
  if (spaceIndex > 0) {
    return [trimmed.slice(0, spaceIndex), trimmed.slice(spaceIndex + 1)];
  }

  // No space found, split at maxPerLine
  return [trimmed.slice(0, maxPerLine), trimmed.slice(maxPerLine)];
};
