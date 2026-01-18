import { useState } from 'react'

function Upload({ onMealSaved }) {
  const [file, setFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [mealType, setMealType] = useState('breakfast')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (!file) return

    setAnalyzing(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error analyzing food:', error)
      alert('Failed to analyze food')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSaveMeal = async () => {
    if (!result) return

    setSaving(true)
    try {
      const response = await fetch('http://localhost:8000/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          meal_type: mealType,
          food: result.food,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
        }),
      })

      if (response.ok) {
        alert('Meal saved successfully!')
        setFile(null)
        setResult(null)
        if (onMealSaved) {
          onMealSaved()
        }
      } else {
        alert('Failed to save meal')
      }
    } catch (error) {
      console.error('Error saving meal:', error)
      alert('Failed to save meal')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="upload-container">
      <h2>Upload Food Photo</h2>
      
      <div className="upload-section">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="file-input"
        />
        
        {file && (
          <div className="file-preview">
            <p>Selected: {file.name}</p>
            <button 
              onClick={handleAnalyze}
              disabled={analyzing}
              className="btn btn-primary"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Food'}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="result-section">
          <h3>Analysis Results</h3>
          <div className="result-card">
            <h4>{result.food}</h4>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="label">Calories:</span>
                <span className="value">{result.calories} kcal</span>
              </div>
              <div className="nutrition-item">
                <span className="label">Protein:</span>
                <span className="value">{result.protein}g</span>
              </div>
              <div className="nutrition-item">
                <span className="label">Carbs:</span>
                <span className="value">{result.carbs}g</span>
              </div>
              <div className="nutrition-item">
                <span className="label">Fat:</span>
                <span className="value">{result.fat}g</span>
              </div>
            </div>
            {result.confidence && (
              <p className="confidence">Confidence: {(result.confidence * 100).toFixed(0)}%</p>
            )}
          </div>

          <div className="save-section">
            <h4>Save Meal</h4>
            <div className="form-group">
              <label>Date:</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Meal Type:</label>
              <select 
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="input"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <button 
              onClick={handleSaveMeal}
              disabled={saving}
              className="btn btn-success"
            >
              {saving ? 'Saving...' : 'Save Meal'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Upload
