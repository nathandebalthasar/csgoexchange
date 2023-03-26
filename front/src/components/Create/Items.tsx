import { useState, useEffect, useContext } from "react";
import {
  Grid,
  Box,
  Autocomplete,
  TextField,
  List,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Dialog,
  DialogContentText,
  DialogContent,
} from "@mui/material";
import axios from 'axios';
import InfoIcon from '@mui/icons-material/Info';
import './style.css';
import { SteamItem } from "../../utils/interface";
import { Translations } from "../../utils/translations";
import { LanguageContext } from "../../App";

const translations: Translations<string> = require("../../utils/translations.json");

const ItemsTypesList = ({ itemsTypes, currentType, setCurrentType, setLoading }: any) => {
  const {language} = useContext(LanguageContext);
  return (
    <Box sx={{ minWidth: 120, paddingTop: '2em' }}>
      <Autocomplete
        disablePortal
        id="item-type-box"
        options={itemsTypes}
        onChange={(event, newValue) => {
          setCurrentType(newValue);
          if (newValue != null)
            setLoading(true);
        }}
        sx={{
          width: 300
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{backgroundColor: 'white', color: 'black'}}
            label={translations[language]["create"]["steam-items-placeholder"]}
          />
        )}
      />
    </Box>
  );
};

export const Items = ({itemsTypes, desiredItems, setDesiredItems}: any) => {
  const [currentType, setCurrentType] = useState<string|null>(null);
  const [items, setItems] = useState<SteamItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogItem, setDialogItem] = useState<SteamItem>();

  useEffect(() => {
    (async () => {
      if (loading && currentType != null) {
        const itemsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/search-items?weaponType=${currentType}`);
        setItems(itemsResponse.data.items);
      }
    })();
  }, [loading, currentType]);

  const handleOpenDialog = (skin: SteamItem) => {
    setDialogItem(skin);
    setOpenDialog(true);
  }
  const handleCloseDialog = () => {
    setOpenDialog(false);
  }

  return (
    <>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogContent style={{ backgroundColor: '#adb5bd' }}>
        <img
          src={dialogItem?.url!}
          alt={dialogItem?.painting!}
          style={{ width: '100%', height: 'auto' }}
        />
        <DialogContentText style={{color: 'black'}}>Name: {dialogItem?.painting!}</DialogContentText>
        <DialogContentText style={{color: 'black'}}>Amount: {dialogItem?.amount!}</DialogContentText>
        </DialogContent>
      </Dialog>
      <Grid item xs={5} style={{ marginTop: '2em', border: '2px solid white', borderRadius: '3px', width: '100%', paddingLeft: '1em', height: '400px', overflowY: 'auto'}}>
        <ItemsTypesList
          itemsTypes={itemsTypes}
          currentType={currentType}
          setCurrentType={setCurrentType}
          setLoading={setLoading}
          />
          <List style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: 0 }}>
            {items != null ? items.map((skin: any, index: any) => (
              <ImageListItem
                key={`${skin.painting}-${index}`}
                style={{ cursor: 'pointer', padding: '1em', width: '150px', height: 'auto' }}
              >
                <img
                  src={skin.url}
                  alt={skin.painting}
                  style={{ border: '2px solid black', borderRadius: '2px', backgroundColor: '#adb5bd'}}
                  onClick={(event: any) => {
                    if (desiredItems.filter((item: any) => item.painting === event.target.alt).length === 0) {
                      setDesiredItems([...desiredItems, { "weapon-type": currentType, painting: event.target.alt, url: event.target.src, amount: 1 }]);
                    } else {
                      setDesiredItems(desiredItems.map((item: any) => {
                        if (item.painting === event.target.alt) {
                          return { "weapon-type": currentType, painting: event.target.alt, url: event.target.src, amount: item.amount + 1 };
                        }
                        return item;
                      }));
                    }
                  }}
                />
              </ImageListItem>
            )) : null}
          </List>
      </Grid>
      {/* Desired item */}
      <Grid item xs={5} style={{ marginTop: '2em', border: '2px solid white', borderRadius: '3px', width: '100%', paddingLeft: '1em', height: '400px', overflowY: 'auto'}}>
          <List style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: 0 }}>
              {desiredItems != null ? desiredItems.map((skin: any, index: any) => (
                <ImageListItem
                  key={`${skin.painting}-${index}`}
                  style={{ cursor: 'pointer', padding: '1em', width: '150px', height: 'auto' }}
                >
                  <img
                    src={skin.url}
                    alt={skin.painting}
                    style={{ border: '2px solid black', borderRadius: '2px', backgroundColor: '#adb5bd'}}
                    onClick={(event: any) => {
                      if (desiredItems.filter((item: any) => item.painting === event.target.alt).length > 0) {
                        setDesiredItems(desiredItems.map((item: any) => {
                          if (item.painting === event.target.alt) {
                            if (item.amount - 1 === 0) {
                              return null;
                            }
                            return { type: currentType, painting: event.target.alt, url: event.target.src, amount: item.amount - 1 };
                          }
                          return item;
                        }).filter((item: any) => item != null));
                      }
                    }}
                  />
                  <ImageListItemBar
                    position="bottom"
                    title={skin.painting}
                    actionIcon={
                    <IconButton
                      onClick={() => handleOpenDialog(skin)}
                    >
                      <InfoIcon />
                    </IconButton>
                    }
                  />
                </ImageListItem>
              )) : null}
            </List>
      </Grid>
      </>
  );
}
