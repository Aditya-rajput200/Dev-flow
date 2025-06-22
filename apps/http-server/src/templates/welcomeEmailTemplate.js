 export const WelcomeEmailTemplate =(name) => {
  const d = new Date();
  let year = d.getFullYear();
return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>🎉 Welcome to DevConnect!</title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        color: #333333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9fafb;
      }
      .header {
        text-align: center;
        padding: 20px 0;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: #10b981;
      }
      .content {
        background: white;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }
      .cta-button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #10b981;
        color: white !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin: 15px 0;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        color: #6b7280;
        font-size: 14px;
      }
      .social-links a {
        margin: 0 8px;
        text-decoration: none;
      }
      .emoji {
        font-size: 24px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">DevConnect</div>
    </div>
    <div class="content">
      <h1 style="text-align: center;"><span class="emoji">🎉</span> Welcome, ${name} !</h1>
      
      <p>We're <strong>thrilled</strong> to have you join <span style="color: #10b981;">DevConnect</span> – your new hub for everything developer-related!</p>
      
      <p>Here’s what you can do now:</p>
      <ul>
        <li>📝 <strong>Share your knowledge</strong> by publishing blogs</li>
        <li>💬 <strong>Engage</strong> in community discussions</li>
        <li>🎟️ <strong>RSVP</strong> for exclusive developer events</li>
        <li>🤝 <strong>Connect</strong> with like-minded devs</li>
      </ul>
      
      <p style="text-align: center;">
        <a href="https://devconnect.com/explore" class="cta-button">Start Exploring →</a>
      </p>
      
      <p>Need help or have questions? Reply to this email or reach out at <a href="mailto:officialdevflow@gmail.com">support@devconnect.com</a> – we’re happy to help!</p>
      
      <p>Happy coding!<br />
      <strong>The DevConnect Team</strong> 🚀</p>
    </div>
    
    <div class="footer">
      <p>Follow us for updates:</p>
      <div class="social-links">
        <a href="https://github.com/devconnect">GitHub</a> •
        <a href="https://linkedin.com/company/devconnect">LinkedIn</a> •
        <a href="https://twitter.com/devconnect">Twitter</a>
      </div>
      <p>© ${year} DevConnect. All rights reserved.</p>
      <p>
        <small>
          <a href="{{unsubscribeLink}}" style="color: #6b7280;">Unsubscribe</a> •
          <a href="{{preferencesLink}}" style="color: #6b7280;">Email Preferences</a>
        </small>
      </p>
    </div>
  </body>
</html>`
};
