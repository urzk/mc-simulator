// 本などは組み合わせが数十万通りになり計算に数秒かかるため、Web Worker で計算する
import { enchantCombinations, ITEM_TYPES } from "@/lib/enchant";

export type EnchantRequest = { itemId: string; enchantability: number; level: number };

self.onmessage = (e: MessageEvent<EnchantRequest>) => {
  const { itemId, enchantability, level } = e.data;
  const item = ITEM_TYPES.find((i) => i.id === itemId)!;
  self.postMessage(enchantCombinations(item, enchantability, level));
};
