import { formatCurrency, formatDate } from './formatters';

interface SelectedOption {
  optionId: string;
  categoryId: string;
  name: string;
  quantity: number;
  price: number;
}

interface PdfData {
  selectedOptions: SelectedOption[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  total: number;
}

export async function generatePdf(data: PdfData): Promise<void> {
  const { selectedOptions, subtotal, discount, discountAmount, total } = data;
  const currentDate = formatDate(new Date());

  // Создаём HTML для печати
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Коммерческое предложение</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          color: #333;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 28px;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        .header .date {
          color: #666;
          font-size: 14px;
        }
        .info-box {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .info-box h2 {
          font-size: 18px;
          margin-bottom: 8px;
        }
        .info-box p {
          color: #666;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background: #f0f0f0;
          font-weight: 600;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .totals {
          text-align: right;
          margin-bottom: 40px;
        }
        .totals p {
          margin: 8px 0;
        }
        .totals .label {
          color: #666;
          display: inline-block;
          width: 150px;
        }
        .totals .discount {
          color: #22c55e;
        }
        .totals .total {
          font-size: 24px;
          font-weight: bold;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #333;
        }
        .totals .total-value {
          color: #2563eb;
        }
        .footer {
          text-align: center;
          color: #999;
          font-size: 12px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        @media print {
          body { padding: 20px; }
          @page { margin: 15mm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Коммерческое предложение</h1>
        <p class="date">Дата: ${currentDate}</p>
      </div>

      <div class="info-box">
        <h2>IT-услуги и разработка</h2>
        <p>Расчет стоимости услуг</p>
      </div>

      <table>
        <thead>
          <tr>
            <th class="text-center" style="width: 50px;">№</th>
            <th>Услуга</th>
            <th class="text-center" style="width: 80px;">Кол-во</th>
            <th class="text-right" style="width: 120px;">Цена</th>
            <th class="text-right" style="width: 120px;">Сумма</th>
          </tr>
        </thead>
        <tbody>
          ${selectedOptions.map((option, index) => `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td>${option.name}</td>
              <td class="text-center">${option.quantity}</td>
              <td class="text-right">${formatCurrency(option.price)}</td>
              <td class="text-right">${formatCurrency(option.price * option.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <p>
          <span class="label">Подытог:</span>
          <strong>${formatCurrency(subtotal)}</strong>
        </p>
        ${discount > 0 ? `
          <p class="discount">
            <span class="label">Скидка (${discount}%):</span>
            <strong>-${formatCurrency(discountAmount)}</strong>
          </p>
        ` : ''}
        <p class="total">
          <span class="label">Итого:</span>
          <span class="total-value">${formatCurrency(total)}</span>
        </p>
      </div>

      <div class="footer">
        Калькулятор IT-услуг | ${currentDate}
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  // Открываем новое окно для печати
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
  }
}
