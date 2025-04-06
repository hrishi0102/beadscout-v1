// client/src/App.jsx
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [etsyUrl, setEtsyUrl] = useState("");
  const [listingData, setListingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const extractListingId = (urlString) => {
    if (!urlString) return null;
    try {
      const match = urlString.match(/listing\/(\d+)/i);
      console.log("Extracted listing ID:", match);
      return match ? match[1] : null;
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setListingData(null);

    const listingId = extractListingId(etsyUrl);
    if (!listingId) {
      setError(
        "Invalid Etsy Listing URL format. Please ensure it contains '/listing/...' followed by numbers."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get(
        "http://localhost:3001/api/listing-details",
        {
          params: { url: etsyUrl },
        }
      );
      setListingData(response.data);
    } catch (err) {
      console.error("Error fetching from backend:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(
          `Error: ${err.response.data.message} ${
            err.response.data.error ? `(${err.response.data.error})` : ""
          }`
        );
      } else {
        setError(
          "Failed to fetch listing data. Check the console or backend server logs."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 border border-gray-200 rounded-lg shadow-md bg-white font-sans">
      <h1 className="text-2xl font-bold mb-5 text-center text-gray-800">
        Etsy Listing Viewer
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 mb-6"
      >
        <input
          type="text"
          value={etsyUrl}
          onChange={(e) => setEtsyUrl(e.target.value)}
          placeholder="Paste Etsy Listing URL here"
          required
          className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {isLoading ? "Loading..." : "Get Details"}
        </button>
      </form>

      {error && (
        <div
          className="mt-4 p-3 border border-red-400 bg-red-100 text-red-700 rounded-md text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {listingData && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">
            {listingData.title}
          </h2>

          {/* Image Display */}
          {listingData.images && listingData.images.length > 0 && (
            <img
              // Using the first image's full size URL. Check API response for other sizes like url_570xN etc.
              src={listingData.images[0].url_fullxfull}
              alt={listingData.title}
              className="block mb-4 rounded-lg shadow-sm max-w-sm h-auto mx-auto border border-gray-100" // Centered image with max width
            />
          )}

          {/* Details Section */}
          <div className="text-gray-700 space-y-2">
            <p>
              <strong className="font-medium text-gray-800">Price:</strong>{" "}
              {listingData.price?.amount / 100}{" "}
              {listingData.price?.currency_code}
            </p>
            <p>
              <strong className="font-medium text-gray-800">
                Quantity Available:
              </strong>{" "}
              {listingData.quantity}
            </p>

            {/* Description */}
            <div>
              <strong className="font-medium text-gray-800 block mb-1">
                Description:
              </strong>
              {/* Using dangerouslySetInnerHTML can be risky if description contains malicious scripts.
                     Consider sanitizing the HTML string on the backend or using a safer rendering method
                     if the source isn't fully trusted or if you need more complex rendering.
                     Replacing newlines with <br> for basic formatting. */}
              <div
                className="text-gray-600 text-sm leading-relaxed whitespace-pre-line" // Preserves line breaks
                dangerouslySetInnerHTML={{
                  __html:
                    listingData.description || "No description available.",
                }}
              />
            </div>

            {/* Link to Etsy */}
            <p className="pt-3">
              <a
                href={listingData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-orange-600 hover:text-orange-800 hover:underline transition duration-150 ease-in-out"
              >
                View on Etsy &rarr;
              </a>
            </p>
          </div>

          {/* Optional: Raw JSON Output for Debugging */}
          {/* <details className="mt-6">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">View Raw API Data</summary>
            <pre className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(listingData, null, 2)}
            </pre>
          </details> */}
        </div>
      )}
    </div>
  );
}

export default App;
