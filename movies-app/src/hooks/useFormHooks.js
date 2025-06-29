import { useState, useEffect, useCallback } from 'react'
import { validateTransferData, createTransferData, getInitialFromStudio } from '@/utils'

export const useFormState = () => {
    const [formData, setFormData] = useState({
        fromStudio: '',
        toStudio: '',
        error: ''
    })

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    const resetForm = useCallback(() => {
        setFormData({
            fromStudio: '',
            toStudio: '',
            error: ''
        })
    }, [])

    const initializeFromStudio = useCallback((value) => {
        setFormData({
            fromStudio: value,
            toStudio: '',
            error: ''
        })
    }, [])

    const setError = useCallback((error) => {
        updateField('error', error)
    }, [updateField])

    return {
        ...formData,
        setFromStudio: (value) => updateField('fromStudio', value),
        setToStudio: (value) => updateField('toStudio', value),
        setError,
        resetForm,
        initializeFromStudio
    }
}

export const useFormInitialization = (open, movie, studios, formActions) => {
    const { resetForm, initializeFromStudio } = formActions

    useEffect(() => {
        if (open && movie) {
            const initialValue = getInitialFromStudio(movie, studios)
            initializeFromStudio(initialValue)
        } else {
            resetForm()
        }
    }, [open, movie, studios, resetForm, initializeFromStudio])
}

export const useFormSubmission = (movie, fromStudio, toStudio, onSubmit, setError) => {
    return useCallback(() => {
        setError('')

        const validationError = validateTransferData(movie, fromStudio, toStudio)
        if (validationError) {
            setError(validationError)
            return
        }

        const transferData = createTransferData(movie, fromStudio, toStudio)
        onSubmit(transferData)
    }, [movie, fromStudio, toStudio, onSubmit, setError])
}

export const useTransferForm = (open, movie, studios, onSubmit) => {
    const formState = useFormState()
    const { setError } = formState

    useFormInitialization(open, movie, studios, formState)
    const handleSubmit = useFormSubmission(
        movie,
        formState.fromStudio,
        formState.toStudio,
        onSubmit,
        setError
    )

    return {
        ...formState,
        handleSubmit
    }
}
