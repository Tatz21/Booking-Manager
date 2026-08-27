import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'demo@apexbarber.com');
  final _passwordController = TextEditingController(text: 'DemoPassword123!');
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignIn() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await ref.read(authProvider.notifier).signIn(
          email: _emailController.text,
          password: _passwordController.text,
        );

    if (success && mounted) {
      context.go('/dashboard');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // App Logo & Header
                        Center(
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.primaryContainer,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.calendar_month_rounded,
                              color: AppColors.primary,
                              size: 40,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Center(
                          child: Text(
                            'Welcome Back',
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Center(
                          child: Text(
                            'Sign in to manage your appointments & team',
                            style: Theme.of(context).textTheme.bodyMedium,
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 24),

                        if (authState.errorMessage != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.error.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.error.withOpacity(0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline, color: AppColors.error, size: 20),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    authState.errorMessage!,
                                    style: const TextStyle(color: AppColors.error, fontSize: 13),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        Text(
                          'Email Address',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(
                            hintText: 'alex@example.com',
                            prefixIcon: Icon(Icons.email_outlined),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Please enter your email';
                            }
                            if (!val.contains('@')) {
                              return 'Please enter a valid email address';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        Text(
                          'Password',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          decoration: InputDecoration(
                            hintText: '••••••••',
                            prefixIcon: const Icon(Icons.lock_outlined),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                            ),
                          ),
                          validator: (val) {
                            if (val == null || val.isEmpty) {
                              return 'Please enter your password';
                            }
                            if (val.length < 8) {
                              return 'Password must be at least 8 characters';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 8),

                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: _showForgotPasswordDialog,
                            child: const Text('Forgot password?', style: TextStyle(fontSize: 13)),
                          ),
                        ),
                        const SizedBox(height: 16),

                        ElevatedButton(
                          onPressed: isLoading ? null : _handleSignIn,
                          child: isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('Sign In to Account'),
                        ),
                        const SizedBox(height: 20),

                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "Don't have a business account?",
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                            TextButton(
                              onPressed: () => context.go('/register'),
                              child: const Text('Start Free Trial'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Divider(color: AppColors.border),
                        const SizedBox(height: 12),

                        // Legal & Compliance Footer Links
                        Wrap(
                          alignment: WrapAlignment.center,
                          spacing: 12,
                          children: [
                            InkWell(
                              onTap: () => context.go('/terms'),
                              child: const Text('Terms of Service', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            ),
                            const Text('•', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                            InkWell(
                              onTap: () => context.go('/privacy'),
                              child: const Text('Privacy Policy', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            ),
                            const Text('•', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                            InkWell(
                              onTap: () => context.go('/refund-policy'),
                              child: const Text('Refund Policy', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            ),
                            const Text('•', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                            InkWell(
                              onTap: () => context.go('/contact'),
                              child: const Text('Support', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showForgotPasswordDialog() {
    final emailCtrl = TextEditingController(text: _emailController.text);
    final tokenCtrl = TextEditingController();
    final newPassCtrl = TextEditingController();
    bool isStepToken = false;
    bool isResetting = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(isStepToken ? 'Set New Password' : 'Reset Account Password', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          content: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (!isStepToken) ...[
                  const Text('Enter your registered email address to receive password reset instructions.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: emailCtrl,
                    decoration: const InputDecoration(hintText: 'owner@luxelounge.com', prefixIcon: Icon(Icons.email_outlined)),
                  ),
                ] else ...[
                  const Text('Enter the reset token received along with your new password.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: tokenCtrl,
                    decoration: const InputDecoration(hintText: 'Enter Reset Token', prefixIcon: Icon(Icons.vpn_key_outlined)),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: newPassCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(hintText: 'New Password (min 8 chars)', prefixIcon: Icon(Icons.lock_reset_outlined)),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isResetting
                  ? null
                  : () async {
                      if (!isStepToken) {
                        setDialogState(() => isResetting = true);
                        await Future.delayed(const Duration(milliseconds: 600));
                        setDialogState(() {
                          isResetting = false;
                          isStepToken = true;
                          tokenCtrl.text = 'demo-reset-token-sample';
                        });
                      } else {
                        setDialogState(() => isResetting = true);
                        await Future.delayed(const Duration(milliseconds: 600));
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('✨ Password updated successfully! Please sign in.'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                      }
                    },
              child: isResetting
                  ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(isStepToken ? 'Update Password' : 'Send Instructions'),
            ),
          ],
        ),
      ),
    );
  }
}
