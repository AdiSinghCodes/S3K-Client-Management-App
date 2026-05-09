import { createContext, useState, useEffect } from 'react'

export const DataContext = createContext()

export const DataProvider = ({ children }) => {
  // Financial Data
  const [monthlyFinancials, setMonthlyFinancials] = useState([])
  const [clientContracts, setClientContracts] = useState([])
  const [teamPerformance, setTeamPerformance] = useState([])
  const [weeklyReports, setWeeklyReports] = useState([])
  const [monthlyReviews, setMonthlyReviews] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    const savedFinancials = localStorage.getItem('monthlyFinancials')
    const savedContracts = localStorage.getItem('clientContracts')
    const savedPerformance = localStorage.getItem('teamPerformance')
    const savedReports = localStorage.getItem('weeklyReports')
    const savedReviews = localStorage.getItem('monthlyReviews')

    if (savedFinancials) setMonthlyFinancials(JSON.parse(savedFinancials))
    if (savedContracts) setClientContracts(JSON.parse(savedContracts))
    if (savedPerformance) setTeamPerformance(JSON.parse(savedPerformance))
    if (savedReports) setWeeklyReports(JSON.parse(savedReports))
    if (savedReviews) setMonthlyReviews(JSON.parse(savedReviews))
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('monthlyFinancials', JSON.stringify(monthlyFinancials))
  }, [monthlyFinancials])

  useEffect(() => {
    localStorage.setItem('clientContracts', JSON.stringify(clientContracts))
  }, [clientContracts])

  useEffect(() => {
    localStorage.setItem('teamPerformance', JSON.stringify(teamPerformance))
  }, [teamPerformance])

  useEffect(() => {
    localStorage.setItem('weeklyReports', JSON.stringify(weeklyReports))
  }, [weeklyReports])

  useEffect(() => {
    localStorage.setItem('monthlyReviews', JSON.stringify(monthlyReviews))
  }, [monthlyReviews])

  // Financial functions
  const addMonthlyFinancial = (data) => {
    const exists = monthlyFinancials.find(
      (item) => item.month === data.month && item.year === data.year
    )
    if (exists) {
      setMonthlyFinancials(
        monthlyFinancials.map((item) =>
          item.month === data.month && item.year === data.year ? data : item
        )
      )
    } else {
      setMonthlyFinancials([...monthlyFinancials, data])
    }
  }

  const getMonthlyFinancial = (month, year) => {
    return monthlyFinancials.find(
      (item) => item.month === month && item.year === year
    )
  }

  // Client contract functions
  const addClientContract = (clientId, data) => {
    const exists = clientContracts.find((item) => item.clientId === clientId)
    if (exists) {
      setClientContracts(
        clientContracts.map((item) =>
          item.clientId === clientId ? { ...data, clientId } : item
        )
      )
    } else {
      setClientContracts([...clientContracts, { ...data, clientId }])
    }
  }

  const getClientContract = (clientId) => {
    return clientContracts.find((item) => item.clientId === clientId)
  }

  // Team performance functions
  const updateTeamMemberPerformance = (memberId, data) => {
    const exists = teamPerformance.find((item) => item.memberId === memberId)
    if (exists) {
      setTeamPerformance(
        teamPerformance.map((item) =>
          item.memberId === memberId ? { ...data, memberId } : item
        )
      )
    } else {
      setTeamPerformance([...teamPerformance, { ...data, memberId }])
    }
  }

  const getTeamMemberPerformance = (memberId) => {
    return teamPerformance.find((item) => item.memberId === memberId)
  }

  // Weekly report functions
  const addWeeklyReport = (data) => {
    setWeeklyReports([...weeklyReports, { ...data, id: Date.now() }])
  }

  const updateWeeklyReport = (id, data) => {
    setWeeklyReports(
      weeklyReports.map((item) => (item.id === id ? { ...data, id } : item))
    )
  }

  // Monthly review functions
  const addMonthlyReview = (data) => {
    setMonthlyReviews([...monthlyReviews, { ...data, id: Date.now() }])
  }

  const updateMonthlyReview = (id, data) => {
    setMonthlyReviews(
      monthlyReviews.map((item) => (item.id === id ? { ...data, id } : item))
    )
  }

  return (
    <DataContext.Provider
      value={{
        monthlyFinancials,
        addMonthlyFinancial,
        getMonthlyFinancial,
        clientContracts,
        addClientContract,
        getClientContract,
        teamPerformance,
        updateTeamMemberPerformance,
        getTeamMemberPerformance,
        weeklyReports,
        addWeeklyReport,
        updateWeeklyReport,
        monthlyReviews,
        addMonthlyReview,
        updateMonthlyReview,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
