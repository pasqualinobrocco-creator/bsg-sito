import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      window.location.replace("/site/index.html");
    }
  },
  component: Index,
});

function Index() {
  return (
    <meta httpEquiv="refresh" content="0; url=/site/index.html" />
  );
}
