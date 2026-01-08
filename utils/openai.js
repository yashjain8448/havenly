const openAI = require("openai");

const openai = new openAI.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    base_url: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

module.exports = openai;