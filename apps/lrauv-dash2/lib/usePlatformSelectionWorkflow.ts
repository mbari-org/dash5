import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePostRuntimePlatforms } from '@mbari/api-client'
import toast from 'react-hot-toast'
import { createLogger } from '@mbari/utils'
import { useSelectedPlatforms } from '../components/SelectedPlatformContext'

const logger = createLogger('usePlatformSelectionWorkflow')

/**
 * Modal-oriented selection workflow:
 * - staged (working) selection
 * - apply/reset/unselect-all
 * - "hasChanges" calculation
 * - persistence via TrackDB runtime + SelectedPlatformContext
 */
export function usePlatformSelectionWorkflow() {
  const { selectedPlatformIds, setSelectedPlatformIds } = useSelectedPlatforms()

  const postRuntimePlatformsMutation = usePostRuntimePlatforms()

  const [workingSelection, setWorkingSelection] = useState<string[]>(
    () => selectedPlatformIds ?? []
  )

  useEffect(() => {
    setWorkingSelection(selectedPlatformIds ?? [])
  }, [selectedPlatformIds])

  const togglePlatformSelection = useCallback((platformId: string) => {
    setWorkingSelection((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    )
  }, [])

  const unselectAll = useCallback(() => {
    setWorkingSelection([])
  }, [])

  const reset = useCallback(() => {
    setWorkingSelection(selectedPlatformIds ?? [])
  }, [selectedPlatformIds])

  const hasChanges = useMemo(() => {
    if (workingSelection.length !== selectedPlatformIds.length) return true
    return !workingSelection.every((id) => selectedPlatformIds.includes(id))
  }, [workingSelection, selectedPlatformIds])

  const apply = useCallback(async () => {
    if (workingSelection.length === 0 && selectedPlatformIds.length === 0) {
      return
    }

    try {
      const result = await postRuntimePlatformsMutation.mutateAsync({
        platformIds: workingSelection,
      })

      setSelectedPlatformIds(result)

      toast.success('Platform selection updated', {
        id: 'platforms-updated',
        duration: 2000,
        className: 'blue-toast',
      })
    } catch (error) {
      logger.error('Failed to update platform selection:', error)
      // Reset selections if mutation fails
      setWorkingSelection(selectedPlatformIds)
      toast.error('Failed to update platform selection', {
        id: 'platforms-error',
        duration: 3000,
      })
    }
  }, [
    workingSelection,
    selectedPlatformIds,
    postRuntimePlatformsMutation,
    setSelectedPlatformIds,
  ])

  return {
    selectedPlatformIds,
    workingSelection,
    togglePlatformSelection,
    unselectAll,
    reset,
    apply,
    hasChanges,
    isApplying: postRuntimePlatformsMutation.isLoading,
  }
}
