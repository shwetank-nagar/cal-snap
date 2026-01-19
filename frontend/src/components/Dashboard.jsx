import { useState, useEffect } from 'react'

function Dashboard({ refreshToken }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [summary, setSummary] = useState(null)
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [selectedDate, refreshToken])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [summaryRes, mealsRes] = await Promise.all([
        fetch(`http://localhost:8000/api/summary?date=${selectedDate}`),
        fetch(`http://localhost:8000/api/meals?date=${selectedDate}`)
      ])
      const summaryData = await summaryRes.json()
      const mealsData = await mealsRes.json()
      setSummary(summaryData)
      setMeals(mealsData)
    } catch (error) {
      console.error('Error fetching data:', error)
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

          {meals.length > 0 && (
            <div className="meals-preview">
              <h3>Meals Today</h3>
              <div className="meals-list-compact">
                {meals.map((meal) => (
                  <div key={meal.id} className="meal-item-compact">
                    <span className="meal-name">{meal.food}</span>
                    <span className="meal-calories">{meal.calories} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default Dashboard
