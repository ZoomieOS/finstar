import "../scss/styles.scss";

import * as bootstrap from "bootstrap";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import annotationPlugin from "chartjs-plugin-annotation";

import greenIconUrl from "../assets/images/green-icon.svg";
import blueIconUrl from "../assets/images/blue-icon.svg";

Chart.register(ChartDataLabels);
Chart.register(annotationPlugin);

const svgIconGreen = new Image();
svgIconGreen.src = greenIconUrl;

const svgIconBlue = new Image();
svgIconBlue.src = blueIconUrl;

function createGradientPlugin() {
  return {
    id: "custom-gradient",
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const gradientGreen = ctx.createLinearGradient(
        0,
        chartArea.top,
        0,
        chartArea.bottom
      );
      gradientGreen.addColorStop(0.0, "rgba(35, 204, 80, 0.4)");
      gradientGreen.addColorStop(0.1, "rgba(35, 204, 80, 0.25)");
      gradientGreen.addColorStop(0.3, "rgba(35, 204, 80, 0.1)");
      gradientGreen.addColorStop(1.0, "rgba(35, 204, 80, 0)");

      const gradientBlue = ctx.createLinearGradient(
        0,
        chartArea.top,
        0,
        chartArea.bottom
      );
      gradientBlue.addColorStop(0.0, "rgba(0, 159, 188, 0.4)");
      gradientBlue.addColorStop(0.5, "rgba(0, 159, 188, 0.25)");
      gradientBlue.addColorStop(0.9, "rgba(0, 159, 188, 0.1)");
      gradientBlue.addColorStop(1.0, "rgba(0, 159, 188, 0)");

      chart.data.datasets[0].backgroundColor = gradientGreen;
      chart.data.datasets[1].backgroundColor = gradientBlue;
    },
  };
}

let chartBefore, chartAfter;

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
          fill: true,
          backgroundColor: () => "transparent",
          tension: 0.4,
          pointStyle: svgIconGreen,
          pointRadius: 10,
        },
        {
          label: "СЧА, млн руб.",
          data: blueData,
          fill: true,
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
        tooltip: {
          enabled: false,
        },
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
        annotation: {
          annotations: {},
        },
      },
    },
    plugins: [createGradientPlugin()],
  });
}

function addHoverListener(chart, canvas) {
    let lastIndex = -1;

    canvas.addEventListener("mousemove", (event) => {
      const points = chart.getElementsAtEventForMode(
        event,
        "nearest",
        { axis: "x", intersect: false },
        false
      );
      const closestIndex = points.length ? points[0].index : -1;

      if (closestIndex !== -1 && closestIndex !== lastIndex) {
        lastIndex = closestIndex;

        const labels = chart.data.labels;

        chart.options.plugins.annotation.annotations = {
          highlightLine: {
            type: "line",
            xMin: labels[closestIndex],
            xMax: labels[closestIndex],
            borderColor: "rgba(128, 128, 128, 0.6)",
            borderWidth: 1,
          },
        };

        chart.options.scales.x.ticks = {
          callback: function (value, index) {
            return index === closestIndex ? this.getLabelForValue(value) : labels[index];
          },
          color: (context) => (context.index === closestIndex ? "#000" : "#000"),
          font: (context) => ({
            weight: context.index === closestIndex ? "700" : "300",
          }),
        };

        chart.update("none"); // Без анимации
      }
    });
  }

function addHoverLabel(canvas, chart, tooltipId) {
    const tooltipElement = document.getElementById(tooltipId);

    canvas.addEventListener("mousemove", (event) => {
      const { scales } = chart;
      const x = event.offsetX;
      const y = event.offsetY;

      const xValue = scales.x.getValueForPixel(x);
      const index = Math.round(xValue);

      if (index < 0 || index >= chart.data.labels.length) {
        tooltipElement.style.opacity = 0;
        return;
      }

      const greenYValue = chart.data.datasets[0].data[index];
      const blueYValue = chart.data.datasets[1].data[index];

      const greenY = scales.y.getPixelForValue(greenYValue);
      const blueY = scales.y.getPixelForValue(blueYValue);

      let text = "";
      if (y <= greenY) {
        text = "Стоимость пая, руб.";
      } else if (y >= blueY) {
        text = "СЧА, млн руб.";
      } else {
        tooltipElement.style.opacity = 0;
        return;
      }

      tooltipElement.innerHTML = text;
      tooltipElement.style.left = event.pageX + "px";
      tooltipElement.style.top = event.pageY - 20 + "px";
      tooltipElement.style.opacity = 1;
    });
  }
function main() {
  const canvasBefore = document.getElementById("pai-current");
  const ctxBefore = canvasBefore.getContext("2d");

  const beforeLabels = [
    "Май 2024",
    "Июнь 2024",
    "Июль 2024",
    "Август 2024",
    "Сентябрь 2024",
    "Октябрь 2024",
    "Ноябрь 2024",
    "Декабрь 2024",
    "Январь 2025",
    "Февраль 2025",
    "Март 2025",
  ];

  const beforeGreenData = [
    999, 1024, 1261, 1413, 1304, 1309, 1298, 1493, 1494, 1551, 1577,
  ];
  const beforeBlueData = [
    150, 154, 281, 494, 456, 457, 454, 522, 522, 542, 543,
  ];

  chartBefore = createChart(
    ctxBefore,
    beforeLabels,
    beforeGreenData,
    beforeBlueData
  );
  requestAnimationFrame(() => chartBefore.update());

  const canvasAfter = document.getElementById("pai-after");
  const ctxAfter = canvasAfter.getContext("2d");

  const afterLabels = [
    "Декабрь 24",
    "Декабрь 25",
    "Декабрь 26",
    "Декабрь 27",
    "Декабрь 28",
    "Декабрь 29",
  ];

  const afterGreenData = [1493, 2082, 2501, 2892, 3289, 3720];
  const afterBlueData = [522, 1282, 3038, 4663, 6351, 8761];

  chartAfter = createChart(
    ctxAfter,
    afterLabels,
    afterGreenData,
    afterBlueData
  );
  requestAnimationFrame(() => chartAfter.update());

  addHoverListener(chartBefore, canvasBefore);
  addHoverListener(chartAfter, canvasAfter);

addHoverLabel(canvasBefore, chartBefore, "custom-tooltip-before");
addHoverLabel(canvasAfter, chartAfter, "custom-tooltip-after");
}

main();

(function () {
  const formInvests = document.getElementById("form-invests");
  const formBannerInvests = document.getElementById("form-banner-invests");
  const modalElement = document.getElementById("formModal");
  const modal = new bootstrap.Modal(modalElement);

  formInvests.addEventListener("click", () => {
    modal.show();
  })

  formBannerInvests.addEventListener("click", () => {
    modal.show();
  })
})();
