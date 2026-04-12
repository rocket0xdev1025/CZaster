// token-price.js - Fetches and displays the Captain Ethereum token price

document.addEventListener("DOMContentLoaded", function () {
  // Initialize price fetching
  fetchTokenPrice();

  // Set up auto-refresh every 1 minute
  setInterval(fetchTokenPrice, 60000);

  // Function to fetch token price
  function fetchTokenPrice() {
    const tokenAddress = "0x9af595C8fc201e82Db65FAef71D51365d7F11B5f";
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
        updatePriceDisplay(data);
      })
      .catch((error) => {
        console.error("Error fetching token price:", error);
        displayErrorMessage();
      });
  }

  // Function to update the price display
  function updatePriceDisplay(data) {
    try {
      const priceElement = document.getElementById("token-price");
      const volumeElement = document.getElementById("token-volume");
      const fdvElement = document.getElementById("token-fdv");
      const liquidityElement = document.getElementById("token-liquidity");

      // Extract data
      const priceUsd = parseFloat(data.data.attributes.price_usd);
      const volumeUsd = parseFloat(data.data.attributes.volume_usd.h24);
      const fdvUsd = parseFloat(data.data.attributes.fdv_usd);
      const totalReserveUsd = parseFloat(
        data.data.attributes.total_reserve_in_usd
      );

      // Format price with appropriate decimal places based on value
      let formattedPrice;
      if (priceUsd < 0.00001) {
        formattedPrice = priceUsd.toFixed(10);
      } else if (priceUsd < 0.0001) {
        formattedPrice = priceUsd.toFixed(8);
      } else if (priceUsd < 0.01) {
        formattedPrice = priceUsd.toFixed(6);
      } else {
        formattedPrice = priceUsd.toFixed(4);
      }

      // Update price display
      if (priceElement) {
        priceElement.textContent = `$${formattedPrice}`;
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

      // Update FDV (Fully Diluted Valuation) if element exists
      if (fdvElement) {
        fdvElement.textContent = `$${formatLargeNumber(fdvUsd)}`;
      }

      // Update Liquidity if element exists
      if (liquidityElement) {
        liquidityElement.textContent = `$${formatLargeNumber(totalReserveUsd)}`;
      }
    } catch (error) {
      console.error("Error processing price data:", error);
      displayErrorMessage();
    }
  }

  // Function to display error message
  function displayErrorMessage() {
    const priceElement = document.getElementById("token-price");
    if (priceElement) {
      priceElement.textContent = "Price Unavailable";
      priceElement.classList.remove("loading");
      priceElement.classList.add("price-error");
    }
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
