import nodemailer from 'nodemailer';
import { Article, StockData, Hook, Slang, Spotlight } from './fetcher';

function generateDynamicSubject(articles: Article[]): string {
  const emojis = ['🚀', '💰', '🔥', '💻', '💡', '🛡️', '⚡', '📊'];
  const selectedArticles = articles.slice(0, 3);
  const parts = selectedArticles.map((a, i) => {
    const emoji = emojis[i % emojis.length];
    return `${a.title.split(':')[0]} ${emoji}`;
  });
  return parts.join(', ');
}
import dotenv from 'dotenv';
dotenv.config();

function formatSnippet(text: string): string {
  const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
  const sentences = cleanText.split('. ');
  if (sentences.length > 0) {
    sentences[0] = `<strong>${sentences[0]}</strong>`;
  }
  return sentences.join('. ');
}

function getWhyItMatters(title: string, index: number): string {
  const lowercaseTitle = title.toLowerCase();
  if (lowercaseTitle.includes('raised') || lowercaseTitle.includes('fund') || lowercaseTitle.includes('round')) {
    return "<strong>The Impact:</strong> Capital is fuel. Even in tough times, these rounds show that VCs are still betting big on the 'Startup Nation' engine.";
  }
  if (lowercaseTitle.includes('acquired') || lowercaseTitle.includes('acquisition') || lowercaseTitle.includes('exit')) {
    return "<strong>The Impact:</strong> Exits are the proof of the pudding. This shows that Israeli innovation is still a top target for global expansion.";
  }
  if (lowercaseTitle.includes('ai') || lowercaseTitle.includes('artificial intelligence')) {
    return "<strong>The Impact:</strong> We're not just users; we're builders. Israel's AI shift is moving from 'hype' to 'heavy-duty' infrastructure.";
  }
  return "<strong>The Impact:</strong> This isn't just news; it's a trend. It shows the ecosystem adapting and finding new ways to scale in a global market.";
}

export async function sendNewsletter(recipients: string | string[], articles: Article[], stocks: StockData[] = [], hook?: Hook, slang?: Slang, spotlight?: Spotlight) {
  if (articles.length === 0) {
    console.log('No articles to send.');
    return;
  }



  /* Reverting to Nodemailer (Gmail) for unrestricted sending */
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Israeli Spark</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f9; color: #1a1a1a; }
        .wrapper { background-color: #f4f7f9; padding: 20px 10px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        .header { background-color: #ffffff; padding: 40px 30px; text-align: left; border-bottom: 4px solid #0038b8; }
        .brand { font-size: 28px; font-weight: 900; color: #0038b8; letter-spacing: -1px; text-transform: uppercase; }
        .date { font-size: 13px; color: #666; margin-top: 8px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
        
        .hook-box { padding: 25px 30px; background-color: #f0f4ff; border-bottom: 1px solid #e0e6ed; }
        .hook-label { font-size: 11px; font-weight: 800; color: #0038b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; display: block; }
        .hook-text { font-size: 16px; line-height: 1.6; color: #333; font-style: italic; }
        
        .content { padding: 40px 30px; }
        
        .spotlight-card { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 12px; padding: 30px; margin-bottom: 45px; }
        .spotlight-label { font-size: 10px; font-weight: 800; color: #0038b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; display: block; }
        .spotlight-name { font-size: 22px; font-weight: 800; margin-bottom: 4px; color: #000; }
        .spotlight-co { font-size: 16px; font-weight: 600; color: #0038b8; margin-bottom: 18px; }
        .spotlight-vision { font-size: 16px; line-height: 1.7; color: #444; font-weight: 400; margin-bottom: 20px; border-left: 2px solid #0038b8; padding-left: 15px; }
        .spotlight-connect { font-size: 13px; background-color: #fff; padding: 12px; border-radius: 6px; border: 1px solid #eee; color: #555; }
        
        .section-header { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #999; margin-bottom: 30px; letter-spacing: 2px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        
        .article { margin-bottom: 60px; }
        .article-source { font-size: 11px; font-weight: 700; color: #0038b8; text-transform: uppercase; margin-bottom: 10px; }
        .article-title { font-size: 24px; font-weight: 800; line-height: 1.3; margin-bottom: 15px; letter-spacing: -0.5px; }
        .article-title a { color: #000; text-decoration: none; }
        .article-title a:hover { text-decoration: underline; }
        .article-body { font-size: 17px; line-height: 1.8; color: #333; }
        
        .axiom { font-weight: 800; color: #0038b8; display: block; margin-top: 20px; font-size: 13px; text-transform: uppercase; }
        
        .cta-btn { display: inline-block; padding: 14px 28px; background-color: #0038b8; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 700; margin-top: 25px; transition: background 0.2s; }
        
        .market { background-color: #001233; padding: 45px 30px; color: white; }
        .market-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #70a1ff; margin-bottom: 25px; letter-spacing: 2px; text-align: center; }
        .stock-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .stock-row:last-child { border-bottom: none; }
        .stock-label { font-size: 14px; font-weight: 700; }
        .stock-val { font-size: 16px; font-weight: 600; text-align: right; }
        .up { color: #2ecc71; }
        .down { color: #ff4757; }
        
        .footer { padding: 40px 30px; text-align: center; color: #888; border-top: 1px solid #eee; font-size: 12px; }
        .footer a { color: #0038b8; text-decoration: none; font-weight: 600; }
        
        /* Mobile specific adjustments */
        @media only screen and (max-width: 480px) {
          .header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .article-title { font-size: 22px; }
          .article-body { font-size: 16px; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div style="text-align: center; padding-bottom: 30px; border-bottom: 1px solid #eee; margin-bottom: 30px;">
            <a href="https://advertise.tldr.tech/?utm_source=tldr&utm_medium=newsletter&utm_campaign=advertisetopnav" style="color: #000; text-decoration: underline; font-size: 16px; margin: 0 5px;">Advertise</a>
            <span style="font-size: 16px; color: #000;">|</span>
            <a href="https://v0.app/chat/israeli-silicon-valley-map-mlpiy60Tvit#IRBEwl8QhMW8uHnTiybrLbl96sR3CkXN" style="color: #000; text-decoration: underline; font-size: 16px; margin: 0 5px;">View Online</a>
        </div>
        <div class="container">
          <div class="header">
            <div class="brand">Iton - Tech Bridge ⚡</div>
            <div class="date">${dateStr}</div>
          </div>
          
          ${hook ? `
            <div class="hook-box">
              <span class="hook-label">The Morning Spark</span>
              <div class="hook-text">"${hook.content}"</div>
            </div>
          ` : ''}

          <div class="content">
            ${spotlight ? `
              <div class="spotlight-card">
                <span class="spotlight-label">Founder Spotlight: SV Connector</span>
                <div class="spotlight-name">${spotlight.name}</div>
                <div class="spotlight-co">${spotlight.company}</div>
                <div class="spotlight-vision">"${spotlight.vision}"</div>
                <div class="spotlight-connect"><strong>The SV Bridge:</strong> ${spotlight.connection}</div>
              </div>
            ` : ''}

            <div class="section-header">Top Briefings</div>
            
            ${articles.map((article, index) => `
              <div class="article">
                <div class="article-source">via ${article.source}</div>
                <h2 class="article-title">
                  <a href="${article.link}">${article.title}</a>
                </h2>
                <div class="article-body">
                  <span class="axiom">The Big Picture</span>
                  ${formatSnippet(article.contentSnippet || '')}
                  
                  <span class="axiom">Why it matters</span>
                  ${getWhyItMatters(article.title, index)}
                </div>
                <a href="${article.link}" class="cta-btn">Read full briefing →</a>
              </div>
            `).join('')}
          </div>

          <div class="market">
            <div class="market-title">Market Pulse: Israeli Ecosystem</div>
            <table width="100%" cellspacing="0" cellpadding="0" border="0">
              ${stocks.map(stock => `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-weight: 700; font-size: 15px; color: #fff;">${stock.symbol}</div>
                  </td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-weight: 500; font-size: 15px; color: #fff;">$${stock.price} <span class="${stock.isUp ? 'up' : 'down'}" style="margin-left: 8px;">${stock.isUp ? '▲' : '▼'} ${stock.changePercent}</span></div>
                  </td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <div class="footer">
            <p>Smart, curated briefings for the Israeli tech community.</p>
            <p>&copy; 2026 SILICON WADI DISPATCH | <a href="#">Unsubscribe</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Determine recipients: either passed arg, or all subscribers + env TO (for testing)
  let initialRecipients: string[] = [];
  if (Array.isArray(recipients)) {
    initialRecipients = recipients;
  } else if (typeof recipients === 'string') {
    initialRecipients = [recipients];
  }

  // Clean up and dedup
  const finalRecipients = [...new Set(initialRecipients)];

  console.log(`Sending to ${finalRecipients.length} recipients: ${finalRecipients.join(', ')}`);

  const dynamicSubject = articles.length > 0 ? generateDynamicSubject(articles) : `The IL-SV Bridge - ${dateStr}`;

  // Send individual emails to hide other recipients (BCC style or individual)
  // For simplicity with nodemailer here, we'll send one email with BCC if multiple, or loop.
  // Looping is safer for deliverability reputation usually, but for small lists BCC is okay.
  // Let's loop to ensure 'To' field is clean or personalized later.

  for (const recipient of finalRecipients) {
    const mailOptions = {
      from: `"Silicon Wadi Dispatch" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: `⚡ ${dynamicSubject}`,
      html: htmlContent,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Message sent to ${recipient}: %s`, info.messageId);
    } catch (error) {
      console.error(`Error sending to ${recipient}:`, error);
    }
  }
}
