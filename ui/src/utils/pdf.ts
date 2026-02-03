import { jsPDF } from "jspdf";
import type { IReceiptData } from "../interface/recipe";
import SARABUN_FONT from "../fonts/sarabunFont";

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

  // Header - Company Logo and Info
  doc.setFillColor(76, 175, 80);
  doc.rect(margin, yPos, 30, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("L", margin + 3, yPos + 7);
  doc.setFontSize(10);
  doc.text("L HOUSE", margin + 3, yPos + 12);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const contactX = pageWidth - margin - 60;
  doc.text("123 ม.16", contactX, yPos + 3);
  doc.text("อ.รัตนบุรี จ.สุรินทร์ 32130", contactX, yPos + 7);
  doc.text("โทร 091-xxxxxxx", contactX, yPos + 11);

  yPos += 25;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(76, 175, 80);
  doc.text("บิลเรียกเก็บค่าเช่าบ้าน", pageWidth / 2, yPos, {
    align: "center",
  });

  yPos += 12;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`บ้านเลขที่ ${receiptData.houseNumber}`, margin, yPos);
  doc.text(`ประจำเดือน ${receiptData.month}`, pageWidth / 2, yPos, {
    align: "center",
  });
  doc.text(receiptData.year, pageWidth - margin - 20, yPos);

  yPos += 10;

  // Table Header
  doc.setFillColor(144, 238, 144);
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
  doc.text("เลขครั้งล่าสุด", xPos, yPos + 7);
  xPos += colWidths.current;
  doc.text("จำนวนหน่วย", xPos, yPos + 7);
  xPos += colWidths.units;
  doc.text("หน่วยละ", xPos, yPos + 7);
  xPos += colWidths.price;
  doc.text("ค่าเงิน (บาท)", xPos, yPos + 7);

  yPos += 10;

  // Table Rows - Items
  receiptData.items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(240, 255, 240);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");
    }

    xPos = margin + 2;
    doc.text(item.name, xPos, yPos + 7);
    xPos += colWidths.item;
    doc.text(item.previous, xPos, yPos + 7);
    xPos += colWidths.previous;
    doc.text(item.current, xPos, yPos + 7);
    xPos += colWidths.current;
    doc.text(item.units, xPos, yPos + 7);
    xPos += colWidths.units;
    doc.text(item.price, xPos, yPos + 7);
    xPos += colWidths.price;
    doc.text(item.amount, xPos, yPos + 7, { align: "right" });

    yPos += 10;
  });

  // House rent row
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");
  doc.text("ค่าเช่าบ้าน", margin + 2, yPos + 7);
  doc.text(receiptData.houseRent, pageWidth - margin - 2, yPos + 7, {
    align: "right",
  });
  yPos += 10;

  // Total row
  doc.setFillColor(144, 238, 144);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 12, "F");
  doc.setFontSize(12);
  doc.setFont("Sarabun");
  doc.text("รวม", margin + 2, yPos + 8);
  doc.text(receiptData.total, pageWidth - margin - 2, yPos + 8, {
    align: "right",
  });
  doc.setFont("Sarabun", "normal");
  yPos += 17;

  doc.setFontSize(9);
  const instructions = [
    "หมายเหตุ: 1. กรุณาโอนเงินเข้าบัญชี",
    "             - บัญชีธนาคารกรุงไทย   เลขที่     xxx-xxx-xxxxxx นางสาวเจ้าของ บ้าน",
    "                                        เบอร์โทรศัพท์  091-2345678",
    "         2. จ่ายค่าเช่าไม่เกินวันที่ 1-5 หลังจากนั้นปรับวันละ 200 บาท",
  ];

  instructions.forEach((line, index) => {
    doc.text(line, margin, yPos + index * 5);
  });

  yPos += instructions.length * 5 + 5;

  // Signature line
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
