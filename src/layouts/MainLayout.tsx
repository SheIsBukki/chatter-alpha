import Header from "@/components/Header";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      {children}
    </div>
  );
}
