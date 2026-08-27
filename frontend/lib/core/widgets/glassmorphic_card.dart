import 'dart:ui';
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class GlassmorphicCard extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double borderRadius;
  final double blur;
  final Color? backgroundColor;
  final Color? borderColor;
  final double borderWidth;
  final VoidCallback? onTap;
  final List<BoxShadow>? shadows;

  const GlassmorphicCard({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.padding = const EdgeInsets.all(20),
    this.margin,
    this.borderRadius = 24,
    this.blur = 16,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth = 1.0,
    this.onTap,
    this.shadows,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveBgColor = backgroundColor ?? AppColors.surface.withOpacity(0.85);
    final effectiveBorderColor = borderColor ?? AppColors.border;
    final effectiveShadows = shadows ?? [
      BoxShadow(
        color: Colors.black.withOpacity(0.25),
        blurRadius: 20,
        offset: const Offset(0, 8),
      ),
    ];

    Widget content = Container(
      width: width,
      height: height,
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: effectiveShadows,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: effectiveBgColor,
              borderRadius: BorderRadius.circular(borderRadius),
              border: Border.all(
                color: effectiveBorderColor,
                width: borderWidth,
              ),
            ),
            child: child,
          ),
        ),
      ),
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(borderRadius),
          child: content,
        ),
      );
    }

    return content;
  }
}

class GlassmorphicBackground extends StatelessWidget {
  final Widget child;

  const GlassmorphicBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Base canvas
        Container(
          color: AppColors.background,
        ),
        // Ambient glow orb 1 (Indigo Top Left)
        Positioned(
          top: -120,
          left: -100,
          child: Container(
            width: 380,
            height: 380,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  const Color(0xFF6366F1).withOpacity(0.12),
                  const Color(0xFF6366F1).withOpacity(0.0),
                ],
              ),
            ),
          ),
        ),
        // Ambient glow orb 2 (Deep Violet Top Right)
        Positioned(
          top: 60,
          right: -120,
          child: Container(
            width: 400,
            height: 400,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  const Color(0xFF7C3AED).withOpacity(0.09),
                  const Color(0xFF7C3AED).withOpacity(0.0),
                ],
              ),
            ),
          ),
        ),
        // Ambient glow orb 3 (Cyan Bottom Left)
        Positioned(
          bottom: 40,
          left: 60,
          child: Container(
            width: 420,
            height: 420,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  const Color(0xFF38BDF8).withOpacity(0.06),
                  const Color(0xFF38BDF8).withOpacity(0.0),
                ],
              ),
            ),
          ),
        ),
        // Main Foreground Content
        SafeArea(child: child),
      ],
    );
  }
}
