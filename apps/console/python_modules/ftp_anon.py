import argparse
import json
import sys

def check_ftp_anon(ip):
    # Mock scanning
    # Return true if the IP starts with 161. (which most of KMITL IPs do) or 192.
    return ip.startswith("161.") or ip.startswith("192.") or ip.startswith("127.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scan for Anonymous FTP")
    parser.add_argument("--ip", required=True, help="IP address to scan")
    
    args = parser.parse_args()
    vulnerability_found = check_ftp_anon(args.ip)
    
    result = {"found": vulnerability_found}
    print(json.dumps(result))
    sys.exit(0)
