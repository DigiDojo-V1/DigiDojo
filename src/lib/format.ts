/** ₹12,550 with Indian digit grouping. Signed: −₹12,550 / +₹150. */
export function formatRupees(
  amount: number,
  { signed = false }: { signed?: boolean } = {},
): string {
  const sign = !signed || amount === 0 ? "" : amount < 0 ? "−" : "+";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}
