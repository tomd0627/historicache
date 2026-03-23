import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  try {
    const { base64, mediaType } = await request.json();

    if (!base64 || !mediaType) {
      return Response.json({ error: "Missing image data" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: `You are helping tag a historical site in a geocaching app.

Look at this photo and respond with a JSON object (no markdown, no code fences) with exactly four fields:
- "name": the specific name of the place if you can read it from signage or recognize it (e.g. "Baird's Tavern" or "Oak Hill Cemetery"). If you cannot determine a specific name, provide a short descriptive label like "Historic Stone Tavern" or "19th Century Brewery".
- "history": a 2-3 sentence historical description. Focus on what kind of place this is, its approximate era, and its historical significance. If it does not appear to be a historical site, say so briefly.
- "lat": the latitude of this specific site as a number if you can confidently identify the exact real-world location, otherwise null.
- "lng": the longitude of this specific site as a number if you can confidently identify the exact real-world location, otherwise null.

Only provide lat/lng if you are confident about the specific location — it is better to return null than to guess.

Example response:
{"name":"Baird's Tavern","history":"Baird's Tavern is a historic stone tavern located in Warwick, New York, dating to the early 19th century. It served as a local gathering place along a regional trade route and is a well-preserved example of Federal-style rural tavern architecture. The building remains in use today as a bar and restaurant.","lat":41.2512,"lng":-74.3607}`,
            },
          ],
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    let name = "";
    let history = "";
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const parsed = JSON.parse(raw);
      name = parsed.name ?? "";
      history = parsed.history ?? "";
      lat = typeof parsed.lat === "number" ? parsed.lat : null;
      lng = typeof parsed.lng === "number" ? parsed.lng : null;
    } catch {
      // If Claude didn't return clean JSON, use the raw text as history only
      history = raw;
    }

    return Response.json({ name, history, lat, lng });
  } catch (err) {
    console.error("AI identify error:", err);
    return Response.json(
      { error: "AI identification failed" },
      { status: 500 }
    );
  }
}
