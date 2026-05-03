import { BrevoClient } from "@getbrevo/brevo";

const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY as string,
});

export async function sendOrderConfirmationEmail(orderData: {
  toEmail: string;
  customerName: string;
  orderId: string;
  totalAmount: number;
}) {
  // Luxury Boutique Styled HTML
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;700&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #fcfcfc; font-family: 'Inter', sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 60px 40px 40px 40px; background-color: #000000;">
                  <h1 style="margin: 0; font-family: 'Playfair Display', serif; color: #D4AF37; font-size: 36px; letter-spacing: 4px; text-transform: uppercase;">ZARITAAR</h1>
                  <p style="margin: 10px 0 0 0; color: #D4AF37; font-size: 10px; letter-spacing: 3px; font-weight: bold; text-transform: uppercase;">The Gold Standard</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 60px 50px;">
                  <h2 style="font-family: 'Playfair Display', serif; color: #1a1a1a; font-size: 24px; margin-bottom: 24px;">Thank you for your order, ${orderData.customerName}.</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                    We are pleased to confirm that we have received your order. Our team is now carefully preparing your items for delivery.
                  </p>
                  
                  <div style="background-color: #fafafa; border-radius: 16px; padding: 32px; border: 1px solid #f0f0f0;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px;">Order Reference</td>
                      </tr>
                      <tr>
                        <td style="color: #1a1a1a; font-size: 18px; font-weight: bold; padding-bottom: 8px;">#${orderData.orderId.slice(-8).toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="color: #D4AF37; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 24px;">
                          (Please copy this ID to track your order status)
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px;">Total Amount</td>
                      </tr>
                      <tr>
                        <td style="color: #D4AF37; font-size: 24px; font-weight: bold;">Rs. ${orderData.totalAmount.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="margin-top: 48px; text-align: center;">
                    <a href="https://zaritaar.com/track-order" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 20px 40px; text-decoration: none; border-radius: 12px; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Track My Order</a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 40px 50px; background-color: #fafafa; border-top: 1px solid #f0f0f0; text-align: center;">
                  <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 0;">
                    Questions? Reply to this email or contact our boutique support.<br/>
                    © 2024 ZARITAAR OFFICIAL. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!process.env.BREVO_API_KEY) {
    console.error("CRITICAL: BREVO_API_KEY is missing from environment variables.");
    return { success: false, error: "API Key missing" };
  }

  if (!process.env.SENDER_EMAIL) {
    console.error("CRITICAL: SENDER_EMAIL is missing from environment variables.");
    return { success: false, error: "Sender email missing" };
  }

  console.log(`Attempting to send email to: ${orderData.toEmail} via Brevo...`);

  try {
    const result = await client.transactionalEmails.sendTransacEmail({
        subject: "Order Confirmed - ZARITAAR",
        sender: { 
          email: process.env.SENDER_EMAIL as string, 
          name: process.env.SENDER_NAME || "Zaritaar Boutique" 
        },
        to: [{ email: orderData.toEmail, name: orderData.customerName }],
        htmlContent
    });
    
    console.log("✅ Brevo Email Sent Successfully:", result);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Brevo Email Failed!");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: error.message };
  }
}
