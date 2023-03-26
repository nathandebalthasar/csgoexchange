import { useContext, useEffect, useState } from "react";
import { getCookie } from "../utils/getCookie";
import axios from 'axios';
import Loading from "../components/Loading";
import { OfferElement } from "../components/TradeOffer";
import { Grid, Button } from "@mui/material";
import { ItemsResponse } from "../utils/interface";
import { LanguageContext } from "../App";
import { Translations } from "../utils/translations";
const translations: Translations<string> = require("../utils/translations.json");

const DeleteButton = ({ offerId, setRemove }: any) => {
  const { language } = useContext(LanguageContext);

  return (
    <Grid container item xs={1} justifyContent={'center'} alignItems={'center'}>
      <Button
        onClick={async () => setRemove({ delete: true, id: offerId })}
        style={{ backgroundColor: 'red' }}
        variant='contained'
        sx={{height: '2em', textTransform: 'none'}}
      >
        {translations[language]["user-trades"]["delete-button"]}
      </Button>
    </Grid>
  );
}

const Trades = ({ offer, setRemove }: any) => {
  return (
    <Grid container justifyContent={'center'}>
      <Grid container style={{ paddingTop: 10 }} direction={'row'} justifyContent={'center'}>
        <OfferElement items={offer.userItems} />
        <DeleteButton setRemove={setRemove} offerId={offer.offerId} />
        <OfferElement items={offer.desiredItems} />
      </Grid>
    </Grid>
  );
}

export const UserTrades = () => {
  const [items, setItems] = useState<ItemsResponse[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [remove, setRemove] = useState<any>({
    delete: false,
    id: null,
  });

  useEffect(() => {
    (async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/offers?requestType=user`, {
        headers: { Authorization: `Bearer ${getCookie("userSession")}` }
      });
      setItems(res?.data!);
      setLoading(false);
      if (remove.delete) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/offer?offerId=${remove.id}`, {
          headers: { Authorization: `Bearer ${getCookie("userSession")}` }
        });
        setRemove({ delete: false, id: null });
      }
    })();
  }, [remove]);

  if (loading)
    return <Loading />;
  return (
    <>
      {items?.map((offer: any, index: any) => (
        <Trades setRemove={setRemove} key={`user-trades-${index}`} offer={offer} />
      ))}
    </>
  );
}
