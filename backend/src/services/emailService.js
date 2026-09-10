import nodemailer from 'nodemailer'
import env from '../config/env.js'

let transporter = null

const getTransporter = () => {
  if (transporter) return transporter

  // Check if credentials are provided
  if (env.SMTP_USER && env.SMTP_PASS && env.SMTP_PASS !== 'your_app_specific_password_here') {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      },
      tls: { rejectUnauthorized: true }
    })
  }
  return transporter
}

/* =========================================================================
   BASE EMAIL SHELL (Responsive, Bulletproof CSS, Compatible with all clients)
   ========================================================================= */

const renderEmailShell = ({
  subjectTitle,
  badgeText = 'OFFICIAL METEOROLOGICAL DISPATCH',
  badgeColor = '#38bdf8',
  headerGradient = 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%)',
  mainContentHtml
}) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${subjectTitle}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    /* Reset styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      color: #1e293b;
    }
    table, td {
      border-collapse: collapse !important;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    a {
      text-decoration: none;
      color: #2563eb;
    }
    /* Mobile responsive */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        margin: 0 !important;
      }
      .content-padding {
        padding: 24px 20px !important;
      }
      .header-padding {
        padding: 28px 20px !important;
      }
      .btn-full {
        width: 100% !important;
        display: block !important;
      }
      .token-text {
        font-size: 20px !important;
        letter-spacing: 2px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 30px 10px; background-color: #f1f5f9;">
  <center>
    <!-- Top Preview Text (Hidden in body, visible in inbox list) -->
    <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #f1f5f9;">
      ${subjectTitle} • Meteorological Early Warning System & Security Portal
    </div>

    <!-- Main Outer Container -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="email-container">
      
      <!-- HEADER CARD -->
      <tr>
        <td align="center" style="background: ${headerGradient}; border-top-left-radius: 18px; border-top-right-radius: 18px; padding: 36px 32px 30px 32px;" class="header-padding">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- Official Badge -->
            <tr>
              <td align="center">
                <span style="display: inline-block; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.22); color: ${badgeColor}; font-size: 10.5px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; padding: 5px 14px; border-radius: 20px;">
                  ${badgeText}
                </span>
              </td>
            </tr>

            <!-- Brand Logo & Title -->
            <tr>
              <td align="center" style="padding-top: 16px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2;">
                  ⛅ Weather<span style="color: #38bdf8;">GPT</span>
                </h1>
                <p style="margin: 6px 0 0 0; font-size: 12.5px; color: #94a3b8; font-weight: 500; letter-spacing: 0.3px;">
                  AI Atmospheric Observation & Early Warning Grid
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BODY CARD -->
      <tr>
        <td style="background: #ffffff; border-bottom-left-radius: 18px; border-bottom-right-radius: 18px; padding: 36px 36px 30px 36px; border: 1px solid #e2e8f0; border-top: none; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);" class="content-padding">
          ${mainContentHtml}
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding: 26px 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px; font-weight: 600; color: #64748b; line-height: 1.5;">
            WeatherGPT Meteorological AI • Integrated with MoES & IMD Observation Feeds
          </p>
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            24x7 Emergency Helplines: <strong>112</strong> (National Emergency) • <strong>1077</strong> (Disaster Relief) • <strong>1800-180-1551</strong> (Kisan Call Center)
          </p>
          <p style="margin: 12px 0 0 0; font-size: 11px; color: #cbd5e1;">
            This is an automated system dispatch. Please do not reply directly to this email.<br />
            To manage notification preferences, sign in to your WeatherGPT Profile Settings.
          </p>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`
}

/* =========================================================================
   1. PASSWORD RESET & SECURITY VERIFICATION TEMPLATE
   ========================================================================= */

export const generatePasswordResetHtml = ({
  userName = 'Valued User',
  resetToken,
  resetLink,
  ttlMinutes = 30
}) => {
  const mainContent = `
    <!-- Greeting -->
    <h2 style="margin: 0 0 8px 0; font-size: 21px; font-weight: 700; color: #0f172a; line-height: 1.3;">
      Password Reset Verification
    </h2>
    <p style="margin: 0 0 20px 0; font-size: 14.5px; color: #475569; line-height: 1.6;">
      Hello <strong>${userName}</strong>, we received an authorized request to reset the login credentials for your WeatherGPT account. Use the secure authorization token below or click the verification button to continue.
    </p>

    <!-- SECURITY ALERT BANNER -->
    <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 5px solid #f59e0b; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="28" valign="top" style="font-size: 18px; line-height: 1;">
            ⚠️
          </td>
          <td style="font-size: 13px; color: #92400e; line-height: 1.5; font-weight: 500;">
            <strong>Important Security Notice:</strong> If you did not request this password reset, please disregard this email. Your current password remains safe and no changes have been applied.
          </td>
        </tr>
      </table>
    </div>

    <!-- SECURITY TOKEN CARD -->
    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 22px 18px; text-align: center; margin: 24px 0;">
      <span style="font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 8px;">
        Single-Use Security Token
      </span>
      <div class="token-text" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 23px; font-weight: 800; color: #1e40af; letter-spacing: 3px; word-break: break-all; padding: 4px 0;">
        ${resetToken}
      </div>
      <span style="font-size: 12px; color: #94a3b8; display: block; margin-top: 8px;">
        ⏱️ Token expires in <strong>${ttlMinutes} minutes</strong> • Single use only
      </span>
    </div>

    <!-- PRIMARY ACTION BUTTON (Bulletproof Table Button) -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn-full">
            <tr>
              <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                <a href="${resetLink}" target="_blank" style="font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; color: #ffffff !important; text-decoration: none; padding: 15px 36px; border-radius: 12px; display: inline-block; border: 1px solid #1d4ed8; letter-spacing: 0.3px;">
                  Reset Password Securely &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- SECURITY CHECKLIST -->
    <div style="background-color: #f1f5f9; border-radius: 10px; padding: 16px 18px; margin-top: 26px;">
      <h4 style="margin: 0 0 10px 0; font-size: 12.5px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">
        🛡️ Account Protection Protocol
      </h4>
      <ul style="margin: 0; padding-left: 20px; font-size: 12.5px; color: #64748b; line-height: 1.6;">
        <li>Never share your security token or password with anyone.</li>
        <li>WeatherGPT administrators will never contact you requesting authentication codes.</li>
        <li>Always ensure your browser connects via <code>https://</code> to legitimate WeatherGPT portals.</li>
      </ul>
    </div>

    <!-- DIRECT LINK FALLBACK -->
    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
      <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
        Button not working? Copy and paste this secure link directly into your browser:
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 11.5px; color: #2563eb; word-break: break-all; font-family: monospace;">
        ${resetLink}
      </div>
    </div>
  `

  return renderEmailShell({
    subjectTitle: '🔒 WeatherGPT - Password Reset Verification Code',
    badgeText: 'SECURITY VERIFICATION',
    badgeColor: '#60a5fa',
    headerGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)',
    mainContentHtml: mainContent
  })
}

/* =========================================================================
   2. SEVERE WEATHER EMERGENCY ALERT BULLETIN TEMPLATE
   ========================================================================= */

export const generateSevereWeatherAlertHtml = ({
  userName = 'Citizen / Farmer',
  alert = {}
}) => {
  const severity = (alert.severity || 'high').toLowerCase()
  const isExtreme = severity === 'extreme' || severity === 'red'
  const isHigh = severity === 'high' || severity === 'orange'

  const bannerColor = isExtreme ? '#ef4444' : isHigh ? '#f97316' : '#eab308'
  const badgeText = isExtreme
    ? '🚨 RED ALERT • CRITICAL EMERGENCY'
    : isHigh
      ? '🟠 ORANGE ALERT • SEVERE WARNING'
      : '🟡 YELLOW ALERT • WEATHER ADVISORY'

  const headerGradient = isExtreme
    ? 'linear-gradient(135deg, #450a0a 0%, #991b1b 60%, #dc2626 100%)'
    : isHigh
      ? 'linear-gradient(135deg, #431407 0%, #9a3412 60%, #ea580c 100%)'
      : 'linear-gradient(135deg, #1e293b 0%, #854d0e 60%, #ca8a04 100%)'

  const mainContent = `
    <!-- EMERGENCY CALLOUT HEADER -->
    <div style="background-color: ${isExtreme ? '#fef2f2' : isHigh ? '#fff7ed' : '#fefce8'}; border: 1px solid ${isExtreme ? '#fecaca' : isHigh ? '#fed7aa' : '#fef08a'}; border-left: 6px solid ${bannerColor}; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="top" width="34" style="font-size: 24px; line-height: 1;">
            ${isExtreme ? '🚨' : isHigh ? '⚠️' : '⚡'}
          </td>
          <td>
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: ${isExtreme ? '#991b1b' : isHigh ? '#9a3412' : '#854d0e'};">
              ${alert.title || 'Severe Weather Meteorological Warning'}
            </h3>
            <p style="margin: 0; font-size: 13.5px; color: #334155; line-height: 1.5;">
              ${alert.description || 'Intense precipitation, convective storm activity, and localized wind gusts anticipated over the next 24 to 48 hours.'}
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- METEOROLOGICAL DISPATCH METRICS -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;" width="50%">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Affected Area</span>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">
            📍 ${alert.location || 'Your Registered District'}
          </div>
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;" width="50%">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Severity Tier</span>
          <div style="font-size: 14px; font-weight: 800; color: ${bannerColor}; margin-top: 2px;">
            ● ${severity.toUpperCase()} ALERT
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px;" width="50%">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Hazard Type</span>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">
            ${(alert.type || 'atmospheric_event').toUpperCase()}
          </div>
        </td>
        <td style="padding: 16px 20px;" width="50%">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Effective Duration</span>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">
            ${alert.duration || 'Immediate — Next 24 Hours'}
          </div>
        </td>
      </tr>
    </table>

    <!-- STANDARD OPERATING PROCEDURES (SOP) ADVISORY -->
    <div style="margin-bottom: 24px;">
      <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
        📋 Precautionary Safety Guidelines
      </h4>
      <div style="background-color: #f1f5f9; border-radius: 10px; padding: 16px 18px;">
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
          <li><strong>Stay Indoors:</strong> Avoid non-essential outdoor travel and stay away from tin sheds, loose hoardings, and weak trees.</li>
          <li><strong>Electrical Safety:</strong> Unplug sensitive electrical appliances during lightning events; never seek shelter under solitary trees.</li>
          <li><strong>Waterlogged Zones:</strong> Avoid wading through moving water or driving across flooded causeways.</li>
          <li><strong>Farmer & Agriculture SOP:</strong> Suspend open-field harvesting; clear drainage runoffs in standing crop fields to prevent root rotting.</li>
        </ul>
      </div>
    </div>

    <!-- CALL TO ACTION BUTTONS -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 16px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: 12px; background: ${isExtreme ? '#dc2626' : '#ea580c'}; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);">
                <a href="${env.FRONTEND_URL || 'http://localhost:5173'}/alerts" target="_blank" style="font-size: 14.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; display: inline-block;">
                  View Live Radar & SOP Map &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `

  return renderEmailShell({
    subjectTitle: `🚨 IMD/WeatherGPT ${badgeText} - ${alert.location || 'Regional Warning'}`,
    badgeText,
    badgeColor: bannerColor,
    headerGradient,
    mainContentHtml: mainContent
  })
}

/* =========================================================================
   3. WELCOME & ROLE VERIFICATION TEMPLATE
   ========================================================================= */

export const generateWelcomeHtml = ({
  userName = 'Valued User',
  role = 'user',
  dashboardLink = env.FRONTEND_URL || 'http://localhost:5173'
}) => {
  const isFarmer = role === 'farmer'
  const isAuthority = role === 'authority' || role === 'admin'

  const roleTitle = isFarmer ? 'Farmer / Krishi Partner' : isAuthority ? 'Disaster Authority Officer' : 'Citizen Member'
  const roleBadge = isFarmer ? '🌾 KRISHI ADVISORY ENABLED' : isAuthority ? '🛡️ DISASTER AUTHORITY ACTIVE' : '⛅ CITIZEN WEATHER PORTAL'

  const mainContent = `
    <h2 style="margin: 0 0 8px 0; font-size: 21px; font-weight: 800; color: #0f172a;">
      Welcome to WeatherGPT AI, ${userName}!
    </h2>
    <p style="margin: 0 0 20px 0; font-size: 14.5px; color: #475569; line-height: 1.6;">
      Your account has been successfully initialized. You now have full access to India's most advanced meteorological intelligence platform, synthesizing IMD Doppler Radar, NWP Numerical Models, and hyperlocal disaster warnings.
    </p>

    <!-- ROLE SPECIFIC PRIVILEGES CARD -->
    <div style="background-color: ${isFarmer ? '#f0fdf4' : '#eff6ff'}; border: 1px solid ${isFarmer ? '#bbf7d0' : '#bfdbfe'}; border-left: 5px solid ${isFarmer ? '#16a34a' : '#2563eb'}; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
      <span style="font-size: 11px; font-weight: 800; color: ${isFarmer ? '#15803d' : '#1d4ed8'}; letter-spacing: 1.2px; text-transform: uppercase;">
        ${roleBadge}
      </span>
      <h3 style="margin: 6px 0 6px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
        Configured as: ${roleTitle}
      </h3>
      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
        ${isFarmer
      ? 'You receive dedicated AI Crop Advisories, Mandi commodity weather risks, spray window forecasts, and soil moisture indicators tailored for Indian agricultural zones.'
      : isAuthority
        ? 'You have privileged access to the Authority Command Center, mass SMS/Email broadcast dispatch, evacuation routing, and automated NDRF/SDRF coordination feeds.'
        : 'You receive instant early warnings for thunderstorms, heatwaves, cyclones, and rainfall forecasts for your saved locations.'
    }
      </p>
    </div>

    <!-- ACTION BUTTON -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                <a href="${dashboardLink}" target="_blank" style="font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; color: #ffffff !important; text-decoration: none; padding: 15px 36px; border-radius: 12px; display: inline-block;">
                  Launch Weather Dashboard &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `

  return renderEmailShell({
    subjectTitle: `⛅ Welcome to WeatherGPT - ${roleTitle}`,
    badgeText: roleBadge,
    badgeColor: isFarmer ? '#4ade80' : '#60a5fa',
    headerGradient: isFarmer
      ? 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%)'
      : 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)',
    mainContentHtml: mainContent
  })
}

/* =========================================================================
   EMAIL DISPATCH METHODS
   ========================================================================= */

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async ({ toEmail, userName, resetToken }) => {
  const resetLink = `${env.FRONTEND_URL || 'http://localhost:5173'}?token=${resetToken}&action=reset-password`
  const mailTransporter = getTransporter()
  const htmlContent = generatePasswordResetHtml({
    userName,
    resetToken,
    resetLink,
    ttlMinutes: env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 30
  })

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: `"${env.SMTP_FROM_NAME || 'WeatherGPT Security'}" <${env.SMTP_USER || env.SMTP_FROM_EMAIL}>`,
        to: toEmail,
        subject: '🔒 WeatherGPT - Password Reset Verification Code',
        text: `Hello ${userName},\n\nYour password reset code is: ${resetToken}\n\nReset Link: ${resetLink}\n\nThis token will expire in 30 minutes. If you did not make this request, please disregard this email.`,
        html: htmlContent
      })
      console.log(`📧 [EmailService] Password reset email sent via SMTP to: ${toEmail}`)
      return { sent: true, provider: 'smtp', htmlContent }
    } catch (error) {
      console.warn(`⚠️ [EmailService] SMTP error sending to ${toEmail}:`, error.message)
    }
  }

  // Fallback simulation mode deliberately does not expose the reset token in logs or return values.
  console.warn(`⚠️ [EmailService] SMTP is not configured; password reset email was not delivered to ${toEmail}`)
  return { sent: false, provider: 'simulated' }
}

/**
 * Send severe weather alert email
 */
export const sendSevereWeatherEmailAlert = async ({ toEmail, userName, alert }) => {
  const mailTransporter = getTransporter()
  const htmlContent = generateSevereWeatherAlertHtml({ userName, alert })

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: `"${env.SMTP_FROM_NAME || 'WeatherGPT Alerts'}" <${env.SMTP_USER || env.SMTP_FROM_EMAIL}>`,
        to: toEmail,
        subject: `🚨 [IMD ALERT] ${alert.title || 'Severe Weather Warning'} - ${alert.location || 'Your Region'}`,
        text: `EMERGENCY ALERT: ${alert.title}\nLocation: ${alert.location}\nSeverity: ${alert.severity}\nDescription: ${alert.description}\n\nPlease take immediate precautions.`,
        html: htmlContent
      })
      console.log(`📧 [EmailService] Severe weather email alert sent via SMTP to: ${toEmail}`)
      return { sent: true, provider: 'smtp' }
    } catch (error) {
      console.warn(`⚠️ [EmailService] SMTP error sending alert to ${toEmail}:`, error.message)
    }
  }

  console.log(`ℹ️ [EmailService (Simulated)] Weather alert sent to ${toEmail}: ${alert.title}`)
  return { sent: true, provider: 'simulated', alertTitle: alert.title, htmlContent }
}

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async ({ toEmail, userName, role }) => {
  const mailTransporter = getTransporter()
  const htmlContent = generateWelcomeHtml({ userName, role })

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: `"${env.SMTP_FROM_NAME || 'WeatherGPT Portal'}" <${env.SMTP_USER || env.SMTP_FROM_EMAIL}>`,
        to: toEmail,
        subject: `⛅ Welcome to WeatherGPT - Your Meteorological AI Assistant`,
        text: `Welcome to WeatherGPT, ${userName}! Your account has been activated with role: ${role}.`,
        html: htmlContent
      })
      console.log(`📧 [EmailService] Welcome email sent via SMTP to: ${toEmail}`)
      return { sent: true, provider: 'smtp' }
    } catch (error) {
      console.warn(`⚠️ [EmailService] SMTP error sending welcome to ${toEmail}:`, error.message)
    }
  }

  console.log(`ℹ️ [EmailService (Simulated)] Welcome email dispatched to ${toEmail} (${role})`)
  return { sent: true, provider: 'simulated', htmlContent }
}

/**
 * Generate HTML email template for password changes performed directly by an administrator
 */
export const generateAdminPasswordChangedHtml = ({
  userName = 'Valued User',
  adminEmail = 'System Administrator',
  newPassword = null,
  loginUrl = `${env.FRONTEND_URL || 'http://localhost:5173'}/login`
}) => {
  const mainContent = `
    <!-- Title -->
    <h2 style="margin: 0 0 8px 0; font-size: 21px; font-weight: 700; color: #0f172a; line-height: 1.3;">
      Account Password Updated by Administrator
    </h2>
    <p style="margin: 0 0 20px 0; font-size: 14.5px; color: #475569; line-height: 1.6;">
      Hello <strong>${userName}</strong>, this is an official security alert confirming that an administrator (<strong>${adminEmail}</strong>) has updated the login credentials for your WeatherGPT account.
    </p>

    <!-- SECURITY ALERT BANNER -->
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-left: 5px solid #3b82f6; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="28" valign="top" style="font-size: 18px; line-height: 1;">
            ℹ️
          </td>
          <td style="font-size: 13px; color: #1e40af; line-height: 1.5; font-weight: 500;">
            <strong>Administrator Action:</strong> Your password was modified on <strong>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</strong>. All previous active sessions across all devices have been terminated for your protection.
          </td>
        </tr>
      </table>
    </div>

    ${newPassword ? `
    <!-- NEW PASSWORD CARD -->
    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px 18px; text-align: center; margin: 24px 0;">
      <span style="font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 8px;">
        Your Newly Assigned Password
      </span>
      <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 22px; font-weight: 800; color: #0284c7; letter-spacing: 2px; word-break: break-all; padding: 6px 0;">
        ${newPassword}
      </div>
      <span style="font-size: 12px; color: #64748b; display: block; margin-top: 8px;">
        💡 You can use this password to sign in immediately. We recommend changing it in your Profile Settings after logging in.
      </span>
    </div>
    ` : ''}

    <!-- PRIMARY ACTION BUTTON -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn-full">
            <tr>
              <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
                <a href="${loginUrl}" target="_blank" style="font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; color: #ffffff !important; text-decoration: none; padding: 15px 36px; border-radius: 12px; display: inline-block; border: 1px solid #0369a1; letter-spacing: 0.3px;">
                  Sign In to WeatherGPT &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- SECURITY ADVISORY -->
    <div style="background-color: #f1f5f9; border-radius: 10px; padding: 16px 18px; margin-top: 26px;">
      <h4 style="margin: 0 0 10px 0; font-size: 12.5px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">
        🛡️ Did Not Authorize This Action?
      </h4>
      <p style="margin: 0; font-size: 12.5px; color: #64748b; line-height: 1.6;">
        If you did not request this administrative password reset, please contact your organization administrator or security office immediately at <strong>admin@weathergpt.ai</strong>.
      </p>
    </div>
  `

  return renderEmailShell({
    subjectTitle: 'Password Changed by Administrator',
    badgeText: 'SECURITY CREDENTIAL NOTICE',
    badgeColor: '#38bdf8',
    headerGradient: 'linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #0284c7 100%)',
    mainContentHtml: mainContent
  })
}

/**
 * Dispatch an email to the user notifying them that their password was changed by an administrator
 */
export const sendAdminPasswordChangedEmail = async ({
  toEmail,
  userName,
  adminEmail,
  newPassword = null
}) => {
  const mailTransporter = getTransporter()
  const htmlContent = generateAdminPasswordChangedHtml({
    userName,
    adminEmail,
    newPassword
  })

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: `"${env.SMTP_FROM_NAME || 'WeatherGPT Security'}" <${env.SMTP_USER || env.SMTP_FROM_EMAIL}>`,
        to: toEmail,
        subject: `🔐 Security Notice: Your WeatherGPT Password Has Been Changed by Administrator`,
        text: `Hello ${userName},\n\nYour WeatherGPT account password has been updated by administrator (${adminEmail}).\n${newPassword ? `Your new password is: ${newPassword}\n` : ''}\nYou can sign in at: ${env.FRONTEND_URL || 'http://localhost:5173'}/login\n\nIf you did not authorize this, please contact support immediately.`,
        html: htmlContent
      })
      console.log(`📧 [EmailService] Password changed notice sent via SMTP to: ${toEmail}`)
      return { sent: true, provider: 'smtp' }
    } catch (error) {
      console.warn(`⚠️ [EmailService] SMTP error sending password change notice to ${toEmail}:`, error.message)
    }
  }

  console.log(`ℹ️ [EmailService (Simulated)] Password change notice dispatched to ${toEmail}`)
  return { sent: true, provider: 'simulated', htmlContent }
}

export default {
  sendPasswordResetEmail,
  sendSevereWeatherEmailAlert,
  sendWelcomeEmail,
  sendAdminPasswordChangedEmail,
  generatePasswordResetHtml,
  generateSevereWeatherAlertHtml,
  generateWelcomeHtml,
  generateAdminPasswordChangedHtml
}
