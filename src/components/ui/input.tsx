export function Input({ type = "text", ...props }) {
    return <input type={type} className="border px-3 py-2 rounded w-full" {...props} />;
  }
  