import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateConfig } from "../scripts/lib/config.mjs";
import { generateProfileReadme } from "../scripts/lib/readme.mjs";

function createConfig(project) {
  return {
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
    projects: [project],
    techStack: ["TypeScript"],
    links: [{ label: "GitHub", value: "test-user", url: "https://github.com/test-user", logo: "github", color: "0B1220" }],
    activity: { enabled: false, limit: 6 },
    appearance: { palette: "ocean" },
    footer: "Building useful software."
  };
}

const project = {
  name: "Bibliotheca",
  url: "",
  homepage: "",
  focus: "Knowledge library",
  summary: "A private knowledge library for curated digital resources.",
  heroLabel: "Knowledge library"
};

async function render(config) {
  const directory = await mkdtemp(join(tmpdir(), "profile-project-url-"));
  const readmePath = join(directory, "README.md");
  try {
    await generateProfileReadme({
      config,
      manifest: { assets: { desktopDark: "desktop-dark.svg", desktopLight: "desktop-light.svg", mobileDark: "mobile-dark.svg", mobileLight: "mobile-light.svg" } },
      readmePath
    });
    return await readFile(readmePath, "utf8");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("projects without a public URL validate and render without a link", async () => {
  const config = createConfig(project);
  assert.doesNotThrow(() => validateConfig(config));
  const readme = await render(config);
  assert.match(readme, /\| \*\*Bibliotheca\*\* \|/);
  assert.doesNotMatch(readme, /\[\*\*Bibliotheca\*\*\]\(\)/);
});

test("projects with a public URL retain their link", async () => {
  const config = createConfig({ ...project, url: "https://github.com/test-user/bibliotheca" });
  assert.doesNotThrow(() => validateConfig(config));
  const readme = await render(config);
  assert.match(readme, /\[\*\*Bibliotheca\*\*\]\(https:\/\/github\.com\/test-user\/bibliotheca\)/);
});
