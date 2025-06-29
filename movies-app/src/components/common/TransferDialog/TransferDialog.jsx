import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Paper
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import styles from './styles/TransferDialog.module.css';
import {mapStudioIdToBackendKey} from "@/utils";
import {useTransferForm} from "@/hooks";

const getMovieId = (movie) => {
    return movie?.id || movie?.name;
};

const getCurrentStudioName = (movie, studios) => {
    if (!movie || !studios) return 'Unknown';
    const currentStudio = studios.find(studio => studio.id === movie.studioId);
    return currentStudio?.name || 'Unknown';
};

const mapStudiosToOptions = (studios) => {
    if (!studios) return [];

    return studios
        .map(studio => {
            const backendValue = mapStudioIdToBackendKey(studio.id);
            return backendValue ? {
                value: backendValue,
                label: studio.name,
                id: studio.id
            } : null;
        })
        .filter(Boolean);
};

const MovieInfo = ({ movie, studios }) => {
    if (!movie) return null;

    const movieId = getMovieId(movie);
    const currentStudioName = getCurrentStudioName(movie, studios);

    return (
        <Box className={styles.movieInfo}>
            <Typography variant="h6" gutterBottom className={styles.movieTitle}>
                {movie.title || movie.name}
            </Typography>
            <Typography variant="body2" className={styles.movieDetails}>
                Current Studio: {currentStudioName}
            </Typography>
            {movie.year && (
                <Typography variant="body2" className={styles.movieDetails}>
                    Year: {movie.year}
                </Typography>
            )}
            <Typography variant="body2" className={styles.movieDetails}>
                ID: {movieId}
            </Typography>
        </Box>
    );
};

const ErrorDisplay = ({ error }) => {
    if (!error) return null;

    return (
        <Paper className={styles.errorContainer}>
            <ErrorIcon className={styles.errorIcon} />
            <Typography className={styles.errorText}>
                {error}
            </Typography>
        </Paper>
    );
};

const StudioSelector = ({
                            label,
                            value,
                            onChange,
                            options,
                            disabled = false,
                            excludeValue = null
                        }) => {
    const filteredOptions = excludeValue
        ? options.filter(option => option.value !== excludeValue)
        : options;

    return (
        <FormControl className={styles.formControl}>
            <InputLabel>{label}</InputLabel>
            <Select value={value} onChange={onChange} disabled={disabled}>
                {filteredOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

const TransferDialog = ({ open, movie, studios, onClose, onSubmit }) => {
    const {
        fromStudio,
        toStudio,
        error,
        setFromStudio,
        setToStudio,
        handleSubmit
    } = useTransferForm(open, movie, studios, onSubmit);

    const studioOptions = mapStudiosToOptions(studios);

    if (!movie) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Transfer Movie</DialogTitle>
            <DialogContent>
                <MovieInfo movie={movie} studios={studios} />
                <ErrorDisplay error={error} />

                <StudioSelector
                    label="From Studio"
                    value={fromStudio}
                    onChange={(e) => setFromStudio(e.target.value)}
                    options={studioOptions}
                    disabled
                />

                <StudioSelector
                    label="To Studio"
                    value={toStudio}
                    onChange={(e) => setToStudio(e.target.value)}
                    options={studioOptions}
                    excludeValue={fromStudio}
                />
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
                <Button onClick={onClose} color="secondary" className={styles.cancelButton}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">
                    Transfer Movie
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TransferDialog;
