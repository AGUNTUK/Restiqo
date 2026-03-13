const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * sendEmail function
 * Verifies Firebase Auth token, then sends email via Resend or SendGrid.
 */
exports.sendEmail = onRequest({ cors: true }, async (req, res) => {
  try {
    // 1. Verify Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authError) {
      console.error("Auth Error:", authError);
      return res.status(401).json({ error: "Unauthorized" });
    }

    const uid = decodedToken.uid;
    const userEmail = decodedToken.email;

    // 2. Parse Request Body
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Missing required fields: to, subject, html" });
    }

    // 3. Configure Email Service API Key
    const resendApiKey = process.env.RESEND_API_KEY;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    if (!resendApiKey && !sendgridApiKey) {
      // Fallback: Log to Firestore when no API key is configured
      await admin.firestore().collection("email_logs").add({
        uid,
        userEmail,
        to_email: to,
        subject,
        type: "api_fallback",
        status: "pending",
        error_message: "No email service configured",
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ message: "Email queued (no API key configured)", success: true });
    }

    // 4. Send via Resend
    if (resendApiKey) {
      const fetch = (await import("node-fetch")).default;
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Restiqa <noreply@restiqa.com>",
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ""),
        }),
      });

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        throw new Error(`Resend API error: ${errorText}`);
      }

      const result = await resendResponse.json();

      // Log success to Firestore
      await admin.firestore().collection("email_logs").add({
        uid,
        userEmail,
        to_email: to,
        subject,
        type: "resend",
        status: "sent",
        resend_id: result.id,
        sent_at: admin.firestore.FieldValue.serverTimestamp(),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ success: true, id: result.id });
    }

    // 5. Send via SendGrid (Fallback)
    if (sendgridApiKey) {
      const fetch = (await import("node-fetch")).default;
      const sendgridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: "noreply@restiqa.com", name: "Restiqa" },
          subject,
          content: [
            { type: "text/html", value: html },
            { type: "text/plain", value: text || html.replace(/<[^>]*>/g, "") },
          ],
        }),
      });

      if (!sendgridResponse.ok) {
        const errorText = await sendgridResponse.text();
        throw new Error(`SendGrid API error: ${errorText}`);
      }

      // Log success to Firestore
      await admin.firestore().collection("email_logs").add({
        uid,
        userEmail,
        to_email: to,
        subject,
        type: "sendgrid",
        status: "sent",
        sent_at: admin.firestore.FieldValue.serverTimestamp(),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ success: true });
    }

    throw new Error("No email service configured");
  } catch (error) {
    console.error("Error in sendEmail:", error);
    return res.status(500).json({ error: String(error) });
  }
});

/**
 * sendSMS function
 * Verifies Firebase Auth token, then sends SMS via Twilio or Vonage.
 */
exports.sendSMS = onRequest({ cors: true }, async (req, res) => {
  try {
    // 1. Verify Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authError) {
      console.error("Auth Error:", authError);
      return res.status(401).json({ error: "Unauthorized" });
    }

    const uid = decodedToken.uid;
    const userEmail = decodedToken.email;

    // 2. Parse Request Body
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: "Missing required fields: to, message" });
    }

    // 3. Configure SMS Service Credentials
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    const nexmoApiKey = process.env.NEXMO_API_KEY;
    const nexmoApiSecret = process.env.NEXMO_API_SECRET;

    // 4. Send via Twilio
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      const fetch = (await import("node-fetch")).default;
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64");

      const params = new URLSearchParams();
      params.append("To", to);
      params.append("From", twilioPhoneNumber);
      params.append("Body", message);

      const twilioResponse = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!twilioResponse.ok) {
        const errorText = await twilioResponse.text();
        throw new Error(`Twilio API error: ${errorText}`);
      }

      const result = await twilioResponse.json();

      // Log success to Firestore
      await admin.firestore().collection("sms_logs").add({
        uid,
        userEmail,
        phone_number: to,
        message,
        type: "twilio",
        status: "sent",
        twilio_sid: result.sid,
        sent_at: admin.firestore.FieldValue.serverTimestamp(),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ success: true, sid: result.sid });
    }

    // 5. Send via Nexmo/Vonage (Fallback)
    if (nexmoApiKey && nexmoApiSecret) {
      const fetch = (await import("node-fetch")).default;
      const nexmoResponse = await fetch("https://api.nexmo.com/v2/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(`${nexmoApiKey}:${nexmoApiSecret}`).toString("base64")}`,
        },
        body: JSON.stringify({
          from: "Restiqa",
          to: to.replace("+", ""),
          text: message,
        }),
      });

      if (!nexmoResponse.ok) {
        const errorText = await nexmoResponse.text();
        throw new Error(`Nexmo API error: ${errorText}`);
      }

      const result = await nexmoResponse.json();

      // Log success to Firestore
      await admin.firestore().collection("sms_logs").add({
        uid,
        userEmail,
        phone_number: to,
        message,
        type: "nexmo",
        status: "sent",
        sent_at: admin.firestore.FieldValue.serverTimestamp(),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ success: true, messageId: result["message-id"] });
    }

    // Fallback: Log to Firestore when no API key is configured
    await admin.firestore().collection("sms_logs").add({
      uid,
      userEmail,
      phone_number: to,
      message,
      status: "pending",
      error_message: "No SMS service configured",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ message: "SMS queued (no API key configured)", success: true });
  } catch (error) {
    console.error("Error in sendSMS:", error);
    return res.status(500).json({ error: String(error) });
  }
});
