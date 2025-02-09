
/*eslint-disable*/
import React from "react";
// react library for routing
// core components
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import AuthFooter from "components/Footers/AuthFooter.js";
import Login from "views/pages/examples/Login.js";
function Index() {
  return (
    <>
      <IndexNavbar />
      <Login />
      <AuthFooter />
    </>
  );
}

export default Index;
