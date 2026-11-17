/**
 * Duitku Redirect Return Handler — Fixprom
 * Smoothly bridges Duitku returnUrl (no hash) to React HashRouter (/#/pricing?params)
 */

export default function handler(req, res) {
  const incomingUrl = req.url || '';
  const queryIndex = incomingUrl.indexOf('?');
  const queryString = queryIndex !== -1 ? incomingUrl.substring(queryIndex) : '';

  // Redirect client to Pricing page with all query params preserved
  res.writeHead(302, {
    Location: `https://www.fixprom.com/#/pricing${queryString}`,
  });
  res.end();
}
