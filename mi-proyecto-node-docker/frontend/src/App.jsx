import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Registro from './pages/Registro';
import Login from './pages/Login';
import ConfigurarPerfil from './pages/ConfigurarPerfil';
import Perfil from './pages/Perfil';
import MisOfertas from './pages/MisOfertas';
import PublicarOferta from './pages/PublicarOferta';
import VerOfertas from './pages/VerOfertas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/configurar-perfil" element={<ConfigurarPerfil />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/mis-ofertas" element={<MisOfertas />} />
        <Route path="/publicar-oferta" element={<PublicarOferta />} />
        <Route path="/editar-oferta/:id" element={<PublicarOferta />} />
        <Route path="/ver-ofertas" element={<VerOfertas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;