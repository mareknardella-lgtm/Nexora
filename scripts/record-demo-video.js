import { chromium } from 'playwright';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('🎬 Starting Nexora Sentinel Automated Demo Recording...');
  const outputDir = path.resolve('public/video');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--enable-webgl', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  // Inject a visual cursor dot to make automated clicks noticeable in the demo video
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'demo-cursor';
      cursor.style.cssText = `
        position: fixed;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(6, 182, 212, 0.4);
        border: 2px solid #06b6d4;
        box-shadow: 0 0 12px #06b6d4;
        pointer-events: none;
        z-index: 999999;
        transition: transform 0.12s ease, background 0.15s ease;
        transform: translate(-50%, -50%);
        display: none;
      `;
      document.body.appendChild(cursor);

      window.addEventListener('mousemove', (e) => {
        cursor.style.display = 'block';
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });

      window.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.75)';
        cursor.style.background = 'rgba(244, 63, 94, 0.8)';
      });

      window.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.background = 'rgba(6, 182, 212, 0.4)';
      });
    });
  });

  console.log('🌐 Navigating to http://127.0.0.1:5173...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await delay(2500);

  // Helper for human-like mouse movement
  async function smoothClick(selector, pauseAfter = 2000) {
    const loc = page.locator(selector).first();
    await loc.waitFor({ state: 'visible', timeout: 5000 });
    const box = await loc.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 });
      await delay(250);
      await page.mouse.down();
      await delay(120);
      await page.mouse.up();
    } else {
      await loc.click();
    }
    await delay(pauseAfter);
  }

  // --- STAGE 1: INTRO & PROBLEM DEMONSTRATION ---
  console.log('📌 STAGE 1: Presenting the Problem & Incident Scenario');
  await page.mouse.move(640, 200, { steps: 15 });
  await delay(2000);

  // Highlight the Incident Context box
  await page.evaluate(() => {
    window.scrollBy({ top: 120, behavior: 'smooth' });
  });
  await delay(2500);

  // Trigger Active Probe
  console.log('⚡ Dispatching Active Probe...');
  await smoothClick('button:has-text("DISPATCH PROBE")', 3500);

  // Scroll down slightly to inspect findings
  await page.evaluate(() => {
    window.scrollBy({ top: 180, behavior: 'smooth' });
  });
  await delay(2500);

  // --- STAGE 2: CONTRACT DAG TOPOLOGY ---
  console.log('🕸️ STAGE 2: Contract Invariant DAG Graph');
  await smoothClick('text=Contract DAG', 1500);

  // Scroll to center graph
  await page.evaluate(() => {
    window.scrollBy({ top: 160, behavior: 'smooth' });
  });
  await delay(1500);

  // Move mouse across graph nodes
  const nodes = await page.locator('svg g.cursor-pointer').all();
  for (let i = 0; i < Math.min(nodes.length, 5); i++) {
    const box = await nodes[i].boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 });
      await delay(900);
    }
  }
  await delay(2000);

  // --- STAGE 3: AI SEMANTIC ROOT-CAUSE ISOLATION ---
  console.log('🧠 STAGE 3: AI Root-Cause Diagnostic');
  await smoothClick('button:has-text("AI Root-Cause")', 3500);

  // --- STAGE 4: SYNTHESIZED MULTI-LANGUAGE PATCHES ---
  console.log('💻 STAGE 4: Synthesized Patches & Monaco Workspace');
  await smoothClick('button:has-text("Synthesized Patches")', 3000);

  // Switch to Python Pydantic v2
  console.log('🐍 Inspecting Python Pydantic v2 Adapter');
  await smoothClick('button:has-text("Python (Pydantic v2)")', 3000);

  // Switch to OpenAPI 3.1 JSON Patch
  console.log('📜 Inspecting OpenAPI 3.1 Patch');
  await smoothClick('button:has-text("OpenAPI 3.1 Patch")', 2500);

  // Switch to Vitest Tests
  console.log('🧪 Inspecting Vitest Suite');
  await smoothClick('button:has-text("Vitest Suite")', 2500);

  // --- STAGE 5: IN-BROWSER SANDBOX FIX VERIFICATION ---
  console.log('🛡️ STAGE 5: In-Browser Sandbox Verification Proof');
  await smoothClick('button:has-text("Sandbox Verification")', 2000);

  // Click the run verification button
  console.log('▶️ Executing 100% Invariant Verification');
  await smoothClick('text=VERIFY FIX IN SANDBOX', 4000);

  // Scroll down slightly to view comparison
  await page.evaluate(() => {
    window.scrollBy({ top: 120, behavior: 'smooth' });
  });
  await delay(3000);

  // --- STAGE 6: ANTI-PATTERN TRAPS PLAYGROUND ---
  console.log('🔥 STAGE 6: Traps Playground Lab');
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  await delay(1200);

  await smoothClick('button[title="Open Invariant Traps Lab"]', 3500);
  await smoothClick('button:has(svg.lucide-x)', 1500);

  // --- STAGE 7: EMPIRICAL BENCHMARKS ---
  console.log('📊 STAGE 7: Empirical Benchmarks');
  await smoothClick('button[title="Open Empirical Benchmarks"]', 3500);
  await smoothClick('button:has(svg.lucide-x)', 1500);

  // --- STAGE 8: CERTIFIED AUDIT DOSSIER ---
  console.log('📜 STAGE 8: Certified Audit Dossier');
  await smoothClick('button[title="Export Certified Audit Dossier"]', 3500);
  await smoothClick('button:has(svg.lucide-x)', 1500);

  // --- OUTRO ---
  console.log('✨ STAGE 9: Conclusion');
  await delay(2000);

  // Close context and wait for video to be written to disk
  console.log('💾 Saving recorded video...');
  await page.close();
  await context.close();
  await browser.close();

  // Find generated .webm file in outputDir
  const files = fs.readdirSync(outputDir).filter((f) => f.endsWith('.webm'));
  if (files.length === 0) {
    console.error('❌ No recorded video found.');
    return;
  }

  const rawVideoPath = path.join(outputDir, files[0]);
  const mp4VideoPath = path.join(outputDir, 'nexora_demo_walkthrough.mp4');

  console.log(`🎬 Video recorded: ${rawVideoPath}`);
  console.log('⚙️ Converting to standard high-compatibility MP4 with ffmpeg...');

  try {
    execSync(`ffmpeg -y -i "${rawVideoPath}" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 22 "${mp4VideoPath}"`, {
      stdio: 'inherit'
    });
    console.log(`✅ High-quality MP4 demo created: ${mp4VideoPath}`);
  } catch (err) {
    console.warn('⚠️ FFmpeg conversion note:', err.message);
  }

  console.log('🎉 Demo video recording complete!');
}

main().catch((err) => {
  console.error('Recording error:', err);
  process.exit(1);
});
