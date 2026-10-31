// Runs the date tests once per time zone. Jest cannot switch the zone mid-run, so each zone
// gets its own process with TZ set. Works on Windows, macOS and Linux.
const { spawnSync } = require('node:child_process');

const zones = ['Asia/Jerusalem', 'America/New_York', 'Pacific/Auckland', 'UTC'];
let failed = false;

for (const tz of zones) {
  console.log(`\n=== TZ=${tz} ===`);
  const res = spawnSync(
    process.execPath,
    [require.resolve('jest/bin/jest'), 'src/core/dates.test.ts', '--silent=false'],
    { stdio: 'inherit', env: { ...process.env, TZ: tz } },
  );
  if (res.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
