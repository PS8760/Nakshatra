import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, TEAM_EMAIL

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html: str) -> bool:
    if not SMTP_USER or not SMTP_PASS:
        logger.warning("SMTP credentials not configured — email skipped")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, to, msg.as_string())
        logger.info(f"Email sent to {to}: {subject}")
        return True
    except smtplib.SMTPAuthenticationError:
        logger.error(
            "SMTP auth failed. Gmail requires an App Password — "
            "generate one at https://myaccount.google.com/apppasswords"
        )
        return False
    except Exception as e:
        logger.error(f"Email error: {e}")
        return False


def send_welcome_email(to: str, name: str) -> bool:
    html = f"""
    <div style="font-family:sans-serif;background:#02182b;color:#fff;padding:40px;border-radius:12px;max-width:600px;margin:auto">
      <h1 style="color:#09ffd3">Welcome to CogniscanAI 🧠</h1>
      <p>Hi <strong>{name}</strong>,</p>
      <p>Your account has been created. You can now take cognitive screening tests, track your history, and share results with caregivers.</p>
      <a href="http://localhost:3000/test" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#09ffd3;color:#02182b;font-weight:bold;border-radius:10px;text-decoration:none">
        Start Your First Test →
      </a>
      <p style="margin-top:30px;color:#666;font-size:12px">CogniscanAI — Early Detection. Better Prevention.</p>
    </div>
    """
    return send_email(to, "Welcome to CogniscanAI", html)


def send_caregiver_alert(to: str, patient_name: str, score: int, risk: str, message: str = "") -> bool:
    risk_color = {"Low": "#09ffd3", "Medium": "#f59e0b", "High": "#ef4444"}.get(risk, "#fff")
    html = f"""
    <div style="font-family:sans-serif;background:#02182b;color:#fff;padding:40px;border-radius:12px;max-width:600px;margin:auto">
      <h1 style="color:#ef4444">⚠️ Cognitive Risk Alert</h1>
      <p>A cognitive screening result has been flagged for your attention.</p>
      <div style="background:#ffffff10;border-radius:10px;padding:20px;margin:20px 0">
        <p><strong>Patient:</strong> {patient_name}</p>
        <p><strong>Score:</strong> <span style="color:{risk_color};font-size:24px;font-weight:bold">{score}/100</span></p>
        <p><strong>Risk Level:</strong> <span style="color:{risk_color};font-weight:bold">{risk}</span></p>
        {f'<p><strong>Message:</strong> {message}</p>' if message else ''}
      </div>
      <p>Please consult a healthcare professional as soon as possible.</p>
      <p style="margin-top:30px;color:#666;font-size:12px">CogniscanAI — Early Detection. Better Prevention.</p>
    </div>
    """
    return send_email(to, f"🚨 CogniscanAI Alert: {risk} Risk Detected", html)


def send_contact_email(name: str, email: str, subject: str, message: str) -> bool:
    html = f"""
    <div style="font-family:sans-serif;background:#02182b;color:#fff;padding:40px;border-radius:12px;max-width:600px;margin:auto">
      <h2 style="color:#09ffd3">New Contact Form Submission</h2>
      <div style="background:#ffffff10;border-radius:10px;padding:20px;margin:20px 0">
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Message:</strong></p>
        <p style="color:#ccc">{message}</p>
      </div>
      <p style="color:#666;font-size:12px">Sent via CogniscanAI Contact Form</p>
    </div>
    """
    return send_email(TEAM_EMAIL, f"[CogniscanAI] {subject}", html)


def send_weekly_reminder(to: str, name: str, days_since_last: Optional[int], last_score: Optional[int], last_risk: Optional[str]) -> bool:
    last_info = ""
    if last_score is not None and last_risk:
        risk_color = {"Low": "#09ffd3", "Medium": "#f59e0b", "High": "#ef4444"}.get(last_risk, "#fff")
        last_info = f"""
        <div style="background:#ffffff10;border-radius:10px;padding:16px;margin:16px 0;text-align:center">
          <p style="color:#aaa;font-size:13px;margin:0 0 4px">Your last score</p>
          <p style="color:{risk_color};font-size:32px;font-weight:bold;margin:0">{last_score}<span style="font-size:16px;color:#666">/100</span></p>
          <p style="color:{risk_color};font-size:13px;margin:4px 0 0">{last_risk} Risk</p>
        </div>"""

    days_text = f"{days_since_last} days ago" if days_since_last else "a while ago"

    html = f"""
    <div style="font-family:sans-serif;background:#02182b;color:#fff;padding:40px;border-radius:12px;max-width:600px;margin:auto">
      <div style="text-align:center;margin-bottom:24px">
        <span style="font-size:40px">🧠</span>
        <h2 style="color:#09ffd3;margin:8px 0 0">CogniscanAI</h2>
      </div>
      <h2 style="color:#fff">Hi {name}, time for your weekly check-in!</h2>
      <p style="color:#aaa;line-height:1.6">
        Your last cognitive screening was <strong style="color:#fff">{days_text}</strong>.
        Regular weekly testing helps detect subtle changes over time — the earlier, the better.
      </p>
      {last_info}
      <div style="text-align:center;margin:28px 0">
        <a href="https://nakshatra.vercel.app/test"
           style="display:inline-block;padding:14px 32px;background:#09ffd3;color:#02182b;font-weight:bold;border-radius:12px;text-decoration:none;font-size:16px">
          Take This Week's Test →
        </a>
      </div>
      <p style="color:#555;font-size:12px;text-align:center;margin-top:24px">
        You're receiving this because you enabled weekly reminders.<br>
        <a href="https://nakshatra.vercel.app/profile" style="color:#09ffd3">Manage preferences</a>
      </p>
    </div>
    """
    return send_email(to, "🧠 Your weekly cognitive check-in is due", html)
