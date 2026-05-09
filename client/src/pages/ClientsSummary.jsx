import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import companyService from '../services/company.service'

const ClientsSummary = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'senior_management'
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('All')
  const [expandedClient, setExpandedClient] = useState(null)

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const response = await companyService.getCompanies()
        setCompanies(response.data || response.companies || [])
        setError('')
      } catch (err) {
        console.error('Error fetching companies:', err)
        setError('Failed to fetch companies')
        setCompanies([])
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  // Comprehensive clients data (fallback)
  const clientsData = companies.length > 0 ? companies : [
    {
      id: 'tekman',
      name: 'Tekman India',
      industry: 'Manufacturing',
      location: 'Chennai, India',
      email: 'contact@tekman.com',
      phone: '+91-44-2719-1234',
      description: 'Leading manufacturing solutions provider specializing in industrial automation and ERP systems',
      keyProjects: ['Document Classification', 'Invoice Processing', 'Inventory Management'],
      employees: 250,
      foundedYear: 2015,
      revenue: 'USD 50M',
    },
    {
      id: 'techflow',
      name: 'TechFlow Solutions',
      industry: 'Technology',
      location: 'Bengaluru, India',
      email: 'hi@techflow.io',
      phone: '+91-80-4162-5678',
      description: 'Digital transformation consultancy helping enterprises modernize their IT infrastructure',
      keyProjects: ['Cloud Migration', 'Data Analytics', 'Mobile App Development'],
      employees: 180,
      foundedYear: 2012,
      revenue: 'USD 35M',
    },
    {
      id: 'datasync',
      name: 'DataSync Inc',
      industry: 'Analytics',
      location: 'New York, USA',
      email: 'info@datasync.io',
      phone: '+1-212-555-9999',
      description: 'Enterprise data analytics platform providing real-time insights and business intelligence solutions',
      keyProjects: ['Real-Time Analytics', 'Predictive Modeling', 'BI Dashboard'],
      employees: 150,
      foundedYear: 2018,
      revenue: 'USD 25M',
    },
    {
      id: 'apcotex',
      name: 'Apcotex Industries Limited',
      industry: 'Chemicals',
      location: 'Ahmedabad, India',
      email: 'corporate@apcotex.com',
      phone: '+91-79-2680-1234',
      description: 'Global specialty chemicals manufacturer with operations across India, Europe, and Asia-Pacific regions',
      keyProjects: [
        'Supply Chain Optimization',
        'Chemical Processing AI',
        'Sustainability Tracking',
        'Quality Control ML',
        'Production Planning',
      ],
      employees: 2500,
      foundedYear: 1986,
      revenue: 'USD 450M',
      keyMetrics: {
        marketShare: 'In liquid specialty chemicals and adhesive raw materials, Apcotex holds approx. 10% market share in India',
        annualProduction: 'Over 100,000 tons per annum',
        factoriesCount: 5,
        countriesPresent: 12,
        directEmployees: 2500,
        contractWorkers: 1200,
      },
      businessUnits: [
        { name: 'Liquid Specialties', description: 'Manufacturing liquid specialty chemicals and adhesive raw materials' },
        { name: 'Polymers', description: 'Production of synthetic polymers for various applications' },
        { name: 'Export', description: 'Global distribution and export of specialty chemicals' },
      ],
      supplies: [
        'Acrylic-based adhesives',
        'Liquid resins',
        'Industrial coatings',
        'Polymer compounds',
        'Emulsions',
        'Specialty additives',
      ],
      clients: [
        'Leading paint and coating manufacturers',
        'Rubber and plastic processing industries',
        'Adhesive manufacturers',
        'Construction and building material companies',
        'Automotive suppliers',
        'Packaging companies',
      ],
      certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'DSIR Recognition'],
      strategicFocus: 'Expanding production capacity, entering new specialty chemical segments, sustainable manufacturing',
    },
  ]

  // Get industries for filter
  const industries = useMemo(() => {
    const unique = ['All', ...new Set(clientsData.map((c) => c.industry))]
    return unique
  }, [])

  // Filter and search clients
  const filteredClients = useMemo(() => {
    return clientsData.filter((client) => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesIndustry = filterIndustry === 'All' || client.industry === filterIndustry
      return matchesSearch && matchesIndustry
    })
  }, [searchQuery, filterIndustry])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Clients Summary</h1>
        <p className="text-muted">Detailed profiles of all our clients and their business information</p>
      </div>

      {/* Search and Filter */}
      <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Search Clients</label>
            <input
              type="text"
              placeholder="Search by name or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Filter by Industry</label>
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clients Count */}
      <div className="flex justify-between items-center">
        <p className="text-muted">
          Showing {filteredClients.length} of {clientsData.length} clients
        </p>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map((client) => {
          const isExpanded = expandedClient === client.id

          return (
            <div
              key={client.id}
              className="card p-6 border-l-4 border-l-primary hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setExpandedClient(isExpanded ? null : client.id)}
            >
              {/* Client Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-dark mb-1">{client.name}</h3>
                  <p className="text-sm text-muted">{client.industry}</p>
                </div>
                <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
              </div>

              {/* Client Quick Info */}
              <div className="space-y-2 mb-4 pb-4 border-b border-border">
                <p className="text-sm text-dark">
                  <span className="font-semibold">Location:</span> {client.location}
                </p>
                <p className="text-sm text-dark">
                  <span className="font-semibold">Employees:</span> {client.employees?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-sm text-dark">
                  <span className="font-semibold">Founded:</span> {client.foundedYear}
                </p>
                <p className="text-sm text-dark">
                  <span className="font-semibold">Revenue:</span> {client.revenue}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm text-muted mb-4">{client.description}</p>

              {/* Contract Status */}
              {contract && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-700 mb-1">Active Contract</p>
                  <p className="text-sm font-bold text-dark">${(contract.contractValue / 1000).toFixed(0)}K</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="mb-4 pb-4 border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted mb-2">Contact Information</p>
                <p className="text-sm text-dark">Email: {client.email}</p>
                <p className="text-sm text-dark">Phone: {client.phone}</p>
              </div>

              {/* Key Projects */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted mb-2">Key Projects</p>
                <div className="flex flex-wrap gap-2">
                  {client.keyProjects?.map((project, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {project}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  {/* Apcotex Special Sections */}
                  {client.id === 'apcotex' && (
                    <>
                      {/* Key Metrics */}
                      <div>
                        <h4 className="font-semibold text-dark mb-3">Key Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-dark">
                            <span className="font-medium">Market Share:</span> {client.keyMetrics?.marketShare}
                          </p>
                          <p className="text-dark">
                            <span className="font-medium">Annual Production:</span> {client.keyMetrics?.annualProduction}
                          </p>
                          <p className="text-dark">
                            <span className="font-medium">Number of Factories:</span> {client.keyMetrics?.factoriesCount}
                          </p>
                          <p className="text-dark">
                            <span className="font-medium">Countries Present:</span> {client.keyMetrics?.countriesPresent}
                          </p>
                          <p className="text-dark">
                            <span className="font-medium">Direct Employees:</span> {client.keyMetrics?.directEmployees?.toLocaleString()}
                          </p>
                          <p className="text-dark">
                            <span className="font-medium">Contract Workers:</span> {client.keyMetrics?.contractWorkers?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Business Units */}
                      <div>
                        <h4 className="font-semibold text-dark mb-2">Business Units</h4>
                        <div className="space-y-2">
                          {client.businessUnits?.map((unit, idx) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded">
                              <p className="text-sm font-semibold text-dark">{unit.name}</p>
                              <p className="text-xs text-muted">{unit.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Supplies */}
                      <div>
                        <h4 className="font-semibold text-dark mb-2">Key Supplies</h4>
                        <div className="flex flex-wrap gap-2">
                          {client.supplies?.map((supply, idx) => (
                            <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                              {supply}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Clients */}
                      <div>
                        <h4 className="font-semibold text-dark mb-2">End Clients & Industries Served</h4>
                        <ul className="text-sm text-dark space-y-1">
                          {client.clients?.map((cl, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{cl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Certifications */}
                      <div>
                        <h4 className="font-semibold text-dark mb-2">Certifications & Recognition</h4>
                        <div className="flex flex-wrap gap-2">
                          {client.certifications?.map((cert, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Strategic Focus */}
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Strategic Focus</p>
                        <p className="text-sm text-blue-900">{client.strategicFocus}</p>
                      </div>
                    </>
                  )}

                  {client.id !== 'apcotex' && (
                    <p className="text-sm text-muted">Additional details available on request</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* No Results */}
      {filteredClients.length === 0 && (
        <div className="card p-12 text-center bg-gray-50">
          <p className="text-xl text-muted mb-2">No clients found</p>
          <p className="text-sm text-muted">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Admin Info */}
      {isAdmin && (
        <div className="card p-6 bg-purple-50 border-l-4 border-l-purple-500">
          <h3 className="font-semibold text-dark mb-2">Admin Note</h3>
          <p className="text-sm text-dark">
            Use the Company CRM page to manage client contracts and update contract values. Click on a client card to expand and
            view detailed information.
          </p>
        </div>
      )}
    </div>
  )
}

export default ClientsSummary
