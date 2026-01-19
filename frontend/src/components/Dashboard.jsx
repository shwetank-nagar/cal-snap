import { useState, useEffect } from 'react'

function Dashboard({ refreshToken }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSummary()
  }, [selectedDate, refreshToken])

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/summary?date=${selectedDate}`)
      const data = await response.json()
      setSummary(data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <h2>Daily Summary</h2>

      <div className="date-selector">
        <label>Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input"
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : summary ? (
        <div className="summary-section">
          <div className="summary-header">
            <h3>{summary.date}</h3>
            <p>{summary.meal_count} meal{summary.meal_count !== 1 ? 's' : ''}</p>
          </div>

          <div className="summary-grid">
            <div className="summary-card">
              <div className="card-icon">CAL</div>
              <div className="card-content">
                <h4>Calories</h4>
                <p className="card-value">{summary.total_calories.toFixed(0)}</p>
                <p className="card-unit">kcal</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">PRO</div>
              <div className="card-content">
                <h4>Protein</h4>
                <p className="card-value">{summary.total_protein.toFixed(1)}</p>
                <p className="card-unit">g</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">CARB</div>
              <div className="card-content">
                <h4>Carbs</h4>
                <p className="card-value">{summary.total_carbs.toFixed(1)}</p>
                <p className="card-unit">g</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">FAT</div>
              <div className="card-content">
                <h4>Fat</h4>
                <p className="card-value">{summary.total_fat.toFixed(1)}</p>
                <p className="card-unit">g</p>
              </div>
            </div>
          </div>

          {summary.meal_count === 0 && (
            <p className="empty-message">No meals recorded for this date.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default Dashboard
