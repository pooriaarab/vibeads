import React from "react";

// Shared wrapper for every scene-5 placement: a full-bleed centred layer whose
// opacity is driven by the placement's own fade in/out curve.
export const PlacementFrame: React.FC<{
  o: number;
  children: React.ReactNode;
}> = ({ o, children }) => {
  return (
    <div style={{ opacity: o, position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </div>
  );
};
