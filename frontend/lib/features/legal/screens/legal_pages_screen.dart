import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';

class LegalPagesScreen extends StatefulWidget {
  final int initialTabIndex;

  const LegalPagesScreen({super.key, this.initialTabIndex = 0});

  @override
  State<LegalPagesScreen> createState() => _LegalPagesScreenState();
}

class _LegalPagesScreenState extends State<LegalPagesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this, initialIndex: widget.initialTabIndex.clamp(0, 3));
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.canPop() ? context.pop() : context.go('/dashboard'),
        ),
        title: const Text('Legal & Compliance Policies', style: TextStyle(fontWeight: FontWeight.bold)),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          tabs: const [
            Tab(text: 'Terms of Service', icon: Icon(Icons.description_outlined, size: 18)),
            Tab(text: 'Privacy Policy', icon: Icon(Icons.security_outlined, size: 18)),
            Tab(text: 'Refund & Cancellation', icon: Icon(Icons.receipt_long_outlined, size: 18)),
            Tab(text: 'Contact & Support', icon: Icon(Icons.contact_support_outlined, size: 18)),
          ],
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 860),
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildTermsOfService(),
              _buildPrivacyPolicy(),
              _buildRefundPolicy(),
              _buildContactSupport(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDocContainer({required String title, required String lastUpdated, required List<Widget> sections}) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: AppColors.textPrimary)),
              const SizedBox(height: 4),
              Text('Last Updated: $lastUpdated', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              const SizedBox(height: 20),
              const Divider(color: AppColors.border),
              const SizedBox(height: 20),
              ...sections,
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection(String heading, String body) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(heading, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
          const SizedBox(height: 6),
          Text(body, style: const TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.5)),
        ],
      ),
    );
  }

  Widget _buildTermsOfService() {
    return _buildDocContainer(
      title: 'Terms of Service',
      lastUpdated: 'August 2026',
      sections: [
        _buildSection('1. Acceptance of Terms', 'By creating an account or accessing the Apex Booking platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our software or online booking portals.'),
        _buildSection('2. Business Tenant Responsibilities', 'Business owners are responsible for maintaining the accuracy of their scheduled appointment slots, pricing details, staff shifts, and for fulfilling confirmed bookings made by customers.'),
        _buildSection('3. Subscriptions & Payments', 'Access to owner dashboard features is billed on a monthly subscription model (₹199/month following the 7-day complimentary trial). Subscriptions renew automatically unless cancelled prior to the billing date.'),
        _buildSection('4. Limitation of Liability', 'Apex Booking provides software services on an "as is" basis and shall not be held liable for indirect, incidental, or consequential damages resulting from schedule disruptions or customer disputes.'),
      ],
    );
  }

  Widget _buildPrivacyPolicy() {
    return _buildDocContainer(
      title: 'Privacy & Data Protection Policy',
      lastUpdated: 'August 2026',
      sections: [
        _buildSection('1. Information We Collect', 'We collect business profile details (name, email, phone) and appointment booking data (customer contact info, service selections, and appointment timestamps) solely for scheduling fulfillment.'),
        _buildSection('2. Data Processing & Security', 'All customer passwords are cryptographically hashed using Argon2id. Payment details are processed through PCI-DSS Level 1 compliant gateways (Razorpay) and are never stored on our servers.'),
        _buildSection('3. Data Retention & Tenant Isolation', 'Customer and appointment records are strictly tenant-isolated via business ID scoping. You may request data export or account deletion at any time by contacting our privacy team.'),
        _buildSection('4. Cookie & Session Policy', 'We use secure HTTP-only session tokens strictly necessary for user authentication and state synchronization.'),
      ],
    );
  }

  Widget _buildRefundPolicy() {
    return _buildDocContainer(
      title: 'Cancellation & Refund Policy',
      lastUpdated: 'August 2026',
      sections: [
        _buildSection('1. SaaS Subscription Refunds', 'If you cancel your SaaS subscription within 48 hours of renewal, you may request a full refund of the current billing cycle by writing to support.'),
        _buildSection('2. Customer Appointment Cancellations', 'Customers may cancel appointments up to 2 hours prior to the scheduled time without penalty unless a different cancellation policy is configured by the specific business.'),
        _buildSection('3. Online Deposit Refunds', 'Where online pre-payments or deposits are collected, approved refunds will be credited back to the original payment source (UPI, Credit/Debit Card, Net Banking) within 5 to 7 business days as per standard banking processing guidelines.'),
      ],
    );
  }

  Widget _buildContactSupport() {
    return _buildDocContainer(
      title: 'Contact & Merchant Grievance Support',
      lastUpdated: 'August 2026',
      sections: [
        _buildSection('Customer & Merchant Support', 'Our dedicated operations and technical support team is available Monday through Saturday, 9:00 AM to 6:00 PM IST.'),
        _buildSection('Official Support Email', 'support@apexbooking.com'),
        _buildSection('Grievance Officer', 'Grievance Officer, Apex Booking Technologies Private Limited\nIndiranagar 100ft Road, Bengaluru, Karnataka, India - 560038'),
        _buildSection('Response Turnaround Time', 'We acknowledge all support inquiries and merchant tickets within 24 business hours.'),
      ],
    );
  }
}
