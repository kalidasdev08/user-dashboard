import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import { getToken } from "./services/authService";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [showRegister, setShowRegister] = useState(false);

  if (!loggedIn) {
    return showRegister ? (
      <Register onSwitch={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={() => setLoggedIn(true)} onSwitch={() => setShowRegister(true)} />
    );
  }

  return <Dashboard />;
}

export default App;
