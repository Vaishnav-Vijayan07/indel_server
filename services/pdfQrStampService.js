const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const QRCode = require("qrcode");

const CAPTION = "Please scan this QR code to view this Draft Prospectus";
const MARGIN = 28;
const QR_SIZE = 35;
const CAPTION_FONT_SIZE = 6.5;
const CAPTION_LINE_GAP = 8;
const CAPTION_MAX_WIDTH = QR_SIZE + 30;

function wrapText(text, font, fontSize, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function stampQrOnPdf(pdfBuffer, targetUrl) {
  const qrPngBuffer = await QRCode.toBuffer(targetUrl, {
    type: "png",
    margin: 1,
    width: 300,
  });

  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const page = pdfDoc.getPages()[0];
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const qrImage = await pdfDoc.embedPng(qrPngBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const captionLines = wrapText(CAPTION, font, CAPTION_FONT_SIZE, CAPTION_MAX_WIDTH);

  const qrX = MARGIN;
  const qrY = pageHeight - MARGIN - QR_SIZE;

  const blockPaddingX = 6;
  const blockPaddingTop = 6;
  const blockWidth = QR_SIZE + blockPaddingX * 2;
  const blockHeight = QR_SIZE + blockPaddingTop + captionLines.length * CAPTION_LINE_GAP + 6;
  const blockX = qrX - blockPaddingX;
  const blockY = qrY - (captionLines.length * CAPTION_LINE_GAP + 6);

  page.drawRectangle({
    x: blockX,
    y: blockY,
    width: blockWidth,
    height: blockHeight,
    color: rgb(1, 1, 1),
    opacity: 0.85,
  });

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: QR_SIZE,
    height: QR_SIZE,
  });

  let textY = qrY - CAPTION_LINE_GAP;
  for (const line of captionLines) {
    const lineWidth = font.widthOfTextAtSize(line, CAPTION_FONT_SIZE);
    page.drawText(line, {
      x: qrX + QR_SIZE / 2 - lineWidth / 2,
      y: textY,
      size: CAPTION_FONT_SIZE,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    textY -= CAPTION_LINE_GAP;
  }

  return Buffer.from(await pdfDoc.save());
}

module.exports = { stampQrOnPdf };
