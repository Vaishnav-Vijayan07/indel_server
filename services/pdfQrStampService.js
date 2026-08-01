const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const QRCode = require("qrcode");

const CAPTION_LINES = ["Please scan this QR code to view", "this Draft Prospectus"];
const MARGIN = 28;
const QR_SIZE = 35;
const CAPTION_FONT_SIZE = 6.5;
const CAPTION_LINE_GAP = 8;

function getContentPadding(page) {
  const mediaBox = page.getMediaBox();
  const cropBox = page.getCropBox();

  const left = cropBox.x - mediaBox.x;
  const top = mediaBox.y + mediaBox.height - (cropBox.y + cropBox.height);

  return {
    left: left > 0 ? left : MARGIN,
    top: top > 0 ? top : MARGIN,
  };
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

  const captionLines = CAPTION_LINES;
  const contentWidth = Math.max(
    QR_SIZE,
    ...captionLines.map((line) => font.widthOfTextAtSize(line, CAPTION_FONT_SIZE))
  );

  const { left: paddingX, top: paddingY } = getContentPadding(page);

  const blockPaddingX = 6;
  const blockPaddingTop = 6;
  const blockWidth = contentWidth + blockPaddingX * 2;
  const blockHeight = QR_SIZE + blockPaddingTop + captionLines.length * CAPTION_LINE_GAP + 6;
  const blockX = paddingX;
  const blockY = pageHeight - paddingY - blockHeight;
  const centerX = blockX + blockWidth / 2;

  const qrX = centerX - QR_SIZE / 2;
  const qrY = pageHeight - paddingY - blockPaddingTop - QR_SIZE;

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
      x: centerX - lineWidth / 2,
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
