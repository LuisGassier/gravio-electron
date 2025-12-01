import * as React from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComboboxOption {
  value: string
  label: string
  subtitle?: string
  avatar?: string
  color?: string
  clave_empresa?: number
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  icon?: React.ReactNode
  className?: string
  showCount?: boolean
  countLabel?: string
  disabled?: boolean
}

// Function to generate avatar color based on text
const getAvatarColor = (text: string) => {
  const colors = [
    'bg-purple-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
  ]
  const index = text.charCodeAt(0) % colors.length
  return colors[index]
}

// Function to get initials from text
const getInitials = (text: string) => {
  const words = text.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  return text.substring(0, 2).toUpperCase()
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder: _searchPlaceholder = "Buscar...",
  emptyText = "No se encontraron resultados",
  icon,
  className,
  showCount = false,
  countLabel = "Resultados",
  disabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((option) => option.value === value)

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  // Reset highlighted index when filtered options change
  React.useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredOptions])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        inputRef.current?.blur()
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    setIsOpen(false)
    setSearchValue("")
    inputRef.current?.blur()
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange("")
    setSearchValue("")
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true)
    }
  }

  const displayValue = selectedOption?.label || ""

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input Container */}
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          {icon && <span className="text-primary transition-transform group-focus-within:scale-110">{icon}</span>}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchValue : displayValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full h-11 px-3 bg-input border-2 border-border rounded-lg text-foreground text-sm outline-none transition-all",
            "focus:border-primary focus:bg-background focus:shadow-sm",
            "placeholder:text-muted-foreground/60",
            icon && "pl-10",
            (value || isOpen) && "pr-16",
            disabled && "opacity-60 cursor-not-allowed bg-muted"
          )}
        />

        {/* Clear and Dropdown Icons */}
        {!disabled && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value && !isOpen && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors group"
              >
                <X className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
              </button>
            )}
            <div className={cn(
              "p-1.5 rounded-md transition-all",
              isOpen && "bg-primary/10"
            )}>
              <svg
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180 text-primary"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-popover border border-primary/20 rounded-lg shadow-2xl max-h-[320px] overflow-hidden animate-in fade-in-0 zoom-in-95"
        >
          {/* Count Header */}
          {showCount && (
            <div className="px-4 py-2.5 text-xs font-medium text-primary border-b border-border bg-primary/5">
              {countLabel} ({filteredOptions.length})
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-[270px] scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 cursor-pointer transition-all border-b border-border/50 last:border-0",
                    highlightedIndex === index && "bg-primary/5",
                    value === option.value && "bg-primary/10 border-l-2 border-l-primary"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm",
                      option.color || getAvatarColor(option.label)
                    )}
                  >
                    {option.avatar || getInitials(option.label)}
                  </div>

                  {/* Label y Subtitle */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {option.label}
                    </div>
                    {option.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">
                        {option.subtitle}
                      </div>
                    )}
                  </div>

                  {/* Check icon */}
                  {value === option.value && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
