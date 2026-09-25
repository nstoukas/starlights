import { SiteFooter } from "@/components/site-footer";
import { Outlet } from "react-router-dom";
import { Header, LandingBackground3 } from "./pages/layouts/default-layout";

function App() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4">
        <LandingBackground3 />
        <main className="mt-12">
          <Outlet />
        </main>
      </div>
      <SiteFooter />
    </>
  );
}

function AppWide() {
  return (
    <>
      <Header />
      <main>
        <LandingBackground3 />
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
export { AppWide };
export default App;
