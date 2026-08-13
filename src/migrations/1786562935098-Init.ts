import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1786562935098 implements MigrationInterface {
    name = 'Init1786562935098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "trusted_persons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "relationship" character varying NOT NULL, "verified" boolean NOT NULL DEFAULT false, "invited_at" TIMESTAMP NOT NULL DEFAULT now(), "verified_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_161c7b3e1244de16225e5aa688a" UNIQUE ("user_id"), CONSTRAINT "REL_161c7b3e1244de16225e5aa688" UNIQUE ("user_id"), CONSTRAINT "PK_fa30e650609cb310cd29fe4f5cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying NOT NULL, "days" text array NOT NULL, "start_time" character varying NOT NULL, "end_time" character varying NOT NULL, "block_porn" boolean NOT NULL DEFAULT true, "block_apps" boolean NOT NULL DEFAULT true, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "blocked_apps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "package_name" character varying NOT NULL, "app_name" character varying NOT NULL, "category" character varying, "is_blocked" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_1583eebfc11da2b803a95db155b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "protection_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "porn_blocking" boolean NOT NULL DEFAULT true, "app_blocking" boolean NOT NULL DEFAULT true, "protection_level" character varying NOT NULL DEFAULT 'high', "blocked_categories" text array NOT NULL DEFAULT ARRAY['adult','dating','gambling','drugs','explicit'], "vpn_connected" boolean NOT NULL DEFAULT false, "last_sync" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3ff236ed8bbd1f5186fab6ebfe4" UNIQUE ("user_id"), CONSTRAINT "REL_3ff236ed8bbd1f5186fab6ebfe" UNIQUE ("user_id"), CONSTRAINT "PK_472c4d4577dc0ee96f4bbca9843" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "unlock_request_id" uuid NOT NULL, "code" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "verified" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_985b696d8c791fb6ae3bb094528" UNIQUE ("unlock_request_id"), CONSTRAINT "REL_985b696d8c791fb6ae3bb09452" UNIQUE ("unlock_request_id"), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "unlock_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "reason" character varying NOT NULL, "custom_message" character varying, "duration_min" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "requested_at" TIMESTAMP NOT NULL DEFAULT now(), "responded_at" TIMESTAMP WITH TIME ZONE, "unlocked_until" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8e34ef27b2ba6da9f3d71a1cbf0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" character varying NOT NULL, "title" character varying NOT NULL, "body" text NOT NULL, "read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "push_token" character varying, "platform" character varying NOT NULL DEFAULT 'android', "is_managed" boolean NOT NULL DEFAULT false, "last_seen" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "biometric_enabled" boolean NOT NULL DEFAULT false, "pin_hash" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "trusted_persons" ADD CONSTRAINT "FK_161c7b3e1244de16225e5aa688a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_55e6651198104efea0b04568a88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocked_apps" ADD CONSTRAINT "FK_585cc073f5c867c3a376eb80571" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "protection_settings" ADD CONSTRAINT "FK_3ff236ed8bbd1f5186fab6ebfe4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "otps" ADD CONSTRAINT "FK_985b696d8c791fb6ae3bb094528" FOREIGN KEY ("unlock_request_id") REFERENCES "unlock_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unlock_requests" ADD CONSTRAINT "FK_df725356eab900c1f44af1885f1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "FK_5e9bee993b4ce35c3606cda194c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_5e9bee993b4ce35c3606cda194c"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "unlock_requests" DROP CONSTRAINT "FK_df725356eab900c1f44af1885f1"`);
        await queryRunner.query(`ALTER TABLE "otps" DROP CONSTRAINT "FK_985b696d8c791fb6ae3bb094528"`);
        await queryRunner.query(`ALTER TABLE "protection_settings" DROP CONSTRAINT "FK_3ff236ed8bbd1f5186fab6ebfe4"`);
        await queryRunner.query(`ALTER TABLE "blocked_apps" DROP CONSTRAINT "FK_585cc073f5c867c3a376eb80571"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "FK_55e6651198104efea0b04568a88"`);
        await queryRunner.query(`ALTER TABLE "trusted_persons" DROP CONSTRAINT "FK_161c7b3e1244de16225e5aa688a"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "devices"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "unlock_requests"`);
        await queryRunner.query(`DROP TABLE "otps"`);
        await queryRunner.query(`DROP TABLE "protection_settings"`);
        await queryRunner.query(`DROP TABLE "blocked_apps"`);
        await queryRunner.query(`DROP TABLE "schedules"`);
        await queryRunner.query(`DROP TABLE "trusted_persons"`);
    }

}
