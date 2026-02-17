import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { useState, useEffect } from "react";

function DevErrorBoundary() {
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const onError = (msg: any, url?: string, line?: number, col?: number, err?: Error) => {
			const message = err?.stack || `${msg} at ${url}:${line}:${col}`;
			console.error("Global error:", message);
			setError(String(message));
			return false;
		};

		const onRejection = (e: PromiseRejectionEvent) => {
			console.error("Unhandled rejection:", e.reason);
			setError(String(e.reason));
		};

		// @ts-ignore - attach global handlers for dev visibility
		window.onerror = onError;
		window.onunhandledrejection = onRejection;

		return () => {
			// cleanup
			// @ts-ignore
			window.onerror = null;
			// @ts-ignore
			window.onunhandledrejection = null;
		};
	}, []);

	if (error) {
		return (
			<div style={{ padding: 20 }}>
				<div style={{ background: "#fff6f6", border: "1px solid #f5c2c7", color: "#842029", padding: 16, borderRadius: 8 }}>
					<h2 style={{ margin: 0, marginBottom: 8 }}>Runtime Error</h2>
					<pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{error}</pre>
				</div>
			</div>
		);
	}

	return <App />;
}

createRoot(document.getElementById("root")!).render(<DevErrorBoundary />);
