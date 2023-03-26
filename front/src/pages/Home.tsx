import { TradeOffer } from "../components/TradeOffer";
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import { getCookie } from "../utils/getCookie";
import { ItemsResponse } from "../utils/interface";

const Home = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<ItemsResponse[]>();

  useEffect(() => {
    (async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/offers?requestType=all`, {
        headers: { Authorization: `Bearer ${getCookie("userSession")}` }
      });
      setItems(res?.data!);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return <Loading />;
  return (
    <>
      {items?.map((offer: any, index: any) => (
        <TradeOffer key={`offer-${index}`} items={offer} />
      ))}
    </>
  );
};

export default Home;
