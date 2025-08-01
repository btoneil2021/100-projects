# Desktop Notification Reminder Script

A Python script that displays desktop notifications at specified times or after delays, serving as a simple reminder system.

## Features

- **Delay-based reminders**: Set reminders after a specified delay (e.g., "5 minutes", "2 hours")
- **Time-based reminders**: Set reminders for specific times (e.g., "3:30 PM", "9:00 AM")
- **Multiple reminders**: Queue multiple reminders to fire at different times
- **Cross-platform support**: Works on Windows, macOS, and Linux using the plyer library
- **Interactive CLI**: User-friendly command-line interface with menu system
- **Non-blocking**: Uses threading to handle multiple reminders without freezing the program

## Requirements

- Python 3.6 or higher
- plyer library (for cross-platform notifications)

## Installation

1. Clone or download this repository

2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Running the Script

```bash
python reminder_notifier.py
```

### Main Menu Options

1. **Add reminder with delay** - Set a reminder after a specified time period
2. **Add reminder at specific time** - Set a reminder for a specific time today or tomorrow
3. **View pending reminders** - Check how many reminders are waiting to fire
4. **Cancel all reminders** - Cancel all pending reminders
5. **Exit** - Exit the program (cancels all pending reminders)

### Examples

#### Delay-based Reminders
- `5 minutes` - Reminder in 5 minutes
- `30 seconds` - Reminder in 30 seconds  
- `2 hours` - Reminder in 2 hours
- `1 hour` - Reminder in 1 hour

#### Time-based Reminders
- `3:30 PM` - Reminder at 3:30 PM
- `15:30` - Reminder at 3:30 PM (24-hour format)
- `9:00 AM` - Reminder at 9:00 AM
- `9 PM` - Reminder at 9:00 PM

## How It Works

1. **NotificationManager**: Handles the display of desktop notifications using plyer
2. **TimeParser**: Parses user input for both delay strings and time formats
3. **ReminderScheduler**: Manages reminder scheduling using Python's threading.Timer
4. **ReminderApp**: Provides the interactive CLI interface

## Key Concepts Demonstrated

- **System Notification Libraries**: Using plyer for cross-platform desktop notifications
- **Time Parsing**: Converting user-friendly time inputs into datetime objects
- **Threading**: Non-blocking reminder scheduling using threading.Timer
- **Object-Oriented Design**: Clean separation of concerns with multiple classes
- **Error Handling**: Robust input validation and error messages

## Limitations

- Reminders are only active while the script is running
- Time-based reminders for times that have already passed today are scheduled for tomorrow
- No persistence - reminders are lost if the program exits

## Potential Enhancements

- Save reminders to a file for persistence
- Add support for recurring reminders
- Include sound alerts with notifications
- Add a GUI interface
- Support for more complex scheduling (e.g., specific dates)
- Integration with system startup for automatic reminder loading

## Troubleshooting

### Notifications not appearing on Windows
- Make sure Windows notifications are enabled in Settings
- Check that Python has permission to send notifications
- Try running the script as administrator

### Import Error for plyer
- Ensure plyer is installed: `pip install plyer`
- Check you're using the correct Python environment

### Time parsing errors
- Use the exact formats shown in the examples
- Ensure there's a space between time and AM/PM