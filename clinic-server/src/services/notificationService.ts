import * as repo from "../dataAccess/notificationRepository";

export function getNotifications(companyId: string) {
  return repo.findPendingByCompany(companyId);
}

export function markPatientCalled(companyId: string, notificationId: string) {
  return repo.markDone(companyId, notificationId);
}

export function processPending() {
  return repo.processAllPending();
}
