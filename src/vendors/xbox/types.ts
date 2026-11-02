// --- OpenXBL (xbl.io) transport shapes (untrusted until validated) ---

/** One `{ id, value }` entry from a profile's `settings` array. */
export interface XboxSetting {
  readonly id: string;
  readonly value: string;
}

export interface XboxProfileUser {
  readonly id: string; // the XUID
  readonly settings?: readonly XboxSetting[];
}

/**
 * Response from GET /api/v2/account. OpenXBL returns the profile either at the
 * top level or wrapped in a `content` envelope depending on the endpoint/plan,
 * so both are modelled here.
 */
export interface XboxAccountResponse {
  readonly profileUsers?: readonly XboxProfileUser[];
  readonly content?: {
    readonly profileUsers?: readonly XboxProfileUser[];
  };
}

/** One title from GET /player/titleHistory. */
export interface XboxTitle {
  readonly titleId?: string;
  readonly name?: string;
  readonly displayImage?: string;
  readonly titleHistory?: {
    readonly lastTimePlayed?: string; // ISO timestamp
  };
}

/**
 * Title history shapes seen from OpenXBL: `titles` at the top level, wrapped in
 * `content.titles`, or `content` being the titles array itself.
 */
export interface XboxTitleHistoryResponse {
  readonly titles?: readonly XboxTitle[];
  readonly content?:
    readonly XboxTitle[] | { readonly titles?: readonly XboxTitle[] };
}
