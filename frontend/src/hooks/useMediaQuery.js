import { useState, useEffect } from "react";

// Reactively tracks a CSS media query, e.g. useMediaQuery("(min-width: 900px)").
// Returns true while the query matches and updates on viewport changes.
export default function useMediaQuery(query) {
    const [matches, setMatches] = useState(
        () => window.matchMedia(query).matches,
    );

    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, [query]);

    return matches;
}
