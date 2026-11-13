export const plantaActionTypes = [
  "watering",
  "fertilizing",
  "misting",
  "cleaning",
  "repotting",
  "progressUpdate",
] as const;

export type PlantaActionType = (typeof plantaActionTypes)[number];

export interface PlantaTokenSet {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly tokenType?: string;
}

export interface PlantaActionRecord {
  readonly date?: string;
  readonly type?: string;
}

export interface PlantaActionState {
  readonly next?: PlantaActionRecord | null;
  readonly completed?: PlantaActionRecord | null;
}

export interface PlantaPlant {
  readonly id: string;
  readonly health?: string;
  readonly names?: {
    readonly custom?: string;
    readonly localizedName?: string;
    readonly scientific?: string;
    readonly variety?: string;
  };
  readonly site?: {
    readonly name?: string;
  };
  readonly image?: {
    readonly url?: string;
    readonly lastUpdated?: string;
  };
  readonly actions?: Partial<Record<PlantaActionType, PlantaActionState>>;
}
