
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PageContainer } from "./_components/PageContainer";


export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageContainer>
        {children}
      </PageContainer>
      <Footer />
    </div>
  );
}
