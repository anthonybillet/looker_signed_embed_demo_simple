import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { LookerNodeSDK } from "@looker/sdk-node";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Verifying Environment Variables at Startup ---
  console.log("--- Verifying Environment Variables at Startup ---");
  console.log("LOOKERSDK_BASE_URL:", process.env.LOOKERSDK_BASE_URL);
  console.log("LOOKERSDK_CLIENT_ID:", process.env.LOOKERSDK_CLIENT_ID);
  console.log("LOOKERSDK_CLIENT_SECRET is set:", !!process.env.LOOKERSDK_CLIENT_SECRET);
  console.log("---------------------------------------------");

  // Looker SDK Initialization
  let sdk: any;
  try {
    if (process.env.LOOKERSDK_BASE_URL && process.env.LOOKERSDK_CLIENT_ID && process.env.LOOKERSDK_CLIENT_SECRET) {
      sdk = LookerNodeSDK.init40();
      console.log("Looker SDK Initialized Successfully.");
    } else {
      console.warn("Looker SDK environment variables missing. SDK not initialized.");
    }
  } catch (e) {
    console.error('CRITICAL: Looker SDK failed to initialize.', e);
  }

  const DASHBOARD_ID = 'external_data_model::data_security_shared_template_dashboard';
  const SESSION_LENGTH = 3600;

  app.get('/api/health', (req, res) => {
    res.status(200).send('Looker SSO Embed Server is running!');
  });

  app.post('/api/get-embed-url', async (req, res) => {
    if (!sdk) {
      console.error("SDK not available to handle request.");
      return res.status(500).json({ error: 'Server is not properly configured. Check Looker environment variables.' });
    }

    const { username, theme } = req.body;

    if (!username || !theme) {
      return res.status(400).json({ error: 'Username and theme are required.' });
    }

    const targetUrl = `${process.env.LOOKERSDK_BASE_URL}/embed/dashboards/${DASHBOARD_ID}?theme=${theme}`;
    console.log('Constructed target_url:', targetUrl);

    const embedParams = {
      target_url: targetUrl,
      session_length: SESSION_LENGTH,
      force_logout_login: true,
      external_user_id: JSON.stringify(username),
      first_name: username.charAt(0).toUpperCase() + username.slice(1),
      last_name: 'User',
      permissions: [
        "access_data",
        "see_looks",
        "see_user_dashboards",
        "see_lookml_dashboards",
        "download_with_limit",
        "schedule_look_emails",
        "schedule_external_look_emails",
        "create_alerts",
        "see_drill_overlay",
        "save_content",
        "embed_browse_spaces",
        "schedule_look_emails",
        "send_to_sftp",
        "send_to_s3",
        "send_outgoing_webhook",
        "send_to_integration",
        "download_without_limit",
        "explore",
        "see_sql",
        "chat_with_explore",
        "chat_with_agent",
      ],
      models: ['external_data_model'],
      user_attributes: {
        'customer_id_row_level': username,
      },
    };

    try {
      const signedUrl = await sdk.ok(sdk.create_sso_embed_url(embedParams));
      console.log(`Successfully generated embed URL for user: ${username} with theme: ${theme}`);
      console.log(`Generated URL: ${signedUrl.url}`);
      res.json({ url: signedUrl.url, payload: embedParams });
    } catch (error) {
      console.error('Error generating Looker embed URL:', error);
      res.status(500).json({ error: 'Failed to generate embed URL.' });
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
    // In production, serve static files from dist
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
