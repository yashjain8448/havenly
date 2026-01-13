const Home = require("../models/homes");
const openai = require("../utils/openai");
const { ZERO_SIMILAR_SYSTEM_PROMPT, SIMILAR_SYSTEM_PROMPT } = require("../utils/systemPrompts");


exports.suggestPrice = async (req, res) => {
  try {
    const { location, rating, description } = req.body;

    // Finding similar homes in the Home DB based on location
    const similarHomes = await Home.find({
      location: new RegExp(location, "i"),
    }).limit(5); // finding only 5 similar homes

    let SYSTEM_PROMPT = "";

    if (similarHomes.length > 0) {
      const prices = similarHomes.map((home) => home.price);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      SYSTEM_PROMPT = SIMILAR_SYSTEM_PROMPT

    } else {
      SYSTEM_PROMPT = ZERO_SIMILAR_SYSTEM_PROMPT;
    }

    // Calling openAI
    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{ role: "system", content: SYSTEM_PROMPT }], // this is not the havenly user
      temperature: 0.5,
    });

    let suggestedPrice = response.choices[0].message.content;
    suggestedPrice = parseInt(suggestedPrice.replace(/\D/g, ""));
    // removes any non-digit characters

    if (!suggestedPrice || isNaN(suggestedPrice)) {
      suggestedPrice = 2500; // fallback price
    }

    res.json({ suggestedPrice });
  } catch (error) {
    console.log("Error in suggestPrice:", error);
    res.status(500).json({ suggestedPrice: 2500 });
  }
};
