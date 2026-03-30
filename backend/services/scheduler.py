"""
Weekly reminder email scheduler.
Runs as a background task — checks every hour for users due a reminder.
"""
import asyncio
import logging
from datetime import datetime, timedelta
from services.mailer import send_weekly_reminder

logger = logging.getLogger(__name__)

REMINDER_INTERVAL_DAYS = 7
CHECK_INTERVAL_SECONDS = 3600  # check every hour


async def run_scheduler(db):
    """Background task that sends weekly reminders to opted-in users."""
    logger.info("📅 Weekly reminder scheduler started")
    while True:
        try:
            await send_due_reminders(db)
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
        await asyncio.sleep(CHECK_INTERVAL_SECONDS)


async def send_due_reminders(db):
    cutoff = datetime.utcnow() - timedelta(days=REMINDER_INTERVAL_DAYS)
    # Find users with reminders enabled who haven't tested in 7+ days
    users = await db.users.find({
        "weeklyReminder": True,
        "$or": [
            {"lastTestDate": {"$lt": cutoff}},
            {"lastTestDate": {"$exists": False}},
        ]
    }).to_list(length=100)

    sent = 0
    for user in users:
        try:
            last = user.get("lastTestDate")
            days_ago = (datetime.utcnow() - last).days if last else None
            ok = send_weekly_reminder(
                to=user["email"],
                name=user["name"],
                days_since_last=days_ago,
                last_score=user.get("lastScore"),
                last_risk=user.get("lastRisk"),
            )
            if ok:
                sent += 1
                # Update last reminder sent time
                await db.users.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"lastReminderSent": datetime.utcnow()}}
                )
        except Exception as e:
            logger.error(f"Reminder failed for {user.get('email')}: {e}")

    if sent > 0:
        logger.info(f"📧 Sent {sent} weekly reminders")
