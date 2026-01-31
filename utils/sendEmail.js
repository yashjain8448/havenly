const nodemailer = require("nodemailer");
// Function to send booking confirmation email
exports.sendBookingEmail = async (toEmail, userName, home) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Havenly Bookings" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Your Havenly Booking is Confirmed ✔",
      html: `
        <h2>Hello ${userName},</h2>
        <p>Your booking has been successfully confirmed!</p>

        <h3>🏡 Booking Details</h3>
        <p><strong>Home:</strong> ${home.houseName}</p>
        <p><strong>Location:</strong> ${home.location}</p>
        <p><strong>Price:</strong> ₹${home.price}/night</p>

        <p>We’re excited to host you! 🎉</p>

        <br>
        <p>Regards,<br>Team Havenly</p>
      `,
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.log("Email error:", error);
  }
};
