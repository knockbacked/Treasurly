type Props = {
    title: string;
  };
  
  export default function AuthHeader({ title }: Props) {
    return (
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
    );
  }
  