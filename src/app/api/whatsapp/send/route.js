export async function POST(req) {
  try {
    const { country, number, message } = await req.json();

    if (!country || !number || !message) {
      return Response.json(
        { error: "Missing country, number, or message" },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.WHATSAPP_SERVICE_URL}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(
          `${process.env.SERVICE_ADMIN_USER}:${process.env.SERVICE_ADMIN_PASS}`
        )}`,
      },
      body: JSON.stringify({
        country,
        number: number.toString().replace(/\D/g, ""),
        message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json(error, { status: response.status });
    }

    return Response.json(await response.json());
  } catch (error) {
    return Response.json(
      {
        error: "Failed to send message",
        solution: "Check the WhatsApp service status",
      },
      { status: 500 }
    );
  }
}
