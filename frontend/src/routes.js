/*!

=========================================================
* Argon Dashboard PRO React - v1.2.5
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Alternative from "views/pages/dashboards/Alternative.js";
import Buttons from "views/pages/components/Buttons.js";
import Calendar from "views/pages/Calendar.js";
import Cards from "views/pages/components/Cards.js";
import Charts from "views/pages/Charts.js";
import Components from "views/pages/forms/Components.js";
import Dashboard from "views/pages/dashboards/Dashboard.js";
import Elements from "views/pages/forms/Elements.js";
import Google from "views/pages/maps/Google.js";
import Grid from "views/pages/components/Grid.js";
import Icons from "views/pages/components/Icons.js";
import Lock from "views/pages/examples/Lock.js";
import Login from "views/pages/examples/Login.js";
import Notifications from "views/pages/components/Notifications.js";
import Pricing from "views/pages/examples/Pricing.js";
import Profile from "views/pages/examples/Profile.js";
import ReactBSTables from "views/pages/tables/ReactBSTables.js";
import Register from "views/pages/examples/Register.js";
import Sortable from "views/pages/tables/Sortable.js";
import Tables from "views/pages/tables/Tables.js";
import Timeline from "views/pages/examples/Timeline.js";
import Typography from "views/pages/components/Typography.js";
import Validation from "views/pages/forms/Validation.js";
import Vector from "views/pages/maps/Vector.js";
import Widgets from "views/pages/Widgets.js";

import TesteAPI from './views/pages/TesteAPI';


import Consultores from "views/pages/cadastros/ConsultoresList";
import Planos from "views/pages/cadastros/PlanosList";
import Vendas from "views/pages/cadastros/VendasList";
import ControleRecebimentoPanel from "views/pages/gestao_de_vendas/ControleRecebimentoPanel";
import Indicadores from "views/pages/dashboards/Indicadores.js";
import IndicadoresV2 from "views/pages/dashboards/Indicadoresv2";

const routes = [
  {
    collapse: true,
    name: "DASHBOARD",
    icon: "ni ni-chart-pie-35 text-primary",
    state: "dashboardsCollapse",
    views: [
      {
        path: "/indicadores",
        name: "Dashboard Lazzari",
        miniName: "DL",
        component: <Indicadores />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/indicadoresV2",
        name: "Indicadores",
        miniName: "DL",
        component: <IndicadoresV2 />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/dashboard",
        name: "Dashboard",
        miniName: "D",
        component: <Dashboard />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/alternative-dashboard",
        name: "Alternative",
        miniName: "A",
        component: <Alternative />,
        layout: "/admin",
        protected: true,
      },
    ],
  },

  {
    collapse: true,
    name: "COMISSIONAMENTO",
    icon: "ni ni-diamond text-primary",
    state: "gestaodecomissoesCollapse",
    views: [
      {
        path: "/ControleRecebimentoPanel",
        name: "Controle de Vendas",
        miniName: "CV",
        component: <ControleRecebimentoPanel />,
        layout: "/admin",
        protected: true,
      },
    ],
  },

  {
    collapse: true,
    name: "CADASTROS",
    icon: "ni ni-collection text-pink",
    state: "formsCollapse",
    views: [
      {
        path: "/consultores",
        name: "Consultores",
        miniName: "Co",
        component: <Consultores />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/planos",
        name: "Planos",
        miniName: "P",
        component: <Planos />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/vendas",
        name: "Vendas",
        miniName: "V",
        component: <Vendas />,
        layout: "/admin",
        protected: true,
      },

    ],
  },

  {
    collapse: true,
    name: "Examples",
    icon: "ni ni-ungroup text-orange",
    state: "examplesCollapse",
    views: [
      {
        path: "/pricing",
        name: "Pricing",
        miniName: "P",
        component: <Pricing />,
        layout: "/auth",
        protected: true,
      },
      {
        path: "/elements",
        name: "Elements",
        miniName: "E",
        component: <Elements />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/components",
        name: "Components",
        miniName: "C",
        component: <Components />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/validation",
        name: "Validation",
        miniName: "V",
        component: <Validation />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/login",
        name: "Login",
        miniName: "L",
        component: <Login />,
        layout: "/auth",
        protected: true,
      },
      {
        path: "/register",
        name: "Register",
        miniName: "R",
        component: <Register />,
        layout: "/auth",
        protected: true,
      },
      {
        path: "/lock",
        name: "Lock",
        miniName: "L",
        component: <Lock />,
        layout: "/auth",
        protected: true,
      },
      {
        path: "/timeline",
        name: "Timeline",
        miniName: "T",
        component: <Timeline />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/profile",
        name: "Profile",
        miniName: "P",
        component: <Profile />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/teste-api",
        name: "Teste API",
        miniName: "RS",
        component: <TesteAPI />,
        layout: "/admin",
        protected: true,
      },
    ],
  },
  {
    collapse: true,
    name: "Components",
    icon: "ni ni-ui-04 text-info",
    state: "componentsCollapse",
    views: [
      {
        path: "/buttons",
        name: "Buttons",
        miniName: "B",
        component: <Buttons />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/cards",
        name: "Cards",
        miniName: "C",
        component: <Cards />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/grid",
        name: "Grid",
        miniName: "G",
        component: <Grid />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/notifications",
        name: "Notifications",
        miniName: "N",
        component: <Notifications />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/icons",
        name: "Icons",
        miniName: "I",
        component: <Icons />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/typography",
        name: "Typography",
        miniName: "T",
        component: <Typography />,
        layout: "/admin",
        protected: true,
      },
      {
        collapse: true,
        name: "Multi Level",
        miniName: "M",
        state: "multiCollapse",
        views: [
          {
            path: "#pablo",
            name: "Third level menu",
            component: () => { },
            layout: "/",
          },
          {
            path: "#pablo",
            name: "Just another link",
            component: () => { },
            layout: "/",
          },
          {
            path: "#pablo",
            name: "One last link",
            component: () => { },
            layout: "/",
          },
        ],
      },
    ],
  },

  {
    collapse: true,
    name: "Tables",
    icon: "ni ni-align-left-2 text-default",
    state: "tablesCollapse",
    views: [
      {
        path: "/tables",
        name: "Tables",
        miniName: "T",
        component: <Tables />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/sortable",
        name: "Sortable",
        miniName: "S",
        component: <Sortable />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/react-bs-table",
        name: "React BS Tables",
        miniName: "RBT",
        component: <ReactBSTables />,
        layout: "/admin",
        protected: true,
      },
    ],
  },
  {
    collapse: true,
    name: "Maps",
    icon: "ni ni-map-big text-primary",
    state: "mapsCollapse",
    views: [
      {
        path: "/google",
        name: "Google",
        miniName: "G",
        component: <Google />,
        layout: "/admin",
        protected: true,
      },
      {
        path: "/vector",
        name: "Vector",
        miniName: "V",
        component: <Vector />,
        layout: "/admin",
        protected: true,
      },
    ],
  },
  {
    path: "/widgets",
    name: "Widgets",
    icon: "ni ni-archive-2 text-green",
    component: <Widgets />,
    layout: "/admin",
    protected: true,
  },
  {
    path: "/charts",
    name: "Charts",
    icon: "ni ni-chart-pie-35 text-info",
    component: <Charts />,
    layout: "/admin",
    protected: true,
  },
  {
    path: "/calendar",
    name: "Calendar",
    icon: "ni ni-calendar-grid-58 text-red",
    component: <Calendar />,
    layout: "/admin",
    protected: true,
  },
];

export default routes;
