export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: body.messages,
    }),
  });
  const data = await response.json();
  const completion = data.choices[0].message;

  return Response.json(completion);
}
