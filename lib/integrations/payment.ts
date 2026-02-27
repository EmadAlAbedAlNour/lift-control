interface InstallmentPaymentInput {
  projectId: string;
  customerName: string;
  totalAmount: number;
  firstInstallment: number;
  secondInstallment: number;
}

export async function createInstallmentPlan(input: InstallmentPaymentInput) {
  return {
    provider: process.env.PAYMENT_PROVIDER ?? "manual",
    projectId: input.projectId,
    status: "draft",
    terms: {
      firstInstallment: input.firstInstallment,
      secondInstallment: input.secondInstallment,
      note: "50% before installation and 50% after delivery"
    }
  };
}
