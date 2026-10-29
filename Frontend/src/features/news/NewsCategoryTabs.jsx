import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'

const CATEGORIES = [
  { key: 'all', label: 'All', value: null },
  { key: 'crops', label: 'Crops', value: 'Crops' },
  { key: 'schemes', label: 'Government schemes', value: 'Government schemes' },
  { key: 'weather', label: 'Weather', value: 'Weather' },
  { key: 'agritech', label: 'Agri-tech', value: 'Agri-tech' },
  { key: 'markets', label: 'Markets', value: 'Markets' },
]

export default function NewsCategoryTabs({
  activeCategory,
  onCategoryChange,
}) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const v = searchParams.get('category')
    if (v !== null && v !== '') {
      onCategoryChange(v === 'all' ? null : v)
    }
  }, [])

  const handleSelect = (value) => {
    onCategoryChange(value)
    const params = new URLSearchParams(searchParams)
    if (value === null) {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    navigate(`?${params.toString()}`, { replace: true })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.key}
          type="button"
          onClick={() => handleSelect(cat.value)}
          variant={activeCategory === cat.value ? 'primary' : 'secondary'}
          size="sm"
          className="rounded-[var(--radius-md)] text-xs"
          aria-pressed={activeCategory === cat.value ? 'true' : 'false'}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  )
}
