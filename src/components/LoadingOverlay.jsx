import React from "react";
import { Button, Progress, Typography } from "antd";
import { StopOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * Loading Overlay Component
 * Full-screen glassmorphism overlay with progress tracking and stop functionality
 * Non-dismissible - only closes via Stop button or completion
 */
const LoadingOverlay = ({ visible, progress, onStop }) => {
  if (!visible) return null;

  const percentage = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      {/* Glass Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          margin: "20px",
          padding: "40px 32px",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            inset 0 1px 1px rgba(255, 255, 255, 0.3),
            inset 0 -1px 1px rgba(0, 0, 0, 0.1)
          `,
          textAlign: "center",
          animation: "slideUp 0.4s ease-out",
        }}
      >
        {/* Spinning Dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "28px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "var(--color-primary)",
                borderRadius: "50%",
                animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                boxShadow: "0 0 10px rgba(53, 183, 41, 0.5)",
              }}
            />
          ))}
        </div>

        {/* Title */}
        <Title
          level={4}
          style={{
            margin: "0 0 12px 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "var(--color-text)",
          }}
        >
          Fetching Data
        </Title>

        {/* Current Message */}
        <Text
          style={{
            display: "block",
            fontSize: "14px",
            color: "var(--color-textSecondary)",
            marginBottom: "24px",
            minHeight: "20px",
          }}
        >
          {progress.message || "Initializing..."}
        </Text>

        {/* Progress Bar */}
        <div style={{ marginBottom: "12px" }}>
          <Progress
            percent={percentage}
            strokeColor={{
              "0%": "#52c41a",
              "100%": "#35b729",
            }}
            trailColor="rgba(255, 255, 255, 0.1)"
            strokeWidth={10}
            showInfo={false}
          />
        </div>

        {/* Progress Text */}
        <Text
          style={{
            display: "block",
            fontSize: "13px",
            color: "var(--color-textSecondary)",
            marginBottom: "28px",
          }}
        >
          {progress.current} of {progress.total} completed ({percentage}%)
        </Text>

        {/* Stop Button */}
        <Button
          danger
          size="large"
          icon={<StopOutlined />}
          onClick={onStop}
          style={{
            width: "100%",
            height: "44px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          Stop
        </Button>

        {/* Info Text */}
        <Text
          style={{
            display: "block",
            fontSize: "11px",
            color: "var(--color-textTertiary)",
            marginTop: "16px",
          }}
        >
          Click Stop to cancel and return to organization selection
        </Text>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
