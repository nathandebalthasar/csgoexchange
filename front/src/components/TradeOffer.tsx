import { Typography, ImageListItem, Grid, List, Tooltip, Button } from '@mui/material';
import { Colors } from '../utils/Colors';
import { ItemOffer } from '../utils/interface';
import { DateTime } from 'luxon';
import { LanguageContext } from "../App"
import { Translations } from '../utils/translations';
import { useContext } from 'react';
const translations: Translations<string> = require("../utils/translations.json");

export const OfferElement = ({ items }: any) => {
  const { language } = useContext(LanguageContext);

  return (
    <Grid item xs={5} style={{backgroundColor: Colors.gray}}>
      <List style={{display: 'flex', flexDirection: 'row'}}>
        {items.map((skin: ItemOffer, index: number) => (
          <Tooltip
            title={<Typography>{skin.type ? skin.type + ' | ': ''}{skin.painting}<br/>{translations[language]["home"]["offer-element-amount"]} {skin.amount}</Typography>}
            placement={'top'}
            key={`tooltip-${index}`}
          >
            <ImageListItem
              key={`${skin.painting}-${index}`}
              style={{ cursor: 'pointer', padding: '1em', width: '140px', height: 'auto' }}
              >
              <img key={`img-${index}`} src={skin.url} alt={skin.painting} style={{ paddingRight: '1em', paddingLeft: '1em' }} />
            </ImageListItem>
          </Tooltip>
        ))}
      </List>
    </Grid>
  );
}

const TradeButton = ({ tradeUrl, language }: any) => {
  return (
    <Grid container item xs={1} justifyContent={'center'} alignItems={'center'}>
      <Button
        onClick={() => window.location.href = tradeUrl}
        style={{ backgroundColor: Colors.blue }}
        variant='contained'
        sx={{height: '2em', textTransform: 'none'}}
      >
        {translations[language]["home"]["trade-button"]}
      </Button>
    </Grid>
  );
}

export const TradeOffer = ({ items }: any) => {
  const { language } = useContext(LanguageContext);
  const date = DateTime.fromISO(items.timestamp).toRelative({ base: DateTime.now(), style: 'long', locale: language });

  return (
    <Grid container justifyContent={'center'}>
      <Typography style={{color: Colors.white, paddingTop: '1em'}}>
        {`${items.author} ${translations[language]["home"]["offer-title"]}, ${date}`}
      </Typography>
      <Grid container style={{paddingTop: 10}} direction={'row'} justifyContent={'center'}>
        <OfferElement key={'left-offer-element'} items={items.userItems} />
        <TradeButton tradeUrl={items.tradeUrl} language={language} />
        <OfferElement key={'right-offer-element'} items={items.desiredItems} />
      </Grid>
    </Grid>
  );
};
