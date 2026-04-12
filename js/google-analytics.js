// Google tag (gtag.js)
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "G-F9K5TF8SZF", {
  custom_map: {
    dimension1: "user_type",
    dimension2: "wallet_connected",
    dimension3: "device_type",
  },
});

// Track navigation events - using a separate closure to avoid conflicts
document.addEventListener("DOMContentLoaded", function () {
  // Wait for the main JS to initialize first
  setTimeout(function () {
    // Track section navigation
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        // Use setTimeout to ensure original event handlers run first
        setTimeout(() => {
          const sectionName =
            this.getAttribute("href").split("#")[1] ||
            this.dataset.section ||
            "external-page";
          gtag("event", "section_navigation", {
            section_name: sectionName,
            navigation_type: "menu_click",
            event_category: "Navigation",
            event_label: sectionName,
          });
        }, 10);
      });
    });

    // Track persistent button clicks
    const actionButtons = document.querySelectorAll(".action-button");
    actionButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const buttonText =
          this.querySelector(".btn-text")?.textContent || "Unknown";
        gtag("event", "action_button_click", {
          button_name: buttonText,
          current_section: getCurrentSection(),
          event_category: "Engagement",
          event_label: buttonText,
        });
      });
    });

    // Track copy address button click
    const copyBtn = document.querySelector(".copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        gtag("event", "copy_token_address", {
          current_section: getCurrentSection(),
          event_category: "Engagement",
          event_label: "Copy Address",
        });
      });
    }

    // Track gallery interactions
    const galleryContainer = document.querySelector(".gallery-grid");
    if (galleryContainer) {
      galleryContainer.addEventListener("click", function (e) {
        const galleryItem = e.target.closest(".gallery-item");
        if (galleryItem) {
          const itemType = galleryItem.dataset.type || "image";
          const itemSrc = galleryItem.dataset.src || "unknown";
          gtag("event", "gallery_item_view", {
            item_type: itemType,
            item_src: itemSrc.split("/").pop(),
            event_category: "Gallery",
            event_label: itemSrc.split("/").pop(),
            value: 1,
          });
        }
      });
    }

    // Track filter button clicks in gallery
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const filterValue = this.dataset.filter || "all";
        gtag("event", "gallery_filter", {
          filter_value: filterValue,
          event_category: "Gallery",
          event_label: filterValue,
          value: 1,
        });
      });
    });

    // Track outbound links
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      link.addEventListener("click", function () {
        gtag("event", "outbound_link_click", {
          link_url: this.href,
          link_text: this.textContent.trim(),
          event_category: "Outbound",
          event_label: this.href,
        });
      });
    });

    // Track errors
    window.addEventListener("error", function (e) {
      gtag("event", "error", {
        error_message: e.message,
        error_source: e.filename,
        error_line: e.lineno,
        error_column: e.colno,
        event_category: "Error",
        event_label: e.message,
      });
    });

    // Track performance metrics
    if (window.performance && window.performance.timing) {
      window.addEventListener("load", function () {
        const timing = window.performance.timing;
        const pageLoadTime =
          timing.domContentLoadedEventEnd - timing.navigationStart;
        const domLoadTime = timing.domComplete - timing.domLoading;
        const resourceLoadTime =
          timing.loadEventEnd - timing.domContentLoadedEventEnd;

        gtag("event", "performance_metrics", {
          page_load_time: pageLoadTime,
          dom_load_time: domLoadTime,
          resource_load_time: resourceLoadTime,
          event_category: "Performance",
          event_label: "Page Load",
        });
      });
    }

    // Track session duration
    let sessionStart = Date.now();
    window.addEventListener("beforeunload", function () {
      const sessionDuration = Date.now() - sessionStart;
      gtag("event", "session_end", {
        session_duration: sessionDuration,
        event_category: "Session",
        event_label: "Session End",
      });
    });

    // Helper function to get current section
    function getCurrentSection() {
      const activeSection = document.querySelector(".vr-section.active");
      return activeSection ? activeSection.id : "unknown";
    }

    // Track scrolling depth on each section
    const sections = document.querySelectorAll(".vr-section");
    sections.forEach((section) => {
      let maxScrollPercentage = 0;

      section.addEventListener("scroll", function () {
        const scrollPosition = this.scrollTop;
        const scrollHeight = this.scrollHeight - this.clientHeight;

        if (scrollHeight <= 0) return; // Prevent division by zero

        const scrollPercentage = Math.floor(
          (scrollPosition / scrollHeight) * 100
        );

        // Only track if we've scrolled further than before
        if (
          scrollPercentage > maxScrollPercentage &&
          scrollPercentage % 25 === 0
        ) {
          maxScrollPercentage = scrollPercentage;
          gtag("event", "scroll_depth", {
            section_id: this.id,
            scroll_percentage: scrollPercentage,
            event_category: "Engagement",
            event_label: this.id,
            value: scrollPercentage,
          });
        }
      });
    });
  }, 1000); // Delay tracking initialization to ensure main JS runs first
});
