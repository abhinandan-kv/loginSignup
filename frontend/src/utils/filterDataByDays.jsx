export function filterDataByDays(data, days, dateKey = "month") {
  console.log(data, days);
  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - days);

  return data.filter((item) => {
    const itemDate = new Date(item[dateKey]);
    // console.log("ITEMDATE --->", itemDate);
    return itemDate >= from && itemDate <= now;
  });
}
