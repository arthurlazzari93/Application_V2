import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
// Importe o ProtectedRoute para envolver suas rotas
import ProtectedRoute from "components/ProtectedRoute.jsx";

// Core components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";

function Admin() {
  const [sidenavOpen, setSidenavOpen] = React.useState(true);
  const location = useLocation();
  const mainContentRef = React.useRef(null);

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContentRef.current.scrollTop = 0;
  }, [location]);

  /**
   * Mapeia as rotas que pertencem ao layout "/admin"
   * e retorna <Route path="..." element="..." />
   */
  const getRoutes = (allRoutes) => {
    return allRoutes.map((prop, key) => {
      // Se for um grupo de rotas em "collapse", chama recursivamente
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      // Se o layout for "/admin", gera a rota
      if (prop.layout === "/admin") {
        return (
          <Route
            path={prop.path}          // Ex: "dashboard"
            element={prop.component}  // Ex: <Dashboard />
            key={key}
          />
        );
      }
      return null;
    });
  };

  /**
   * Retorna o título da página atual (usado na navbar), 
   * caso você queira exibir um texto diferente em cada rota
   */
  const getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "Brand";
  };

  // Alterna entre abrir/fechar sidebar no mobile
  const toggleSidenav = () => {
    if (document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-pinned");
      document.body.classList.add("g-sidenav-hidden");
    } else {
      document.body.classList.add("g-sidenav-pinned");
      document.body.classList.remove("g-sidenav-hidden");
    }
    setSidenavOpen(!sidenavOpen);
  };

  // Altera a cor do Navbar dependendo da rota
  const getNavbarTheme = () => {
    return location.pathname.indexOf("admin/alternative-dashboard") === -1
      ? "dark"
      : "light";
  };

  return (
    <>
      {/* Sidebar lateral */}
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
      {/* Conteúdo principal */}
      <div className="main-content" ref={mainContentRef}>
        <AdminNavbar
          theme={getNavbarTheme()}
          toggleSidenav={toggleSidenav}
          sidenavOpen={sidenavOpen}
          brandText={getBrandText(location.pathname)}
        />

        {/*
          Envolvemos as rotas de /admin com <ProtectedRoute />.
          Assim, se o usuário não estiver autenticado, 
          <ProtectedRoute /> redireciona para /auth/login
        */}
        <Routes>
          {/* Tudo dentro deste <Route> será protegido */}
          <Route element={<ProtectedRoute />}>
            {getRoutes(routes)}

            {/* Se não achar nenhuma rota, redireciona para /admin/dashboard */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>

        <AdminFooter />
      </div>
      {sidenavOpen ? (
        <div className="backdrop d-xl-none" onClick={toggleSidenav} />
      ) : null}
    </>
  );
}

export default Admin;
