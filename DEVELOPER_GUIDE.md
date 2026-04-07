# คู่มือสำหรับนักพัฒนาโปรแกรม (Developer Guide)
**โครงการ: Attack Surface Management (ASM)**

เอกสารฉบับนี้จัดทำขึ้นเพื่อนักพัฒนาโปรแกรมหรือผู้ที่ต้องการนำระบบไปพัฒนาต่อ โดยสรุปภาพรวมในรูปแบบ Top-Down ตั้งแต่สถาปัตยกรรมระบบ โครงสร้างไฟล์ ไปจนถึงการทำงานของโปรแกรมย่อยและพารามิเตอร์ที่ใช้ในการรับส่งข้อมูล

---

## 1. การออกแบบและสถาปัตยกรรม (Top-Down Architecture)

โปรแกรมถูกออกแบบด้วยสถาปัตยกรรม **Client-Server** แบบแยกส่วน (Decoupled) ในโครงสร้างแบบ Monorepo ทำให้สามารถดูแลรักษาชุดคำสั่งได้ง่าย โปรแกรมนี้สามารถแบ่งออกเป็นโมดูลหลัก (Modules) 3 ส่วน ได้แก่:

1.  **Frontend (UI Module):** ทำหน้าที่ติดต่อกับผู้ใช้งาน รับคำสั่ง และแสดงผลหน้าจอ
2.  **Backend (API Module):** ทำหน้าที่เป็นตัวกลางประมวลผลโลจิก (Business Logic) ติดต่อฐานข้อมูล และประสานงาน
3.  **Scanning (Python Engine):** โปรแกรมย่อยเพื่อทำการทดสอบและประเมินช่องโหว่

### แผนภาพความสัมพันธ์ระดับบนสุด (System Architecture Diagram)

```mermaid
flowchart TD
    User([ผู้ใช้งาน]) -->|HTTP/HTTPS| FE(Frontend: Next.js)
    
    subgraph System ["ASM System"]
        FE -->|REST API Requests| BE(Backend: Node.js/Express)
        
        subgraph Backend Modules
            BE -->|Execute via Child Process| PY[Python Scanning Scripts]
            BE <-->|Prisma ORM| DB[(PostgreSQL Database)]
        end
    end
    
    PY -->|Network Requests| Target[Target Assets / IPs]
    BE <-->|API Calls| External[External APIs: Shodan, WhoisXML]
```

---

## 2. โครงสร้างของโปรแกรมและการแบ่งโมดูล (Program Structure)

โปรแกรมประกอบด้วยไฟล์หลักจำนวนมาก (มากกว่า 100 ไฟล์เมื่อรวมทั้งโปรเจกต์) โดยมีการรวมและจัดระเบียบแบ่งเป็นโฟลเดอร์หรือ **โปรแกรมย่อย (Sub-programs)** หลักๆ ดังนี้:

### โครงสร้างพื้นที่ทำงานหลัก (Root Directory)
```text
/prompt_ASM_00
├── apps/               # พื้นที่จัดการโปรเจกต์แบบ Monorepo สำหรับเก็บแอปพลิเคชันหลัก
│   ├── console/        # โปรเจกต์ฝั่ง BACKEND (API & สแกนเนอร์)
│   └── web-console/    # โปรเจกต์ฝั่ง FRONTEND (UI & แดชบอร์ด)
├── README.md           # คำแนะนำเกี่ยวกับการรันระบบเบื้องต้น
```

### 2.1 โมดูล Backend (`apps/console/`)
คือ REST API ที่เป็นตัวขับเคลื่อนระบบ ASM หน้าที่หลักคือการตอบสนองคำร้องขอจาก Frontend
```text
apps/console/
├── .env                # ตัวแปรระบบ (URL ฐานข้อมูล, API Keys เช่น Shodan Token)
├── prisma/             # โครงสร้าง ORM และสคริปต์จำลองข้อมูลตั้งต้น
│   ├── schema.prisma   # กำหนดโครงสร้างฐานข้อมูล (Models: Users, Assets, Issues)
│   └── seed.ts         # สคริปต์สร้างข้อมูลจำลองตั้งต้น
├── src/                
│   ├── index.ts        # ไฟล์หลักในการเริ่มการทำงาน (รวบรวมระบบ & ตั้งค่า Middleware)
│   ├── lib/            # ส่วนควบคุมคำสั่งส่วนกลาง (เช่น การเชื่อมต่อ Shodan API)
│   ├── middlewares/    # ระบบคัดกรอง Request สำหรับ Express (เช่น เช็คสิทธิ์)
│   └── routes/         # แบ่งโปรแกรมย่อยเพื่อรับ URL Path รับพารามิเตอร์แล้วประมวลผล
├── python_modules/     # กลุ่มโปรแกรมสแกนช่องโหว่อิสระ (เขียนด้วย Python)
│   ├── openssl_vuln.py # ทดสอบและสแกนช่องโหว่ประเภท SSL/TLS
│   ├── redirect_http.py# ตรวจสอบการเปลี่ยนเส้นทาง (Redirect) ที่ไม่ปลอดภัย
│   ├── ftp_anon.py     # ระบบเช็คการเข้าถึง FTP แบบนิรนาม
│   └── ...             # สคริปต์ย่อยอิสระอื่นๆ
└── prisma/             # ฐานข้อมูลใช้ผู้ให้บริการผ่าน PostgreSQL
```

### 2.2 โมดูล Frontend (`apps/web-console/`)
คือแอปพลิเคชันแดชบอร์ดที่ประมวลผลข้อมูลที่ได้จาก Backend มีการจัดแบ่งแบบย่อย (Component & Page) เพื่อจัดการง่าย:
```text
apps/web-console/
├── src/
│   ├── app/            # กลไกเราเตอร์ของ Next.js (App Router แบบอิงโฟลเดอร์)
│   │   ├── (auth)/     # โปรแกรมย่อยระบบลงชื่อเข้าใช้/สมัครสมาชิกสมาชิก
│   │   └── (protected)/# โปรแกรมย่อยหลังบ้านที่ต้องยืนยันสิทธิ์ถึงจะแสดง (Dashboard, Settings)
│   ├── components/     # ชิ้นส่วนหน้าจออิสระ (Reusable Cards, UI, Charts) ไว้เรียกใช้ซ้ำ
│   ├── lib/            # ฟังก์ชันตัวช่วย (Utility functions)
│   ├── providers/      # สถานะตัวคุมการทำงานของ React (Themes, Auth states)
│   └── types/          # ส่วนประกาศชนิดตัวแปร TypeScript (Type definitions)
├── public/             # ทรัพยากรระบบ เช่น ภาพ SVG และโลโก้
├── tailwind.config.ts  # ตัวควบคุมค่าการตั้งค่า UI โทนสีและขนาดขอบเขตหน้าจอ
└── ...
```

---

## 3. การทำงานของโปรแกรมย่อยและพารามิเตอร์ (Sub-program Workflows)

เพื่อให้เห็นภาพการทำงานร่วมกันอย่างชัดเจน จะขอยกตัวอย่าง **โปรแกรมย่อยด้านการสแกนหาช่องโหว่ (Vulnerability Scanner)** ว่ามีการส่งพารามิเตอร์และ Output กันอย่างไร

### 3.1 Flowchart การทำงานเมื่อสั่งรันสแกนช่องโหว่

```mermaid
sequenceDiagram
    participant FE as Frontend (UI)
    participant BE as Backend (Express API)
    participant PY as Python Script (Scanner)
    
    FE->>BE: POST /api/scanner/run <br>(Input: {"targetId": 123, "ip": "1.1.1.1"})
    BE->>BE: ตรวจสอบสิทธิ์ (JWT Token Validate)
    BE->>PY: spawn / exec <br>(Input Parameter: --ip "1.1.1.1")
    Note right of PY: ทำการสแกนผ่าน Network ไปยังเป้าหมาย
    PY-->>BE: STDOUT (Output: {"found": true})
    BE->>BE: บันทึกข้อมูล Issues ลง PostgreSQL Data
    BE-->>FE: HTTP 200 OK (Output: {"status": "success", "issueCreated": 1})
```

### 3.2 รายละเอียดของ Input, Output และ Parameters

#### 1) การเชื่อมต่อระหว่าง Frontend และ Backend (REST API)
ใช้รูปแบบ JSON เป็นมาตรฐานสำหรับการคุยกัน:
*   **Input (จาก Frontend -> Backend):** 
    ส่งผ่าน HTTP Request Body (สำหรับ POST/PUT) หรือ Query String (สำหรับ GET) 
    *   *ตัวอย่างพารามิเตอร์ (Parameter):* `{ "domain": "example.com" }` หรือ `?page=1&limit=10`
*   **Output (จาก Backend -> Frontend):**
    *   *รูปแบบผลลัพธ์:* JSON Object
    *   *ตัวอย่าง:* `{ "target": "example.com", "subdomains": [...] }`

#### 2) การเชื่อมต่อระหว่าง Backend (Node.js) และ Python Modules
เนื่องจากเป็นการเรียกใช้โปรแกรมคนละภาษา Backend จึงเรียก Python ผ่าน Command Line Interface (CLI):
*   **Input (ส่งเป็น Arguments):**
    Backend จะสั่งรันคำสั่ง: `python ./apps/console/python_modules/openssl_vuln.py --ip <IP_ADDRESS>`
    *   *พารามิเตอร์ส่งเข้า (Input Parameter):* `--ip` ตามด้วยค่าไอพีของสินทรัพย์ (Asset) ที่ต้องการตรวจสอบ
*   **Output (รับค่ากลับผ่าน Standard Output (STDOUT)):**
    Python จะทำงานและทำการปริ้นคำคอบกลับมาเป็น string ในรูปแบบ JSON เสมอ เช่น:
    ```json
    {
      "found": true
    }
    ```
    หรือมี error message ออกมา Backend จะจับผลลัพธ์ที่อยู่ในรูปแบบ JSON ไปแปลงตีความ (parse) และทำการบันทึกลงฐานข้อมูลต่อไป

---

## 4. ส่วนเชื่อมต่อฮาร์ดแวร์ / วงจร (Hardware / Circuit)

> *หมายเหตุ: โปรเจกต์นี้เป็นโครงงานด้านระบบสารสนเทศส่วนซอฟต์แวร์ (Software Engineering Project) เป็นหลัก ไม่มีวงจรฮาร์ดแวร์ หรือการสร้างแผงวงจรอิเล็กทรอนิกส์เข้ามาเกี่ยวข้องแต่อย่างใด ฮาร์ดแวร์ที่ใช้มีเพียง Server ทั่วไปสำหรับการรันโปรแกรมตามที่ได้ระบุไว้ใน System Requirements ในไฟล์ Installation Guide.*
