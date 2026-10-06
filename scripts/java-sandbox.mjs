// One-off: build the Vercel Sandbox snapshot that Java code challenges boot from.
//
//   vercel link && vercel env pull .env.local   (gives this script a VERCEL_OIDC_TOKEN)
//   node --env-file=.env.local scripts/java-sandbox.mjs
//
// Then set the printed id as JAVA_SANDBOX_SNAPSHOT in .env.local and in the Vercel project.
// Run it again only to upgrade the JDK.

import { Sandbox } from "@vercel/sandbox";

const sandbox = await Sandbox.create({ image: "vercel/sandbox/ubuntu", resources: { vcpus: 2 }, timeout: 15 * 60_000, persistent: false });
try {
  console.log("Installing a JDK…");
  const install = await sandbox.runCommand({ cmd: "bash", args: ["-c", "apt-get update && apt-get install -y --no-install-recommends default-jdk-headless"], sudo: true });
  if (install.exitCode !== 0) throw new Error(await install.stderr());
  const version = await sandbox.runCommand("javac", ["-version"]);
  console.log((await version.stdout()) || (await version.stderr()));

  // Snapshotting stops the sandbox. Never expire: every Java run boots from this.
  const snapshot = await sandbox.snapshot({ expiration: 0 });
  console.log(`\nJAVA_SANDBOX_SNAPSHOT=${snapshot.snapshotId}`);
} catch (err) {
  await sandbox.stop();
  throw err;
}
