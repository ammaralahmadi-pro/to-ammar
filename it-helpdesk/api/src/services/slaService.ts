/** يحسب مواعيد الاستحقاق (استجابة/حل) بناءً على دقائق SLA المرتبطة بأولوية التذكرة. */
export function computeSlaDueDates(createdAt: Date, responseSlaMinutes: number, resolutionSlaMinutes: number) {
  const responseDueAt = new Date(createdAt.getTime() + responseSlaMinutes * 60_000);
  const resolutionDueAt = new Date(createdAt.getTime() + resolutionSlaMinutes * 60_000);
  return { responseDueAt, resolutionDueAt };
}
