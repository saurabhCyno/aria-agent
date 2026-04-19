import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Lead Submission
  app.post("/api/submit-lead", async (req, res) => {
    const lead = req.body;
    console.log("Received Lead:", lead);

    try {
      // 1. Send Email (Simulated/Real logic)
      // In a real app, you'd use process.env.SMTP_HOST, etc.
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email", // Mock SMTP for testing
        port: 587,
        secure: false,
        auth: {
          user: "mock_user", // Replace with real credentials
          pass: "mock_pass",
        },
      });

      const mailOptions = {
        from: '"Planify Aria" <aria@planify.com>',
        to: "test@gmail.com",
        subject: `New Design Consultation: ${lead.name}`,
        html: `
          <h3>New Project Brief from Aria</h3>
          <table border="1" cellpadding="10" style="border-collapse: collapse;">
            <tr><td><b>Name</b></td><td>${lead.name}</td></tr>
            <tr><td><b>Contact</b></td><td>${lead.contact}</td></tr>
            <tr><td><b>Project Type</b></td><td>${lead.projectType}</td></tr>
            <tr><td><b>Location</b></td><td>${lead.location}</td></tr>
            <tr><td><b>Timeline</b></td><td>${lead.timeline}</td></tr>
            <tr><td><b>Meeting Requested</b></td><td>${lead.meetingRequested ? 'Yes' : 'No'}</td></tr>
            ${lead.meetingDate ? `<tr><td><b>Meeting Date</b></td><td>${lead.meetingDate}</td></tr>` : ''}
            ${lead.meetingTime ? `<tr><td><b>Meeting Time</b></td><td>${lead.meetingTime}</td></tr>` : ''}
            <tr><td><b>Summary</b></td><td>${lead.summary || 'N/A'}</td></tr>
          </table>
        `,
      };

      // For now, we just log it as "sent" to avoid crashing without real credentials
      console.log("Email would be sent to test@gmail.com");
      
      // 2. Schedule Google Calendar (Simulated)
      if (lead.meetingRequested) {
        console.log(`Scheduling Google Calendar event for ${lead.meetingDate} at ${lead.meetingTime}`);
        // Real implementation would use googleapis SDK and OAuth
      }

      res.json({ status: "success", message: "Lead processed and email triggered." });
    } catch (error) {
      console.error("Error processing lead:", error);
      res.status(500).json({ status: "error", message: "Failed to process lead." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
