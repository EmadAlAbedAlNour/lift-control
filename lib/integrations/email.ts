interface PasswordResetEmailInput {
  email: string;
  name: string;
  resetUrl: string;
}

interface SendResult {
  delivered: boolean;
  reason?: string;
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    console.info(
      `[email:mock] Password reset email for ${input.email}. URL: ${input.resetUrl}`
    );

    return {
      delivered: false,
      reason: "missing_resend_config"
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: input.email,
      subject: "Lift Control - Password Reset",
      html: `
        <p>مرحبا ${input.name},</p>
        <p>تم طلب إعادة تعيين كلمة المرور الخاصة بحسابك في Lift Control.</p>
        <p><a href="${input.resetUrl}">اضغط هنا لإعادة التعيين</a></p>
        <p>إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>
      `
    })
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Email delivery failed", body);

    return {
      delivered: false,
      reason: "resend_request_failed"
    };
  }

  return {
    delivered: true
  };
}
