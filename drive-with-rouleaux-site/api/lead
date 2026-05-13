export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      message: "Missing Brevo API key on server.",
    });
  }

  try {
    const lead = req.body;

    const response = await fetch(
      "https://api.brevo.com/v3/contacts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          email: lead.email,
          attributes: {
            FIRSTNAME: lead.name,
            SMS: lead.phone,
          },
          listIds: lead.newsletterOptIn ? [2] : [],
          updateEnabled: true,
        }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return res.status(400).json({
        message: text,
      });
    }

    return res.status(200).json({
      message: "Lead saved successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}
