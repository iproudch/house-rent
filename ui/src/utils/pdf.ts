import { jsPDF } from "jspdf";
import type { IReceiptData } from "../interface/recipe";
import SARABUN_FONT from "../fonts/sarabunFont";
import LOGO_IMAGE from "../assets/logoImage";
import QR_PAYMENT from "../assets/qrPayment";

const GR = 99, GG = 115, GB = 86;
const LR = 165, LG = 180, LB = 150;
const PR = 230, PG = 237, PB = 224;

const addThaiFont = (doc: jsPDF) => {
  doc.addFileToVFS("Sarabun-Regular.ttf", SARABUN_FONT);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun");
  return doc;
};

export const generateBillPDF = (receiptData: IReceiptData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  addThaiFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  doc.addImage(LOGO_IMAGE, "JPEG", margin, yPos, 38, 38);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const contactX = pageWidth - margin - 62;
  doc.text("149 ม.9", contactX, yPos + 10);
  doc.text("อ.รัตนบุรี จ.สุรินทร์ 32130", contactX, yPos + 15);
  doc.text("โทร 065-6295411", contactX, yPos + 20);

  yPos += 38;

  // === TITLE ===
  doc.setFontSize(18);
  doc.setTextColor(GR, GG, GB);
  doc.text("บิลเรียกเก็บค่าเช่าบ้าน", pageWidth / 2, yPos, { align: "center" });

  yPos += 12;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`บ้านเลขที่ ${receiptData.houseNumber}`, margin, yPos);
  doc.text(`ประจำเดือน ${receiptData.month}`, pageWidth / 2, yPos, { align: "center" });

  yPos += 10;

  doc.setFillColor(LR, LG, LB);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const colWidths = {
    item: 40,
    previous: 25,
    current: 25,
    units: 20,
    price: 25,
    amount: 30,
  };

  let xPos = margin + 2;
  doc.text("รายการ", xPos, yPos + 7);
  xPos += colWidths.item;
  doc.text("เลขครั้งก่อน", xPos, yPos + 7);
  xPos += colWidths.previous;
  doc.text("เลขครั้งปัจจุบัน", xPos, yPos + 7);
  xPos += colWidths.current;
  doc.text("จำนวนหน่วย", xPos, yPos + 7);
  xPos += colWidths.units;
  doc.text("หน่วยละ", xPos, yPos + 7);
  xPos += colWidths.price;
  doc.text("รวม (บาท)", xPos, yPos + 7);

  yPos += 10;

  // === TABLE ROWS ===
  receiptData.items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(PR, PG, PB);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");
    }

    xPos = margin + 2;
    doc.text(item.name, xPos, yPos + 7);
    xPos += colWidths.item;
    doc.text(convertToString(item.previous), xPos, yPos + 7);
    xPos += colWidths.previous;
    doc.text(convertToString(item.current), xPos, yPos + 7);
    xPos += colWidths.current;
    doc.text(convertToString(item.units), xPos, yPos + 7);
    xPos += colWidths.units;
    doc.text(item.price.toString(), xPos, yPos + 7);
    xPos += colWidths.price;
    doc.text(item.amount.toString(), pageWidth - margin - 2, yPos + 7, { align: "right" });

    yPos += 10;
  });

  doc.setFillColor(PR, PG, PB);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");
  doc.text("ค่า Internet", margin + 2, yPos + 7);
  doc.text(convertToString(receiptData.internet), pageWidth - margin - 2, yPos + 7, {
    align: "right",
  });
  yPos += 10;

  doc.setFillColor(255, 255, 255);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");
  doc.text("ค่าเช่าบ้าน", margin + 2, yPos + 7);
  doc.text(convertToString(receiptData.houseRent), pageWidth - margin - 2, yPos + 7, {
    align: "right",
  });
  yPos += 10;

  // Total row
  doc.setFillColor(LR, LG, LB);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 12, "F");
  doc.setFontSize(12);
  doc.setFont("Sarabun");
  doc.text("รวม", margin + 2, yPos + 8);
  doc.text(convertToString(receiptData.total), pageWidth - margin - 2, yPos + 8, {
    align: "right",
  });
  doc.setFont("Sarabun", "normal");
  yPos += 17;

  // QR + notes side by side
  const qrSize = 35;
  const qrX = pageWidth - margin - qrSize;
  doc.addImage(QR_PAYMENT, "JPEG", qrX, yPos, qrSize, qrSize);

  doc.setFontSize(9);
  const instructions = [
    "หมายเหตุ: 1. กรุณาโอนเงินเข้าบัญชีตาม QR-Code  ที่กำหนด",
    "         2. จ่ายค่าเช่าไม่เกินวันที่ 1-5 หลังจากนั้นปรับวันละ 200 บาท",
  ];

  instructions.forEach((line, index) => {
    doc.text(line, margin, yPos + index * 5);
  });

  yPos += Math.max(instructions.length * 5, qrSize) + 15;

  // Signature
  doc.setTextColor(0, 0, 0);
  doc.text(
    "ลงชื่อ ......................................... ผู้เช่าบ้าน",
    pageWidth - margin - 50,
    yPos,
  );

  doc.save(
    `receipt_${receiptData.houseNumber.replace(/\s/g, "_")}_${receiptData.month}_${receiptData.year}.pdf`,
  );
};

const convertToString = (val: string | number) => val.toString();
