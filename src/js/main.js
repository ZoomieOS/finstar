import "../scss/styles.scss";

import * as bootstrap from "bootstrap";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.2.133/+esm';

Chart.register(ChartDataLabels);

const svgIconGreen = new Image();
svgIconGreen.src = './assets/images/green-icon.svg';

const svgIconBlue = new Image();
svgIconBlue.src = './assets/images/blue-icon.svg';

function createGradientPlugin() {
  return {
    id: "custom-gradient",
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const gradientGreen = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradientGreen.addColorStop(0.0, "rgba(35, 204, 80, 0.4)");
      gradientGreen.addColorStop(0.1, "rgba(35, 204, 80, 0.25)");
      gradientGreen.addColorStop(0.3, "rgba(35, 204, 80, 0.1)");
      gradientGreen.addColorStop(1.0, "rgba(35, 204, 80, 0)");

      const gradientBlue = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradientBlue.addColorStop(0.0, "rgba(0, 159, 188, 0.4)");
      gradientBlue.addColorStop(0.5, "rgba(0, 159, 188, 0.25)");
      gradientBlue.addColorStop(0.9, "rgba(0, 159, 188, 0.1)");
      gradientBlue.addColorStop(1.0, "rgba(0, 159, 188, 0)");

      chart.data.datasets[0].backgroundColor = gradientGreen;
      chart.data.datasets[1].backgroundColor = gradientBlue;
    },
  };
}

function createChart(ctx, labels, greenData, blueData) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Стоимость пая, руб.",
          data: greenData,
          borderColor: "#23CC50",
          borderWidth: 2,
          backgroundColor: () => "transparent",
          tension: 0.4,
          pointStyle: svgIconGreen,
          pointRadius: 10,
        },
        {
          label: "СЧА, млн руб.",
          data: blueData,
          borderColor: "rgba(0, 159, 188, 1)",
          borderWidth: 2,
          backgroundColor: () => "transparent",
          tension: 0.4,
          pointStyle: svgIconBlue,
          pointRadius: 10,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        tooltip: { enabled: false },
        datalabels: {
          color: "#000",
          align: "top",
          anchor: "end",
          font: { size: 14 },
          formatter: (value) => value,
        },
        legend: {
          display: true,
          position: "top",
          labels: { usePointStyle: true },
        },
      },
    },
    plugins: [createGradientPlugin()],
  });
}

function initPdfViewer() {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.2.133/build/pdf.worker.min.mjs';

  const url = './assets/files/table-desktop.pdf';

  pdfjsLib.getDocument(url).promise.then(pdf => {
    pdf.getPage(1).then(page => {
      const scale = 1;
      const viewport = page.getViewport({ scale });

      const canvas = document.getElementById('pdf-canvas');
      const context = canvas.getContext('2d');

      context.fillStyle = "white";
      context.fillRect(0, 0, viewport.width, viewport.height);

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      page.render(renderContext);
    });
  });
}

function main() {
  const canvasBefore = document.getElementById("pai-current");
  const ctxBefore = canvasBefore.getContext("2d");

  const beforeLabels = [
    "Май 2024", "Июнь 2024", "Июль 2024", "Август 2024", "Сентябрь 2024",
    "Октябрь 2024", "Ноябрь 2024", "Декабрь 2024", "Январь 2025",
    "Февраль 2025", "Март 2025",
  ];

  const beforeGreenData = [999, 1024, 1261, 1413, 1304, 1309, 1298, 1493, 1494, 1551, 1577];
  const beforeBlueData = [150, 154, 281, 494, 456, 457, 454, 522, 522, 542, 543];

  const chartBefore = createChart(ctxBefore, beforeLabels, beforeGreenData, beforeBlueData);
  requestAnimationFrame(() => chartBefore.update());

  const canvasAfter = document.getElementById("pai-after");
  const ctxAfter = canvasAfter.getContext("2d");

  const afterLabels = [
    "Декабрь 24", "Декабрь 25", "Декабрь 26",
    "Декабрь 27", "Декабрь 28", "Декабрь 29",
  ];

  const afterGreenData = [1493, 2082, 2501, 2892, 3289, 3720];
  const afterBlueData = [522, 1282, 3038, 4663, 6351, 8761];

  const chartAfter = createChart(ctxAfter, afterLabels, afterGreenData, afterBlueData);
  requestAnimationFrame(() => chartAfter.update());

  initPdfViewer();
}

(function() {
  main();

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const modalElement = document.getElementById("formModal");
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }, 10); // 40 000 миллисекунд = 40 секунд
  });
}());