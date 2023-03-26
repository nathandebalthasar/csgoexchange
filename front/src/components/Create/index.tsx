import { Inventory } from "./Inventory";
import { useState, useEffect, useContext } from "react";
import Loading from "../Loading";
import { InventoryItem } from "../../utils/interface";
import { getCookie } from "../../utils/getCookie";
import axios from 'axios';
import { Typography, Button, Grid } from "@mui/material";
import { Items } from "./Items";
import { Colors } from "../../utils/Colors";
import { SteamItem } from "../../utils/interface";
import { LanguageContext } from "../../App";

import { Translations } from "../../utils/translations";
const translations: Translations<string> = require("../../utils/translations.json");

export enum INVENTORY {
  TRADE_INV,
  INV,
}

const SubmitButton = ({setSubmitted, language}: any) => {
  return (
    <Grid container justifyContent={'center'} sx={{
      marginTop: '1em'
    }}>
      <Button sx={{
        color: Colors.blue,
        textTransform: 'none',
        fontSize: '1.5em',
        '&:hover': {
          color: Colors.white,
        }}}
        onClick={() => setSubmitted(true)}
      >
        {translations[language]["create"]["submit-button"]}
      </Button>
    </Grid>
  )
}

export const Create = () => {
  const { language } = useContext(LanguageContext);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [tradeInv, setTradeInv] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [itemsTypes, setItemsTypes] = useState<string[]>([]);
  const [desiredItems, setDesiredItems] = useState<SteamItem[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const cookie = getCookie('userSession');
      if (loading) {
        const inventoryResponse = await axios.get(`${process.env.REACT_APP_API_URL}/inventory`,
          { headers: { 'Authorization': `Bearer ${cookie}` } }
        );
        setInventory(inventoryResponse.data);
        const itemsTypesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/items-types`);
        setItemsTypes(itemsTypesResponse.data.items);
        setLoading(false);
      }
      if (submitted) {
        await axios.post(`${process.env.REACT_APP_API_URL}/offer`, {
          offer: {
              userItems: tradeInv,
              desiredItems
          }
        },
          { headers: { 'Authorization': `Bearer ${cookie}` } }
        );
        setSubmitted(false);
      }
    })();
  }, [loading, itemsTypes, desiredItems, submitted, tradeInv]);

  if (loading)
    return <Loading />;
  return (
    <>
      <Grid container direction={'row'} justifyContent={'center'}>
        <Grid item xs={5}>
          <Typography style={{paddingTop: '10px', paddingBottom: '15px', color: Colors.white }} fontSize={'1.2em'}>{translations[language]["create"]["items-inventory"]}</Typography>
          <Inventory inventory={inventory} setInventory={setInventory} tradeInv={tradeInv} setTradeInv={setTradeInv} type={INVENTORY.INV} />
        </Grid>
        <Grid item xs={5}>
          <Typography style={{paddingTop: '10px', paddingBottom: '15px', color: Colors.white}} fontSize={'1.2em'}>{translations[language]["create"]["items-offered"]}</Typography>
          <Inventory inventory={inventory} setInventory={setInventory} tradeInv={tradeInv} setTradeInv={setTradeInv} type={INVENTORY.TRADE_INV}/>
        </Grid>
      </Grid>
      <Grid container direction={'row'} justifyContent={'center'}>
        <Items
          itemsTypes={itemsTypes}
          desiredItems={desiredItems}
          setDesiredItems={setDesiredItems}
        />
      </Grid>
      <SubmitButton
        setSubmitted={setSubmitted}
        language={language}
      />
    </>
  );
}
