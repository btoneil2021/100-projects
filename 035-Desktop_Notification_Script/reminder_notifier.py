import threading
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
import re
from plyer import notification

class NotificationManager:
    """Manages desktop notifications using plyer library."""
    
    def __init__(self):
        self.app_name = "Reminder Notifier"
        self.default_timeout = 10  # Number of seconds before timeout
    
    # Optional[int] => timeout can either be an integer (num seconds) or None (no timeout)
    def send_notification(self, title: str, message: str, timeout: Optional[int] = None) -> None:
        """
        Send a desktop notification.
        
        Args:
            title: Notification title
            message: Notification message
            timeout: How long to display notification (seconds)
        """
        try:
            notification.notify(
                title=title,
                message=message,
                app_name=self.app_name,
                timeout=timeout or self.default_timeout
            )
            print(f"[OK] Notification sent: {title}")
        except Exception as e:
            print(f"Error sending notification: {e}")


class TimeParser:
    """Parses user input for time delays and specific times."""
    
    # staticmethod - doesn't need the class, is in it for organizational purposes
    @staticmethod
    def parse_delay(input_str: str) -> Optional[int]:
        """
        Parse delay strings like '5 minutes', '30 seconds', '2 hours'.
        
        Args:
            input_str: User input string
            
        Returns:
            Delay in seconds, or None if parsing fails
        """
        input_str = input_str.lower().strip()
        
        # Pattern to match number followed by time unit
        pattern = r'^(\d+)\s*(second|seconds|sec|s|minute|minutes|min|m|hour|hours|hr|h)$'
        match = re.match(pattern, input_str)
        
        if not match:
            return None
        
        value = int(match.group(1))
        unit = match.group(2)
        
        # Convert to seconds
        if unit in ['second', 'seconds', 'sec', 's']:
            return value
        elif unit in ['minute', 'minutes', 'min', 'm']:
            return value * 60
        elif unit in ['hour', 'hours', 'hr', 'h']:
            return value * 3600
        
        return None
    
    @staticmethod
    # Optional[datetime] - returns a datetime object or None if parsing fails
    def parse_time(input_str: str) -> Optional[datetime]:
        """
        Parse time strings like '3:30 PM', '15:30', '9:00 AM'.
        
        Args:
            input_str: User input string
            
        Returns:
            datetime object for today at specified time, or None if parsing fails
        """
        input_str = input_str.strip()
        
        # Common time formats to try (tries each one until it works)
        time_formats = [
            '%I:%M %p',    # 3:30 PM
            '%I:%M%p',     # 3:30PM
            '%H:%M',       # 15:30
            '%I %p',       # 3 PM
            '%I%p',        # 3PM
        ]
        
        for fmt in time_formats:
            try:
                parsed_time = datetime.strptime(input_str, fmt).time()
                # Combine with today's date
                today = datetime.now().date()
                target_datetime = datetime.combine(today, parsed_time)
                
                # If time has already passed today, set for tomorrow
                if target_datetime <= datetime.now():
                    target_datetime += timedelta(days=1)
                
                return target_datetime
            except ValueError:
                continue
        
        return None


class ReminderScheduler:
    """Manages and schedules reminders."""
    
    def __init__(self, notification_manager: NotificationManager):
        self.notification_manager = notification_manager
        self.pending_reminders: List[threading.Timer] = []
        self.reminder_count = 0
    
    def schedule_reminder(self, delay_seconds: int, title: str, message: str) -> None:
        """
        Schedule a reminder to fire after specified delay.
        
        Args:
            delay_seconds: Delay in seconds
            title: Reminder title
            message: Reminder message
        """
        self.reminder_count += 1
        reminder_id = self.reminder_count
        
        # Send notification and clean expired timers
        def fire_reminder():
            self.notification_manager.send_notification(title, message)
            # Remove from pending list
            self.pending_reminders = [t for t in self.pending_reminders if t.is_alive()]
        
        # Init a thread to wait delay_seconds before firing reminder
        timer = threading.Timer(delay_seconds, fire_reminder)
        timer.daemon = True  # Don't prevent program from exiting
        timer.start()
        
        self.pending_reminders.append(timer)
        
        # Calculate when reminder will fire
        # timedelta - adding/subtracting time periods with datetime objects
        fire_time = datetime.now() + timedelta(seconds=delay_seconds)
        print(f"[OK] Reminder #{reminder_id} scheduled for {fire_time.strftime('%I:%M %p')}")
    
    def schedule_at_time(self, target_time: datetime, title: str, message: str) -> None:
        """
        Schedule a reminder for a specific time.
        
        Args:
            target_time: When to fire the reminder
            title: Reminder title
            message: Reminder message
        """
        delay = (target_time - datetime.now()).total_seconds()
        
        if delay <= 0:
            print("Error: Specified time has already passed")
            return
        
        self.schedule_reminder(int(delay), title, message)
    
    def get_pending_count(self) -> int:
        """Get count of pending reminders."""
        self.pending_reminders = [t for t in self.pending_reminders if t.is_alive()]
        return len(self.pending_reminders)
    
    def cancel_all(self) -> None:
        """Cancel all pending reminders."""
        for timer in self.pending_reminders:
            if timer.is_alive():
                timer.cancel()
        self.pending_reminders.clear()
        print("[OK] All pending reminders cancelled")


class ReminderApp:
    """Main application class for the reminder system."""
    
    def __init__(self):
        self.notification_manager = NotificationManager()
        self.time_parser = TimeParser()
        self.scheduler = ReminderScheduler(self.notification_manager)
    
    def display_menu(self) -> None:
        """Display the main menu."""
        print("\n" + "="*50)
        print("DESKTOP REMINDER NOTIFIER")
        print("="*50)
        print("1. Add reminder with delay (e.g., '5 minutes')")
        print("2. Add reminder at specific time (e.g., '3:30 PM')")
        print("3. View pending reminders")
        print("4. Cancel all reminders")
        print("5. Exit")
        print("="*50)
    
    def get_reminder_details(self) -> Tuple[str, str]:
        """Get reminder title and message from user."""
        title = input("Enter reminder title: ").strip()
        if not title:
            title = "Reminder"
        
        message = input("Enter reminder message: ").strip()
        if not message:
            message = "This is your scheduled reminder!"
        
        return title, message
    
    def add_delay_reminder(self) -> None:
        """Add a reminder with a delay."""
        print("\nExamples: '5 minutes', '30 seconds', '2 hours'")
        delay_input = input("Enter delay: ").strip()
        
        delay_seconds = self.time_parser.parse_delay(delay_input)
        
        if delay_seconds is None:
            print("Error: Invalid delay format. Please try again.")
            return
        
        title, message = self.get_reminder_details()
        self.scheduler.schedule_reminder(delay_seconds, title, message)
    
    def add_time_reminder(self) -> None:
        """Add a reminder at a specific time."""
        print("\nExamples: '3:30 PM', '15:30', '9:00 AM'")
        time_input = input("Enter time: ").strip()
        
        target_time = self.time_parser.parse_time(time_input)
        
        if target_time is None:
            print("Error: Invalid time format. Please try again.")
            return
        
        title, message = self.get_reminder_details()
        self.scheduler.schedule_at_time(target_time, title, message)
    
    def view_pending(self) -> None:
        """View count of pending reminders."""
        count = self.scheduler.get_pending_count()
        if count == 0:
            print("\nNo pending reminders.")
        else:
            print(f"\nYou have {count} pending reminder(s).")
    
    def run(self) -> None:
        """Run the main application loop."""
        print("Welcome to Desktop Reminder Notifier!")
        print("This app will help you set desktop notification reminders.")
        
        while True:
            self.display_menu()
            
            try:
                choice = input("\nEnter your choice (1-5): ").strip()
                
                if choice == '1':
                    self.add_delay_reminder()
                elif choice == '2':
                    self.add_time_reminder()
                elif choice == '3':
                    self.view_pending()
                elif choice == '4':
                    self.scheduler.cancel_all()
                elif choice == '5':
                    print("\nExiting... (Pending reminders will be cancelled)")
                    self.scheduler.cancel_all()
                    break
                else:
                    print("Invalid choice. Please enter a number from 1 to 5.")
            
            except KeyboardInterrupt:
                print("\n\nInterrupted. Exiting...")
                self.scheduler.cancel_all()
                break
            except Exception as e:
                print(f"An error occurred: {e}")


def main():
    """Main entry point."""
    app = ReminderApp()
    app.run()


if __name__ == "__main__":
    main()