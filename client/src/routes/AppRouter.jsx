import { Routes, Route } from 'react-router-dom';
import MainRoute from './MainRoute';
import AuthRoute from './AuthRoute'



export default function AppRouter() {
  return (
    <Routes>
      {[...AuthRoute(), ...MainRoute()]}
      <Route path="*" element={<h1>Sorry!!</h1>} />
    </Routes>
  );
}
