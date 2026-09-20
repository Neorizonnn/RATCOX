// 
// SELECT HTML ELEMENTS
// 

const amountInput = document.querySelector("#amount");

const fromCurrency = document.querySelector("#from-currency");
const toCurrency = document.querySelector("#to-currency");

const swapButton = document.querySelector("#swap-btn");
const convertButton = document.querySelector("#convert-btn");

const result = document.querySelector("#result");
const exchangeRate = document.querySelector("#exchange-rate");
const errorMessage = document.querySelector("#error-message");


// 
// STORAGE SETTINGS
// 

const API_URL = "https://open.er-api.com/v6/latest/USD";

const STORAGE_KEY = "exchangeRates";
const TIMESTAMP_KEY = "exchangeRatesTimestamp";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;


// 
// GET EXCHANGE RATES
// 

async function getExchangeRates() {

    const storedRates = localStorage.getItem(STORAGE_KEY);
    const storedTimestamp = localStorage.getItem(TIMESTAMP_KEY);

    const currentTime = Date.now();

    // 
    // USE STORED RATES
    // 

    if (
        storedRates &&
        storedTimestamp &&
        currentTime - Number(storedTimestamp) < TWENTY_FOUR_HOURS
    ) {

        return JSON.parse(storedRates);
    }


    // 
    // FETCH NEW RATES
    // 

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Unable to fetch exchange rates.");
    }

    const data = await response.json();


    // 
    // CHECK API RESPONSE
    // 

    if (data.result !== "success") {
        throw new Error("Exchange rate data unavailable.");
    }


    // 
    // STORE RATES LOCALLY
    // 

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data.rates)
    );

    localStorage.setItem(
        TIMESTAMP_KEY,
        currentTime
    );


    return data.rates;
}


// 
// CONVERT CURRENCY
// 

async function convertCurrency() {

    // Get amount
    const amount = Number(amountInput.value);

    // Get selected currencies
    const from = fromCurrency.value;
    const to = toCurrency.value;


    // 
    // INPUT VALIDATION
    // 

    if (amount <= 0 || isNaN(amount)) {

        errorMessage.textContent = "Please enter a valid amount.";

        result.textContent = "0.00";
        exchangeRate.textContent = "";

        return;
    }


    // Clear previous error
    errorMessage.textContent = "";


    // 
    // SAME CURRENCY
    // 

    if (from === to) {

        result.textContent = amount.toFixed(2);

        exchangeRate.textContent =
            `1 ${from} = 1 ${to}`;

        return;
    }


    // 
    // GET STORED / FRESH RATES
    // 

    try {

        // Show loading state
        result.textContent = "Loading...";
        exchangeRate.textContent = "";


        const rates = await getExchangeRates();


        // 
        // GET CURRENCY RATES
        // 

        const fromRate = rates[from];
        const toRate = rates[to];


        // Check currencies
        if (!fromRate || !toRate) {
            throw new Error("Currency is not supported.");
        }


        // 
        // CALCULATE EXCHANGE RATE
        // 

        const rate = toRate / fromRate;


        // 
        // CALCULATE RESULT
        // 

        const convertedAmount = amount * rate;


        // 
        // DISPLAY RESULT
        // 

        result.textContent = convertedAmount.toFixed(2);

        exchangeRate.textContent =
            `1 ${from} = ${rate.toFixed(4)} ${to}`;

    }

    catch (error) {

        console.error(error);

        result.textContent = "0.00";

        exchangeRate.textContent = "";

        errorMessage.textContent =
            "Unable to get exchange rates. Please check your connection.";
    }
}


// 
// SWAP CURRENCIES
// 

function swapCurrencies() {

    const temporaryCurrency = fromCurrency.value;

    fromCurrency.value = toCurrency.value;
    toCurrency.value = temporaryCurrency;


    // Convert automatically after swapping
    if (amountInput.value) {
        convertCurrency();
    }
}


// 
// BUTTON EVENTS
// 

convertButton.addEventListener("click", convertCurrency);

swapButton.addEventListener("click", swapCurrencies);


// 
// ENTER KEY
// 

amountInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        convertCurrency();
    }

});
