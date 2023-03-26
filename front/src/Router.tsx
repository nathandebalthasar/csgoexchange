import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Error from './pages/Error';
import Consume from './components/Consume';
import Home from './pages/Home';
import Header from './components/Header';
import { useEffect, useState } from 'react';
import { getCookie } from './utils/getCookie';
import axios from "axios";
import Loading from "./components/Loading";
import { Create } from './components/Create';
import { UserTrades } from './pages/UserTrades';

const Router = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [playerData, setPlayerData] = useState(null);
  const [fetching, setFetching] = useState(true);

  const ProtectedRoute = ({children}: any) => {
    if (!authenticated)
      return window.location.href = `${process.env.REACT_APP_API_URL}/login`
    return children;
  };

  useEffect(() => {
    (async () => {
      const cookie = getCookie('userSession');
      if (cookie && fetching) {
        try {
          const userRes = await axios.get(`${process.env.REACT_APP_API_URL}/user`,
            { headers: { 'Authorization': `Bearer ${cookie}` } }
          );
          setPlayerData(userRes.data.player);
          setAuthenticated(true);
        } catch (e) {
          setPlayerData(null);
        }
      }
      setFetching(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fetching)
    return (<Loading />);
  return (
    <BrowserRouter>
      <Header authenticated={authenticated} playerData={playerData} setAuthenticated={setAuthenticated} />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/error' element={<Error/>} />
        <Route path='/authenticate' element={<Consume />} />
        {/* <Route
          path='/search'
          element={
          <ProtectedRoute>
            <Error />
          </ProtectedRoute>
          }
        /> */}
        <Route
          path='/create'
          element={
          <ProtectedRoute>
            <Create />
          </ProtectedRoute>
          }
        />
        <Route
          path='/my-trades'
          element={
          <ProtectedRoute>
            <UserTrades />
          </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
