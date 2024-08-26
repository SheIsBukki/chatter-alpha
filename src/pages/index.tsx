import MainSection from "@/components/MainSection";
import SideSection from "@/components/SideSection";
import WriteFormModal from "@/components/WriteFormModal";
import MainLayout from "@/layouts/MainLayout";

export default function HomePage() {
  return (
    <MainLayout>
      <section className="grid h-full w-full grid-cols-12 place-items-center">
        <MainSection />

        <SideSection />
      </section>

      <WriteFormModal />
    </MainLayout>
  );
}
