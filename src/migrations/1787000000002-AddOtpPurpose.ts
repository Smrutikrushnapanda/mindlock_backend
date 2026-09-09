import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtpPurpose1787000000002 implements MigrationInterface {
  name = 'AddOtpPurpose1787000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invite_otps" ADD COLUMN "purpose" varchar NOT NULL DEFAULT 'invite'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_invite_otps_user_purpose" ON "invite_otps" ("user_id", "purpose")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_invite_otps_user_purpose"`);
    await queryRunner.query(`ALTER TABLE "invite_otps" DROP COLUMN "purpose"`);
  }
}
