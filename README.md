# BidChain Gallery — ระบบประมูลสินค้าและคืนเงินผู้แพ้ประมูล
**Auction & Bid Refund Platform** · โมเดลวางมัดจำ (Deposit)

BidChain Gallery จัดประมูลงานศิลปะและสินค้าสะสมออนไลน์ด้วย Smart Contract บน Ethereum
ผู้ประมูล **วางมัดจำ** เพื่อเข้าประมูล ถ้าถูกแซงจะได้มัดจำคืน **ทันที** (ถอนเองได้ตลอดเวลา)
ปิดประมูลแล้วผู้ชนะชำระส่วนที่เหลือ ระบบหักค่าธรรมเนียม 2.5% แล้วโอนให้ผู้ขาย **อัตโนมัติ**
ถ้าผู้ชนะไม่ชำระภายในกำหนด **มัดจำถูกยึด** ให้ผู้ขาย

## 📦 สิ่งที่ส่ง

| รายการ | ค่า |
|---|---|
| Contract Address (Sepolia) | `0xa589c9e4B9Ff50FfAc675329a0c88F98977bDA3a` |
| GitHub Pages | https://arayakositkrai.github.io/bidchain-auction/ |
| GitHub Repository | https://github.com/ArayaKositkrai/bidchain-auction |
| ดู Contract บน Etherscan | https://sepolia.etherscan.io/address/0xa589c9e4B9Ff50FfAc675329a0c88F98977bDA3a |

---

## 🔄 อัปเดตตามโจทย์: จาก "กองเงินทั้งก้อน" เป็น "เก็บมัดจำ"

| | แบบเดิม (ล็อกเงินเต็มจำนวน) | แบบใหม่ (มัดจำ) ✅ |
|---|---|---|
| ตอนเสนอราคา | โอน ETH เท่าราคาที่เสนอ | โอนแค่ **มัดจำ** ตามที่ผู้ขายกำหนด |
| ถูกแซง | คืนเงินทั้งก้อน | คืน **มัดจำ** (บันทึกยอดทันที ถอนเองได้) |
| ปิดประมูล (ถึง Reserve) | โอนให้ผู้ขายทันที | ผู้ชนะต้อง **ชำระส่วนที่เหลือ** (ราคาชนะ − มัดจำ) ภายในเวลาที่กำหนด |
| ผู้ชนะไม่จ่าย | — (เงินอยู่ใน contract แล้ว) | **ยึดมัดจำ** ให้ผู้ขาย (หัก 2.5%) |
| ไม่ถึง Reserve | คืนเงินผู้ประมูลสูงสุด | คืน **มัดจำ** ผู้ประมูลสูงสุดเต็มจำนวน |

---

## ✅ ฟังก์ชันตามโจทย์

| # | ความต้องการ | ฟังก์ชันใน Contract | หน้าเว็บ |
|---|---|---|---|
| 1 | สร้างรายการประมูล | `createAuction({title, description, imageURI, startPrice, reservePrice, minIncrement, deposit, endTime, paymentWindow})` | แท็บ "ฝากขาย" (มี preview ภาพ) |
| 2 | วางราคาประมูล | `placeBid(id, amount)` payable — แนบมัดจำพอดี ราคาต้อง ≥ ราคาสูงสุด + ขั้นต่ำ | ฟอร์มเสนอราคาในหน้ารายละเอียด Lot |
| 3 | บันทึกเงินคืนผู้ถูกแซง | ทำใน `placeBid` → `pendingWithdrawals[ผู้ถูกแซง] += deposit` + event `OutbidCredited` | แจ้งยอดคืนที่เมนู "กระเป๋าของฉัน" |
| 4 | ถอนเงินคืน | `withdraw()` — pull payment ถอนได้ตลอดเวลา | ปุ่ม "ถอนเงินคืน" |
| 5 | ปิดประมูล | `finalize(id)` — ใครก็ได้เรียกเมื่อหมดเวลา ตรวจ Reserve | ปุ่ม "ปิดประมูล" (ขึ้นเมื่อหมดเวลา) |
| 6 | จ่ายเงิน/หักค่าธรรมเนียม | `completePayment(id)` (ถึง Reserve) / คืนมัดจำอัตโนมัติ (ไม่ถึง) / `claimForfeit(id)` (ผิดนัด) | ปุ่ม "ชำระส่วนที่เหลือ" / "ยึดมัดจำให้ผู้ขาย" |
| 7 | Auction Dashboard | `getAuction`, `getBids`, `remainingDue` + events | หน้าคอลเลกชัน (ราคาสูงสุด, นับถอยหลัง, สถานะ Reserve), ประวัติการเสนอราคา, "บันทึกธุรกรรม" พร้อม Tx Hash |

ฟังก์ชันเสริม: `cancelAuction` (ยกเลิกก่อนมีผู้ประมูล), `withdrawFees` (เจ้าของแพลตฟอร์มถอนค่าธรรมเนียม), `feeOf` (คำนวณค่าธรรมเนียม)

### สถานะของรายการประมูล

```
Live ──finalize──▶ AwaitingPayment ──completePayment──▶ Settled    (หัก 2.5% → ผู้ขาย)
  │                       └──────────claimForfeit──────▶ Defaulted  (ยึดมัดจำ → ผู้ขาย)
  ├──finalize──▶ ReserveNotMet   (คืนมัดจำผู้ประมูลสูงสุด)
  ├──finalize──▶ NoBids
  └──cancelAuction──▶ Cancelled  (ยังไม่มีผู้ประมูล)
```

### 🔒 กฎทางธุรกิจ และวิธีบังคับใช้ใน Contract

| กฎ | วิธีบังคับใช้ |
|---|---|
| ผู้ขายห้ามประมูลสินค้าตนเอง | `require(msg.sender != a.seller)` ใน `placeBid` |
| ผู้ชนะห้ามถอนเงินคืน | มัดจำของผู้นำ **ไม่เคยถูกบันทึกเป็นยอดถอน** จะถูกบันทึกก็ต่อเมื่อถูกแซง / ไม่ถึง Reserve เท่านั้น |
| ปิดประมูลและจ่ายเงินได้ครั้งเดียว | ทุกฟังก์ชันตรวจสถานะก่อน แล้วเปลี่ยนสถานะทันที (`Already finalized`, `Not awaiting payment`) |
| เงินของผู้ประมูลคนหนึ่งต้องไม่ถูกขัดขวางโดยอีกคน | **Pull payment** — ไม่มีการโอนเงินออกระหว่างประมูลเลย มีแค่บันทึกยอด แต่ละคนถอนเอง (มี test ใช้ wallet ที่ปฏิเสธรับเงินพิสูจน์) |
| เงินที่จ่ายออกทั้งหมด = เงินที่ล็อกไว้พอดี | ค่าธรรมเนียมปัดเศษลง `fee = amount × 250 / 10000` ผู้ขายได้ `amount − fee` → รวมกันเท่า amount เสมอ (มี test ตรวจยอด contract = ยอดรอถอน + ค่าธรรมเนียม + มัดจำที่ล็อก ทุกขั้น) |
| กันการโจมตีซ้ำ (reentrancy) | `nonReentrant` + ตั้งยอดเป็น 0 ก่อนโอน |

---

## 🎨 หน้าเว็บ (สายแกลเลอรีศิลปะ)

- ดีไซน์แนว editorial / museum catalogue — กระดาษสีครีม ตัวอักษร serif ขนาดใหญ่ (Playfair Display + Noto Serif Thai) เลข Lot แบบ monospace
- ภาพผลงานเป็น **Generative Art** สร้างจาก seed (`imageURI = "gen:<seed>"`) — เป็นภาพต้นฉบับที่โค้ดวาดขึ้นเอง ไม่ได้ใช้ผลงานของศิลปินจริง (ใส่ URL รูป / ipfs:// เองก็ได้)
- นับถอยหลังแบบ real-time, สถานะ Reserve, ขั้นตอน 4 สเต็ป, ประวัติการเสนอราคา, บันทึกธุรกรรมพร้อมลิงก์ Etherscan

## 📁 โครงสร้างโปรเจกต์

```
bidchain-auction/
├── contracts/BidChainAuction.sol        # Smart Contract (หลังบ้าน)
├── contracts/mocks/RejectingBidder.sol  # ใช้ทดสอบ wallet ที่ปฏิเสธรับเงิน
├── test/BidChainAuction.test.js         # Unit tests 11 กรณี
├── scripts/deploy.js                    # Deploy + อัปเดต docs/config.js อัตโนมัติ
├── scripts/export-abi.js
├── docs/                                # หน้าบ้าน (GitHub Pages)
│   ├── index.html · style.css · app.js
│   ├── art.js                           # Generative artwork
│   ├── config.js                        # Contract Address / Chain ID
│   └── abi.js
├── hardhat.config.js · package.json · .env.example
└── README.md
```

---

## 🚀 วิธีติดตั้งและใช้งาน

```bash
git clone https://github.com/ArayaKositkrai/bidchain-auction.git
cd bidchain-auction
npm install
npx hardhat test              # รัน unit tests
```

**Deploy (Hardhat):** `cp .env.example .env` ใส่ `PRIVATE_KEY` แล้ว `npm run deploy:sepolia` — สคริปต์จะเขียน address ลง `docs/config.js` ให้อัตโนมัติ

**Deploy (Remix):** เปิด `contracts/BidChainAuction.sol` ใน https://remix.ethereum.org → Compiler 0.8.24 (optimizer 200) → Deploy ด้วย *Injected Provider - MetaMask* → ใส่ address ใน `docs/config.js`

**รันหน้าเว็บในเครื่อง:** `npx http-server docs -p 8080` แล้วเปิด http://localhost:8080

**GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / `/docs`

## 🧪 ทดลองใช้งาน (ใช้ MetaMask 2–3 บัญชี)

1. **บัญชี A (ผู้ขาย)** — แท็บ "ฝากขาย" ตั้งราคา/มัดจำ/เวลาปิด (ลองตั้งให้ปิดใน 2–3 นาที)
2. **บัญชี B** — เปิด Lot แล้วเสนอราคา (MetaMask จะขอโอนมัดจำ)
3. **บัญชี C** — เสนอราคาสูงกว่า → บัญชี B เห็นยอดคืนที่ "กระเป๋าของฉัน" กดถอนได้ทันที
4. หมดเวลา → ใครก็ได้กด "ปิดประมูล" → ผู้ชนะกด "ชำระส่วนที่เหลือ" → ผู้ขายถอนรายได้ (หัก 2.5%)
5. ถ้าผู้ชนะไม่ชำระจนเลยกำหนด → กด "ยึดมัดจำให้ผู้ขาย"
6. ดูทุกธุรกรรมได้ที่ "บันทึกธุรกรรม" (มี Tx Hash ลิงก์ Etherscan)

### ผลการทดสอบ Unit Test

```
  BidChainAuction
    ✔ 1) สร้างรายการประมูลพร้อมเงื่อนไขครบ และตรวจข้อมูลไม่ถูกต้อง
    ✔ 2) วางราคาต้องแนบมัดจำพอดี ต้องไม่ต่ำกว่าราคาเริ่ม/ขั้นต่ำ และผู้ขายห้ามประมูลเอง
    ✔ 3-4) ผู้ถูกแซงได้ยอดคืนทันที ถอนได้ตลอดเวลา แต่ผู้นำถอนไม่ได้
    ✔ 5-6) ปิดประมูลถึง Reserve → ผู้ชนะจ่ายส่วนที่เหลือ → หัก 2.5% ผู้ขายได้ส่วนที่เหลือ
    ✔ 5-6) ไม่ถึง Reserve → คืนมัดจำผู้ประมูลสูงสุดเต็มจำนวน ไม่มีค่าธรรมเนียม
    ✔ อัปเดต: ผู้ชนะไม่จ่ายภายในกำหนด → ยึดมัดจำให้ผู้ขาย (หัก 2.5%)
    ✔ ค่าธรรมเนียมปัดเศษลง และ fee + ยอดผู้ขาย = ยอดรวมพอดี (ไม่มีเศษหาย)
    ✔ wallet ที่ปฏิเสธรับเงินขัดขวางผู้ประมูลคนอื่นไม่ได้ (pull payment)
    ✔ ไม่มีผู้ประมูล → NoBids, ยกเลิกได้เฉพาะก่อนมีผู้ประมูล, ปฏิเสธ ETH ที่โอนตรง
    ✔ ผู้ถอนค่าธรรมเนียมได้เฉพาะ owner
    ✔ สถานการณ์จำลองหลายงาน: เงินใน contract ตรงกับยอดที่ควรมีทุกขั้น

  11 passing
```

---

## 🛠️ เทคโนโลยี
Solidity 0.8.24 · Hardhat · ethers.js v6 · MetaMask · GitHub Pages · Sepolia Testnet

## 👩‍💻 ผู้จัดทำ
อารยา โฆษิตไกร (Araya Kositkrai) — รหัสนักศึกษา 66048395
สาขาวิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์ คณะเทคโนโลยีสารสนเทศ มหาวิทยาลัยศรีปทุม
