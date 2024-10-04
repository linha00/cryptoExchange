const wallet = {
    ETH: 10000,
    BTC: 0,
    SOL: 0,
};

const dropdownToggle1 = document.getElementById('dropdownButton1');
const dropdownToggle2 = document.getElementById('dropdownButton2');

const dropdownMenu1 = document.getElementById('dropdownMenu1');
const dropdownMenu2 = document.getElementById('dropdownMenu2');

const selectedOption1 = document.getElementById('selectedOption1');
const selectedOption2 = document.getElementById('selectedOption2');

const inputAmount = document.getElementById('input-amount');

function validateInput() {
    const input = document.getElementById("input-amount");
    
    // Clear any custom validity message
    input.setCustomValidity("");

    // Check if the input is empty or not a valid number
    if (!input.value) {
        // Optionally, set a custom message if you want to show something specific
        input.setCustomValidity(""); // Disable the prompt
    }
}

/* dropdown */
dropdownToggle1.addEventListener('click', () => {
    dropdownMenu1.classList.toggle('show');
});

dropdownToggle2.addEventListener('click', () => {
    dropdownMenu2.classList.toggle('show');
});

// Handle option selection
dropdownMenu1.addEventListener('click', (event) => {
  if (event.target.tagName === 'LI') {
    selectedOption1.textContent = event.target.textContent;
    dropdownMenu1.classList.remove('show'); 
    refresh();
    updateExchangeSell();
    switchChart(selectedOption1.textContent);
    checkInput();
  }
});

dropdownMenu2.addEventListener('click', (event) => {
  if (event.target.tagName === 'LI') {
    selectedOption2.textContent = event.target.textContent;
    dropdownMenu2.classList.remove('show'); 
    sellingToken = event.target.textContent;
    refresh();
    updateExchangeBuy();
    checkInput();
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
  if (!dropdownToggle1.contains(event.target) && !dropdownMenu1.contains(event.target)) {
    dropdownMenu1.classList.remove('show');
  }
  if (!dropdownToggle2.contains(event.target) && !dropdownMenu2.contains(event.target)) {
    dropdownMenu2.classList.remove('show');
  }
});

const sellingAmountInput = document.getElementById('input-amount');
const buyingAmountInput = document.getElementById('output-amount');

sellingAmountInput.addEventListener('input', () => {
    updateExchangeBuy();
});

buyingAmountInput.addEventListener('input', () => {
    updateExchangeSell();
});


/* update functions */
function updateSGDRates() {
    const sellingToken = selectedOption1.textContent;
    const buyingToken = selectedOption2.textContent;
    const sellingTokenToSGD = cryptoData[sellingToken].current_price * 1;
    document.getElementById('token-sgd-text').textContent = sellingTokenToSGD.toFixed(2);
}

function updateTokenRates() {
    const sellingToken = selectedOption1.textContent;
    const buyingToken = selectedOption2.textContent;
    
    const sellingTokenToBuyingToken = 
        cryptoData[sellingToken].current_price / cryptoData[buyingToken].current_price;
    document.getElementById('selling-token-buying-token').textContent = 
        `1 ${sellingToken} to ${sellingTokenToBuyingToken} ${buyingToken}`;
}

function updateExchangeBuy() {
    const sellingToken = selectedOption1.textContent;
    const buyingToken = selectedOption2.textContent;

    const buyingNumber = sellingAmountInput.value *
        cryptoData[sellingToken].current_price / cryptoData[buyingToken].current_price;
    
    buyingAmountInput.value = buyingNumber != 0 ? buyingNumber.toFixed(7) : '';
}

function updateExchangeSell() {
    const sellingToken = selectedOption1.textContent;
    const buyingToken = selectedOption2.textContent;

    const sellingNumber = buyingAmountInput.value *
        cryptoData[buyingToken].current_price / cryptoData[sellingToken].current_price;
    
    sellingAmountInput.value = sellingNumber != 0 ? sellingNumber.toFixed(7) : '';
}

/* crypto data*/
const apiURL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=sgd';
const cryptoData = {
    BTC: {},
    ETH: {},
    SOL: {}
};

// Function to fetch and display crypto exchange rates
async function getCryptoData() {
    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        
        // Update cryptoData
        data.forEach(crypto => {
            // Use the symbol as the key and assign the entire crypto object
            cryptoData[crypto.symbol.toUpperCase()] = crypto;
        });
        
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function refresh() {
    updateSGDRates();
    updateTokenRates();
}

/* graph*/
const priceData = {};
let priceChart;

async function fetchPriceData(cryptoId, days) {
    const url = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=sgd&days=${days}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.prices; 
}

async function fetchGraphData(coinKey) {
    const days = '7'; 
    priceData[coinKey] = await fetchPriceData(cryptoData[coinKey].id, days);
    renderChart(coinKey); 
}

function renderChart(coinKey) {
    const prices = priceData[coinKey];

    const timestamps = prices.map(price => {
        const date = new Date(price[0]);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short'
        });
    });

    const values = prices.map(price => price[1]);

    const ctx = document.getElementById('priceChart').getContext('2d');

    if (priceChart) {
        priceChart.destroy();
    }

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: cryptoData[coinKey].name,
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `${cryptoData[coinKey].name} Price Over the Last 7 Days`
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (SGD)'
                    }
                }
            }
        }
    });
}

async function switchChart(coinKey) {
    if (priceData[coinKey] === undefined) {
        await fetchGraphData(coinKey); // Fetch and display the chart data for the selected coin
    } else {
        renderChart(coinKey); // Render the chart for the selected coin
    }
}
const pricesData = [
    {
        "Instrument": "BTC/USD",
        "24H Change": "-1.01%",
        "24H Volume": "$456.34M\n7,233.00200 BTC"
    },
    {
        "Instrument": "SOL/USD",
        "24H Change": "-3.82%",
        "24H Volume": "$16.12M\n109,827.098 SOL"
    },
    {
        "Instrument": "ETH/USD",
        "24H Change": "-0.12%",
        "24H Volume": "$700.72M\n270,559.4714 ETH"
    }
];


window.onload = async () => {
    
    try {
        await getCryptoData(); // Fetch the cryptocurrency data
        refresh(); // Refresh the data on the webpage
        await fetchGraphData('ETH'); // Fetch data and generate graph

        const pricesBody = document.getElementById('prices-body');

        // Populate the price list
        Object.values(cryptoData).forEach((coin) => {
            const row = document.createElement('tr');
        
            const changeClass = coin.price_change_percentage_24h > 0 ? 'change-positive' : 'change-negative';
        
            row.innerHTML = `
                <td class="coin-name"><img src="${coin.image}" alt="${coin.name} icon" width="24" height="24"> ${coin.symbol.toUpperCase()}</td>
                <td class="${changeClass}">${coin.price_change_percentage_24h.toFixed(2)}%</td>
                <td class="price-last">${coin.current_price.toLocaleString('en-US', { style: 'currency', currency: 'SGD' })}</td>
            `;
            pricesBody.appendChild(row);
        });

        const dropdownMenus = document.querySelectorAll('.dropdown-menu');
        
        dropdownMenus.forEach(menu => {
            // Clear the existing options
            menu.innerHTML = '';
            
            Object.values(cryptoData).forEach(coin => {
                const li = document.createElement('li');
                li.setAttribute('data-value', coin.symbol);
                
                // Create an image element for the coin icon
                const icon = document.createElement('img');
                icon.src = coin.image;
                icon.alt = `${coin.symbol} icon`;
                icon.style.width = '20px'; // Adjust icon size as needed
                icon.style.marginRight = '8px'; // Space between icon and text
                
                li.appendChild(icon);
                li.appendChild(document.createTextNode(`${coin.symbol.toUpperCase()}`));
                menu.appendChild(li);
            });
        });
        checkInput();
    } catch (error) {
        alert("Failed to fetch cryptocurrency data. Please try again later.");
    }

    setInterval(getCryptoData, 30000);
    setInterval(refresh, 30000);
};

const swapButton = document.getElementById('swapButton');

// Function to check input and toggle button state
function checkInput() {
    if (sellingAmountInput.value.trim() === '' || 
        selectedOption1.textContent === selectedOption2.textContent) {
        swapButton.disabled = true; // Disable the button if input is empty
    } else {
        swapButton.disabled = false; // Enable the button if there is input
    }
}

// Add event listener to input field
sellingAmountInput.addEventListener('input', checkInput);
buyingAmountInput.addEventListener('input', checkInput);

//function to show wallet balance
function showWalletBalance() {
    console.log(wallet);
}

//functions to convert coins
function convert() {
    const sellToken = selectedOption1.textContent;
    const buyToken = selectedOption2.textContent; 
    const _sellingAmount = sellingAmountInput.value;
    const _buyingAmount = buyingAmountInput.value;

    if (wallet[sellToken] === undefined) {
        console.log("No Token");
        showErrorModal("Swap unsuccessful!", "Not enough balance");
    } else {
        if (_sellingAmount > wallet[sellToken]) {
            console.log("Not enough balance");
            showErrorModal("Swap unsuccessful!", "Not enough balance");
        } else {
            console.log("success");
            wallet[sellToken] -= _sellingAmount;
            if (wallet[buyToken] === undefined) {
                wallet[buyToken] = _buyingAmount;
            } else {
                wallet[buyToken] += _buyingAmount;
            }
            showSuccessPrompt(sellToken, _sellingAmount, buyToken, _buyingAmount);
            sellingAmountInput.value = '';
            buyingAmountInput.value = '';
        }
    }
    console.log(wallet);
}

// Function to show the success modal
function showSuccessPrompt(tokenFrom, amountFrom, tokenTo, amountTo) {
    const modal = document.getElementById("prompt-modal");

    document.getElementById("prompt-header").textContent = "Swap successful!";
    document.getElementById("prompt-message").textContent = 
        `You exchanged ${amountFrom} ${tokenFrom} for ${amountTo} ${tokenTo}.`;
    modal.style.display = "block";

    document.getElementById("close-modal").onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function showErrorModal(header, message) {
    const modal = document.getElementById("prompt-modal");

    document.getElementById("prompt-header").textContent = header;
    document.getElementById("prompt-message").textContent = message;
    modal.style.display = "block";

    document.getElementById("close-modal").onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

showErrorModal("Read Me", 
    "Wallet balance will be displayed in the console<br>might run into timeout when fetching data");