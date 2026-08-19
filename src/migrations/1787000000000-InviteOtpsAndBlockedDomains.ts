import { MigrationInterface, QueryRunner } from "typeorm";

export const DOMAIN_SEED: Record<string, string[]> = {
  adult: [
    "pornhub.com", "xvideos.com", "xnxx.com", "xhamster.com", "onlyfans.com",
    "redtube.com", "youporn.com", "tube8.com", "pornmd.com", "spankbang.com",
    "brazzers.com", "bangbros.com", "realitykings.com", "vixen.com",
    "blacked.com", "blackedraw.com", "tushy.com", "tushyraw.com",
    "evilangel.com", "naughtyamerica.com", "digitalplayground.com",
    "julesjordan.com", "twistys.com", "kink.com", "familytherapyxxx.com",
    "modelhub.com", "manyvids.com", "clips4sale.com", "chaturbate.com",
    "stripchat.com", "livejasmin.com", "cam4.com", "bongacams.com",
    "myfreecams.com", "camsoda.com", "xcams.com", "camster.com",
    "streamate.com", "imlive.com", "flirt4free.com", "porn.com",
    "porn300.com", "beeg.com", "eporner.com", "youjizz.com", "porntrex.com",
    "hclips.com", "tnaflix.com", "empflix.com", "xbiz.com", "avn.com",
    "adultempire.com", "adamandeve.com", "lovehoney.com", "penthouse.com",
    "playboy.com", "hustler.com", "sex.com", "thumbzilla.com",
    "pornhubpremium.com", "youpornpremium.com", "heavy-r.com", "motherless.com",
    "pornoxo.com", "theporncity.com", "palimas.com", "yespornplease.com",
    "goodporn.to", "pornve.com", "pornid.xxx", "hellporno.com",
    "fapomania.com", "pornhub.org", "iafd.com", "freeones.com",
    "babes.com", "fakku.net", "hentaihaven.org", "hanime.tv", "nhentai.net",
    "rule34.xxx", "hentaimama.io", "9anime.id", "kimcartoon.to", "mangago.me",
    "porntrex.to", "wetplace.com", "shagaholic.com", "vid2c.com",
    "youporntube.com", "pornork.com", "sxyprn.com", "shemale-movies.net",
    "tranny.one", "futanari.one", "apornvideo.com", "vporn.com",
    "pornktube.com", "sexvid.com", "xvideos2.com", "xvedios.com",
    "wankoz.com", "drtuber.com", "needgore.com", "sundry.club",
    "fap18.net", "javhd.com", "javhub.net", "javbus.com", "javlibrary.com",
    "missav.com", "jable.tv", "avgle.com", "xnxx2.com", "zeenite.com",
    "xemloi.org", "youjizz.com", "petite-teen-girls.com", "girlsway.com",
    "babygotboobs.com", "bang.com", "banged.com", "teamskeet.com",
    "propertysex.com", "18vr.com", "wankz.com", "slutload.com",
    "pornhub.es", "mydirtyhobby.com", "camsunited.com", "jerkmate.com",
    "yep.com", "ljplus.ru", "xtube.com", "redgifs.com", "imgur.com", 
    "gfycat.com", "porngifs.com", "nudegifs.com", "adultswim.com", 
    "literotica.com", "sexstories.com", "lushstories.com", "asstr.org",
    "nifty.org", "erotica.com", "dirtysexstories.com", "xfree.com",
    "pornwall.com", "theporndude.com", "bestpornstarens.com", "porndex.com",
    "pornlabs.net", "hypnotube.com", "eroprofile.com", "darknanny.com",
    "fux.com", "hqporner.com", "ebony.com", "gangbangcreampie.com",
    "milfsarea.com", "porzo.com", "pornstar.com", "swapporn.com",
    "hentaibondage.com", "bdsm.com", "fetlife.com", "kinkmenu.com",
  ],
  dating: [
    "tinder.com", "bumble.com", "hinge.co", "okcupid.com", "match.com",
    "eharmony.com", "zoosk.com", "plentyoffish.com", "pof.com",
    "ashleymadison.com", "seeking.com", "sugardaddymeet.com",
    "elitesingles.com", "coffeemeetsbagel.com", "happn.com", "grindr.com",
    "scruff.com", "her.com", "badoo.com", "tagged.com", "twoo.com",
    "flirt.com", "adultfriendfinder.com", "friendfinder.com", "fling.com",
    "date.com", "datenight.com", "dates.christiancafe.com", "catholicmatch.com",
    "silversingles.com", "ourtime.com", "seniormatch.com", "maturedating.co.uk",
    "beautifulpeople.com", "millionairematch.com", "luxy.com", "raya.com",
    "theleague.com", "innercircle.co", "jdate.com", "jsweet.com", "muzmatch.com",
    "salams.app", "hawaya.com", "eshyft.com", "islamicmarriage.com",
    "shaadi.com", "bharatmatrimony.com", "jeevansathi.com", "matrimony.com",
    "secondshaadi.com", "gowedding.in", "quackquack.in", "dilmill.com",
    "wooplus.com", "wingman.com", "tastebuds.fm", "wigglestore.com",
    "threesomer.com", "wild.com", "feeld.co", "pure.app", "badoo.com",
    "facebook.com/dating", "tinder.photographer", "haterapp.com", "her.zone",
  ],
  gambling: [
    "bet365.com", "betway.com", "betfair.com", "williamhill.com",
    "ladbrokes.com", "coral.co.uk", "paddypower.com", "bwin.com",
    "unibet.com", "888.com", "888casino.com", "888poker.com", "betmgm.com",
    "fanduel.com", "draftkings.com", "pointsbet.com", "betrivers.com",
    "betonline.ag", "bovada.lv", "betus.com", "mybookie.ag", "casino.com",
    "jackpotcity.com", "royalpanda.com", "spins.com", "leovegas.com",
    "partycasino.com", "slots.lv", "cafecasino.com", "goldennuggetcasino.com",
    "betsson.com", "mrgreen.com", "bet-at-home.com", "sportsbet.com.au",
    "tab.com.au", "neds.com.au", "parimatch.com", "melbet.com", "1xbet.com",
    "dafabet.com", "10bet.com", "betobet.com", "22bet.com", "jeetwin.com",
    "4rabet.com", "mostbet.com", "betwinner.com", "marathonbet.com",
    "fun88.com", "betway.in", "1xbet.in", "dafabet.in", "parimatch.in",
    "comeon.com", "genesis-casino.com", "bitstarz.com", "stake.com",
    "roobet.com", "casumo.com", "casinodays.com", "playojo.com",
    "pokerstars.com", "partypoker.com", "888poker.it", "betfair.poker",
    "guts.com", "giganticcassino.com", "livecasino.io", "casinoland.com",
    "betsafe.com", "betvictor.com", "betfred.com", "skybet.com",
    "crownbet.com.au", "betr.com.au", "ladbrokes.com.au", "palmsbet.com",
    "ggpoker.com", "wsop.com", "ignitioncasino.eu", "cafino.com",
    "tigerbingo.com", "mekkabingo.com", "bingoport.co.uk", "gala bingo",
    "satta.com", "bettingexpert.com", "oddschecker.com", "smarkets.com",
    "matchbook.com", "betangel.com", "betting.betfair.com",
  ],
  drugs: [
    "weedmaps.com", "leafly.com", "zamnesia.com", "royalqueenseeds.com",
    "dutch-headshop.nl", "sensiseeds.com", "ilovegrowingmarijuana.com",
    "growweedeasy.com", "rollitup.org", "thctalk.com", "drugbuyersguide.net",
    "drugs-forum.com", "bluelight.org", "erowid.org", "420magazine.com",
    "growertalks.com", "cannabis.com", "highlife420.com", "thecannabist.co",
    "marijuanatimes.org", "weedstocks.com", "ilovegrowingmarijuana.org",
    "autoflower.net", "seedsman.com", "herbiesheadshop.com",
    "420-seeds.com", "amsterdammarijuanaseeds.com", "cropkingseeds.com",
    "marijuanaseedcity.com", "paradiseseeds.com", "barneysfarm.com",
    "siberianseeds.com", "dinafem.org", "greenhouseseeds.nl",
    "dutchpassion.com", "msnl.nl", "peakseedsbc.com", "truenorthseedbank.com",
    "buycheapmarijuanaseeds.com", "nukeheads.com", "strainhunter.com",
    "cannabisculture.com", "skunkmed.com", "cannabis.net", "vaultcannabis.com",
    "seedcity.co.uk", "theweedshop.co.uk", "iceheadshop.co.uk",
    "everyonedoesit.com", "smokeplanet.com", "thegreenroute.co.uk",
    "smartshop.nl", "azarius.net", "psychonautwiki.org", "dmt-nexus.me",
    "shroomery.org", "mycotopia.net", "mushroom-cultivation.com",
    "fungi.com", "sporeworks.com", "premiumspores.com", "microdosing.com",
    "tripsitter.com", "doubleblindmag.com", "psychedelics.com",
    "mapstalk.org", "candyflip.com", "bluelight.nl", "vaping.com",
  ],
  explicit: [
    "fansly.com", "patreon.com", "manyvids.com", "onlyfans.com",
    "jerkofftocelebs.com", "celebritymoviearchive.com", "paparazzi.com",
    "explicitly.com", "lushstories.com", "sexstories.com", "literotica.com",
    "asstr.org", "nifty.org", "wattpad.com", "ao3.org", "fanfiction.net",
    "nhentai.net", "rule34.xxx", "e621.net", "gelbooru.com", "danbooru.donmai.us",
    "xbooru.com", "tbib.org", "konachan.com", "yandere.re", "zerochan.net",
    "sankakucomplex.com", "4chan.org", "8kun.top", "lookism.net",
    "tumblr.com", "reddit.com/r/nsfw", "swapporn.com", "fetish.com",
    "fetlife.com", "collarme.com", "bondage.com", "bdsm.com", "mansion.com",
    "submissive.com", "findom.com", "gentlefemdom.com", "femdom.cc",
    "femdom.com", "kitchenfemdom.com", "hotfemdom.com", "imfemdom.com",
    "pegging.com", "chastity.com", "cuckold.com", "cuckoldworld.com",
    "thecuckolds.com", "hotwife.com", "swinglifestyle.com", "swingers.com",
    "casualdates.com", "spicyflirt.com", "wildmatch.com", "amateurmatch.com",
    "bootycall.com", "dirtyroulette.com", "chatrandom.com", "omegle.com",
    "coomeet.com", "camgo.com", "chatki.com", "chatroulette.com",
    "viphentai.com", "hentai-stream.net", "hentaistream.tv",
  ],
};

export class InviteOtpsAndBlockedDomains1787000000000 implements MigrationInterface {
    name = 'InviteOtpsAndBlockedDomains1787000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invite_otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "email" character varying NOT NULL, "code" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "verified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_invite_otps" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_invite_otps_email" ON "invite_otps" ("email", "verified") `);
        await queryRunner.query(`CREATE TABLE "blocked_domains" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" character varying NOT NULL, "domain" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_blocked_domains" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_blocked_domains_category_domain" ON "blocked_domains" ("category", "domain") `);

        for (const [category, domains] of Object.entries(DOMAIN_SEED)) {
            for (const domain of domains) {
                await queryRunner.query(
                    `INSERT INTO "blocked_domains" ("category", "domain", "is_active") VALUES ($1, $2, true) ON CONFLICT DO NOTHING`,
                    [category, domain.trim().toLowerCase().replace(/^\.+/, '')],
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_blocked_domains_category_domain"`);
        await queryRunner.query(`DROP TABLE "blocked_domains"`);
        await queryRunner.query(`DROP INDEX "IDX_invite_otps_email"`);
        await queryRunner.query(`DROP TABLE "invite_otps"`);
    }
}
