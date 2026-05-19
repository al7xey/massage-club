import { demoMasters, demoServices, demoStudios, demoTimeSlots } from '@/data/mockData';
import type { Appointment, AppointmentStatus, BookingPrice } from '@/types';
import { createId, ensureSeedData, mockKeys, readJson, writeJson } from './storageService';
import { paymentService } from './paymentService';
import { subscriptionService } from './subscriptionService';

export interface CreateAppointmentInput {
  userId: string;
  serviceId: string;
  studioId: string;
  masterId: string;
  date: string;
  time: string;
  useSubscriptionVisit: boolean;
}

export const appointmentService = {
  getAvailableTimes(masterId: string, date: string): string[] {
    const appointments = readJson<Appointment[]>(mockKeys.appointments, []);
    const busyTimes = new Set(
      appointments
        .filter((appointment) => appointment.masterId === masterId && appointment.date === date && appointment.status !== 'cancelled')
        .map((appointment) => appointment.time),
    );

    return demoTimeSlots.filter((time) => !busyTimes.has(time));
  },

  calculatePrice(userId: string, serviceId: string): BookingPrice {
    const service = demoServices.find((item) => item.id === serviceId) ?? demoServices[0];
    const activeSubscription = subscriptionService.getActiveSubscription(userId);
    const discountPercent = activeSubscription?.discountPercent ?? 0;
    const canUseSubscriptionVisit = Boolean(activeSubscription && activeSubscription.remainingVisits > 0);

    return {
      basePriceRub: service.priceRub,
      finalPriceRub: Math.round(service.priceRub * (1 - discountPercent / 100)),
      discountPercent,
      canUseSubscriptionVisit,
    };
  },

  createAppointment(input: CreateAppointmentInput): Appointment {
    ensureSeedData();

    if (!input.date || !input.time) {
      throw new Error('Выберите дату и время');
    }

    const service = demoServices.find((item) => item.id === input.serviceId);
    const studio = demoStudios.find((item) => item.id === input.studioId);
    const master = demoMasters.find((item) => item.id === input.masterId);

    if (!service || !studio || !master) {
      throw new Error('Заполните услугу, студию и мастера');
    }

    if (!this.getAvailableTimes(input.masterId, input.date).includes(input.time)) {
      throw new Error('Это время уже занято у выбранного мастера');
    }

    const price = this.calculatePrice(input.userId, input.serviceId);
    if (input.useSubscriptionVisit) {
      if (!price.canUseSubscriptionVisit) {
        throw new Error('Нет доступных посещений по подписке');
      }

      subscriptionService.consumeVisit(input.userId);
    } else {
      paymentService.createPayment(input.userId, 'service', service.title, price.finalPriceRub);
    }

    const appointment: Appointment = {
      id: createId('apt'),
      userId: input.userId,
      serviceId: service.id,
      serviceName: service.title,
      studioId: studio.id,
      studioName: studio.name,
      masterId: master.id,
      masterName: `${master.firstName} ${master.lastName}`,
      date: input.date,
      time: input.time,
      status: 'planned',
      basePriceRub: price.basePriceRub,
      finalPriceRub: input.useSubscriptionVisit ? 0 : price.finalPriceRub,
      paidBySubscriptionVisit: input.useSubscriptionVisit,
      createdAt: new Date().toISOString(),
    };

    writeJson(mockKeys.appointments, [appointment, ...readJson<Appointment[]>(mockKeys.appointments, [])]);
    return appointment;
  },

  getUserAppointments(userId: string): Appointment[] {
    ensureSeedData();
    return readJson<Appointment[]>(mockKeys.appointments, []).filter((appointment) => appointment.userId === userId);
  },

  getAllAppointments(): Appointment[] {
    ensureSeedData();
    return readJson<Appointment[]>(mockKeys.appointments, []);
  },

  updateStatus(appointmentId: string, status: AppointmentStatus) {
    const appointments = readJson<Appointment[]>(mockKeys.appointments, []);
    writeJson(
      mockKeys.appointments,
      appointments.map((appointment) => (appointment.id === appointmentId ? { ...appointment, status } : appointment)),
    );
  },
};
