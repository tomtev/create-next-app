import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Get query parameters with fallbacks
    const title = searchParams.get("title") || "Page.fun";
    const description =
      searchParams.get("description") || "Your personalized web3 page";
    const imageUrl = searchParams.get("image") || "";

    // Get theme values with fallbacks
    const themeName = searchParams.get("theme") || "default";
    const primaryColor = searchParams.get("primaryColor") || "#3B82F6";
    const secondaryColor = searchParams.get("secondaryColor") || "#1D4ED8";
    const backgroundColor =
      searchParams.get("backgroundColor") ||
      (themeName === "dark" || themeName === "modern" ? "#121212" : "#f8fafc");
    const textColor =
      searchParams.get("textColor") ||
      (themeName === "dark" || themeName === "modern" ? "#ffffff" : "#1E293B");

    // Determine gradient based on theme
    let backgroundGradient = `linear-gradient(to bottom right, ${backgroundColor}, ${
      backgroundColor === "#f8fafc" ? "#e2e8f0" : backgroundColor
    })`;
    let titleGradient = null;
    let cardBackground = "white";
    let cardBorderStyle = "0";

    // Apply theme-specific styles
    if (themeName === "modern" || themeName === "solana") {
      titleGradient =
        "linear-gradient(to right, #9945FF 8%, #8752F3 30%, #5497D5 50%, #43B4CA 60%, #28E0B9 72%, #19FB9B 97%)";
      cardBackground = backgroundColor;
      cardBorderStyle = "2px solid rgba(255, 255, 255, 0.1)";
    } else if (themeName === "terminal") {
      cardBackground = "#000000";
      cardBorderStyle = "5px solid #00e653";
    } else if (themeName === "pixel") {
      cardBorderStyle = "5px solid #000000";
    } else if (themeName === "dark") {
      cardBackground = "#000000";
      cardBorderStyle = "1px solid rgba(255, 255, 255, 0.1)";
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: backgroundColor,
            backgroundImage: backgroundGradient,
            padding: "40px",
          }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",           
              position: "relative",
              overflow: "hidden",
            }}>
            {imageUrl && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "24px",
                  width: "100%",
                }}>
                <img
                  src={imageUrl}
                  alt={title}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: themeName === "pixel" ? "0px" : "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    border: themeName === "pixel" ? "5px solid #000" : "none",
                  }}
                />
              </div>
            )}

            <h1
              style={{
                fontSize: "52px",
                fontWeight: "bolder",
                color: titleGradient ? "transparent" : textColor,
                backgroundImage: titleGradient || "none",
                backgroundClip: titleGradient ? "text" : "border-box",
                WebkitBackgroundClip: titleGradient ? "text" : "border-box",
                textAlign: "center",
                margin: "0 0 16px 0",
                maxWidth: "80%",
                lineHeight: 1.2,
              }}>
              {title}
            </h1>

            <p
              style={{
                fontSize: "32px",
                color:
                  themeName === "terminal"
                    ? "#00e653"
                    : textColor === "#1E293B"
                    ? "#64748B"
                    : textColor,
                textAlign: "center",
                margin: 0,
                maxWidth: "70%",
                lineHeight: 1.5,
              }}>
              {description}
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
