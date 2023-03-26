import {
  AppBar,
  Box,
  IconButton,
  Typography,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Menu,
  Toolbar,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { deleteCookie } from '../../utils/deleteCookie';
import axios from 'axios';
import { getCookie } from '../../utils/getCookie';
import { Flag, flags } from '../Flag';
import { LanguageContext } from '../../App';
import { Translations } from '../../utils/translations';
const translations: Translations<string> = require("../../utils/translations.json");

const Logo = require('./logo.png');
const SignIn = require('./sign-in-button.png');

// TODO: implement search
// const pages = ['search', 'create', 'my-trades'];
const pages = ['create', 'my-trades'];

const tradeUrlRegex = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=[^&]+&token=[^&]+$/;

const logout = (setAuthenticated: any, setAnchorElUser: any) => {
  deleteCookie('userSession', '/', 'localhost');
  setAuthenticated(false);
  setAnchorElUser(null)
}

export const Language = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const [anchorEl, setAnchorEl] = useState<null|HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid>
      <Button onClick={handleClick}>
        <Flag countryCode={language}/>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {Object.entries(flags).filter(([k, _]) => k !== language).map(([key, _]) => (
          <MenuItem key={`${key}-flag`} onClick={() => {setLanguage(key); handleClose();}}>
            <Flag countryCode={key}/>
          </MenuItem>
        ))}
      </Menu>
    </Grid>
  );
}

const Header = ({ authenticated, setAuthenticated, playerData} : any ) => {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tradeUrl, setTradeUrl] = useState<string>(playerData?.tradeUrl || '');
  const [validUrl, setValidUrl] = useState<boolean|null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const { language } = useContext(LanguageContext);

  const handleOpenUserMenu = (event: any) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  useEffect(() => {
    (async () => {
      if (fetching) {
        const cookie = getCookie('userSession');
        await axios.put(`${process.env.REACT_APP_API_URL}/tradeurl`,
        {
          'tradeUrl': tradeUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${cookie}`,
          },
        });
        playerData.tradeUrl = tradeUrl;
        setFetching(false);
      }
    })();
  }, [fetching, tradeUrl, playerData]);

  return (
    <div>
      <Dialog open={showSettings} onClose={() => setShowSettings(!showSettings)} style={{color: 'red'}}>
        <DialogContent>
          <DialogContentText>
          Enter your Trade URL below, you can get it through your profile settings.
          Also, make sure that your inventory is publicly accessible.
          </DialogContentText>
          <TextField
            value={tradeUrl}
            onChange={(event) => setTradeUrl(event.target.value)}
            autoFocus
            margin="dense"
            id="name"
            label="Trade URL"
            fullWidth
            variant="standard"
            />
            {validUrl === false ? (
              <Typography color={'red'} sx={{fontSize: '0.9em'}}>Invalid URL</Typography>
              ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowSettings(!showSettings); setTradeUrl(playerData?.tradeUrl || '') }}>Cancel</Button>
          <Button onClick={() => {
            if (tradeUrlRegex.test(tradeUrl)) {
              setFetching(true);
              setShowSettings(!showSettings)
            } else
              setValidUrl(false);
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <AppBar position="static" sx={{ backgroundColor: '#6320EE' }}>
        <Container maxWidth={false} sx={{m: 0}}>
          <Toolbar disableGutters>
            <Box
              component="img"
              sx={{
                height: 70,
                width: 70,
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
              alt="logo"
              src={Logo}
            />
            <Box sx={{ flexGrow: 1}}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => navigate(page)}
                  sx={{ my: 2, color: '#F8F0FB', marginLeft: 5}}
                >
                  {translations[language]["pages"][page]}
                </Button>
              ))}
            </Box>
            {authenticated ? (
              <Typography sx={{ color: '#F8F0FB' }}>Steamid: {playerData.steamid}</Typography>
            ) : null}
            <Language />
            <Box>
              {authenticated ? (
                <Tooltip title="Settings">
                  <IconButton onClick={handleOpenUserMenu}>
                    <Avatar alt="avatar" src={playerData.avatar} />
                  </IconButton>
                </Tooltip>
              ) : (
                <a href={`${process.env.REACT_APP_API_URL}/login`}>
                <img src={SignIn} alt='signIn-button' />
              </a>
              )}
              <Menu
                sx={{
                  mt: '45px',
                }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem key={'Settings'} onClick={() => setShowSettings(!showSettings)}>
                  <Typography sx={{ color: '#211A1D' }}>{translations[language]["settings"]["settings"]}</Typography>
                </MenuItem>
                <MenuItem key={'Logout'} onClick={() => logout(setAuthenticated, setAnchorElUser)}>
                  <Typography sx={{ color: '#211A1D' }}>{translations[language]["settings"]["logout"]}</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
}

export default Header;
