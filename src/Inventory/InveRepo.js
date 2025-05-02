import { showReport} from '../FunctLib.js';

const dataSource = './DB_INVENSUM.json';
const cAsOfDate = '04/27/2025';
setStockEndByLocationChart(dataSource, cAsOfDate);


async function setStockEndByLocationChart(dataSource, cAsOfDate) {
    try {
        const response = await fetch(dataSource);
        const data = await response.json();

        const locationChart1Element = document.getElementById('locaEndChart1');
        const locationChart2Element = document.getElementById('locaEndChart2');

        // Destroy previous charts if they exist
        if (window.myChart1) window.myChart1.destroy();
        if (window.myChart2) window.myChart2.destroy();

        // === Sort all locations by totalsrp (descending) ===
        // const sortedData = data.sort((a, b) => b.totalsrp - a.totalsrp);
        const sortedData = [...data].sort((a, b) => b.totalsrp - a.totalsrp);
        const totalSRP = sortedData.reduce((sum, loc) => sum + loc.totalsrp, 0);
        

        // === Chart 1: Column chart for all locations ===
        const allLabels = sortedData.map(loc => loc.locaname);
        const allValues = sortedData.map(loc => loc.totalsrp);

        const ctx1 = locationChart1Element.getContext('2d');
        window.myChart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: allLabels,
                datasets: [{
                    label: 'Inventory By SRP',
                    data: allValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Inventory by SRP as of ${cAsOfDate}`
                    },
                    font: {
                        size: 14 // smaller title
                    },                    
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: false,
                            maxRotation: 90,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // === Chart 2: Pie chart for Top 20 locations' percentage ===
        const top20 = sortedData.slice(0, 20);
        const rest = sortedData.slice(20);
        const othersSRP = rest.reduce((sum, loc) => sum + loc.totalsrp, 0);
        
        // Labels and values
        const pieLabels = top20.map(loc => loc.locaname);
        const pieData = top20.map(loc => loc.totalsrp);
        
        // Add "Others"
        pieLabels.push('Others');
        pieData.push(othersSRP);
        
        // Recalculate percentages for all segments
        const piePercentages = pieData.map(val => ((val / totalSRP) * 100).toFixed(2));
        

        const pieColors = pieLabels.map(() =>
            `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.6)`
        );

        const ctx2 = locationChart2Element.getContext('2d');
        window.myChart2 = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: pieLabels,
                datasets: [{
                    data: pieData,
                    backgroundColor: pieColors,
                    borderColor: pieColors.map(c => c.replace('0.6', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 10
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                const dataset = data.datasets[0];
                    
                                return data.labels.map((label, i) => {
                                    const rawValue = dataset.data[i];
                                    const percentage = piePercentages[i];
                                    const shortLabel = label.substring(0, 18);
                                    return {
                                        text: `${percentage}% - ${shortLabel}`,
                                        fillStyle: dataset.backgroundColor[i],
                                        strokeStyle: dataset.borderColor[i],
                                        lineWidth: dataset.borderWidth,
                                        hidden: chart.getDatasetMeta(0).data[i].hidden,
                                        index: i
                                    };
                                });
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const idx = context.dataIndex;
                                return `${pieLabels[idx]}: ${piePercentages[idx]}%`;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Top 20 Locations – % CTI'
                    },
                    font: {
                        size: 14 // smaller title
                    }                    
                }
            }
        });

    } catch (error) {
        console.error('Error loading or processing chart data:', error);
    }
}
// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const stockEndingByLocation = document.getElementById('stockEndingByLocation');
    const rankRepoDiv = document.getElementById('StockEndLocation');
    const closeRepo = document.getElementById('closeStockEndLoca');
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

        // Add event listener to each element with the necessary arguments
    stockEndingByLocation.addEventListener('click', () => {
        showReport('StockEndLocation')
    });
});
