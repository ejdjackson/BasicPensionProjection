document.addEventListener('DOMContentLoaded', (event) => {
    let currentInput = 1;
    document.getElementById('currentAge').focus();

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                revealNextInput(currentInput);
                 // Increment the currentInput tracker
                currentInput++;
            }
        });
    });
});

function revealNextInput(currentGroup) {
    const nextDiv = document.getElementById(`group${currentGroup + 1}`);
    
    // Ensure the next group exists and reveal it
    if (nextDiv) {
        nextDiv.classList.remove('hidden');
        nextDiv.querySelector('input').focus(); // Focus on the next input field
    }

}

let chartInstance = null;

function calculateRetirementIncome(event) {
    event.preventDefault();

    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const projectionAge = parseInt(document.getElementById('projectionAge').value);
    const currentFund = parseFloat(document.getElementById('currentFund').value);
    const annualPremium = parseFloat(document.getElementById('annualPremium').value);
    const investmentReturn = parseFloat(document.getElementById('investmentReturn').value) / 100;
    const inflation = parseFloat(document.getElementById('inflation').value) / 100;

    const currentYear = new Date().getFullYear();
    const yearsToRetirement = retirementAge - currentAge;
    const totalYears = projectionAge - currentAge;

    function calculateFundAtEnd(initialDrawing) {
        let fund = currentFund;
        let age = currentAge;
        let drawing = 0;
        for (let year = currentYear; year <= currentYear + totalYears; year++) {
            let investmentReturnAmount = fund * investmentReturn;
            if (age < retirementAge) {
                fund += annualPremium + investmentReturnAmount;
                drawing = 0;
            } else {
                drawing = initialDrawing * Math.pow(1 + inflation, age - retirementAge);
                fund += investmentReturnAmount - drawing;
            }
            age++;
        }
        return fund;
    }

    let low = 0;
    let high = Math.max(currentFund ,annualPremium * yearsToRetirement)  ;
    let initialDrawing = 0;
    while (high - low > 0.01) {
        initialDrawing = (low + high) / 2;
        let fundAtEnd = calculateFundAtEnd(initialDrawing);
        if (fundAtEnd > 0) {
            low = initialDrawing;
        } else {
            high = initialDrawing;
        }
    }

    let discountedIncome = initialDrawing / Math.pow(1 + inflation, yearsToRetirement);

    // Display the discounted gross income result
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('result').innerHTML = `
        <h2>Result</h2>
        <p>With these assumptions,</p>
        <p>you could afford a pension of</p>
        <div class="income-box">
            £${Math.round(discountedIncome).toLocaleString()}
        </div>
        <p>( In today's money )</p>
    `;

    // Generate the projection data for the chart
    let labels = [];
    let fundData = [];
    let discountedFundData = [];
    let age = currentAge;
    let fund = currentFund;
    
    for (let year = 0; age <= projectionAge; year++) {
        let investmentReturnAmount = fund * investmentReturn;
        if (age < retirementAge) {
            fund += annualPremium + investmentReturnAmount;
            drawing = 0;
            
        } else {
            drawing = initialDrawing * Math.pow(1 + inflation, age - retirementAge);
            fund += investmentReturnAmount - drawing;
        }

        // Calculate discounted value of the fund
        let discountedValue = fund / Math.pow(1 + inflation, year);
        discountedFundData.push(Math.round(discountedValue));

        labels.push(age);
        fundData.push(Math.round(fund));
        age++;
    }


    console.log("Fund Data:", fundData);  // Debugging step
    console.log("Discounted Fund Data:", discountedFundData);  // Debugging step

    // Reveal the chart container
    document.getElementById('chartContainer').classList.remove('hidden');

    // Before creating a new chart, destroy the previous one if it exists
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;  // Set to null to ensure it's reset
    }

    const ctx = document.getElementById('projectionChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Fund Value',
                    data: fundData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.1, // Smooth curve
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                },
                {
                    label: 'Inflation Adjusted Fund Value',
                    data: discountedFundData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.1, // Smooth curve
                    pointStyle: 'rect',
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Age',
                        color: '#ffffff',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false // Hide the x-axis grid lines
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount (£)',
                        color: '#ffffff',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)', // Change the color of grid lines
                        borderDash: [5, 5] // Dotted grid lines
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });

    console.log('Chart created');  // Debugging step
}
