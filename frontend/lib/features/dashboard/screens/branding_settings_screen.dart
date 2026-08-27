import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';

class BrandingSettingsScreen extends ConsumerStatefulWidget {
  const BrandingSettingsScreen({super.key});

  @override
  ConsumerState<BrandingSettingsScreen> createState() => _BrandingSettingsScreenState();
}

class _BrandingSettingsScreenState extends ConsumerState<BrandingSettingsScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _taglineCtrl;
  late TextEditingController _logoUrlCtrl;
  late TextEditingController _customDomainCtrl;
  late TextEditingController _bannerUrlCtrl;

  String _selectedPrimaryHex = '#4F46E5';
  String _selectedSecondaryHex = '#6366F1';
  bool _isSaving = false;

  final List<Map<String, dynamic>> _curatedPalettes = [
    {'name': 'Royal Indigo', 'primary': '#4F46E5', 'secondary': '#6366F1', 'color': Color(0xFF4F46E5)},
    {'name': 'Emerald Green', 'primary': '#059669', 'secondary': '#10B981', 'color': Color(0xFF059669)},
    {'name': 'Crimson Luxury', 'primary': '#E11D48', 'secondary': '#F43F5E', 'color': Color(0xFFE11D48)},
    {'name': 'Electric Ocean', 'primary': '#0284C7', 'secondary': '#38BDF8', 'color': Color(0xFF0284C7)},
    {'name': 'Sunset Amber', 'primary': '#D97706', 'secondary': '#F59E0B', 'color': Color(0xFFD97706)},
    {'name': 'Midnight Slate', 'primary': '#334155', 'secondary': '#64748B', 'color': Color(0xFF334155)},
    {'name': 'Deep Violet', 'primary': '#7C3AED', 'secondary': '#A855F7', 'color': Color(0xFF7C3AED)},
  ];

  @override
  void initState() {
    super.initState();
    _taglineCtrl = TextEditingController(text: 'Luxury grooming & styling lounge');
    _logoUrlCtrl = TextEditingController(text: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1');
    _customDomainCtrl = TextEditingController(text: 'book.apexbarber.com');
    _bannerUrlCtrl = TextEditingController(text: '');
  }

  @override
  void dispose() {
    _taglineCtrl.dispose();
    _logoUrlCtrl.dispose();
    _customDomainCtrl.dispose();
    _bannerUrlCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSaveBranding() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✨ Brand styling and custom domain saved successfully!'),
          backgroundColor: AppColors.success,
        ),
      );
    }
  }

  Color _parseHex(String hex) {
    try {
      final buffer = StringBuffer();
      if (hex.length == 6 || hex.length == 7) buffer.write('ff');
      buffer.write(hex.replaceFirst('#', ''));
      return Color(int.parse(buffer.toString(), radix: 16));
    } catch (_) {
      return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final primaryColor = _parseHex(_selectedPrimaryHex);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/dashboard'),
        ),
        title: const Text('Brand Styling & Custom Subdomains', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 800),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: primaryColor.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(Icons.palette_rounded, color: primaryColor, size: 32),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Customize Booking Portal Theme',
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Personalize the colors, logo, and vanity URL that your customers see when booking.',
                                  style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 1. Color Palette Selection
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Primary Brand Theme Color', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 6),
                          const Text('Select a preset palette or enter a custom hex value', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                          const SizedBox(height: 16),

                          Wrap(
                            spacing: 12,
                            runSpacing: 12,
                            children: _curatedPalettes.map((p) {
                              final isSelected = _selectedPrimaryHex == p['primary'];
                              final c = p['color'] as Color;

                              return InkWell(
                                onTap: () {
                                  setState(() {
                                    _selectedPrimaryHex = p['primary'];
                                    _selectedSecondaryHex = p['secondary'];
                                  });
                                },
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: isSelected ? c.withOpacity(0.15) : Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isSelected ? c : AppColors.border,
                                      width: isSelected ? 2 : 1,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      CircleAvatar(radius: 10, backgroundColor: c),
                                      const SizedBox(width: 8),
                                      Text(
                                        p['name'],
                                        style: TextStyle(
                                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                          color: isSelected ? c : AppColors.textPrimary,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 2. Custom Domain & Vanity URL
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Vanity Subdomain & Custom CNAME', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 16),

                          Text('Default Platform Subdomain', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceVariant,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.link_rounded, size: 18, color: AppColors.textSecondary),
                                const SizedBox(width: 8),
                                Text(
                                  'https://${user?.businessSlug ?? 'your-business'}.bookingapp.com',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),

                          Text('Custom Verified Domain (e.g. book.yourbrand.com)', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _customDomainCtrl,
                            decoration: const InputDecoration(
                              hintText: 'book.yourdomain.com',
                              prefixIcon: Icon(Icons.language_rounded),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceVariant,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              '💡 To connect your domain, add a CNAME record in your DNS provider pointing your subdomain to cname.bookingapp.com with automatic SSL certificate provisioning.',
                              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 3. Logo & Brand Tagline
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Brand Assets & Copy', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 16),

                          Text('Business Tagline', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _taglineCtrl,
                            decoration: const InputDecoration(
                              hintText: 'e.g. Bespoke Grooming Lounge',
                              prefixIcon: Icon(Icons.chat_bubble_outline_rounded),
                            ),
                          ),
                          const SizedBox(height: 16),

                          Text('Brand Logo Image URL', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _logoUrlCtrl,
                            decoration: const InputDecoration(
                              hintText: 'https://example.com/logo.png',
                              prefixIcon: Icon(Icons.image_outlined),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  ElevatedButton(
                    onPressed: _isSaving ? null : _handleSaveBranding,
                    style: ElevatedButton.styleFrom(backgroundColor: primaryColor),
                    child: _isSaving
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Save Brand Theme & Domains'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
