import type { ToggleOption } from "./ToggleGroup.types.ts";

export const mockAlbumOptions: readonly ToggleOption[] = [
  { value: "apps", label: "Apps", icon: "images" },
  { value: "map", label: "Map", icon: "map" },
  { value: "heart", label: "Heart", icon: "heart" },
  { value: "dog", label: "Dog", icon: "dog" },
];

export const mockTabOptions: readonly ToggleOption[] = [
  { value: "home", label: "Home" },
  { value: "files", label: "Files" },
  { value: "search", label: "Search" },
  { value: "settings", label: "Settings" },
];
