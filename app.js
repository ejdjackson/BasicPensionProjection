let chartInstance = null; // Declare a variable to hold the chart instance

function generateGraph(event) {
    event.preventDefault();

    // Get input values
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const projectionAge = parseInt(document.getElementById('projectionAge').value);
    const currentFund = parseFloat(document.getElementById('currentFund').value);
    const annualPremium = parseFloat(document.getElementById('annualPremium').value);
    const investmentReturn = parseFloat(document.getElementById('investmentReturn').value) / 100;
    const inflation = parseFloat(document.getElementById('inflation').value) / 100;

    const bestCaseReturn = investmentReturn + 0.03; // 3% higher
    const worstCaseReturn = investmentReturn - 0.03; // 3% lower

    const currentYear = new Date().getFullYear();
    const yearsToRetirement = retirementAge - currentAge;
    const totalYears = projectionAge - currentAge;

    function calculateFundAtEnd(initialDrawing, returnRate) {
        let fund = currentFund;
        let age = currentAge;
        let drawing = 0;
        for (let year = currentYear; year <= currentYear + totalYears; year++) {
            let investmentReturnAmount = fund * returnRate;
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

    function calculateInitialDrawing(returnRate) {
        let low = 0;
        let high = Math.max(currentFund * (1 + returnRate)**yearsToRetirement, (annualPremium * yearsToRetirement)* (1 + returnRate)**yearsToRetirement);
        let initialDrawing = 0;
        while (high - low > 0.01) {
            initialDrawing = (low + high) / 2;
            let fundAtEnd = calculateFundAtEnd(initialDrawing, returnRate);
            if (fundAtEnd > 0) {
                low = initialDrawing;
            } else {
                high = initialDrawing;
            }
        }
        return initialDrawing;
    }

       // Calculate initial drawings for central, best case, and worst case
       const centralDrawing = calculateInitialDrawing(investmentReturn);
       const bestCaseDrawing = calculateInitialDrawing(bestCaseReturn);
       const worstCaseDrawing = calculateInitialDrawing(worstCaseReturn);
   
       // Discount the initial drawings back to present value using inflation rate
       const centralDiscountedIncome = centralDrawing / Math.pow(1 + inflation, yearsToRetirement);
       const bestCaseDiscountedIncome = bestCaseDrawing / Math.pow(1 + inflation, yearsToRetirement);
       const worstCaseDiscountedIncome = worstCaseDrawing / Math.pow(1 + inflation, yearsToRetirement);

    // Display the discounted gross income results
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('result').innerHTML = `
        
        <p>With these assumptions, you could afford a pension (in today's money) of:</p>
        <div class="income-box">
            <div class="income-item">Underperformance (-3%): <br>   £${Math.round(worstCaseDiscountedIncome).toLocaleString()}</div>
            <div class="income-item">Central Scenario: <br>  £${Math.round(centralDiscountedIncome).toLocaleString()}</div>
            <div class="income-item">Outperformance (+3%): <br>   £${Math.round(bestCaseDiscountedIncome).toLocaleString()}</div>
        
        </div>
        
    `;


    // Perform calculations for the pension projection
    let labels = [];
    let fundData = [];
    let fundDataCentral = [];
    let fundDataBestCase = [];
    let fundDataWorstCase = [];
    let age = currentAge;
    let fund = currentFund;

    

    for (let year = 0; age <= projectionAge; year++) {
        let fundCentral = currentFund;
        let fundBestCase = currentFund;
        let fundWorstCase = currentFund;

        // Calculate fund values for each scenario
        for (let ageInner = currentAge; ageInner <= age; ageInner++) {
            let investmentReturnAmountCentral = fundCentral * investmentReturn;
            let investmentReturnAmountBestCase = fundBestCase * bestCaseReturn;
            let investmentReturnAmountWorstCase = fundWorstCase * worstCaseReturn;
            
            if (ageInner < retirementAge) {
                fundCentral += annualPremium + investmentReturnAmountCentral;
                fundBestCase += annualPremium + investmentReturnAmountBestCase;
                fundWorstCase += annualPremium + investmentReturnAmountWorstCase;
            } else {
                fundCentral += investmentReturnAmountCentral - (centralDrawing * Math.pow(1 + inflation, ageInner - retirementAge));
                fundBestCase += investmentReturnAmountBestCase - (bestCaseDrawing * Math.pow(1 + inflation, ageInner - retirementAge));
                fundWorstCase += investmentReturnAmountWorstCase - (worstCaseDrawing * Math.pow(1 + inflation, ageInner - retirementAge));
            }
        }

        labels.push(age);
        fundDataCentral.push(Math.round(fundCentral));
        fundDataBestCase.push(Math.round(fundBestCase));
        fundDataWorstCase.push(Math.round(fundWorstCase));
        age++;
    }

    // Reveal the graph container
    document.getElementById('chartContainer').classList.remove('d-none');
    document.getElementById('result').classList.remove('d-none');

    // Destroy the previous chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart for Graph 3
    const ctx3 = document.getElementById('Graph').getContext('2d');
    chartInstance = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
            {
                label: 'Underperformance (-3%)',
                data: fundDataWorstCase,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
                tension: 0.1
            },
            {
                label: 'Central Scenario',
                data: fundDataCentral,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false,
                tension: 0.1
            },
            {
                label: 'Outperformance (+3%)',
                data: fundDataBestCase,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
                tension: 0.1
            }
            
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,  // Allows height to be controlled via CSS
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Age',
                        color: '#333',
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
                        text: 'Fund Value (£)',
                        color: '#333',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)', // Light grid lines
                        borderDash: [5, 5] // Dotted grid lines
                    }
                    
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Set up event listener for form submission
    document.getElementById('pensionForm').addEventListener('submit', generateGraph);
});
