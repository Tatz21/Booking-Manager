import 'package:flutter/material.dart';

class AppColors {
  // Primary brand tokens from Stitch "Obsidian Reserve" Design System
  static const Color primary = Color(0xFF6366F1); // Indigo-Violet Accent
  static const Color primaryDark = Color(0xFF4F46E5); // Deep Indigo
  static const Color primaryLight = Color(0xFF818CF8);
  static const Color primaryContainer = Color(0xFF2E2B5A);

  // Status & Supporting accents
  static const Color secondary = Color(0xFFC8C6C8);
  static const Color accent = Color(0xFFF59E0B); // Amber Accent
  static const Color success = Color(0xFF10B981); // Emerald Green
  static const Color warning = Color(0xFFF59E0B); // Warm Amber
  static const Color error = Color(0xFFEF4444); // Crimson Red
  static const Color critical = Color(0xFFEF4444);
  static const Color info = Color(0xFF38BDF8); // Electric Sky

  // Stitch Obsidian Reserve Surfaces (Dark-Mode Minimalist)
  static const Color background = Color(0xFF0A0A0B); // Base Canvas Charcoal
  static const Color surface = Color(0xFF161618); // Level 1 Card & Navigation Container
  static const Color surfaceVariant = Color(0xFF1C1B1C); // Level 1.5 Soft Surface
  static const Color surfaceElevated = Color(0xFF222224); // Level 2 Modal & Popover Surface
  static const Color surfaceContainerHigh = Color(0xFF2A2A2B);
  static const Color surfaceContainerHighest = Color(0xFF353436);

  // Typography & Borders
  static const Color textPrimary = Color(0xFFF4F4F5); // High-contrast White/Zinc
  static const Color textSecondary = Color(0xFFA1A1AA); // Muted Zinc Secondary
  static const Color textMuted = Color(0xFF71717A);
  static const Color border = Color(0xFF27272A); // 1px Low-Contrast Border
  static const Color borderSubtle = Color(0xFF1F1F23);

  // Light Mode Fallback Palette
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightBorder = Color(0xFFE2E8F0);
  static const Color lightTextPrimary = Color(0xFF0F172A);
  static const Color lightTextSecondary = Color(0xFF64748B);
}
