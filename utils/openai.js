const openAI = require("openai");

const openai = new openAI.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openai;