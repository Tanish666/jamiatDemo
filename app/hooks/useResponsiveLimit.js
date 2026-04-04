import { useState, useEffect } from "react";

export default function useResponsiveLimit() {
  const [limit, setLimit] = useState(3);

  useEffect(() => {
    function updateLimit() {
      const width = window.innerWidth;

      if (width < 480) setLimit(3);           // small mobile
      else if (width <= 1024) setLimit(6);    // mobiles, tablets and small laptops (13")
      else if (width <= 1440) setLimit(9);    // large desktops and laptops (15")
      else setLimit(12);                      // very large screens (4k)
    }

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  return limit;
}
