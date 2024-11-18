import { ChevronDown, FileText, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function Component() {
  const [file, setFile] = useState(null)
  const [columns, setColumns] = useState([])
  const [columnTypes, setColumnTypes] = useState({})
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleColumnTypeChange = (column, value) => {
    setColumnTypes({
      ...columnTypes,
      [column]: value,
    })
  }

  const handleSubmit = async () => {
    if (!file) {
      alert('Veuillez sélectionner un fichier.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setColumns(data.columns)
      await processColumns(data.file_path)
    } catch (err) {
      setError('Erreur lors de l\'upload du fichier')
      setLoading(false)
    }
  }

  const processColumns = async (filePath) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/process_columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: filePath, column_types: columnTypes }),
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setResults(data)
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du traitement des colonnes')
      setLoading(false)
    }
  }

  const renderMatrix = (matrix, title) => {
    const getHeaderColor = () => {
      switch (title) {
        case 'Matrice de dissemblance':
          return 'bg-blue-500'
        case 'Matrice de Burt':
          return 'bg-green-500'
        default:
          return 'bg-purple-100'
      }
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`${getHeaderColor()} text-white`}>
            <tr>
              {matrix[0].map((_, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Col {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderHistogram = (data, title) => {
    const chartData = data.flat().map((value, index) => ({ value, index: `${index}` }))

    return (
      <div className="w-full mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">{title} - Histogram</h3>
        <p className="text-sm text-gray-600 mb-4">Distribution of values in the matrix</p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const renderCombobar = (data, title) => {
    const chartData = data.map((row, rowIndex) => {
      const rowData = { name: `Row ${rowIndex + 1}` }
      row.forEach((value, colIndex) => {
        rowData[`Col ${colIndex + 1}`] = value
      })
      return rowData
    })

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

    return (
      <div className="w-full mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">{title} - Combobar</h3>
        <p className="text-sm text-gray-600 mb-4">Comparison of values across rows and columns</p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data[0].map((_, colIndex) => (
                <Bar
                  key={`Col ${colIndex + 1}`}
                  dataKey={`Col ${colIndex + 1}`}
                  fill={colors[colIndex % colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const renderPieChart = (data, title) => {
    const chartData = data.flat().reduce((acc, value, index) => {
      acc.push({ name: `Item ${index + 1}`, value })
      return acc
    }, [])

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

    return (
      <div className="w-full mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">{title} - Camembert</h3>
        <p className="text-sm text-gray-600 mb-4">Répartition des valeurs dans la matrice</p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-0 w-screen">
      <div className="relative py-3 sm:max-w-full sm:mx-auto w-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 w-full">
          <div className="max-w-90 mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Application de traitement de fichier</h1>

            <div className="mb-6">
              <label htmlFor="file-upload" className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <Upload className="mr-2 h-5 w-5 text-gray-400" />
                <span>{file ? file.name : 'Sélectionner un fichier'}</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Télécharger et traiter
                </>
              )}
            </button>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {Object.entries(columns).map(([col, values], index) => (
    <div key={index} className="relative">
        <select
            onChange={(e) => handleColumnTypeChange(col, e.target.value)}
            value={columnTypes[col] || ''}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500"
        >
            <option value="">Type pour {col}</option>
            <option value="0">Nominal</option>
            <option value="1">Ordinal</option>
        </select>
        <div className="text-gray-600 mt-1">
            {values.join(", ")}
        </div>
    </div>
))}

            {results && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Résultats</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Matrice de dissemblance</h3>
                    {results.distance_matrix && renderMatrix(results.distance_matrix, 'Matrice de dissemblance')}
                    {results.distance_matrix && renderHistogram(results.distance_matrix, 'Matrice de dissemblance')}
                    {/* {results.distance_matrix && renderCombobar(results.distance_matrix, 'Matrice de dissemblance')}
                    {results.distance_matrix && renderPieChart(results.distance_matrix, 'Matrice de dissemblance')} */}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Matrice de Burt</h3>
                    {results.burt_matrix && renderMatrix(results.burt_matrix, 'Matrice de Burt')}
                    {results.burt_matrix && renderHistogram(results.burt_matrix, 'Matrice de Burt')}
                    {/* {results.burt_matrix && renderCombobar(results.burt_matrix, 'Matrice de Burt')}
                    {results.burt_matrix && renderPieChart(results.burt_matrix, 'Matrice de Burt')} */}
                  </div>
                  <div>
  <h3 className="text-lg font-medium text-gray-900 mb-4">Tables de contingence</h3>
  {results?.contingency_tables &&
    Object.keys(results.contingency_tables).map((tableKey) => (
      <section key={tableKey} className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3">{tableKey}</h4>
        <div className="space-y-4">
          {renderMatrix(results.contingency_tables[tableKey], tableKey)}
          {renderHistogram(results.contingency_tables[tableKey], tableKey)}
          {renderCombobar(results.contingency_tables[tableKey], tableKey)}
          {renderPieChart(results.contingency_tables[tableKey], tableKey)}
        </div>
        {results?.freq_tables?.[tableKey] && (
          <div className="mt-4">
            {renderMatrix(results.freq_tables[tableKey], tableKey)}
          </div>
        )}
      </section>
    ))}
</div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}