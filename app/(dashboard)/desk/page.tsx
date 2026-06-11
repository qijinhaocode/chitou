export default function DeskPage() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "待吃透", value: "24", color: "text-rose-500" },
          { label: "消化中", value: "12", color: "text-amber-500" },
          { label: "已吃透", value: "38", color: "text-emerald-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground mb-1">今日待复习</p>
        <p className="text-4xl font-bold text-foreground">8 张</p>
        <p className="text-xs text-muted-foreground mt-2">仪表盘完整版在 Step 5 实现</p>
      </div>
    </div>
  )
}
