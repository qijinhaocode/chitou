export interface DayData {
  label: string
  date: string
  count: number
  isToday: boolean
}

/** Build the last-7-days activity data from a ISO-date → count map. */
export function buildWeekData(countsMap: Record<string, number>): DayData[] {
  const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"]
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    return {
      label: DAY_LABELS[d.getDay()],
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      count: countsMap[key] ?? 0,
      isToday: i === 6,
    }
  })
}
