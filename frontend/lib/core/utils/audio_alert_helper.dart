import 'package:flutter/foundation.dart';
import 'dart:js' as js;

class AudioAlertHelper {
  /// Plays a clean, pleasant two-tone chime via Web Audio API
  static void playNotificationChime() {
    if (kIsWeb) {
      try {
        js.context.callMethod('eval', [
          '''
          (function() {
            try {
              var AudioContext = window.AudioContext || window.webkitAudioContext;
              if (!AudioContext) return;
              var ctx = new AudioContext();
              
              // Note 1 (E5 - 659.25Hz)
              var osc1 = ctx.createOscillator();
              var gain1 = ctx.createGain();
              osc1.type = 'sine';
              osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
              gain1.gain.setValueAtTime(0.15, ctx.currentTime);
              gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
              osc1.connect(gain1);
              gain1.connect(ctx.destination);
              osc1.start(ctx.currentTime);
              osc1.stop(ctx.currentTime + 0.35);

              // Note 2 (B5 - 987.77Hz - sparkling chime)
              var osc2 = ctx.createOscillator();
              var gain2 = ctx.createGain();
              osc2.type = 'sine';
              osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12);
              gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
              gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              osc2.start(ctx.currentTime + 0.12);
              osc2.stop(ctx.currentTime + 0.55);
            } catch(e) {
              console.warn('Audio chime play error:', e);
            }
          })()
          ''',
        ]);
      } catch (e) {
        debugPrint('⚠️ [AudioAlertHelper] Could not play notification chime: $e');
      }
    }
  }
}
