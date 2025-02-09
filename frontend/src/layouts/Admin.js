import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "components/ProtectedRoute.jsx";

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";

function Admin() {
  const [sidenavOpen, setSidenavOpen] = React.useState(true);
  const location = useLocation();
  const mainContentRef = React.useRef(null);

  // useEffect para sincronizar as classes do body com o estado do sidebar
  React.useEffect(() => {
    if (sidenavOpen) {
      document.body.classList.add("g-sidenav-pinned");
      document.body.classList.remove("g-sidenav-hidden");
    } else {
      document.body.classList.remove("g-sidenav-pinned");
      document.body.classList.add("g-sidenav-hidden");
    }
  }, [sidenavOpen]);

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [location]);

  /**
   * Mapeia as rotas que pertencem ao layout "/admin"
   */
  const getRoutes = (allRoutes) => {
    return allRoutes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (prop.layout === "/admin") {
        return (
          <Route
            path={prop.path}
            element={prop.component}
            key={key}
          />
        );
      }
      return null;
    });
  };

  /**
   * Retorna o título da página atual para exibição na navbar
   */
  const getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "Brand";
  };

  // Função que apenas alterna o estado; o useEffect cuida das classes no body
  const toggleSidenav = () => {
    setSidenavOpen((prevState) => !prevState);
  };

  // Define o tema da navbar com base na rota
  const getNavbarTheme = () => {
    return location.pathname.indexOf("admin/alternative-dashboard") === -1
      ? "dark"
      : "light";
  };

  return (
    <>
      <Sidebar
        routes={routes}
        toggleSidenav={toggleSidenav}
        sidenavOpen={sidenavOpen}
        logo={{
          innerLink: "/",
          imgSrc: require("assets/img/brand/argon-react.png"),
          imgAlt: "...",
        }}
      />
      <div className="main-content" ref={mainContentRef}>
        <AdminNavbar
          theme={getNavbarTheme()}
          toggleSidenav={toggleSidenav}
          sidenavOpen={sidenavOpen}
          brandText={getBrandText(location.pathname)}
        />

        <Routes>
          <Route element={<ProtectedRoute />}>
            {getRoutes(routes)}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>

        <AdminFooter />
      </div>
      {sidenavOpen && (
        <div className="backdrop d-xl-none" onClick={toggleSidenav} />
      )}
    </>
  );
}

export default Admin;
