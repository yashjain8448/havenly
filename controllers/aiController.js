const Home = require("../models/homes");
const openai = require("../utils/openai");

exports.suggestPrice = async (req, res) => {
  try {
    const { location, rating, description } = req.body;

    // Finding similar homes in the Home DB based on location
    const similarHomes = await Home.find({
      location: new RegExp(location, "i"),
    }).limit(5); // finding only 5 similar homes

    let prompt = "";

    if (similarHomes.length > 0) {
      const prices = similarHomes.map((home) => home.price);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      prompt = `
        You are an Smart pricing assistant which suggests competitive nightly prices for Havenly listings.

        Market data:
        - Location: ${location}
        - Average price: ₹${avgPrice}
        - Price range: ₹${minPrice} - ₹${maxPrice}

        Host details:
        - Rating: ${rating}
        - Description: "${description}"

        Suggest a competitive nightly price in INR.
        Return ONLY a number.
        `;
    }

    else {
        prompt = `
        You are an Smart pricing assistant which suggests competitive nightly prices for Havenly listings.
        There is no existing pricing data for this location.

        Host details:
        - Location: ${location}
        - Rating: ${rating}
        - Description: "${description}"

        Based on typical hotel and homestay pricing in this location,
        suggest a reasonable nightly price in INR.

        Return ONLY a number.
        `;
    }

    // Calling openAI
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }], // this is not the havenly user
        temperature: 0.5
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
