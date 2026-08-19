import { MigrationInterface, QueryRunner } from "typeorm";

const CONVERSIONS: ReadonlyArray<readonly [string, string]> = [
  ["devices", "last_seen"],
  ["invite_otps", "created_at"],
  ["invite_otps", "expires_at"],
  ["notifications", "created_at"],
  ["otps", "expires_at"],
  ["protection_settings", "last_sync"],
  ["schedules", "created_at"],
  ["trusted_persons", "invited_at"],
  ["unlock_requests", "requested_at"],
  ["users", "created_at"],
];

export class Timestamptz1787000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [table, column] of CONVERSIONS) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE timestamptz USING ("${column}" AT TIME ZONE 'UTC')`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [table, column] of CONVERSIONS) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE timestamp USING ("${column}" AT TIME ZONE 'UTC')`,
      );
    }
  }
}