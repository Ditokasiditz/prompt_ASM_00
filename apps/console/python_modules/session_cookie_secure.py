import argparse
import json
import sys
import requests

def check_secure(target: str) -> bool:
    """
    ตรวจสอบ Session Cookie Missing 'Secure' Attribute
    ฟังก์ชันมาตรฐานสำหรับ API: คืนค่า True หากพบ Cookie ที่ไม่มี Secure (Vulnerable)
    """
    if not target:
        return False
        
    # จัดการใส่ https:// เข้าไปถ้าผู้ใช้ส่งมาแค่ชื่อโดเมน
    if not target.startswith(('http://', 'https://')):
        url = 'https://' + target
    else:
        url = target

    try:
        # ใช้ HEAD method เพื่อให้ทำงานเร็วที่สุด คล้ายๆ Invoke-WebRequest -Method HEAD
        # ใส่ User-Agent เสมือนเป็นเบราว์เซอร์ปกติ
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.head(url, headers=headers, timeout=10, allow_redirects=True)
        
        # ถ้าระบบใช้ GET บางหน้าเว็บถึงจะหลุด set-cookie มาให้ (Fallback)
        if 'set-cookie' not in response.headers:
             response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)

        cookies = response.headers.get('set-cookie')
        
        if cookies:
            for cookie in response.cookies:
                # ตรวจสอบ attribute Secure จาก session cookies ที่ตอบกลับมา
                if not cookie.secure:
                    # ถ้าเจอแม้แต่หนึ่ง Cookie (ใน session) ที่ไม่มี Secure ถือว่าเสี่ยง
                    return True
                    
        return False

    except Exception:
        # หากเชื่อมต่อไม่ได้ คืนค่า False ตีว่าไม่เจอช่องโหว่นี้ไปก่อน
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scan for Session Cookie Missing 'Secure' Attribute")
    parser.add_argument("--ip", required=True, help="IP address to scan")
    
    args = parser.parse_args()
    vulnerability_found = check_secure(args.ip)
    
    result = {"found": vulnerability_found}
    print(json.dumps(result))
    sys.exit(0)
