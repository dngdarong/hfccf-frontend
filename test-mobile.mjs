import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set mobile viewport (480px width - small mobile)
  await page.setViewportSize({ width: 480, height: 960 });
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1500);
    
    console.log('✓ Page loaded');
    
    // Take screenshot of mobile view
    await page.screenshot({ 
      path: 'scratchpad/mobile_navbar.png',
      fullPage: false 
    });
    console.log('✓ Screenshot 1: Mobile navbar saved');
    
    // Find and click hamburger button - look for multiple selectors
    const selectors = [
      'button[aria-label*="toggle"]',
      'button[aria-label*="Sidebar"]',
      'button[aria-label*="sidebar"]',
      '.min[769px]:hidden button',
    ];
    
    let clicked = false;
    for (const selector of selectors) {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        clicked = true;
        console.log('✓ Hamburger button clicked');
        break;
      }
    }
    
    if (!clicked) {
      console.log('⚠ Hamburger button not found, checking page structure...');
      const buttons = await page.$$('button');
      console.log(`Found ${buttons.length} buttons on page`);
    }
    
    await page.waitForTimeout(600);
    
    // Take screenshot of drawer
    await page.screenshot({ 
      path: 'scratchpad/mobile_drawer_open.png',
      fullPage: false 
    });
    console.log('✓ Screenshot 2: Mobile drawer saved');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
