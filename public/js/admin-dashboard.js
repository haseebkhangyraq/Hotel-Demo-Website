/* =========================================================
   GRAND AURELIA — ADMIN DASHBOARD CHARTS
   ========================================================= */
(function () {
  'use strict';

  const data = window.AURELIA_CHART;
  if (!data || typeof window.Chart === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gold = '#C5A46D';
  const goldDeep = '#A9864C';
  const navy = '#14212B';
  const muted = '#77736B';
  const grid = 'rgba(20, 33, 43, 0.08)';

  Chart.defaults.font.family = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  Chart.defaults.font.size = 10;
  Chart.defaults.color = muted;
  Chart.defaults.animation = reduceMotion ? false : { duration: 900, easing: 'easeOutQuart' };

  const tooltip = {
    backgroundColor: navy,
    titleColor: '#F8F5EF',
    bodyColor: 'rgba(248,245,239,.78)',
    borderColor: 'rgba(197,164,109,.35)',
    borderWidth: 1,
    padding: 12,
    cornerRadius: 0,
    displayColors: true,
    boxWidth: 8,
    boxHeight: 8,
    titleFont: { family: Chart.defaults.font.family, size: 11, weight: '600' },
    bodyFont: { family: Chart.defaults.font.family, size: 10 }
  };

  /* ---------------------------------------------------------
     Revenue & reservations
     --------------------------------------------------------- */
  const revenueCanvas = document.getElementById('revenueChart');
  if (revenueCanvas) {
    new Chart(revenueCanvas, {
      type: 'bar',
      data: {
        labels: data.labels || [],
        datasets: [
          {
            type: 'bar',
            label: 'Revenue (PKR ’000)',
            data: data.revenue || [],
            backgroundColor: 'rgba(197,164,109,.74)',
            hoverBackgroundColor: gold,
            borderWidth: 0,
            borderRadius: 1,
            barPercentage: 0.62,
            categoryPercentage: 0.72,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Reservations',
            data: data.bookings || [],
            borderColor: navy,
            backgroundColor: navy,
            borderWidth: 1.6,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#F8F5EF',
            pointBorderColor: navy,
            pointBorderWidth: 1.4,
            tension: 0.34,
            fill: false,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltip,
            callbacks: {
              label(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                if (context.dataset.yAxisID === 'y') {
                  return ` ${label}: PKR ${Number(value).toLocaleString('en-PK')}k`;
                }
                return ` ${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 9, family: Chart.defaults.font.family },
              color: muted,
              padding: 8
            }
          },
          y: {
            beginAtZero: true,
            position: 'left',
            grid: { color: grid, drawTicks: false },
            border: { display: false },
            ticks: {
              padding: 10,
              maxTicksLimit: 6,
              callback(value) {
                return `${Number(value).toLocaleString('en-PK')}k`;
              }
            },
            title: {
              display: true,
              text: 'REVENUE (PKR ’000)',
              color: '#A8A298',
              font: { size: 8, family: Chart.defaults.font.family, weight: '600' },
              padding: { bottom: 10 }
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            grid: { display: false },
            border: { display: false },
            ticks: { padding: 10, precision: 0, maxTicksLimit: 6 },
            title: {
              display: true,
              text: 'RESERVATIONS',
              color: '#A8A298',
              font: { size: 8, family: Chart.defaults.font.family, weight: '600' },
              padding: { bottom: 10 }
            }
          }
        }
      }
    });
  }

  /* ---------------------------------------------------------
     Reservations by room type
     --------------------------------------------------------- */
  const mixCanvas = document.getElementById('mixChart');
  if (mixCanvas) {
    const palette = [
      navy, gold, '#7C7465', '#B9A88C', '#405765', '#D6C3A2',
      '#8E7B5D', '#5E7079', '#C7BBAA', '#A98450', '#E2D5BD'
    ];

    new Chart(mixCanvas, {
      type: 'doughnut',
      data: {
        labels: data.mixLabels || [],
        datasets: [{
          data: data.mixData || [],
          backgroundColor: (data.mixLabels || []).map((label, index) => palette[index % palette.length]),
          hoverBackgroundColor: gold,
          borderColor: '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '58%',
        layout: { padding: 4 },
        plugins: {
          legend: {
            position: window.innerWidth > 760 ? 'right' : 'bottom',
            labels: {
              boxWidth: 7,
              boxHeight: 7,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 14,
              color: '#4A4A45',
              font: { size: 9.5, family: Chart.defaults.font.family }
            }
          },
          tooltip: {
            ...tooltip,
            callbacks: {
              label(context) {
                const total = context.dataset.data.reduce((sum, value) => sum + Number(value), 0);
                const value = Number(context.parsed);
                const share = total ? Math.round((value / total) * 100) : 0;
                return ` ${context.label}: ${value} (${share}%)`;
              }
            }
          }
        }
      }
    });
  }
})();
