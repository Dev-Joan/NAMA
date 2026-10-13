import { expect, test, type Page } from '@playwright/test';

// Collects console errors/warnings, uncaught exceptions and failed requests for a page.
function watchProblems(page: Page) {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') problems.push(`console.${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => {
    // Google Maps tiles and analytics inside the map iframe are not ours.
    if (!/google|gstatic/.test(request.url())) problems.push(`request failed: ${request.url()} (${request.failure()?.errorText})`);
  });
  return problems;
}

// Reveal animations normally run on scroll; scroll through the page so everything is shown.
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight * 0.6)) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 1300));
  });
}

const isTouch = (page: Page) => page.evaluate(() => matchMedia('(pointer: coarse)').matches);

test.describe('home page', () => {
  test('loads cleanly: no console errors, no horizontal scroll, images and fonts load', async ({ page }, info) => {
    const problems = watchProblems(page);
    await page.goto('/?lang=fr');
    await scrollThrough(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'page must not scroll sideways').toBeLessThanOrEqual(0);

    const brokenImages = await page.evaluate(() =>
      [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
    );
    expect(brokenImages, 'all images load').toEqual([]);

    const fonts = await page.evaluate(async () => {
      await document.fonts.ready;
      return ['16px "DM Sans"', '16px "Instrument Serif"', '16px "Space Mono"'].filter((f) => !document.fonts.check(f));
    });
    expect(fonts, 'web fonts load').toEqual([]);

    await page.screenshot({ path: `screenshots/${info.project.name.replace('/', '__')}.png`, fullPage: true, scale: 'css' });
    expect(problems).toEqual([]);
  });

  test('Arabic page is right to left and does not scroll sideways', async ({ page }, info) => {
    const problems = watchProblems(page);
    await page.goto('/?lang=ar');
    await scrollThrough(page);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    if (/iphone-15$|laptop/.test(info.project.name)) {
      await page.screenshot({ path: `screenshots/${info.project.name.replace('/', '__')}__ar.png`, fullPage: true, scale: 'css' });
    }
    expect(problems).toEqual([]);
  });

  test('language switcher changes language, direction and stays on the page', async ({ page }) => {
    await page.goto('/?lang=fr');
    const switcher = page.locator('.site-header .language-switcher');
    await switcher.getByRole('button', { name: 'EN' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.hero h1')).toContainText('Because every journey');
    await switcher.getByRole('button', { name: 'عربي' }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('.hero h1')).toContainText('لأن كل مسيرة');
    await switcher.getByRole('button', { name: 'FR' }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('.hero h1')).toContainText('Parce que chaque');
    // Language is remembered on the legal pages too.
    await switcher.getByRole('button', { name: 'EN' }).click();
    await page.goto('/confidentialite');
    await expect(page.locator('h1')).toHaveText('Privacy policy');
  });

  test('every menu item scrolls to a section that is not hidden under the header', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/?lang=fr');
    const hrefs = await page.locator('.site-header .nav-links a').evaluateAll((links) => links.map((a) => a.getAttribute('href')!));
    expect(hrefs.length).toBe(8);
    for (const href of hrefs) {
      const menuButton = page.locator('.menu-button');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await expect(page.locator('.nav-links')).toBeVisible();
      }
      await page.locator(`.site-header .nav-links a[href="${href}"]`).click();
      // Wait for the smooth scroll to finish: position unchanged for 300ms.
      await page.evaluate(async () => {
        let last = -1, still = 0;
        while (still < 3) { await new Promise((r) => setTimeout(r, 100)); still = scrollY === last ? still + 1 : 0; last = scrollY; }
      });
      if (href === '#accueil') {
        expect(await page.evaluate(() => scrollY), 'Accueil returns to the top').toBeLessThan(5);
        continue;
      }
      // The section's first element (title, or the illustration that precedes it on phones)
      // must start below the fixed header and be on screen.
      const result = await page.evaluate((id) => {
        const first = document.querySelector(`${id} .container > *`)!.getBoundingClientRect();
        const header = document.querySelector('.site-header')!.getBoundingClientRect();
        return { top: Math.round(first.top), headerBottom: Math.round(header.bottom), inView: first.top < innerHeight };
      }, href);
      expect(result.inView, `${href} content in view`).toBe(true);
      expect(result.top, `${href} content below the fixed header`).toBeGreaterThanOrEqual(result.headerBottom);
    }
  });

  test('every in-page link has a target, and phone/WhatsApp/external links are well formed', async ({ page }, info) => {
    test.skip(!info.project.name.endsWith('/laptop'), 'link structure is the same on every device');
    await page.goto('/?lang=fr');
    const links = await page.locator('a[href]').evaluateAll((as) =>
      as.map((a) => ({ href: a.getAttribute('href')!, target: a.getAttribute('target'), rel: a.getAttribute('rel') })),
    );
    for (const { href, target, rel } of links) {
      if (href.startsWith('#')) expect(await page.locator(href).count(), `${href} exists`).toBe(1);
      else if (href.startsWith('tel:')) expect(href).toBe('tel:+96178876825');
      else if (href.startsWith('mailto:')) expect(href).toBe('mailto:namapolyclinic@gmail.com');
      else if (href.startsWith('http')) {
        expect(href).toMatch(/^https:\/\/(wa\.me\/96178876825|www\.instagram\.com\/namapolyclinic|maps\.google\.com\/)/);
        expect(target).toBe('_blank');
        expect(rel).toContain('noreferrer');
      } else expect(['/confidentialite', '/mentions-legales', '/']).toContain(href);
    }
  });
});

test.describe('legal pages', () => {
  for (const [path, title] of [['/confidentialite', 'Politique de confidentialité'], ['/mentions-legales', 'Mentions légales']]) {
    test(`${path} opens directly and on refresh`, async ({ page }) => {
      const problems = watchProblems(page);
      await page.goto(`${path}?lang=fr`);
      await expect(page.locator('h1')).toHaveText(title);
      await page.reload();
      await expect(page.locator('h1')).toHaveText(title);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await page.locator('[data-testid=link-legal-back]').click();
      await expect(page.locator('.hero h1')).toBeVisible();
      expect(problems).toEqual([]);
    });
  }
});

test.describe('contact form', () => {
  // The network is intercepted: nothing is sent to Web3Forms by these tests.
  test.beforeEach(async ({ page }, info) => {
    test.skip(!/\/(iphone-15|android-large|laptop)$/.test(info.project.name), 'one phone and one laptop per engine');
    // Smooth scrolling keeps the page moving after Playwright scrolls a button into view,
    // which can make WebKit drop the click. People scroll, then tap: test the same way.
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.scrollBehavior = 'auto'; });
    });
  });

  async function fill(page: Page) {
    // Let the contact block finish its 1s slide-in before typing and clicking.
    await page.locator('.contact-column.is-visible').waitFor();
    await page.waitForTimeout(1200);
    await page.locator('#name').fill('Test Playwright');
    await page.locator('#phone').fill('03 123 456');
    await page.locator('#specialty').selectOption({ index: 1 });
    await page.locator('#message').fill('Message de test automatique.');
  }

  test('validation shows field errors', async ({ page }) => {
    await page.goto('/?lang=fr#contact');
    await page.locator('[data-testid=button-submit-contact]').click();
    await expect(page.locator('#name-error')).toHaveText('Indiquez votre nom.');
    await expect(page.locator('#phone-error')).toBeVisible();
    await expect(page.locator('#specialty-error')).toBeVisible();
  });

  test('success: sends to Web3Forms and shows the thank-you message', async ({ page }) => {
    let payload: Record<string, string> | null = null;
    await page.route('https://api.web3forms.com/submit', async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    });
    await page.goto('/?lang=fr#contact');
    await fill(page);
    await page.locator('[data-testid=button-submit-contact]').click();
    await expect(page.locator('[data-testid=status-form-success]')).toContainText('Merci, votre message est bien arrivé.');
    expect(payload!.access_key).toBeTruthy();
    expect(payload!.subject).toBe('Nouvelle demande – Test Playwright – Orthophonie');
  });

  test('error: shows the error message and the WhatsApp fallback', async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false}' }),
    );
    await page.goto('/?lang=fr#contact');
    await fill(page);
    await page.locator('[data-testid=button-submit-contact]').click();
    await expect(page.locator('[data-testid=status-form-send-error]')).toBeVisible();
    await expect(page.locator('[data-testid=link-form-error-whatsapp]')).toHaveAttribute('href', /^https:\/\/wa\.me\/96178876825\?text=/);
    await expect(page.locator('#name')).toHaveValue('Test Playwright');
  });

  test('honeypot: a filled hidden field sends nothing', async ({ page }) => {
    let requests = 0;
    await page.route('https://api.web3forms.com/submit', (route) => {
      requests++;
      return route.abort();
    });
    await page.goto('/?lang=fr#contact');
    await fill(page);
    await page.locator('input[name=botcheck]').evaluate((el: HTMLInputElement) => { el.checked = true; });
    await page.locator('[data-testid=button-submit-contact]').click();
    await expect(page.locator('[data-testid=status-form-success]')).toBeVisible();
    expect(requests).toBe(0);
  });

  test('form fields are at least 16px on touch screens (no iOS zoom on focus)', async ({ page }) => {
    await page.goto('/?lang=fr#contact');
    test.skip(!(await isTouch(page)), 'touch screens only');
    const sizes = await page.locator('.field input:not([name=botcheck]), .field select, .field textarea').evaluateAll((els) =>
      els.map((el) => parseFloat(getComputedStyle(el).fontSize)),
    );
    for (const size of sizes) expect(size).toBeGreaterThanOrEqual(16);
  });
});

test.describe('team cards', () => {
  test('profile opens on hover (mouse) or tap (touch), closes on tap elsewhere, never moves other cards', async ({ page }) => {
    await page.goto('/?lang=fr#equipe');
    await scrollThrough(page);
    const card = page.locator('[data-testid=card-team-0]');
    const details = card.locator('.person-details');
    await card.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    const positions = () => page.locator('[data-person]').evaluateAll((cs) => cs.map((c) => Math.round(c.getBoundingClientRect().top + scrollY)).join());
    const before = await positions();
    if (await isTouch(page)) {
      await card.locator('.person-media').tap();
      await expect(details).toBeVisible();
      await page.waitForTimeout(700);
      await page.locator('#equipe h2').first().tap();
      await expect(details).toBeHidden();
    } else {
      await card.locator('.person-media').hover();
      await expect(details).toBeVisible();
      await page.mouse.move(2, 2);
      await expect(details).toBeHidden();
    }
    const after = await positions();
    expect(after).toBe(before);
  });

  test('profile opens with the keyboard', async ({ page }, info) => {
    test.skip(!info.project.name.endsWith('/laptop'), 'keyboard check on laptops');
    // WebKit only tabs to buttons when "tab to all controls" is on; focus directly instead.
    await page.goto('/?lang=fr#equipe');
    await scrollThrough(page);
    const badge = page.locator('[data-testid=toggle-founder-0]');
    await badge.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid=details-founder-0]')).toBeVisible();
    await expect(badge).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(badge).toHaveAttribute('aria-expanded', 'false');
  });

  test('reduced motion: profile still shows, without zoom', async ({ browser }, info) => {
    test.skip(!info.project.name.endsWith('/laptop'), 'checked on laptops');
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1366, height: 768 }, baseURL: 'http://localhost:4173' });
    const page = await context.newPage();
    await page.goto('/?lang=fr#equipe');
    await scrollThrough(page);
    const card = page.locator('[data-testid=card-founder-0]');
    await card.locator('.person-media').hover();
    await expect(card.locator('.person-details')).toBeVisible();
    expect(await card.locator('.person-photo').evaluate((el) => getComputedStyle(el).transform)).toBe('none');
    await context.close();
  });
});

test.describe('touch usability', () => {
  test('tap targets are at least 44px', async ({ page }) => {
    await page.goto('/?lang=fr');
    test.skip(!(await isTouch(page)), 'touch screens only');
    await scrollThrough(page);
    const small = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('a[href], button, select, summary, input:not([type=checkbox]), textarea')) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') continue;
        // Size of the area that responds to a tap: the element, or its ::before tap area if larger.
        const before = getComputedStyle(el, '::before');
        const hasHitArea = before.content !== 'none' && before.position === 'absolute';
        const w = Math.max(r.width, hasHitArea ? parseFloat(before.width) || 0 : 0);
        const h = Math.max(r.height, hasHitArea ? parseFloat(before.height) || 0 : 0);
        // FR/EN/عربي sit side by side in a small pill: only their height can reach 44px.
        const minWidth = el.closest('.language-switcher') ? 0 : 44;
        if (w < minWidth || h < 44) out.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(w)}×${Math.round(h)}`);
      }
      return [...new Set(out)];
    });
    expect(small).toEqual([]);
  });
});
