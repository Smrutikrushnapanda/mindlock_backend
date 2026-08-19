import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockedApp } from '../entities/blocked-app.entity';
import { BulkUpdateAppsDto } from './dto';

@Injectable()
export class BlockedAppsService {
  constructor(
    @InjectRepository(BlockedApp) private readonly apps: Repository<BlockedApp>,
  ) {}

  async findAll(userId: string) {
    return this.apps.find({ where: { userId }, order: { appName: 'ASC' } });
  }

  async bulkUpdate(userId: string, dto: BulkUpdateAppsDto) {
    const existing = await this.apps.find({ where: { userId } });
    const byPackage = new Map(existing.map((a) => [a.packageName, a]));

    const toSave: BlockedApp[] = [];
    for (const item of dto.apps) {
      const found = byPackage.get(item.packageName);
      if (found) {
        if (item.appName !== undefined) found.appName = item.appName;
        if (item.category !== undefined) found.category = item.category;
        if (item.isBlocked !== undefined) found.isBlocked = item.isBlocked;
        toSave.push(found);
      } else {
        toSave.push(
          this.apps.create({
            userId,
            packageName: item.packageName,
            appName: item.appName,
            category: item.category ?? null,
            isBlocked: item.isBlocked ?? true,
          }),
        );
      }
    }

    await this.apps.save(toSave);
    return this.findAll(userId);
  }

  async toggle(userId: string, id: string) {
    const app = await this.apps.findOne({ where: { id, userId } });
    if (!app) {
      throw new NotFoundException('Blocked app not found');
    }
    app.isBlocked = !app.isBlocked;
    return this.apps.save(app);
  }

  catalog() {
    return APP_CATALOG.map(({ category, apps }) => ({
      category,
      apps: apps.map(([packageName, appName]) => ({ packageName, appName })),
    }));
  }
}

const APP_CATALOG: { category: string; apps: [string, string][] }[] = [
  {
    category: 'Social Media',
    apps: [
      ['com.instagram.android', 'Instagram'],
      ['com.facebook.katana', 'Facebook'],
      ['com.facebook.orca', 'Facebook Messenger'],
      ['com.whatsapp', 'WhatsApp'],
      ['com.twitter.android', 'X (Twitter)'],
      ['com.snapchat.android', 'Snapchat'],
      ['org.telegram.messenger', 'Telegram'],
      ['com.discord', 'Discord'],
      ['com.reddit.frontpage', 'Reddit'],
      ['com.pinterest', 'Pinterest'],
      ['com.linkedin.android', 'LinkedIn'],
      ['com.threads.android', 'Threads'],
      ['com.zhiliaoapp.musically', 'TikTok'],
      ['com.kuaishou.nebula', 'Kwai'],
      ['com.truecaller', 'Truecaller'],
      ['com.snapchat.android', 'Snapchat'],
    ],
  },
  {
    category: 'Video & Streaming',
    apps: [
      ['com.google.android.youtube', 'YouTube'],
      ['com.netflix.mediaclient', 'Netflix'],
      ['com.amazon.avod.thirdpartyclient', 'Amazon Prime Video'],
      ['in.startv.hotstar', 'Disney+ Hotstar'],
      ['com.jio.media.ondemand', 'JioCinema'],
      ['tv.twitch.android.app', 'Twitch'],
      ['com.spotify.music', 'Spotify'],
      ['com.gaana.app', 'Gaana'],
      ['com.jio.media.jiobeats', 'JioSaavn'],
      ['com.mxtech.videoplayer.ad', 'MX Player'],
      ['com.tubitv', 'Tubi'],
      ['com.hulu.plus', 'Hulu'],
      ['com.apple.android.music', 'Apple Music'],
      ['com.amazon.mp3', 'Amazon Music'],
      ['com.zing.mp3', 'Zing MP3'],
    ],
  },
  {
    category: 'Gaming',
    apps: [
      ['com.tencent.ig', 'PUBG Mobile'],
      ['com.dts.freefiremax', 'Free Fire Max'],
      ['com.dts.freefireth', 'Free Fire'],
      ['com.mobile.legends', 'Mobile Legends'],
      ['com.supercell.clashofclans', 'Clash of Clans'],
      ['com.supercell.royale', 'Clash Royale'],
      ['com.mojang.minecraftpe', 'Minecraft'],
      ['com.roblox.client', 'Roblox'],
      ['com.king.candycrushsaga', 'Candy Crush Saga'],
      ['com.codm', 'Call of Duty Mobile'],
      ['com.activision.callofduty.shooter', 'Call of Duty: Warzone'],
      ['com.miHoYo.GenshinImpact', 'Genshin Impact'],
      ['com.miHoYo.hkrpg', 'Honkai: Star Rail'],
      ['com.ea.game.pvz2_na', 'Plants vs Zombies 2'],
      ['com.four.five.ninety.nine', 'Ludo King'],
      ['com.miniclip.eightballpool', '8 Ball Pool'],
      ['com.gameloft.android.ANMP.GloftA9HM', 'Asphalt 9'],
      ['com.gramgames.royalmatch', 'Royal Match'],
      ['com.zeptolab.ctr.ads', 'Cut the Rope'],
      ['com.igg.castleclash', 'Castle Clash'],
    ],
  },
  {
    category: 'Dating',
    apps: [
      ['com.tinder', 'Tinder'],
      ['com.bumble.app', 'Bumble'],
      ['co.hinge.app', 'Hinge'],
      ['com.okcupid.okcupid', 'OkCupid'],
      ['com.match.mobile', 'Match'],
      ['com.eharmony', 'eHarmony'],
      ['com.zoosk', 'Zoosk'],
      ['com.pof.android', 'Plenty of Fish'],
      ['com.grindrapp.android', 'Grindr'],
      ['com.her.android', 'HER'],
      ['com.badoo', 'Badoo'],
      ['com.shaadi.android', 'Shaadi.com'],
      ['com.bharatmatrimony', 'Bharat Matrimony'],
      ['com.quackquack', 'QuackQuack'],
      ['com.ashleymadison.app', 'Ashley Madison'],
    ],
  },
  {
    category: 'Shopping',
    apps: [
      ['com.amazon.mShop.android.shopping', 'Amazon'],
      ['com.flipkart.android', 'Flipkart'],
      ['com.meesho.supply', 'Meesho'],
      ['com.myntra.android', 'Myntra'],
      ['com.snapdeal.main', 'Snapdeal'],
      ['com.ebay.mobile', 'eBay'],
      ['com.alibaba.aliexpresshd', 'AliExpress'],
      ['com.temu', 'Temu'],
      ['com.shein', 'SHEIN'],
      ['com.nykaa', 'Nykaa'],
      ['com.ajio', 'AJIO'],
      ['com.tatacliq', 'Tata CLiQ'],
      ['com.reliance.jio.jioprime', 'JioMart'],
    ],
  },
  {
    category: 'Browsers',
    apps: [
      ['com.android.chrome', 'Chrome'],
      ['org.mozilla.firefox', 'Firefox'],
      ['com.opera.browser', 'Opera'],
      ['com.opera.mini.native', 'Opera Mini'],
      ['com.microsoft.emmx', 'Microsoft Edge'],
      ['com.brave.browser', 'Brave'],
      ['com.sec.android.app.sbrowser', 'Samsung Internet'],
      ['com.uc.browser.en', 'UC Browser'],
      ['com.duckduckgo.mobile.android', 'DuckDuckGo'],
      ['com.vivaldi.browser', 'Vivaldi'],
    ],
  },
  {
    category: 'News & Reading',
    apps: [
      ['com.google.android.apps.magazines', 'Google News'],
      ['com.dailyhunt', 'DailyHunt'],
      ['in.inshorts', 'Inshorts'],
      ['com.oneindia.news', 'OneIndia'],
      ['com.nytimes.android', 'NYTimes'],
      ['com.guardian', 'The Guardian'],
      ['com.cnn.mobile.android.phone', 'CNN'],
      ['com.bbc.mobile.news.ww', 'BBC News'],
      ['com.whatsweb.news', 'News18'],
    ],
  },
];
