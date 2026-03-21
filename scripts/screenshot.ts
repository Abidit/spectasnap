import { chromium } from 'playwright';

const pages = [
  { name: 'landing',          url: '/',          w: 1280, h: 800  },
  { name: 'landing-mobile',   url: '/',          w: 375,  h: 812  },
  { name: 'landing-tablet',   url: '/',          w: 768,  h: 1024 },
  { name: 'trydemo',          url: '/trydemo',   w: 1280, h: 800  },
  { name: 'trydemo-mobile',   url: '/trydemo',   w: 375,  h: 812  },
  { name: 'trydemo-tablet',   url: '/trydemo',   w: 768,  h: 1024 },
  { name: 'dashboard',        url: '/dashboard',  w: 1280, h: 800  },
  { name: 'dashboard-mobile', url: '/dashboard',  w: 375,  h: 812  },
  { name: 'qr',               url: '/qr',         w: 1280, h: 800  },
  { name: 'upload',           url: '/upload',      w: 1280, h: 800  },
  { name: 'onepager',         url: '/onepager',    w: 1280, h: 800  },
];

async function capture() {
  const browser = await chromium.launch();

  for (const page of pages) {
    const context = await browser.newContext({
      viewport: { width: page.w, height: page.h },
    });
    const p = await context.newPage();
    try {
      await p.goto(`http://localhost:3000${page.url}`, { waitUntil: 'networkidle', timeout: 15000 });
    } catch {
      // fallback: wait a fixed time if networkidle times out (e.g. AR camera pages)
      await p.waitForTimeout(3000);
    }
    await p.waitForTimeout(2000);
    await p.screenshot({
      path: `screenshots/${page.name}.png`,
      fullPage: true,
    });
    await context.close();
    console.log(`✓ ${page.name}`);
  }

  await browser.close();
  console.log('\nAll screenshots saved to /screenshots');
}

capture();
