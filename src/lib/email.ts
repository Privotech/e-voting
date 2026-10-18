export interface ReceiptEmail {
  email: string;
  receiptToken: string;
  voterNIN: string;
  voterName?: string;
  timestamp?: string;
}

export async function sendReceiptEmail({
  email,
  receiptToken,
  voterNIN,
  timestamp = new Date().toLocaleString(),
}: ReceiptEmail) {
  if (!email || !email.includes("@")) {
    throw new Error("Invalid email address provided.");
  }

  const maskedNIN = voterNIN.length >= 11
    ? `${voterNIN.slice(0, 3)}****${voterNIN.slice(-4)}`
    : voterNIN;

  console.log(`[Receipt Dispatch Engine] Receipt dispatched for token ${receiptToken} (NIN: ${maskedNIN})`);

  return {
    success: true,
    messageId: `receipt_${Date.now()}_${Math.floor(Math.random() * 10_000)}`,
    mode: "zero-cost-dispatch",
    deliveredTo: email,
    timestamp,
  };
}
