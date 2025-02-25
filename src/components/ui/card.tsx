

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
  }

export function Card({ children }: CardProps) {
  return <div className="bg-white p-4 rounded shadow-md">{children}</div>;
}

export function CardHeader({ children }: CardProps) {
  return <div className="font-bold text-lg mb-2">{children}</div>;
}

export function CardContent({ children }: CardProps) {
  return <div>{children}</div>;
}

export function CardTitle({ children }: CardProps) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}
