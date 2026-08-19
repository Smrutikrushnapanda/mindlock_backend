import 'reflect-metadata';
import dotenv from 'dotenv';
import dataSource from '../src/data-source';
import { DOMAIN_SEED } from '../src/migrations/1787000000000-InviteOtpsAndBlockedDomains';

dotenv.config();

async function main() {
  await dataSource.initialize();
  let inserted = 0;
  for (const [category, domains] of Object.entries(DOMAIN_SEED)) {
    for (const domain of domains) {
      const cleaned = domain.trim().toLowerCase().replace(/^\.+/, '');
      const result = await dataSource.query(
        `INSERT INTO "blocked_domains" ("category", "domain", "is_active")
         VALUES ($1, $2, true)
         ON CONFLICT DO NOTHING`,
        [category, cleaned],
      );
      inserted += result?.rowCount ?? 0;
    }
  }
  const [{ count }] = await dataSource.query(
    `SELECT count(*)::int AS count FROM "blocked_domains"`,
  );
  console.log(`Seeded ${inserted} new domains. Total blocked domains: ${count}`);
  await dataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
