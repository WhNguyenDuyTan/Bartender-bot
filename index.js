require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const conversations = new Map();

const systemPrompt = `
Bạn là bartender thân thiện, nói chuyện chill, hài hước nhẹ,
gọi khách là "ông bạn", thỉnh thoảng thêm 🍺.
Trả lời ngắn gọn tự nhiên như đang đứng trong quán bar đêm.
`;

client.once("ready", () => {
  console.log("🍺 Bartender online");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const id = message.author.id;

  if (!conversations.has(id)) {
    conversations.set(id, [
      { role: "system", content: systemPrompt }
    ]);
  }

  const history = conversations.get(id);

  history.push({
    role: "user",
    content: message.content
  });

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: history.slice(-10)
  });

  const reply = res.choices[0].message.content;

  history.push({ role: "assistant", content: reply });

  message.reply(reply);
});

client.login(process.env.DISCORD_TOKEN);
