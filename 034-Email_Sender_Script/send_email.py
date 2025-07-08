import smtplib
import configparser
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email import encoders
import os
import sys

def main():
    """
    Connects to an SMTP server, constructs an email with attachments from a config file,
    and sends it.
    """
    config = configparser.ConfigParser()
    config.read('config.ini') 

    SMTP_SERVER = config['smtp']['server']
    SMTP_PORT = config['smtp']['port']
    SENDER_EMAIL = os.getenv('SENDER_EMAIL')
    SENDER_PASSWORD = os.getenv('SENDER_PASSWORD')
    RECIPIENT_EMAIL = os.getenv('RECIPIENT_EMAIL')

    if not SENDER_EMAIL:
        print("Error: SENDER_EMAIL environment variable not set.", file=sys.stderr)
        sys.exit(1)
    if not SENDER_PASSWORD:
        print("Error: SENDER_PASSWORD environment variable not set.", file=sys.stderr)
        sys.exit(1)
    if not RECIPIENT_EMAIL:
        print("Error: RECIPIENT_EMAIL environment variable not set.", file=sys.stderr)
        sys.exit(1)

    EMAIL_SUBJECT = "Test Email with Attachments"
    EMAIL_BODY = "Hello,\n\nPlease find the project report and the latest data attached.\n\nBest regards,\nAutomation Bot"
    ATTACHMENT_FILES = ['resume.pdf']

    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = RECIPIENT_EMAIL
    msg['Subject'] = EMAIL_SUBJECT
    msg.attach(MIMEText(EMAIL_BODY, 'plain'))

    for file in ATTACHMENT_FILES:
        try:
            with open(file, "rb") as attachment:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())

            encoders.encode_base64(part)

            part.add_header(
                "Content-Disposition",
                f"attachment; filename= {os.path.basename(file)}"
            )

            msg.attach(part)
            print(f"Successfully attached {file}")
        
        except Exception as e:
            print(f"Could not attach file {file}. Error: {e}")

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, RECIPIENT_EMAIL, text)
        print("Email sent successfully")

    except Exception as e:
        print(f"Failed to send email. Error: {e}")
    finally:
        if 'server' in locals() and server:
            server.quit()

if __name__ == "__main__":
    main()