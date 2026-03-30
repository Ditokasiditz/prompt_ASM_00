import argparse
import json
import sys

def check_directory_listing(ip):
    # Dummy check for another vulnerability
    return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scan for Directory Listing")
    parser.add_argument("--ip", required=True, help="IP address to scan")
    
    args = parser.parse_args()
    vulnerability_found = check_directory_listing(args.ip)
    
    result = {"found": vulnerability_found}
    
    print(json.dumps(result))
    sys.exit(0)
