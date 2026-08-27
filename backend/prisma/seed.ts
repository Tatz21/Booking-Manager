import {
  PrismaClient,
  UserRole,
  BusinessRole,
  SubscriptionStatus,
  AppointmentStatus,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Resetting and seeding clean database records...');

  // 1. Clean existing records in strict dependency order
  await prisma.notificationLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.staffAvailability.deleteMany();
  await prisma.staffService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.businessHours.deleteMany();
  await prisma.bookingSettings.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.businessMembership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();

  console.log('🧹 Cleaned all previous database tables.');

  // 2. Hash default secure password
  const passwordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // 3. Create Business Owner User
  const ownerUser = await prisma.user.create({
    data: {
      id: 'usr-owner-001',
      email: 'owner@luxelounge.com',
      name: 'Elena Rostova',
      phone: '+919876543210',
      passwordHash,
      role: UserRole.OWNER,
    },
  });

  // 4. Create Main Business Profile
  const business = await prisma.business.create({
    data: {
      id: 'biz-luxe-001',
      name: 'Luxe Aesthetic Lounge',
      slug: 'luxe-lounge',
      type: 'Luxury Salon & Wellness Spa',
      description:
        'Premier wellness and aesthetic lounge providing expert hair artistry, skin rejuvenation, and bespoke grooming rituals.',
      email: 'hello@luxelounge.com',
      phone: '+91 80 2345 6789',
      location: 'Ground Floor, Prestige Meridian, MG Road, Bengaluru 560001',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      primaryColor: '#5D3E6B', // Signature Plum Accent
      secondaryColor: '#2B253A',
      tagline: 'Refined Beauty & Bespoke Wellness',
    },
  });

  // 5. Link Owner Membership
  await prisma.businessMembership.create({
    data: {
      userId: ownerUser.id,
      businessId: business.id,
      role: BusinessRole.OWNER,
    },
  });

  // 6. Create Active 7-Day Free Trial Subscription
  const now = new Date();
  const trialStart = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
  const trialEnd = new Date(now.getTime() + 6.5 * 24 * 60 * 60 * 1000); // 6.5 days remaining

  await prisma.subscription.create({
    data: {
      businessId: business.id,
      plan: 'MONTHLY_STANDARD',
      status: SubscriptionStatus.TRIALING,
      trialStart,
      trialEnd,
      currentPeriodStart: trialStart,
      currentPeriodEnd: trialEnd,
    },
  });

  // 7. Configure Notification & Booking Settings
  await prisma.bookingSettings.create({
    data: {
      businessId: business.id,
      slotIntervalMinutes: 15,
      advanceBookingDays: 30,
      minNoticeMinutes: 60,
      cancellationNoticeHours: 4,
      emailNotificationsEnabled: true,
      smsNotificationsEnabled: true,
      whatsappNotificationsEnabled: true,
      reminder24hEnabled: true,
      reminder2hEnabled: true,
    },
  });

  // 8. Configure Business Operating Hours (Mon - Sat 09:00 - 20:00, Sun 10:00 - 18:00)
  const businessHoursData = [
    { dayOfWeek: 0, openTime: '10:00', closeTime: '18:00', isClosed: false }, // Sun
    { dayOfWeek: 1, openTime: '09:00', closeTime: '20:00', isClosed: false }, // Mon
    { dayOfWeek: 2, openTime: '09:00', closeTime: '20:00', isClosed: false }, // Tue
    { dayOfWeek: 3, openTime: '09:00', closeTime: '20:00', isClosed: false }, // Wed
    { dayOfWeek: 4, openTime: '09:00', closeTime: '20:00', isClosed: false }, // Thu
    { dayOfWeek: 5, openTime: '09:00', closeTime: '20:00', isClosed: false }, // Fri
    { dayOfWeek: 6, openTime: '09:00', closeTime: '20:00', isClosed: false }, // Sat
  ];

  for (const bh of businessHoursData) {
    await prisma.businessHours.create({
      data: {
        businessId: business.id,
        ...bh,
      },
    });
  }

  // 9. Create Curated Services Catalog
  const srv1 = await prisma.service.create({
    data: {
      id: 'srv-luxe-1',
      businessId: business.id,
      name: 'Signature Hair Sculpt & Blowout',
      description: 'Consultation, botanical wash, precision cut, and keratin blowout styling.',
      durationMinutes: 45,
      price: 120000, // ₹1,200.00
      currency: 'INR',
      isActive: true,
    },
  });

  const srv2 = await prisma.service.create({
    data: {
      id: 'srv-luxe-2',
      businessId: business.id,
      name: 'Hydra-Dew Glow Facial',
      description: 'Deep pore detox, ultrasonic serum infusion, and chilled jade stone lymphatic massage.',
      durationMinutes: 60,
      price: 250000, // ₹2,500.00
      currency: 'INR',
      isActive: true,
    },
  });

  const srv3 = await prisma.service.create({
    data: {
      id: 'srv-luxe-3',
      businessId: business.id,
      name: 'Executive Beard Architecture & Hot Towel',
      description: 'Precision beard sculpting, straight razor lines, and organic sandalwood oil steam.',
      durationMinutes: 30,
      price: 65000, // ₹650.00
      currency: 'INR',
      isActive: true,
    },
  });

  const srv4 = await prisma.service.create({
    data: {
      id: 'srv-luxe-4',
      businessId: business.id,
      name: 'Balayage & Gloss Therapy',
      description: 'Custom French balayage hand-painted lightening with gloss glaze sealant.',
      durationMinutes: 90,
      price: 450000, // ₹4,500.00
      currency: 'INR',
      isActive: true,
    },
  });

  // 10. Create Staff Specialists
  const staff1 = await prisma.staff.create({
    data: {
      id: 'stf-luxe-1',
      businessId: business.id,
      name: 'Kavya Sen',
      roleTitle: 'Lead Hair Artist',
      email: 'kavya.s@luxelounge.com',
      phone: '+919876500011',
      isActive: true,
    },
  });

  const staff2 = await prisma.staff.create({
    data: {
      id: 'stf-luxe-2',
      businessId: business.id,
      name: 'Aiden Vance',
      roleTitle: 'Master Barber & Groomer',
      email: 'aiden.v@luxelounge.com',
      phone: '+919876500022',
      isActive: true,
    },
  });

  const staff3 = await prisma.staff.create({
    data: {
      id: 'stf-luxe-3',
      businessId: business.id,
      name: 'Dr. Rhea Mehra',
      roleTitle: 'Skin Therapist & Aesthetician',
      email: 'rhea.m@luxelounge.com',
      phone: '+919876500033',
      isActive: true,
    },
  });

  // 11. Assign Services to Specialists
  const staffServiceMappings = [
    { staffId: staff1.id, serviceId: srv1.id },
    { staffId: staff1.id, serviceId: srv4.id },
    { staffId: staff2.id, serviceId: srv1.id },
    { staffId: staff2.id, serviceId: srv3.id },
    { staffId: staff3.id, serviceId: srv2.id },
  ];

  for (const mapping of staffServiceMappings) {
    await prisma.staffService.create({
      data: {
        businessId: business.id,
        staffId: mapping.staffId,
        serviceId: mapping.serviceId,
      },
    });
  }

  // 12. Create Specialists Weekly Shifts (Mon - Sat, 09:00 - 18:30)
  for (const staff of [staff1, staff2, staff3]) {
    for (let day = 1; day <= 6; day++) {
      await prisma.staffAvailability.create({
        data: {
          businessId: business.id,
          staffId: staff.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:30',
          isOff: false,
        },
      });
    }
  }

  // 13. Create Initial Client Profiles
  const customer1 = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: 'Pooja Hegde',
      email: 'pooja.h@example.com',
      phone: '+919845012345',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: 'Arjun Kapoor',
      email: 'arjun.k@example.com',
      phone: '+919845067890',
    },
  });

  // 14. Create Sample Appointments
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  await prisma.appointment.create({
    data: {
      id: 'appt-seed-001',
      businessId: business.id,
      serviceId: srv1.id,
      staffId: staff1.id,
      customerId: customer1.id,
      startAt: new Date(year, month, day, 11, 0),
      endAt: new Date(year, month, day, 11, 45),
      status: AppointmentStatus.CONFIRMED,
      price: srv1.price,
      currency: 'INR',
      notes: 'First time visitor - requested soft waves',
    },
  });

  await prisma.appointment.create({
    data: {
      id: 'appt-seed-002',
      businessId: business.id,
      serviceId: srv3.id,
      staffId: staff2.id,
      customerId: customer2.id,
      startAt: new Date(year, month, day, 15, 0),
      endAt: new Date(year, month, day, 15, 30),
      status: AppointmentStatus.CONFIRMED,
      price: srv3.price,
      currency: 'INR',
      notes: 'Wants beard trim & shaping before evening event',
    },
  });

  console.log('✅ Fresh clean database seeded successfully!');
  console.log('---------------------------------------------------------');
  console.log('🏢 Business:  Luxe Aesthetic Lounge');
  console.log('🔗 Public URL: http://localhost:5050/book/luxe-lounge');
  console.log('👤 Owner:     owner@luxelounge.com');
  console.log('🔑 Password:  Password123!');
  console.log('💳 Status:    7-Day Free Trial (6.5 days active)');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
