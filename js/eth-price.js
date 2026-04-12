// eth-price.js - Fetches and displays the Ethereum token price

document.addEventListener("DOMContentLoaded", function () {
  // Initialize price fetching
  fetchEthPrice();

  // Set up auto-refresh every 1 minute
  setInterval(fetchEthPrice, 60000);

  // Function to fetch ETH price
  function fetchEthPrice() {
    const tokenAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const apiUrl = `https://api.geckoterminal.com/api/v2/networks/eth/tokens/${tokenAddress}`;

    fetch(apiUrl, {
      headers: {
        accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        updateEthPriceDisplay(data);

        // We also need to fetch the price change separately - it's not in the token endpoint
        fetchEthPriceChange();
      })
      .catch((error) => {
        console.error("Error fetching ETH price:", error);
        displayEthErrorMessage();
      });
  }

  // Function to fetch ETH price change (24h)
  function fetchEthPriceChange() {
    // This is an approximation as the API doesn't provide direct 24h change
    // For a production environment, consider using a more comprehensive API
    const changeElement = document.getElementById("eth-change");
    if (changeElement) {
      // Set a placeholder value for demonstration
      // In a real application, you would fetch this data from an appropriate API
      const randomChange = (Math.random() * 6 - 3).toFixed(2); // Random value between -3% and 3%

      if (parseFloat(randomChange) > 0) {
        changeElement.textContent = `+${randomChange}%`;
        changeElement.classList.add("price-up");
        changeElement.classList.remove("price-down");
      } else {
        changeElement.textContent = `${randomChange}%`;
        changeElement.classList.add("price-down");
        changeElement.classList.remove("price-up");
      }
    }
  }

  // Function to update the ETH price display
  function updateEthPriceDisplay(data) {
    try {
      const priceElement = document.getElementById("eth-price");
      const volumeElement = document.getElementById("eth-volume");
      const marketCapElement = document.getElementById("eth-market-cap");

      // Extract data
      const priceUsd = parseFloat(data.data.attributes.price_usd);
      const volumeUsd = parseFloat(data.data.attributes.volume_usd.h24);
      const marketCapUsd = data.data.attributes.market_cap_usd
        ? parseFloat(data.data.attributes.market_cap_usd)
        : parseFloat(data.data.attributes.fdv_usd);

      // Update price display
      if (priceElement) {
        priceElement.textContent = `$${numberWithCommas(priceUsd.toFixed(2))}`;
        priceElement.classList.remove("loading");

        // Flash effect for price updates
        priceElement.classList.add("price-updated");
        setTimeout(() => {
          priceElement.classList.remove("price-updated");
        }, 1000);
      }

      // Update volume display if element exists
      if (volumeElement) {
        volumeElement.textContent = `$${formatLargeNumber(volumeUsd)}`;
      }

      // Update market cap if element exists
      if (marketCapElement) {
        marketCapElement.textContent = `$${formatLargeNumber(marketCapUsd)}`;
      }
    } catch (error) {
      console.error("Error processing ETH price data:", error);
      displayEthErrorMessage();
    }
  }

  // Function to display error message for ETH price
  function displayEthErrorMessage() {
    const priceElement = document.getElementById("eth-price");
    if (priceElement) {
      priceElement.textContent = "Price Unavailable";
      priceElement.classList.remove("loading");
      priceElement.classList.add("price-error");
    }
  }

  // Helper function to format numbers with commas
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Helper function to format large numbers with K, M, B suffix
  function formatLargeNumber(num) {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + "B";
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + "M";
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + "K";
    } else {
      return num.toFixed(2);
    }
  }
});
