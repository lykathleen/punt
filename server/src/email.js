export async function sendMagicLink({ email, magicLink }) {
  const isProduction = process.env.NODE_ENV === "production";

  function logDevelopmentLink() {
    console.log(`Magic login link for ${email}: ${magicLink}`);
  }

  if (!process.env.RESEND_API_KEY) {
    logDevelopmentLink();
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Punt <onboarding@resend.dev>",
        to: email,
        subject: "Your Punt login link",
        html: `<p>Click this link to log in to Punt:</p><p><a href="${magicLink}">${magicLink}</a></p><p>This link expires in 15 minutes.</p>`
      })
    });

    if (response.ok) {
      return;
    }

    if (isProduction) {
      throw new Error("Unable to send login email.");
    }

    console.warn(`Resend could not send the login email. Status: ${response.status}`);
    logDevelopmentLink();
  } catch (error) {
    if (isProduction) {
      throw error;
    }

    console.warn(`Resend could not send the login email. ${error.message}`);
    logDevelopmentLink();
  }
}
