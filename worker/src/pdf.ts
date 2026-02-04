import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { GenerationJobData } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.OUTPUT_DIR || './output';
const FONTS_DIR = join(__dirname, '..', 'fonts');

interface PdfData {
  context: GenerationJobData['context'];
  selectedServices: GenerationJobData['selectedServices'];
  brief: string;
  prd: string;
  screenshots: string[];
}

export async function generatePdf(
  sessionId: string,
  data: PdfData
): Promise<string> {
  const { context, selectedServices, brief, screenshots } = data;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Register fontkit for custom font support
  pdfDoc.registerFontkit(fontkit);

  // Load and embed Roboto fonts (supports Cyrillic)
  const fontRegularBytes = await readFile(join(FONTS_DIR, 'Roboto-Regular.ttf'));
  const fontBoldBytes = await readFile(join(FONTS_DIR, 'Roboto-Bold.ttf'));

  const font = await pdfDoc.embedFont(fontRegularBytes);
  const fontBold = await pdfDoc.embedFont(fontBoldBytes);

  // Colors
  const primaryColor = rgb(0.15, 0.39, 0.92); // Blue
  const textColor = rgb(0.12, 0.16, 0.22);
  const grayColor = rgb(0.42, 0.45, 0.49);

  // Calculate total
  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + s.price * s.quantity,
    0
  );

  // ========================================
  // Cover Page
  // ========================================
  let page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  // Header decoration
  page.drawRectangle({
    x: 0,
    y: height - 200,
    width,
    height: 200,
    color: primaryColor,
  });

  // Logo/Company name
  page.drawText('ASYSTEM', {
    x: 50,
    y: height - 80,
    size: 32,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Title
  page.drawText('Коммерческое предложение', {
    x: 50,
    y: height - 280,
    size: 28,
    font: fontBold,
    color: textColor,
  });

  // Project name
  page.drawText(context.projectName || 'Веб-проект', {
    x: 50,
    y: height - 320,
    size: 18,
    font: font,
    color: grayColor,
  });

  // Date
  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  page.drawText(`Дата: ${today}`, {
    x: 50,
    y: height - 360,
    size: 12,
    font: font,
    color: grayColor,
  });

  // Total price box
  page.drawRectangle({
    x: 50,
    y: 100,
    width: width - 100,
    height: 80,
    color: rgb(0.95, 0.97, 1),
    borderColor: primaryColor,
    borderWidth: 2,
  });

  page.drawText('Итого:', {
    x: 70,
    y: 150,
    size: 14,
    font: font,
    color: grayColor,
  });

  page.drawText(`$${totalPrice.toLocaleString()}`, {
    x: 70,
    y: 120,
    size: 24,
    font: fontBold,
    color: primaryColor,
  });

  // ========================================
  // Services Page
  // ========================================
  page = pdfDoc.addPage([595, 842]);

  // Header
  page.drawText('Выбранные услуги', {
    x: 50,
    y: height - 60,
    size: 20,
    font: fontBold,
    color: textColor,
  });

  // Line under header
  page.drawLine({
    start: { x: 50, y: height - 75 },
    end: { x: width - 50, y: height - 75 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  // Services list
  let yPos = height - 120;
  const lineHeight = 50;

  for (const service of selectedServices) {
    if (yPos < 100) {
      // New page if needed
      page = pdfDoc.addPage([595, 842]);
      yPos = height - 60;
    }

    // Service name
    page.drawText(service.name, {
      x: 50,
      y: yPos,
      size: 12,
      font: fontBold,
      color: textColor,
    });

    // Quantity
    page.drawText(`Кол-во: ${service.quantity}`, {
      x: 50,
      y: yPos - 18,
      size: 10,
      font: font,
      color: grayColor,
    });

    // Price
    const priceText = `$${(service.price * service.quantity).toLocaleString()}`;
    const priceWidth = font.widthOfTextAtSize(priceText, 12);
    page.drawText(priceText, {
      x: width - 50 - priceWidth,
      y: yPos,
      size: 12,
      font: fontBold,
      color: primaryColor,
    });

    // Separator line
    page.drawLine({
      start: { x: 50, y: yPos - 30 },
      end: { x: width - 50, y: yPos - 30 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });

    yPos -= lineHeight;
  }

  // Total at bottom
  yPos -= 20;
  page.drawText('Итого:', {
    x: 50,
    y: yPos,
    size: 14,
    font: fontBold,
    color: textColor,
  });

  const totalText = `$${totalPrice.toLocaleString()}`;
  const totalWidth = fontBold.widthOfTextAtSize(totalText, 16);
  page.drawText(totalText, {
    x: width - 50 - totalWidth,
    y: yPos,
    size: 16,
    font: fontBold,
    color: primaryColor,
  });

  // ========================================
  // Screenshots Page
  // ========================================
  if (screenshots.length > 0) {
    page = pdfDoc.addPage([595, 842]);

    page.drawText('Демо-скриншоты', {
      x: 50,
      y: height - 60,
      size: 20,
      font: fontBold,
      color: textColor,
    });

    page.drawLine({
      start: { x: 50, y: height - 75 },
      end: { x: width - 50, y: height - 75 },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    // Embed screenshots
    yPos = height - 120;

    for (let i = 0; i < Math.min(screenshots.length, 2); i++) {
      try {
        const imageBytes = await readFile(screenshots[i]);
        const image = await pdfDoc.embedPng(imageBytes);

        const imgWidth = width - 100;
        const imgHeight = (image.height / image.width) * imgWidth;

        if (yPos - imgHeight < 50) {
          page = pdfDoc.addPage([595, 842]);
          yPos = height - 60;
        }

        page.drawImage(image, {
          x: 50,
          y: yPos - imgHeight,
          width: imgWidth,
          height: Math.min(imgHeight, 300),
        });

        yPos -= imgHeight + 30;
      } catch (error) {
        console.error(`[PDF] Error embedding screenshot ${i}:`, error);
      }
    }
  }

  // ========================================
  // Contact Page
  // ========================================
  page = pdfDoc.addPage([595, 842]);

  page.drawText('Контакты', {
    x: 50,
    y: height - 60,
    size: 20,
    font: fontBold,
    color: textColor,
  });

  page.drawLine({
    start: { x: 50, y: height - 75 },
    end: { x: width - 50, y: height - 75 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  const contactInfo = [
    { label: 'Компания:', value: 'ASYSTEM' },
    { label: 'Телефон:', value: '+996 XXX XXX XXX' },
    { label: 'Email:', value: 'info@asystem.kg' },
    { label: 'Сайт:', value: 'https://asystem.kg' },
    { label: 'Адрес:', value: 'г. Бишкек, Кыргызстан' },
  ];

  yPos = height - 120;
  for (const info of contactInfo) {
    page.drawText(info.label, {
      x: 50,
      y: yPos,
      size: 12,
      font: font,
      color: grayColor,
    });

    page.drawText(info.value, {
      x: 150,
      y: yPos,
      size: 12,
      font: fontBold,
      color: textColor,
    });

    yPos -= 30;
  }

  // CTA
  yPos -= 40;
  page.drawRectangle({
    x: 50,
    y: yPos - 60,
    width: width - 100,
    height: 80,
    color: primaryColor,
  });

  page.drawText('Готовы обсудить проект?', {
    x: 70,
    y: yPos - 20,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('Свяжитесь с нами для бесплатной консультации', {
    x: 70,
    y: yPos - 45,
    size: 12,
    font: font,
    color: rgb(1, 1, 1),
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();

  // Ensure output directory exists
  const pdfDir = join(OUTPUT_DIR, 'pdf');
  await mkdir(pdfDir, { recursive: true });

  const pdfPath = join(pdfDir, `${sessionId}.pdf`);
  await writeFile(pdfPath, pdfBytes);

  console.log(`[PDF] Generated: ${pdfPath}`);
  return pdfPath;
}
