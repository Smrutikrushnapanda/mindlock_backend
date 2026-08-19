const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const users = await c.query(
    "SELECT id FROM users WHERE email LIKE 'smoketest%'",
  );
  const ids = users.rows.map((r) => r.id);
  console.log('smoke users found:', ids.length);
  if (!ids.length) {
    await c.end();
    return;
  }
  await c.query(
    'DELETE FROM otps WHERE unlock_request_id IN (SELECT id FROM unlock_requests WHERE user_id = ANY($1::uuid[]))',
    [ids],
  );
  for (const t of [
    'unlock_requests',
    'notifications',
    'devices',
    'invite_otps',
    'trusted_persons',
    'blocked_apps',
    'protection_settings',
  ]) {
    await c.query(`DELETE FROM ${t} WHERE user_id = ANY($1::uuid[])`, [ids]);
  }
  await c.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [ids]);
  const left = await c.query(
    "SELECT count(*) FROM users WHERE email LIKE 'smoketest%'",
  );
  console.log('remaining smoke users:', left.rows[0].count);
  await c.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});