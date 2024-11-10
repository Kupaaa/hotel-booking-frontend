import React, { useState, useRef, useEffect } from "react";
import { Button } from "@mui/material";

// TruncateText Component to show a truncated text with a "Show More" button
function TruncateText({ text, limit = 100 }) {
  // State to manage whether the text is expanded or truncated
  const [isExpanded, setIsExpanded] = useState(false);

  // Ref to track the component and detect clicks outside it
  const textRef = useRef(null);

  // Function to toggle the expanded state
  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  // useEffect to handle clicks outside the component and collapse text
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the component, collapse the text
      if (textRef.current && !textRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    // Add event listener for mouse clicks
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener when the component is unmounted
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array ensures this runs only once after component mount

  // Determine the text to display based on whether it's expanded or not
  const displayText = isExpanded ? text : text.slice(0, limit);

  return (
    <div
      ref={textRef}
      style={{ display: "inline-block", marginBottom: "10px" }}
    >
      {/* Display the truncated or expanded text */}
      <p style={{ display: "inline" }}>{displayText}</p>

      {/* Only show the "Show More" button if the text length exceeds the limit */}
      {text.length > limit && !isExpanded && (
        <>
          {/* Display the ellipsis with the button on the same line */}
          <span>...</span>
          <Button
            onClick={toggleExpanded} // Toggle the expanded state on button click
            size="small"
            aria-expanded={isExpanded} // Accessible attribute for expanded state
            aria-label={isExpanded ? "Show less text" : "Show more text"} // For accessibility, change label based on state
            style={{ marginLeft: "5px" }}
          >
            Show More
          </Button>
        </>
      )}

      {/* Display "Show Less" if text is expanded */}
      {isExpanded && text.length > limit && (
        <Button
          onClick={toggleExpanded} // Toggle the expanded state on button click
          size="small"
          aria-expanded={isExpanded} // Accessible attribute for expanded state
          aria-label={isExpanded ? "Show less text" : "Show more text"} // For accessibility, change label based on state
          style={{ marginLeft: "5px" }}
        >
          Show Less
        </Button>
      )}
    </div>
  );
}

export default TruncateText;
