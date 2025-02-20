export function formatDate(str: string): Date {
  const months: { [key: string]: number } = {
    "янв.": 0,
    "фев.": 1,
    "мар.": 2,
    "апр.": 3,
    "мая.": 4,
    "июн.": 5,
    "июл.": 6,
    "авг.": 7,
    "сен.": 8,
    "окт.": 9,
    "ноя.": 10,
    "дек.": 11
  };
  const [day, month, year] = str.split(" ");
  const monthIndex = months[month.toLowerCase()];
  if (monthIndex === undefined) {
    throw new Error(`Unknown month: ${month}`);
  }

  const numericYear = parseInt(year.replace("г.", "").trim(), 10);
  const numericDay = parseInt(day, 10);

  return new Date(numericYear, monthIndex, numericDay);
}
