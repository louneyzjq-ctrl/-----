import type { TStory } from '../types'

export const STORIES: TStory[] = [
  {
    id: 'night-watch',
    title: '夜班守望',
    difficulty: 'easy',
    surface:
      '我在便利店的夜班值守。凌晨两点时，监控画面突然空白了一秒钟。更奇怪的是，收银台抽屉却从没被撬开。',
    bottom:
      '监控并不是故障：那一秒钟店长把摄像头的供电短接以重置系统；抽屉没被撬，是因为营业款在抽屉里从未有人动过。',
  },
  {
    id: 'sealed-room',
    title: '封闭的房间',
    difficulty: 'medium',
    surface:
      '案发时房间从内反锁。窗户紧闭，门也完好无损。钥匙却在地板中央，像是有人刚把它放下。',
    bottom:
      '房间门的“反锁”只是把门插销压住；真正的锁芯并未上锁。钥匙从门缝掉落，地板中央是安装人员测试时不小心遗留的。',
  },
  {
    id: 'broken-tea',
    title: '碎茶杯',
    difficulty: 'hard',
    surface:
      '晚饭后，客人抱怨茶太烫。我端起茶杯却只喝了一口。下一秒杯子忽然碎成两半，茶也没有溅出来。',
    bottom:
      '杯子先前就有裂纹，只是在刚才因为热胀冷缩受力崩裂；茶没有溅出是因为杯中只剩少量液体，且碎裂方向向内。',
  },
  {
    id: 'missing-footprint',
    title: '消失的脚印',
    difficulty: 'medium',
    surface:
      '雨后我沿着走廊寻找脚印。奇怪的是，只有我自己的脚印一路清晰，其他人却像从没来过。',
    bottom:
      '走廊铺设了可吸水的地垫：其他人的脚印被地垫吸收了；只有我穿的鞋底带着防水胶层，雨水并未被吸收。',
  },
]

export function getStoryById(id: string): TStory | undefined {
  return STORIES.find((s) => s.id === id)
}

