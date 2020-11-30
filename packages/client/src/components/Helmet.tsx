import ReactHelmet from "react-helmet";

const T = "3d-deps";

export const Helmet = ({ title }: { title?: string }) => {
  const t = [T, title].filter(Boolean).join(" | ");
  return (
    <ReactHelmet>
      <title>{t}</title>
    </ReactHelmet>
  );
};
