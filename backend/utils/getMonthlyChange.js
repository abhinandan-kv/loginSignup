export async function getMonthlyChange(data) {
  try {
    if (!data || data.length < 2) return null;

    const sorted = [...data].sort((a, b) => new Date(a.month).getDate - new Date(b.month));

    const prev = sorted[sorted.length - 2].value;
    const curr = sorted[sorted.length - 1].value;

    if (prev === 0) return { direction: "up", percentage: 100 };
    const percentage = ((curr - prev) / prev) * 100;

    return { direction: percentage >= 0 ? "up" : "down", percentage: Math.abs(percentage).toFixed(2), prev, curr };
  } catch (error) {
    console.error(error);
  }
}
