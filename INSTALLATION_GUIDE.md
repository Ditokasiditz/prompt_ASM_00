# คู่มือการติดตั้งโปรแกรม Attack Surface Management (ASM)

เอกสารฉบับนี้อธิบายถึงขั้นตอนการติดตั้งและกำหนดค่าระบบ Attack Surface Management (ASM) เพื่อใช้ในการตรวจสอบและวิเคราะห์ช่องโหว่ของสินทรัพย์ดิจิทัลภายนอกองค์กร

---

## 1. ความต้องการของระบบ (System Requirements)

### 1.1 ความต้องการด้านซอฟต์แวร์ (Software Requirements)

เพื่อให้ระบบทำงานได้อย่างมีประสิทธิภาพ จำเป็นต้องติดตั้งซอฟต์แวร์ตามรายการด้านล่างนี้:

| รายการ | เวอร์ชั่นที่แนะนำ | หมายเหตุ |
| :--- | :--- | :--- |
| **Node.js** | v20.x หรือสูงกว่า | สำหรับรัน Backend (Express) และ Frontend (Next.js) |
| **npm** | v10.x หรือสูงกว่า | มาพร้อมกับ Node.js สำหรับจัดการ Package |
| **Python** | v3.10 หรือสูงกว่า | สำหรับรันโมดูลการสแกนช่องโหว่ (Vulnerability Scanning) |
| **PostgreSQL** | v15 หรือสูงกว่า | แนะนำให้ใช้ [Neon.tech](https://neon.tech/) สำหรับ Database |
| **Git** | ล่าสุด | สำหรับการ Clone Source Code |

**Python Dependencies:**
โมดูลการสแกนต้องการ Library เพิ่มเติม:
- `requests` (สำหรับเช็ค Redirect และ Cookie)

### 1.2 ความต้องการด้านฮาร์ดแวร์ (Hardware Requirements)

| รายการ | ขั้นต่ำ (Minimum) | แนะนำ (Recommended) |
| :--- | :--- | :--- |
| **CPU** | 2 Cores | 4 Cores หรือสูงกว่า |
| **RAM** | 4 GB | 8 GB หรือสูงกว่า |
| **Disk Space** | 1 GB (สำหรับ Source code) | 5 GB หรือสูงกว่า (สำหรับ Log และ Database) |
| **Network** | การเชื่อมต่ออินเทอร์เน็ตที่เสถียร | สำหรับการติดต่อกับ Shodan API และ Database Cloud |

---

## 2. ขั้นตอนการติดตั้งโปรแกรม (Installation Steps)

### 2.1 การเตรียม Source Code
ท่านสามารถเลือกใช้วิธีการใดวิธีการหนึ่งดังนี้:

*   **วิธีที่ 1: การ Clone จาก Git (แนะนำ)**
    ```bash
    git clone <repository-url>
    cd prompt_ASM_00
    ```
*   **วิธีที่ 2: การ Upload Source Code**
    แตกไฟล์โปรเจกต์ไปยังโฟลเดอร์ที่ต้องการ และเปิด Terminal/Command Prompt ในโฟลเดอร์นั้น

---

### 2.2 การติดตั้งระบบ Backend (apps/console)

1.  เข้าไปยังโฟลเดอร์ Backend:
    ```bash
    cd apps/console
    ```
2.  ติดตั้ง dependencies ของ Node.js:
    ```bash
    npm install
    ```
3.  ติดตั้ง Python dependencies:
    ```bash
    pip install requests
    ```
4.  การกำหนดค่า Database (Prisma):
    ตรวจสอบให้แน่ใจว่าได้ระบุ `DATABASE_URL` ในไฟล์ `.env` แล้ว จากนั้นรันคำสั่ง:
    ```bash
    npx prisma generate
    ```

---

### 2.3 การติดตั้งระบบ Frontend (apps/web-console)

1.  เข้าไปยังโฟลเดอร์ Frontend:
    ```bash
    cd apps/web-console
    ```
2.  ติดตั้ง dependencies:
    ```bash
    npm install
    ```

---

## 3. การกำหนดค่าระบบ (Environmental Configuration)

ระบบใช้ไฟล์ `.env` ในการเก็บค่ากำหนดต่างๆ โดยต้องสร้างไฟล์ชื่อ `.env` ในโฟลเดอร์ `apps/console/` และ `apps/web-console/` (หากจำเป็น)

### 3.1 รายละเอียดในไฟล์ `apps/console/.env`

| Key | คำอธิบาย | ตัวอย่าง |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL สำหรับเชื่อมต่อ PostgreSQL | `postgresql://user:pass@host/db` |
| `SHODAN_API_KEY` | API Key จาก Shodan.io | `D4bP214tLRjHDHPcOPAe...` |
| `WHOISXML_API_KEY` | API Key จาก WhoisXML API | `at_Dg9Or3WueP26qFfRHT...` |

> [!IMPORTANT]  
> กรุณาอย่าเปิดเผยไฟล์ `.env` ต่อสาธารณะ เนื่องจากมีข้อมูลสำคัญ เช่น API Key และ Password ของ Database

---

## 4. วิธีการเริ่มใช้งานโปรแกรม (Running the Application)

### 4.1 การรันในโหมดพัฒนา (Development Mode)

**เริ่มรัน Backend:**
```bash
# อยู่ในโฟลเดอร์ apps/console
npm run dev
```

**เริ่มรัน Frontend:**
```bash
# อยู่ในโฟลเดอร์ apps/web-console
npm run dev
```
หลังจากรันทั้งสองระบบแล้ว ท่านสามารถเข้าใช้งานหน้าจอ Web Console ได้ที่ [http://localhost:3000](http://localhost:3000)

### 4.2 การสร้างชุดโปรแกรมสำหรับใช้งานจริง (Production Build)

หากต้องการรันโปรแกรมในสภาพแวดล้อมจริง ให้รันคำสั่งดังนี้ในทั้งสองโฟลเดอร์:
```bash
npm run build
npm start
```

---

**จัดทำโดย:** ทีมพัฒนาโปรเจกต์ ASM
**วันที่อัปเดตล่าสุด:** 6 เมษายน 2569
