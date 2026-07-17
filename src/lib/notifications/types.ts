/**
 * Contact details forwarded to Rik when a visitor finishes the Contact chat.
 * Declared here (not imported from the Contact module) so the notifications
 * layer stays free of UI dependencies.
 */
export interface ContactNotification {
  readonly name: string;
  readonly phone: string;
  readonly reason: string;
  readonly email: string;
}
