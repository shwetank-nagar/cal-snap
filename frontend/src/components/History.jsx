import { useState, useEffect } from 'react'

function History({ refreshToken }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMeals()
  }, [selectedDate, refreshToken])

  const fetchMeals = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/meals?date=${selectedDate}`)
      const data = await response.json()
      setMeals(data)
    } catch (error) {
      console.error('Error fetching meals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: 'B',
      lunch: 'L',
      dinner: 'D',
      snack: 'S',
    }
    return icons[mealType] || 'M'
  }

  return (
    <div className="history-container">
      <h2>Meal History</h2>

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
      ) : (
        <div className="meals-list">
          {meals.length === 0 ? (
            <p className="empty-message">No meals recorded for this date.</p>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="meal-card">
                <div className="meal-header">
                  <span className="meal-icon">{getMealIcon(meal.meal_type)}</span>
                  <div>
                    <h4>{meal.food}</h4>
                    <p className="meal-type">{meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}</p>
                  </div>
                </div>
                <div className="meal-nutrition">
                  <div className="nutrition-item">
                    <span className="label">Calories</span>
                    <span className="value">{meal.calories} kcal</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="label">Protein</span>
                    <span className="value">{meal.protein}g</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="label">Carbs</span>
                    <span className="value">{meal.carbs}g</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="label">Fat</span>
                    <span className="value">{meal.fat}g</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default History
