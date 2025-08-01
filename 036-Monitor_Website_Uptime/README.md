# Website Uptime Monitor

A Python script that monitors website uptime by making HTTP requests and logging the results. Tracks response times, status codes, and downtime events.

## Features

- Monitor multiple websites simultaneously
- Configurable timeout and check intervals per website
- Comprehensive error handling for network issues
- Structured logging with timestamps
- Separate downtime logging
- JSON result storage for analysis
- Support for both single checks and continuous monitoring
- Response time measurement

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

Edit `websites.json` to configure the websites you want to monitor:

```json
[
  {
    "url": "https://www.example.com",
    "name": "Example Site",
    "timeout": 10,
    "expected_status": [200],
    "check_interval": 300
  }
]
```

### Configuration Options

- `url`: Website URL to monitor
- `name`: Friendly name for the website
- `timeout`: Request timeout in seconds
- `expected_status`: List of acceptable HTTP status codes
- `check_interval`: Check interval in seconds

## Usage

### Single Check
Run a one-time check of all configured websites:
```bash
python uptime_monitor.py --single
```

### Continuous Monitoring
Run continuous monitoring (default 5-minute intervals):
```bash
python uptime_monitor.py
```

### Custom Configuration File
Use a different configuration file:
```bash
python uptime_monitor.py --config my_websites.json
```

### Custom Check Interval
Set a default check interval (in seconds):
```bash
python uptime_monitor.py --interval 60
```

## Output Files

The script creates several output files in the `logs/` directory:

- `uptime_YYYYMMDD.log`: Main log file with all events
- `results_YYYYMMDD.json`: JSON file with detailed results
- `downtime_YYYYMMDD.log`: Separate log file for downtime events only

## Log Format

The main log shows:
- ✓ for successful checks with response time
- ✗ for failed checks with error details
- Status codes and response times
- Detailed error messages for troubleshooting

## Error Handling

The script handles various failure scenarios:
- Connection timeouts
- DNS resolution failures
- Network connectivity issues
- Unexpected HTTP status codes
- Server errors

## Example Output

```
2024-01-15 10:30:00,123 - INFO - Starting uptime check cycle...
2024-01-15 10:30:00,456 - INFO - ✓ Google (https://www.google.com) - Status: 200, Response Time: 145.67ms
2024-01-15 10:30:01,789 - ERROR - ✗ Test Server Error (https://httpstat.us/500) - Status: 500, Response Time: 234.56ms - UNEXPECTED STATUS
2024-01-15 10:30:02,012 - INFO - Uptime check cycle completed
```