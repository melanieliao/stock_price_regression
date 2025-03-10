// Load data from stock_data.js (already available as `stockData` and `stockList`)

// Populate Dropdowns
let stockSelect = document.getElementById("stockSelect");
let yearSelect = document.getElementById("yearSelect");

stockList.stocks.forEach(stock => {
    let option = document.createElement("option");
    option.value = stock;
    option.text = stock;
    stockSelect.appendChild(option);
});

stockList.years.forEach(year => {
    let option = document.createElement("option");
    option.value = year;
    option.text = year;
    yearSelect.appendChild(option);
});

// Event Listener for "Show Graph" Button
document.getElementById("showGraphButton").addEventListener("click", updateGraph);

function updateGraph() {
    let stock = document.getElementById("stockSelect").value;
    let year = parseInt(document.getElementById("yearSelect").value, 10); // Ensure year is an integer

    if (!stock || !year) {
        alert("Please select a stock and year!");
        return;
    }

    let dataPoints = stockData[stock]?.[year];

    if (!dataPoints || dataPoints.length === 0) {
        alert(`No data available for ${stock} in ${year}`);
        return;
    }

    // Convert Dates and Filter Out Next Year (January)
    let filteredData = dataPoints.filter(d => {
        let date = new Date(d.Date);
        return date.getFullYear() === year; // Keep only dates within the selected year
    });

    if (filteredData.length === 0) {
        alert(`No valid data found for ${stock} in ${year} (after filtering).`);
        return;
    }

    let dates = filteredData.map(d => new Date(d.Date));
    let prices = filteredData.map(d => d.Close);

    // Convert Dates to Numeric X Values
    let xValues = Array.from({length: prices.length}, (_, i) => i);
    let yValues = prices;

    // Linear Regression Calculation (Least Squares Method)
    let sumX = xValues.reduce((a, b) => a + b, 0);
    let sumY = yValues.reduce((a, b) => a + b, 0);
    let sumXY = xValues.map((x, i) => x * yValues[i]).reduce((a, b) => a + b, 0);
    let sumXX = xValues.map(x => x * x).reduce((a, b) => a + b, 0);
    let n = xValues.length;

    let slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let intercept = (sumY - slope * sumX) / n;
    let regressionLine = xValues.map(x => slope * x + intercept);

    // Plot Graph with Close Prices Only (Add $ Sign in Hover)
    let trace1 = {
        x: dates,
        y: prices,
        mode: 'markers',
        name: 'Close Prices',
        marker: { color: 'blue' },
        hovertemplate: `<b>Date:</b> %{x}<br><b>Close Price:</b> $%{y:.2f}<extra></extra>` // Add $ sign
    };

    let trace2 = {
        x: dates,
        y: regressionLine,
        mode: 'lines',
        name: 'Regression Line',
        line: { color: 'red' },
        hovertemplate: `<b>Date:</b> %{x}<br><b>Trend Price:</b> $%{y:.2f}<extra></extra>` // Add $ sign
    };

    let layout = {
        title: `${stock} Stock Close Prices (${year})`,
        xaxis: { title: "Date" },
        yaxis: { title: "Stock Price (USD)" },
        hovermode: 'x unified' // Ensures unified hover over x-axis
    };

    Plotly.newPlot("plot", [trace1, trace2], layout);
}