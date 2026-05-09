const ProgressBar = ({ value, label, color = 'primary' }) => {
  const colorMap = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-dark text-sm">{label}</span>
        <span className="text-sm font-semibold text-primary">{value}%</span>
      </div>
      <div className="progress-bar">
        <div
          className={`h-full rounded-full transition-all ${colorMap[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
