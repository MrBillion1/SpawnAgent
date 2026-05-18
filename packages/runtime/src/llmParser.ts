export const parseAgentDescription = async (userDescription: string) => {
  const provider = process.env.LLM_PROVIDER || 'claude'; // 'claude', 'gemini', 'openrouter'
  
  const systemPrompt = `You are an agent config parser. Output ONLY valid JSON. Required fields: goal (string), trigger_type (price_threshold|schedule|wallet_event), trigger_value (number or cron string), action_type (alert|swap|move_funds|monitor), action_params (object), alert_channel (telegram|none), frequency (string), agent_type (yield_guardian|dca_agent|wallet_sentinel|custom). Never include explanations. Output the JSON object only.`;

  if (provider === 'claude') {
    return await callClaude(userDescription, systemPrompt);
  } else if (provider === 'gemini') {
    return await callGemini(userDescription, systemPrompt);
  } else if (provider === 'openrouter') {
    return await callOpenRouter(userDescription, systemPrompt);
  } else {
    throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
  }
};

const cleanJSON = (text: string) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
};

const callClaude = async (userDescription: string, systemPrompt: string) => {
  if (!process.env.CLAUDE_API_KEY) throw new Error("CLAUDE_API_KEY is not set.");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userDescription }]
    })
  });
  const data = await response.json();
  if (data.error) throw new Error("Claude API Error: " + data.error.message);
  return JSON.parse(cleanJSON(data.content[0].text));
};

const callGemini = async (userDescription: string, systemPrompt: string) => {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userDescription }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });
  const data = await response.json();
  if (data.error) throw new Error("Gemini API Error: " + data.error.message);
  return JSON.parse(cleanJSON(data.candidates[0].content.parts[0].text));
};

const callOpenRouter = async (userDescription: string, systemPrompt: string) => {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not set.");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userDescription }
      ],
      response_format: { type: "json_object" }
    })
  });
  const data = await response.json();
  if (data.error) throw new Error("OpenRouter API Error: " + data.error.message);
  return JSON.parse(cleanJSON(data.choices[0].message.content));
};
