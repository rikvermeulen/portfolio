import { notifyContactSubmission } from "./contact.ts";

const sendNotification = jest.fn();

jest.mock("@/vendors/ntfy/index.ts", () => ({
  sendNotification: (...args: unknown[]) => sendNotification(...args),
}));

describe("notifyContactSubmission", () => {
  beforeEach(() => {
    sendNotification.mockReset();
    sendNotification.mockResolvedValue({ ok: true });
  });

  it("sends a formatted contact submission notification", async () => {
    const result = await notifyContactSubmission(
      {
        name: "Jane Doe",
        phone: "+31612345678",
        reason: "Wants to talk about a project",
        email: "jane@example.com",
      },
      "2026-07-14T10:00:00.000Z",
    );

    expect(result).toEqual({ ok: true });
    expect(sendNotification).toHaveBeenCalledWith(
      [
        "From: Jane Doe",
        "Phone: +31612345678",
        "Email: jane@example.com",
        "Message: Wants to talk about a project",
        "Sent: 2026-07-14T10:00:00.000Z",
      ].join("\n"),
      "New contact request",
    );
  });
});
