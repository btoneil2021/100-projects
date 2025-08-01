#!/usr/bin/env python3
"""
Website Uptime Monitor Script
Monitors multiple websites and logs their status, downtime, and response times.
"""

import json
import logging
import time
import requests
from datetime import datetime
from typing import Dict, Any
import sys
import os


class UptimeMonitor:
    def __init__(self, config_file: str = "websites.json"):
        self.config_file = config_file
        self.websites = []
        self.setup_logging()
        self.load_websites()
    
    def setup_logging(self):
        """Create logs directory, and configures logging to file and console."""
        if not os.path.exists("logs"):
            os.makedirs("logs")
        
        # Timestamp - Log Level - Actual Log Message
        log_format = '%(asctime)s - %(levelname)s - %(message)s'
        
        # Setup root logger, applying format and adding handlers for log files and the console
        logging.basicConfig(
            level=logging.INFO,
            format=log_format,
            handlers=[
                logging.FileHandler(f"logs/uptime_{datetime.now().strftime('%Y%m%d')}.log"),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def load_websites(self):
        try:
            with open(self.config_file, 'r') as f:
                self.websites = json.load(f)
            self.logger.info(f"Loaded {len(self.websites)} websites to monitor")
        except FileNotFoundError:
            self.logger.error(f"Configuration file {self.config_file} not found")
            sys.exit(1)
        except json.JSONDecodeError as e:
            self.logger.error(f"Invalid JSON in configuration file: {e}")
            sys.exit(1)
    
    def check_website(self, website: Dict[str, Any]) -> Dict[str, Any]:
        url = website['url']
        name = website.get('name', url)
        timeout = website.get('timeout', 10)
        expected_status = website.get('expected_status', [200])
        
        result = {
            'name': name,
            'url': url,
            'timestamp': datetime.now().isoformat(),
            'status': 'down',
            'status_code': None,
            'response_time': None,
            'error': None
        }
        
        try:
            start_time = time.time()
            response = requests.get(
                url, 
                timeout=timeout,
                headers={'User-Agent': 'Uptime-Monitor/1.0'}
            )
            response_time = round((time.time() - start_time) * 1000, 2)
            
            result['status_code'] = response.status_code
            result['response_time'] = response_time
            
            if response.status_code in expected_status:
                result['status'] = 'up'
                self.logger.info(
                    f"[OK] {name} ({url}) - Status: {response.status_code}, "
                    f"Response Time: {response_time}ms"
                )
            else:
                result['status'] = 'down'
                result['error'] = f"Unexpected status code: {response.status_code}"
                self.logger.warning(
                    f"[FAIL] {name} ({url}) - Status: {response.status_code}, "
                    f"Response Time: {response_time}ms - UNEXPECTED STATUS"
                )
        
        except requests.exceptions.Timeout:
            result['error'] = f"Request timeout after {timeout} seconds"
            self.logger.error(f"[TIMEOUT] {name} ({url}) - TIMEOUT after {timeout}s")
        
        except requests.exceptions.ConnectionError as e:
            result['error'] = f"Connection error: {str(e)}"
            self.logger.error(f"[ERROR] {name} ({url}) - CONNECTION ERROR: {str(e)}")
        
        except requests.exceptions.RequestException as e:
            result['error'] = f"Request error: {str(e)}"
            self.logger.error(f"[ERROR] {name} ({url}) - REQUEST ERROR: {str(e)}")
        
        except Exception as e:
            result['error'] = f"Unexpected error: {str(e)}"
            self.logger.error(f"[ERROR] {name} ({url}) - UNEXPECTED ERROR: {str(e)}")
        
        return result
    
    def save_result(self, result: Dict[str, Any]):
        filename = f"logs/results_{datetime.now().strftime('%Y%m%d')}.json"
        
        try:
            results = []
            if os.path.exists(filename):
                try:
                    with open(filename, 'r') as f:
                        content = f.read().strip()
                        if content:
                            results = json.loads(content)
                except (json.JSONDecodeError, ValueError):
                    self.logger.warning(f"Corrupted JSON file {filename}, creating new one")
                    results = []
            
            results.append(result)
            
            with open(filename, 'w') as f:
                json.dump(results, f, indent=2)
        
        except Exception as e:
            self.logger.error(f"Failed to save result to {filename}: {e}")
    
    def run_single_check(self):
        self.logger.info("Starting uptime check cycle...")
        
        for website in self.websites:
            result = self.check_website(website)
            self.save_result(result)
            
            if result['status'] == 'down':
                self.log_downtime(result)
        
        self.logger.info("Uptime check cycle completed")
    
    def log_downtime(self, result: Dict[str, Any]):
        downtime_log = f"logs/downtime_{datetime.now().strftime('%Y%m%d')}.log"
        
        try:
            with open(downtime_log, 'a') as f:
                f.write(f"{result['timestamp']} - {result['name']} ({result['url']}) - "
                       f"Status: {result.get('status_code', 'N/A')} - "
                       f"Error: {result.get('error', 'Unknown')}\n")
        except Exception as e:
            self.logger.error(f"Failed to write to downtime log: {e}")
    
    def run_continuous(self, default_interval: int = 300):
        self.logger.info(f"Starting continuous monitoring (default interval: {default_interval}s)")
        
        try:
            while True:
                self.run_single_check()
                
                min_interval = min(
                    website.get('check_interval', default_interval) 
                    for website in self.websites
                )
                
                self.logger.info(f"Sleeping for {min_interval} seconds...")
                time.sleep(min_interval)
        
        except KeyboardInterrupt:
            self.logger.info("Monitoring stopped by user")
        except Exception as e:
            self.logger.error(f"Unexpected error in continuous monitoring: {e}")


def main():
    import argparse
    
    # Create args for single check, interval check, or a different config file
    parser = argparse.ArgumentParser(description='Website Uptime Monitor')
    parser.add_argument(
        '--config', 
        default='websites.json',
        help='Configuration file path (default: websites.json)'
    )
    parser.add_argument(
        '--single', 
        action='store_true',
        help='Run a single check instead of continuous monitoring'
    )
    parser.add_argument(
        '--interval', 
        type=int, 
        default=300,
        help='Default check interval in seconds (default: 300)'
    )
    
    args = parser.parse_args()
    
    monitor = UptimeMonitor(args.config)
    
    if args.single:
        monitor.run_single_check()
    else:
        monitor.run_continuous(args.interval)


if __name__ == "__main__":
    main()