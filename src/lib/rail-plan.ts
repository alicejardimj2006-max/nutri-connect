// Distribuição dos cards das colunas laterais sem rolagem. Recebe a altura de cada card (já medida
// na largura da coluna) e devolve quais ficam em cada coluna e quais vão para a seção "Mais".

export interface RailPlan {
  left: number[];
  right: number[];
  /** Cards que não couberam em nenhuma coluna. */
  rest: number[];
}

/**
 * `heights` lista primeiro os cards da coluna esquerda (`leftCount` deles) e depois os da direita.
 * Cada coluna recebe os seus, na ordem, enquanto couberem em `maxHeight`; o que sobrar tenta a coluna
 * com mais espaço livre. Cards de altura 0 (sem dados) não ocupam espaço.
 */
export function planRails(
  heights: number[],
  leftCount: number,
  maxHeight: number,
  gap: number,
): RailPlan {
  const plan: RailPlan = { left: [], right: [], rest: [] };
  const used = { left: 0, right: 0 };
  const spilled: number[] = [];

  const tryPlace = (side: "left" | "right", i: number) => {
    const h = heights[i];
    if (h === 0) {
      plan[side].push(i);
      return true;
    }
    const need = (used[side] > 0 ? gap : 0) + h;
    if (used[side] + need > maxHeight) return false;
    used[side] += need;
    plan[side].push(i);
    return true;
  };

  heights.forEach((_, i) => {
    const side = i < leftCount ? "left" : "right";
    if (!tryPlace(side, i)) spilled.push(i);
  });
  for (const i of spilled) {
    const order: ("left" | "right")[] =
      used.left <= used.right ? ["left", "right"] : ["right", "left"];
    if (!order.some((side) => tryPlace(side, i))) plan.rest.push(i);
  }
  return plan;
}
