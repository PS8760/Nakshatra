import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
