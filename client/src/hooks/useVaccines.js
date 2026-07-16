import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'

export function useVaccines(catId) {
  return useQuery({
    queryKey: ['vaccines', catId],
    queryFn: () => api(`/vaccines/cat/${catId}`).then((data) => data.vaccines),
    enabled: !!catId,
  })
}

export function useCreateVaccine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api('/vaccines', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vaccines', variables.catId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useAdministerVaccine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api(`/vaccines/${id}/administer`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useSnoozeVaccine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, days }) =>
      api(`/vaccines/${id}/snooze`, { method: 'PATCH', body: JSON.stringify({ days }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteVaccine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api(`/vaccines/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
