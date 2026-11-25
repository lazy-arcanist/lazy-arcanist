import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import test from "node:test";
import { generateHeroAssets } from "../scripts/lib/hero.mjs";

const config = {
  profile: {
    name: "Test User",
    username: "test-user",
    headline: "Student Developer",
    affiliation: "Independent",
    location: "Indonesia",
    status: "Building",
    about: ["A profile description with enough detail to pass validation."]
  },
  research: {
    primary: "Applied AI",
    direction: "Useful software",
    themes: "AI / web / Linux",
    narrative: "Exploring useful software across artificial intelligence, web development, and Linux."
  },
  focus: [{ name: "Web Development", description: "Building practical web experiences." }],
  projects: [{ name: "Bibliotheca", url: "", homepage: "", focus: "Knowledge", summary: "A curated digital resource library.", heroLabel: "Knowledge library" }],
  techStack: ["TypeScript"],
  links: [{ label: "GitHub", value: "test-user", url: "https://github.com/test-user", logo: "github", color: "0B1220" }],
  activity: { enabled: false, limit: 6 },
  appearance: { palette: "ocean" },
  footer: "Building useful software."
};

test("desktop terminal cursor appears after the footer text", async () => {
  const directory = await mkdtemp(join(tmpdir(), "profile-hero-cursor-"));
  try {
    const portraitPath = join(directory, "portrait.png");
    const raw = Buffer.alloc(16 * 16 * 4);
    for (let y = 3; y < 13; y += 1) {
      for (let x = 3; x < 13; x += 1) {
        const offset = (y * 16 + x) * 4;
        raw[offset] = 30;
        raw[offset + 1] = 130;
        raw[offset + 2] = 180;
        raw[offset + 3] = 255;
      }
    }
    await sharp(raw, { raw: { width: 16, height: 16, channels: 4 } }).png().toFile(portraitPath);
    const manifest = await generateHeroAssets({ config, sourcePath: portraitPath, outputDirectory: directory });
    const svg = await readFile(join(directory, manifest.assets.desktopDark), "utf8");
    const cursor = svg.match(/<rect x="([0-9.]+)" y="[0-9.]+" width="9" height="16" fill="#2DD4BF"/);
    assert.ok(cursor, "expected an animated terminal cursor rectangle");
    assert.ok(Number(cursor[1]) > 700, `cursor should follow the footer text, got x=${cursor[1]}`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
