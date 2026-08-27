"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailProvider = EmailProvider_1 = class EmailProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailProvider_1.name);
        this.transporter = null;
        const host = this.configService.get('SMTP_HOST');
        const port = this.configService.get('SMTP_PORT', 587);
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
        this.fromEmail =
            this.configService.get('SMTP_FROM') || 'noreply@bookflow.io';
        if (host && user && pass) {
            try {
                this.transporter = nodemailer.createTransport({
                    host,
                    port,
                    secure: port === 465,
                    auth: { user, pass },
                });
                this.isConfigured = true;
                this.logger.log(`📧 SMTP Transporter initialized (${host}:${port})`);
            }
            catch (err) {
                this.logger.warn(`Failed to initialize SMTP: ${err}`);
                this.isConfigured = false;
            }
        }
        else {
            this.isConfigured = false;
            this.logger.log('📧 SMTP not fully configured. Using development console email logger.');
        }
    }
    async sendEmail(payload) {
        if (this.isConfigured && this.transporter) {
            try {
                const mailOptions = {
                    from: `"${payload.metadata?.businessName || 'BookFlow'}" <${this.fromEmail}>`,
                    to: payload.to,
                    subject: payload.subject,
                    text: payload.text,
                    html: payload.html,
                    attachments: payload.attachments?.map((att) => ({
                        filename: att.filename,
                        content: att.content,
                        contentType: att.contentType || 'text/calendar',
                    })),
                };
                const info = await this.transporter.sendMail(mailOptions);
                this.logger.log(`📧 Live email dispatched to ${payload.to} (MessageID: ${info.messageId})`);
                return {
                    success: true,
                    messageId: info.messageId,
                    channel: 'EMAIL',
                };
            }
            catch (error) {
                this.logger.error(`Failed to dispatch SMTP email to ${payload.to}: ${error.message}`);
                return {
                    success: false,
                    channel: 'EMAIL',
                    error: error.message,
                };
            }
        }
        this.logger.log(`\n================= 📧 [DEV TRANSACTIONAL EMAIL] =================\n` +
            `To: ${payload.to} (${payload.recipientName})\n` +
            `Subject: ${payload.subject}\n` +
            `Attachments: ${payload.attachments?.map((a) => a.filename).join(', ') || 'None'}\n` +
            `---------------------------------------------------------------\n` +
            `${payload.text}\n` +
            `=================================================================\n`);
        return {
            success: true,
            messageId: `dev-mock-${Date.now()}`,
            channel: 'EMAIL',
        };
    }
    generateIcsContent(data) {
        const formatDate = (date) => {
            return date
                .toISOString()
                .replace(/[-:]/g, '')
                .replace(/\.\d{3}/, '');
        };
        const uid = `${data.appointmentId || Date.now()}@bookflow.io`;
        const dtStamp = formatDate(new Date());
        const dtStart = formatDate(data.startAt);
        const dtEnd = formatDate(data.endAt);
        const summary = `${data.serviceName} with ${data.staffName} at ${data.businessName}`;
        const description = `Appointment for ${data.serviceName}\\nSpecialist: ${data.staffName}\\nClient: ${data.customerName}\\nNotes: ${data.notes || 'None'}`;
        const location = data.businessLocation || data.businessName;
        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//BookFlow SaaS//Appointment Booking//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:REQUEST',
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${dtStamp}`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description}`,
            `LOCATION:${location}`,
            'STATUS:CONFIRMED',
            'SEQUENCE:0',
            'BEGIN:VALARM',
            'TRIGGER:-PT2H',
            'ACTION:DISPLAY',
            `DESCRIPTION:Reminder: ${summary}`,
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR',
        ].join('\r\n');
    }
    generateGoogleCalendarUrl(data) {
        const formatGDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
        const title = encodeURIComponent(`${data.serviceName} with ${data.staffName} @ ${data.businessName}`);
        const dates = `${formatGDate(data.startAt)}/${formatGDate(data.endAt)}`;
        const details = encodeURIComponent(`Appointment: ${data.serviceName}\nSpecialist: ${data.staffName}\nVenue: ${data.businessName}\nClient: ${data.customerName}`);
        const location = encodeURIComponent(data.businessLocation || data.businessName);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    }
    renderCustomerConfirmationHtml(data) {
        const color = data.primaryColor || '#4F46E5';
        const priceFormatted = (data.servicePricePaise / 100).toLocaleString('en-IN', {
            style: 'currency',
            currency: data.currency || 'INR',
        });
        const dateFormatted = data.startAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const timeFormatted = `${data.startAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${data.endAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        const googleCalUrl = this.generateGoogleCalendarUrl(data);
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0F172A; color: #F8FAFC; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background: #1E293B; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
    .header { background: linear-gradient(135deg, ${color}, #6366F1); padding: 32px 24px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .body { padding: 32px 24px; }
    .greeting { font-size: 16px; line-height: 1.6; color: #CBD5E1; margin-bottom: 24px; }
    .card { background: #0F172A; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .card-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1E293B; }
    .card-row:last-child { border-bottom: none; }
    .label { color: #94A3B8; font-size: 14px; }
    .value { color: #F8FAFC; font-size: 14px; font-weight: 600; text-align: right; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: ${color}; color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(79,70,229,0.35); }
    .footer { background: #0F172A; border-top: 1px solid #334155; padding: 20px; text-align: center; font-size: 12px; color: #64748B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Booking Confirmed ✓</span>
      <h1 style="margin-top: 12px;">${data.businessName}</h1>
      <p style="margin: 0; opacity: 0.9;">We look forward to welcoming you</p>
    </div>
    <div class="body">
      <p class="greeting">Hi <strong>${data.customerName}</strong>,<br>Your appointment for <strong>${data.serviceName}</strong> has been successfully booked!</p>
      
      <div class="card">
        <div class="card-row">
          <span class="label">📅 Date</span>
          <span class="value">${dateFormatted}</span>
        </div>
        <div class="card-row">
          <span class="label">⏰ Time</span>
          <span class="value">${timeFormatted} (${data.durationMinutes} mins)</span>
        </div>
        <div class="card-row">
          <span class="label">👤 Specialist</span>
          <span class="value">${data.staffName}</span>
        </div>
        <div class="card-row">
          <span class="label">💵 Price</span>
          <span class="value">${priceFormatted}</span>
        </div>
        ${data.businessLocation ? `
        <div class="card-row">
          <span class="label">📍 Location</span>
          <span class="value">${data.businessLocation}</span>
        </div>` : ''}
      </div>

      <div class="btn-container">
        <a href="${googleCalUrl}" target="_blank" class="btn">📅 Add to Google Calendar</a>
      </div>

      <p style="font-size: 13px; color: #94A3B8; text-align: center;">
        An iCal (<code>.ics</code>) invitation is attached to this email for Apple Calendar and Outlook.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">Need to reschedule? Contact <strong>${data.businessName}</strong> at ${data.businessPhone || data.businessEmail || 'support'}.</p>
      <p style="margin: 0;">Powered by BookFlow SaaS</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    }
    renderStaffAlertHtml(data) {
        const color = data.primaryColor || '#4F46E5';
        const dateFormatted = data.startAt.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
        const timeFormatted = `${data.startAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${data.endAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0F172A; color: #F8FAFC; padding: 20px; }
    .box { max-width: 520px; margin: 0 auto; background: #1E293B; border-radius: 12px; border: 1px solid #334155; padding: 24px; }
    .header { font-size: 18px; font-weight: 700; color: ${color}; margin-bottom: 16px; border-bottom: 1px solid #334155; padding-bottom: 12px; }
    .info-item { margin-bottom: 12px; font-size: 14px; }
    .info-label { color: #94A3B8; }
    .info-val { font-weight: 600; color: #F8FAFC; }
  </style>
</head>
<body>
  <div class="box">
    <div class="header">📋 New Appointment Assigned</div>
    <p>Hi <strong>${data.staffName}</strong>, a new client booking has been confirmed with you at <strong>${data.businessName}</strong>.</p>
    <div style="background: #0F172A; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <div class="info-item"><span class="info-label">Client: </span><span class="info-val">${data.customerName} (${data.customerPhone || data.customerEmail})</span></div>
      <div class="info-item"><span class="info-label">Service: </span><span class="info-val">${data.serviceName} (${data.durationMinutes}m)</span></div>
      <div class="info-item"><span class="info-label">When: </span><span class="info-val">${dateFormatted} @ ${timeFormatted}</span></div>
      ${data.notes ? `<div class="info-item"><span class="info-label">Notes: </span><span class="info-val">${data.notes}</span></div>` : ''}
    </div>
    <p style="font-size: 12px; color: #64748B; margin: 0;">View in your BookFlow Staff Schedule.</p>
  </div>
</body>
</html>
    `.trim();
    }
    renderReminderHtml(data, reminderType) {
        const color = data.primaryColor || '#4F46E5';
        const tag = reminderType === '24H' ? 'Tomorrow' : 'In 2 Hours';
        const dateFormatted = data.startAt.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
        const timeFormatted = data.startAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0F172A; color: #F8FAFC; padding: 24px; }
    .box { max-width: 540px; margin: 0 auto; background: #1E293B; border-radius: 16px; border: 1px solid ${color}; padding: 30px; }
    .tag { display: inline-block; background: #F59E0B; color: #000; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="box">
    <span class="tag">⏰ Appointment Reminder (${tag})</span>
    <h2 style="margin: 14px 0 8px 0; color: #F8FAFC;">See you soon at ${data.businessName}</h2>
    <p style="color: #94A3B8; font-size: 15px; line-height: 1.6;">
      Hi ${data.customerName}, this is a quick reminder for your upcoming <strong>${data.serviceName}</strong> appointment.
    </p>
    <div style="background: #0F172A; border-radius: 10px; border: 1px solid #334155; padding: 18px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>📅 When:</strong> ${dateFormatted} at <strong>${timeFormatted}</strong></p>
      <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>👤 Specialist:</strong> ${data.staffName}</p>
      ${data.businessLocation ? `<p style="margin: 0; font-size: 15px;"><strong>📍 Location:</strong> ${data.businessLocation}</p>` : ''}
    </div>
    <p style="font-size: 13px; color: #64748B; margin-bottom: 0;">
      If you have questions or need directions, contact us at ${data.businessPhone || data.businessEmail || 'our desk'}.
    </p>
  </div>
</body>
</html>
    `.trim();
    }
    renderCancellationHtml(data) {
        const dateFormatted = data.startAt.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
        const timeFormatted = data.startAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0F172A; color: #F8FAFC; padding: 24px; }
    .box { max-width: 540px; margin: 0 auto; background: #1E293B; border-radius: 16px; border: 1px solid #EF4444; padding: 30px; }
    .tag { display: inline-block; background: #EF4444; color: #FFF; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="box">
    <span class="tag">Cancelled</span>
    <h2 style="margin: 14px 0 8px 0; color: #F8FAFC;">Appointment Cancelled</h2>
    <p style="color: #94A3B8; font-size: 15px; line-height: 1.6;">
      Hi ${data.customerName}, your appointment for <strong>${data.serviceName}</strong> at ${data.businessName} scheduled for <strong>${dateFormatted} at ${timeFormatted}</strong> has been cancelled.
    </p>
    ${data.cancellationReason ? `
    <div style="background: #0F172A; border-radius: 10px; border: 1px solid #334155; padding: 14px; margin: 16px 0; font-size: 14px; color: #E2E8F0;">
      <strong>Reason:</strong> ${data.cancellationReason}
    </div>` : ''}
    <p style="font-size: 13px; color: #64748B; margin-top: 20px;">
      You can rebook at any time by visiting our online booking page.
    </p>
  </div>
</body>
</html>
    `.trim();
    }
};
exports.EmailProvider = EmailProvider;
exports.EmailProvider = EmailProvider = EmailProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailProvider);
//# sourceMappingURL=email.provider.js.map