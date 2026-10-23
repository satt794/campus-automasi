export async function sendTelegramMessage(
  chatId: string | number,
  message: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not defined in environment variables.");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("Telegram API error response:", data);
    }
    return Boolean(data.ok);
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}
