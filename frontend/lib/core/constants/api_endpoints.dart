class ApiEndpoints {
  // Configurable base URL
  static const String baseUrl = 'http://localhost:3000/api/v1';

  // Auth
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';

  // Business
  static const String business = '/business';
  static const String businessSettings = '/business/settings';

  // Services
  static const String services = '/services';

  // Staff
  static const String staff = '/staff';

  // Availability
  static const String businessHours = '/availability/business-hours';
  static const String staffAvailability = '/availability/staff';
  static const String availabilitySlots = '/availability/slots';

  // Customers
  static const String customers = '/customers';

  // Appointments
  static const String appointments = '/appointments';

  // Subscription & Trial
  static const String subscriptionStatus = '/business/subscription-status';
  static const String createSubscriptionPayment = '/payments/create-subscription';
  static const String verifyPayment = '/payments/verify';

  // Public Booking (by slug)
  static String publicBusiness(String slug) => '/public/$slug';
  static String publicServices(String slug) => '/public/$slug/services';
  static String publicStaff(String slug) => '/public/$slug/staff';
  static String publicAvailability(String slug) => '/public/$slug/availability';
  static String publicAppointments(String slug) => '/public/$slug/appointments';
}
