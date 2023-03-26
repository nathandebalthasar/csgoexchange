import { FC, useState, Dispatch, SetStateAction } from "react";
import { InventoryItem } from "../../utils/interface";
import { INVENTORY } from "./index";
  import InfoIcon from '@mui/icons-material/Info';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { Grid, List, ImageListItem, ImageListItemBar } from "@mui/material";
import { IconButton } from "@mui/material";

interface InventoryProps {
  inventory: InventoryItem[],
  type: INVENTORY,
  setInventory: Dispatch<SetStateAction<InventoryItem[]>>,
  tradeInv: InventoryItem[],
  setTradeInv: Dispatch<SetStateAction<InventoryItem[]>>,
}

export const Inventory: FC<InventoryProps> = ({inventory, setInventory, tradeInv, setTradeInv, type}) => {
  const handleClick = (source: InventoryItem[], setSource: any, target: InventoryItem[], setTarget: any, skinName: string) => {
    const elem = source.find((item: InventoryItem) => item.name === skinName)!;
    const copy = source;
    if (elem.amount > 1)
      elem.amount--;
    else
      copy.splice(copy.indexOf(elem), 1);
    const targetCopy = target;
    const targetElem = targetCopy.find((item) => item.name === skinName)!;
    if (targetElem) {
      targetElem.amount++;
      setTarget([...targetCopy]);
    } else {
      setTarget([...target, {
        amount: 1,
        icon_url: elem.icon_url,
        name: elem.name,
      }]);
    }
    setSource([...copy]);
  }

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [item, setItem] = useState<InventoryItem|null>(null);
  const handleOpenDialog = (skin: InventoryItem) => {
    setItem(skin);
    setOpenDialog(true);
  }
  const handleCloseDialog = () => {
    setOpenDialog(false);
  }

  return (
      <Grid container style={{ border: '2px solid white', borderRadius: '3px', width: '100%', paddingLeft: '1em', height: '400px', overflowY: 'auto'}}>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogContent style={{ backgroundColor: '#adb5bd' }}>
          <img
            src={`http://cdn.steamcommunity.com/economy/image/${item?.icon_url}`}
            alt={item?.name}
            style={{ width: '100%', height: 'auto' }}
          />
          <DialogContentText style={{color: 'black'}}>Name: {item?.name}</DialogContentText>
          <DialogContentText style={{color: 'black'}}>Amount: {item?.amount}</DialogContentText>
          </DialogContent>
        </Dialog>
        <Grid item>
          <List style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: 0 }}>
          {(type === INVENTORY.INV ? inventory : tradeInv).map((skin: any, index: any) => (
            <ImageListItem
              key={`${skin.classid}-${index}`}
              style={{ cursor: 'pointer', padding: '1em', width: '150px', height: 'auto' }}
            >
              <img
                src={`http://cdn.steamcommunity.com/economy/image/${skin.icon_url}`}
                alt={skin.name}
                style={{ border: '2px solid black', borderRadius: '2px', backgroundColor: '#adb5bd'}}
                onClick={(event: any) => {
                  if (type === INVENTORY.INV)
                    handleClick(inventory, setInventory, tradeInv, setTradeInv, event.target.alt);
                  else
                    handleClick(tradeInv, setTradeInv, inventory, setInventory, event.target.alt);
                }}
              />
              <ImageListItemBar
                position="bottom"
                title={skin.name}
                actionIcon={
                <IconButton
                  onClick={() => handleOpenDialog(skin)}
                >
                  <InfoIcon />
                </IconButton>
                }
              />
            </ImageListItem>
          ))}
          </List>
        </Grid>
      </Grid>
  );
}
