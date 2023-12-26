document.addEventListener("DOMContentLoaded", function () {
  fetch("/get-graph-data")
    .then((response) => response.json())
    .then((data) => {
      const labels = data.labels;
      const data1 = data.data1;

      // Using the ApexCharts heatmap
      const options = {
        series: [
          {
            name: "Contributions",
            data: data1.map((value, index) => ({ x: index, y: value })),
          },
        ],
        chart: {
          height: 105,
          type: "heatmap",
        },
        dataLabels: {
          enabled: false,
        },
        colors: ["#008FFB"],

        xaxis: {
          categories: labels,
          labels: {
            show: true,
          },
          axisBorder: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
        },
        tooltip: {
          shared: false,
          followCursor: true,
          intersect: false,
          x: {
            show: true,
            formatter: function (value) {
              return labels[value];
            },
          },
        },
      };

      const chart = new ApexCharts(document.querySelector("#heatmap"), options);
      chart.render();
    });
});
