import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { DollarSign, TrendingUp, Users, Eye, ToggleLeft } from 'lucide-react'
import { motion } from 'motion/react'

function NumberInput({
  label,
  value,
  step,
  min,
  prefix,
  suffix,
  onChange,
  color = 'teal',
}: {
  label: string
  value: number
  step: number
  min?: number
  prefix?: string
  suffix?: string
  onChange: (v: number) => void
  color?: 'teal' | 'purple' | 'indigo'
}) {
  const ringColor = {
    teal: 'focus:border-teal-500/70 focus:ring-teal-500/20',
    purple: 'focus:border-purple-500/70 focus:ring-purple-500/20',
    indigo: 'focus:border-indigo-500/70 focus:ring-indigo-500/20',
  }[color]
  const textColor = {
    teal: 'text-teal-400',
    purple: 'text-purple-400',
    indigo: 'text-indigo-400',
  }[color]

  return (
    <div className="space-y-1.5">
      <span className="text-sm text-slate-300 font-medium block">{label}</span>
      <div className="flex items-center gap-1">
        {prefix && <span className={`text-sm font-mono font-bold ${textColor}`}>{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          min={min ?? 0}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v) && v >= (min ?? 0)) onChange(v)
          }}
          className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold ${textColor} focus:outline-none focus:ring-2 transition-colors ${ringColor} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
        {suffix && <span className={`text-sm font-mono font-bold ${textColor}`}>{suffix}</span>}
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: 'teal' | 'purple' | 'indigo' | 'green'
  sub?: string
}) {
  const colors = {
    teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', icon: 'text-teal-500' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-500' },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', icon: 'text-indigo-500' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-500' },
  }
  const c = colors[color]
  return (
    <motion.div
      layout
      className={`${c.bg} border ${c.border} rounded-xl p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={c.icon} />
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <div className={`font-mono font-bold ${c.text} truncate text-xl leading-tight`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1 truncate">{sub}</div>}
    </motion.div>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmt$(n: number) {
  if (!isFinite(n) || isNaN(n)) return '$∞'
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

function fmtNum(n: number) {
  if (!isFinite(n) || isNaN(n)) return '∞'
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T`
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

// Custom tooltip for recharts
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-2 font-medium">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-sm font-mono font-bold" style={{ color: p.color }}>
            {p.name}: {fmt$(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function MoneySimulatorTab() {
  const [dailyVisitors, setDailyVisitors] = useState(200)
  const [premiumPrice, setPremiumPrice] = useState(4.99)
  const [conversionRate, setConversionRate] = useState(2)
  const [adCPM, setAdCPM] = useState(2.5)
  const [adsEnabled, setAdsEnabled] = useState(true)
  const [premiumEnabled, setPremiumEnabled] = useState(true)

  const metrics = useMemo(() => {
    const monthlyPageviews = dailyVisitors * 30 * 2.5 // avg 2.5 pages/visit
    const monthlyUpgrades = adsEnabled || premiumEnabled
      ? Math.floor((dailyVisitors * 30) * (conversionRate / 100))
      : 0
    const monthlyAdRevenue = adsEnabled ? (monthlyPageviews / 1000) * adCPM : 0
    const monthlyPremiumRevenue = premiumEnabled ? monthlyUpgrades * premiumPrice : 0
    const totalMonthly = monthlyAdRevenue + monthlyPremiumRevenue
    const totalYearly = totalMonthly * 12

    return {
      monthlyPageviews,
      monthlyUpgrades,
      monthlyAdRevenue,
      monthlyPremiumRevenue,
      totalMonthly,
      totalYearly,
    }
  }, [dailyVisitors, premiumPrice, conversionRate, adCPM, adsEnabled, premiumEnabled])

  const chartData = useMemo(() => {
    return MONTHS.map((month, i) => {
      const growthFactor = Math.pow(1.22, i) // ~22% monthly growth
      const visitors = dailyVisitors * growthFactor
      const pageviews = visitors * 30 * 2.5
      const upgrades = Math.floor(visitors * 30 * (conversionRate / 100))
      const adRev = adsEnabled ? (pageviews / 1000) * adCPM : 0
      const premRev = premiumEnabled ? upgrades * premiumPrice : 0
      return {
        month,
        'Ad Revenue': Math.round(adRev),
        'Premium Revenue': Math.round(premRev),
        'Total Revenue': Math.round(adRev + premRev),
      }
    })
  }, [dailyVisitors, premiumPrice, conversionRate, adCPM, adsEnabled, premiumEnabled])

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">🧮 Money Simulator</h2>
        <p className="text-slate-400">
          Move the sliders and watch your projected revenue update in real-time. Toggle revenue
          streams on/off to see what matters most.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="card-base p-6 space-y-7">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">
              Traffic & Users
            </h3>
            <div className="space-y-5">
              <NumberInput
                label="Daily Unique Visitors"
                value={dailyVisitors}
                step={100}
                min={1}
                onChange={setDailyVisitors}
                color="teal"
              />
              <NumberInput
                label="Conversion Rate (free → premium)"
                value={conversionRate}
                step={0.1}
                min={0}
                suffix="%"
                onChange={setConversionRate}
                color="purple"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">
              Revenue Streams
            </h3>
            <div className="space-y-5">
              {/* Ad Revenue Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300 font-medium flex items-center gap-2">
                    <Eye size={14} className="text-teal-400" />
                    Ad Revenue (CPM)
                  </label>
                  <button
                    onClick={() => setAdsEnabled(!adsEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      adsEnabled ? 'bg-teal-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        adsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {adsEnabled && (
                  <NumberInput
                    label="Ad CPM (per 1,000 pageviews)"
                    value={adCPM}
                    step={0.1}
                    min={0}
                    prefix="$"
                    onChange={setAdCPM}
                    color="teal"
                  />
                )}
              </div>

              {/* Premium Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300 font-medium flex items-center gap-2">
                    <ToggleLeft size={14} className="text-purple-400" />
                    Premium Upgrades
                  </label>
                  <button
                    onClick={() => setPremiumEnabled(!premiumEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      premiumEnabled ? 'bg-purple-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        premiumEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {premiumEnabled && (
                  <NumberInput
                    label="Premium Price (one-time / monthly)"
                    value={premiumPrice}
                    step={0.5}
                    min={0}
                    prefix="$"
                    onChange={setPremiumPrice}
                    color="purple"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard
              label="Monthly Pageviews"
              value={fmtNum(metrics.monthlyPageviews)}
              icon={Eye}
              color="indigo"
            />
            <MetricCard
              label="Monthly Upgrades"
              value={fmtNum(metrics.monthlyUpgrades)}
              icon={Users}
              color="purple"
              sub={`${fmtNum(conversionRate)}% conversion`}
            />
            <MetricCard
              label="Ad Earnings"
              value={fmt$(metrics.monthlyAdRevenue)}
              icon={DollarSign}
              color="teal"
              sub={adsEnabled ? 'This month' : 'Disabled'}
            />
            <MetricCard
              label="Premium Earnings"
              value={fmt$(metrics.monthlyPremiumRevenue)}
              icon={DollarSign}
              color="purple"
              sub={premiumEnabled ? 'This month' : 'Disabled'}
            />
            <MetricCard
              label="Total Monthly"
              value={fmt$(metrics.totalMonthly)}
              icon={TrendingUp}
              color="green"
            />
            <MetricCard
              label="Total Yearly"
              value={fmt$(metrics.totalYearly)}
              icon={TrendingUp}
              color="green"
              sub="Projected (20% mo growth)"
            />
          </div>

          {/* Chart */}
          <div className="card-base p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
              12-Month Revenue Projection
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Assumes ~22% monthly user growth as your app gains traction
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPrem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmt$(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }}
                />
                {adsEnabled && (
                  <Area
                    type="monotone"
                    dataKey="Ad Revenue"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fill="url(#colorAd)"
                  />
                )}
                {premiumEnabled && (
                  <Area
                    type="monotone"
                    dataKey="Premium Revenue"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fill="url(#colorPrem)"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="Total Revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#colorTotal)"
                  strokeDasharray={adsEnabled || premiumEnabled ? '0' : '4 4'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
