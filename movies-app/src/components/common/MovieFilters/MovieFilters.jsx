import React from 'react'
import {
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Button,
    Chip,
    Slider,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress
} from '@material-ui/core'
import {
    ExpandMore as ExpandMoreIcon,
    FilterList as FilterListIcon,
    Clear as ClearIcon,
    Search as SearchIcon
} from '@material-ui/icons'
import styles from './styles/MovieFilters.module.css'

const MovieFilters = ({
                          filters,
                          filterOptions,
                          onUpdateFilter,
                          onUpdatePriceRange,
                          onResetFilters,
                          hasActiveFilters,
                          totalResults,
                          totalMovies,
                          isSearching = false
                      }) => {
    if (!filterOptions || !filters) {
        return null
    }

    const { studios = [], priceRange = { min: 0, max: 1000 } } = filterOptions

    const safeMinPrice = Math.max(0, priceRange.min || 0)
    const safeMaxPrice = Math.max(safeMinPrice + 1, priceRange.max || 1000)
    const currentMin = Math.max(safeMinPrice, filters.priceRange?.min || 0)
    const currentMax = Math.min(safeMaxPrice, filters.priceRange?.max || 1000)

    const handlePriceChange = (event, newValue) => {
        if (Array.isArray(newValue) && newValue.length === 2) {
            onUpdatePriceRange(newValue[0], newValue[1])
        }
    }

    const shouldRenderSlider = safeMaxPrice > safeMinPrice &&
        typeof currentMin === 'number' &&
        typeof currentMax === 'number' &&
        currentMin <= currentMax

    return (
        <Paper className={styles.filtersContainer}>
            <Accordion defaultExpanded>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="filters-content"
                    id="filters-header"
                >
                    <Box display="flex" alignItems="center" width="100%">
                        <FilterListIcon className={styles.filterIcon} />
                        <Typography variant="h6" className={styles.filterTitle}>
                            Movie Filters
                        </Typography>
                        <Box ml="auto" mr={2} display="flex" alignItems="center">
                            {isSearching && (
                                <CircularProgress size={16} style={{ marginRight: 8 }} />
                            )}
                            <Typography variant="body2" color="textSecondary">
                                {isSearching ? 'Searching...' : `${totalResults || 0} of ${totalMovies || 0} movies`}
                            </Typography>
                        </Box>
                    </Box>
                </AccordionSummary>

                <AccordionDetails>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Search by title"
                                variant="outlined"
                                size="small"
                                value={filters.title || ''}
                                onChange={(e) => onUpdateFilter('title', e.target.value)}
                                placeholder="Enter movie title..."
                                InputProps={{
                                    startAdornment: <SearchIcon style={{ marginRight: 8, color: '#666' }} />
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Studio</InputLabel>
                                <Select
                                    value={filters.studio || ''}
                                    onChange={(e) => onUpdateFilter('studio', e.target.value)}
                                    label="Studio"
                                >
                                    <MenuItem value="">All Studios</MenuItem>
                                    {studios.map(studio => (
                                        <MenuItem key={studio} value={studio}>
                                            {studio}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>



                        <Grid item xs={12} md={8}>
                            <Typography gutterBottom>
                                Price Range: ${currentMin} - ${currentMax}
                            </Typography>
                            {shouldRenderSlider ? (
                                <Slider
                                    value={[currentMin, currentMax]}
                                    onChange={handlePriceChange}
                                    valueLabelDisplay="auto"
                                    min={safeMinPrice}
                                    max={safeMaxPrice}
                                    step={Math.max(1, Math.floor((safeMaxPrice - safeMinPrice) / 100))}
                                    marks={[
                                        { value: safeMinPrice, label: `${safeMinPrice}` },
                                        { value: safeMaxPrice, label: `${safeMaxPrice}` }
                                    ]}
                                />
                            ) : (
                                <Box py={2}>
                                    <Typography variant="body2" color="textSecondary">
                                        Price range not available
                                    </Typography>
                                </Box>
                            )}
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box display="flex" alignItems="center" height="100%">
                                {hasActiveFilters && (
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={onResetFilters}
                                        startIcon={<ClearIcon />}
                                        className={styles.resetButton}
                                        disabled={isSearching}
                                    >
                                        Clear All Filters
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>

                    {hasActiveFilters && (
                        <Box mt={2}>
                            <Typography variant="subtitle2" gutterBottom>
                                Active Filters:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {filters.title && (
                                    <Chip
                                        label={`Title: "${filters.title}"`}
                                        onDelete={() => onUpdateFilter('title', '')}
                                        color="primary"
                                        size="small"
                                        disabled={isSearching}
                                    />
                                )}
                                {filters.studio && (
                                    <Chip
                                        label={`Studio: ${filters.studio}`}
                                        onDelete={() => onUpdateFilter('studio', '')}
                                        color="primary"
                                        size="small"
                                        disabled={isSearching}
                                    />
                                )}
                                {shouldRenderSlider && (currentMin > safeMinPrice || currentMax < safeMaxPrice) && (
                                    <Chip
                                        label={`Price: $${currentMin}-$${currentMax}`}
                                        onDelete={() => onUpdatePriceRange(safeMinPrice, safeMaxPrice)}
                                        color="primary"
                                        size="small"
                                        disabled={isSearching}
                                    />
                                )}
                            </Box>
                        </Box>
                    )}


                </AccordionDetails>
            </Accordion>
        </Paper>
    )
}

export default React.memo(MovieFilters)
