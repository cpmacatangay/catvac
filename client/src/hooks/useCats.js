import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'

export function useCat(id) {
  return useQuery({
    queryKey: ['cat', id],
    queryFn: () => api(`/cats/${id}`).then((data) => data.cat),
    enabled: !!id,
  })
}

export function useCreateCat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api('/cats', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateCat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api(`/cats/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cat', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteCat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api(`/cats/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
