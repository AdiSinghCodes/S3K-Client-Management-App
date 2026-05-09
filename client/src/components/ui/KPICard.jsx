const KPICard = ({ icon, label, value, unit = '', trend = null }) => {
  return (
    <div className="card p-6 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="card-value">{value}</span>
            {unit && <span className="text-lg text-muted">{unit}</span>}
          </div>
          {trend !== null && trend !== undefined && (
            <div className={`text-sm font-medium mt-2 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% from last month
            </div>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

export default KPICard
