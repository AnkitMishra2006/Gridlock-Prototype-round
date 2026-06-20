/**
 * React Query hooks for GuardianEye API
 * 
 * Provides caching, loading states, and error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api-client';
import { toast } from 'sonner';

// ===== DASHBOARD =====

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds for live data
  });
}

export function useHeatmapData() {
  return useQuery({
    queryKey: ['dashboard', 'heatmap'],
    queryFn: () => api.getHeatmapData(),
    refetchInterval: 60000, // Refetch every minute
  });
}

// ===== INCIDENTS =====

export function useIncidents(params?: {
  skip?: number;
  limit?: number;
  severity?: string;
  status?: string;
  camera_id?: string;
}) {
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: () => api.getIncidents(params),
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incidents', id],
    queryFn: () => api.getIncident(id),
    enabled: !!id,
  });
}

export function useRecentIncidents(hours: number = 24, limit: number = 10) {
  return useQuery({
    queryKey: ['incidents', 'recent', hours, limit],
    queryFn: () => api.getRecentIncidents(hours, limit),
    refetchInterval: 10000,
  });
}

export function useViolationTrend(hours: number = 24) {
  return useQuery({
    queryKey: ['incidents', 'trend', hours],
    queryFn: () => api.getViolationTrend(hours),
    refetchInterval: 30000,
  });
}

export function useTopViolations(limit: number = 5) {
  return useQuery({
    queryKey: ['incidents', 'top-violations', limit],
    queryFn: () => api.getTopViolations(limit),
    refetchInterval: 30000,
  });
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateIncidentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident status updated');
    },
    onError: () => {
      toast.error('Failed to update incident status');
    },
  });
}

// ===== ALERTS =====

export function useAlerts(params?: {
  skip?: number;
  limit?: number;
  alert_type?: string;
  status?: string;
  severity?: string;
}) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => api.getAlerts(params),
    refetchInterval: 10000,
  });
}

export function useSendPoliceAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (incidentId: string) => api.sendPoliceAlert(incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Police alert sent successfully');
    },
    onError: () => {
      toast.error('Failed to send police alert');
    },
  });
}

export function useSendHospitalAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (incidentId: string) => api.sendHospitalAlert(incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Hospital alert sent successfully');
    },
    onError: () => {
      toast.error('Failed to send hospital alert');
    },
  });
}

export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateAlertStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert status updated');
    },
    onError: () => {
      toast.error('Failed to update alert status');
    },
  });
}

// ===== CAMERAS =====

export function useCameras() {
  return useQuery({
    queryKey: ['cameras'],
    queryFn: () => api.getCameras(),
    refetchInterval: 30000,
  });
}

export function useCamera(id: string) {
  return useQuery({
    queryKey: ['cameras', id],
    queryFn: () => api.getCamera(id),
    enabled: !!id,
  });
}

// ===== VEHICLES =====

export function useVehicleHistory(licensePlate: string) {
  return useQuery({
    queryKey: ['vehicles', licensePlate],
    queryFn: () => api.getVehicleHistory(licensePlate),
    enabled: !!licensePlate,
  });
}

export function useRepeatOffenders(minViolations: number = 3, limit: number = 50) {
  return useQuery({
    queryKey: ['vehicles', 'repeat-offenders', minViolations, limit],
    queryFn: () => api.getRepeatOffenders(minViolations, limit),
  });
}

// ===== UTILITY =====

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.healthCheck(),
    refetchInterval: 60000,
    retry: false,
  });
}
