import Notification from "../models/Notification";

export function findPendingByCompany(companyId: string) {
  return Notification.find({ companyId, type: "call", status: "pending" })
    .populate("patientId", "name")
    .exec()
    .then((list) =>
      list.map((n) => ({
        id: n._id.toString(),
        patientId: n.patientId._id.toString(),
        patientName: n.patientId.name,
        createdAt: n.createdAt.toISOString(),
        isCalled: n.status === "done",
        note: n.note ?? "",
      }))
    );
}

export function create(data: any) {
  // create a new notification
  return new Notification(data).save();
}

export function markDone(companyId: string, notificationId: string) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, companyId },
    { status: "done" }
  ).exec();
}

export async function processAllPending() {
  const now = new Date();
  const pending = await Notification.find({
    scheduledFor: { $lte: now },
    sent: false,
  }).exec();
  for (const msg of pending) {
    // you might delegate to a service here
    msg.status = "done";
    msg.sent = true;
    msg.sentAt = new Date();
    await msg.save();
  }
}
