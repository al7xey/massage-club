export {
  useCancelAppointmentMutation,
  useGetAvailableMastersQuery,
  useCreateAppointmentMutation,
  useGetAppointmentSlotsQuery,
  useGetMyAppointmentsQuery,
  useGetServiceSlotsQuery,
  useUpdateAppointmentStatusMutation,
} from './api/appointmentApi';
export type { AppointmentDto, CreateAppointmentRequest } from './model/types';
