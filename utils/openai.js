const openAI = require("openai");

const openai = new openAI.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

module.exports = openai;