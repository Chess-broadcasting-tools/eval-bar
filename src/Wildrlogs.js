import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Tabs,
  Tab,
  Typography,
  Box,
  Container,
  Paper,
  TextField, // Import TextField from Material-UI
  Button,    // Import Button from Material-UI
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './Wildrlogs.css';


const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff00', // Futuristic green color
    },
  },
  typography: {
    fontFamily: 'Orbitron, Arial, sans-serif', // Futuristic font for titles
    h4: {
      fontWeight: 'bold',
    },
    subtitle1: {
      color: '#00ff00',
    },
    body1: {
      fontFamily: 'Roboto, Arial, sans-serif', // More readable font for body/data
    },
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function DataList({ items }) {
  return (
    <div className="dataList">
      {items.map((item, index) => (
        <Typography key={index} className="dataItem">
          <span className="dataIndex">{index + 1}.</span> {item}
        </Typography>
      ))}
    </div>
  );
}

function WildrLogs() {
  const [value, setValue] = useState(0);
  const [logs, setLogs] = useState([]);
  const [verified, setVerified] = useState([]);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handlePasswordSubmit = () => {
    // Check if the entered password is correct
    if (password === 'chess1base@India') {
      setAuthenticated(true);
    } else {
      alert('Incorrect password. Access denied.');
    }
  };

  useEffect(() => {
    // Fetch logs and verified users only if authenticated
    if (authenticated) {
      // Fetch logs
      fetch('http://139.59.45.140:8000/logs')
        .then(response => response.json())
        .then(data => setLogs(data.data.split('\n')));

      // Fetch verified users
      fetch('http://139.59.45.140:8000/verified')
        .then(response => response.json())
        .then(data => setVerified(data.data.split('\n')));
    }
  }, [authenticated]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        {authenticated ? (
          <>
            <Typography variant="h4" gutterBottom className="appHeading">WILDR LOGS</Typography>
            <AppBar position="static">
              <Tabs value={value} onChange={handleChange}>
                <Tab label="Verified Users" />
                <Tab label="Logs" />
              </Tabs>
            </AppBar>
            <TabPanel value={value} index={0}>
          <Typography variant="h4" gutterBottom>Verified Users</Typography>
          <Typography paragraph>
            List of users whose account exist on Wildr and have claimed the premium account.
          </Typography>
          <Paper className="paperStyle">
            <DataList items={verified} />
          </Paper>
        </TabPanel>
        <TabPanel value={value} index={1}>
        <TabPanel value={value} index={1}>
  <Typography variant="h4" gutterBottom>Logs</Typography>
  <Typography paragraph>
    List of all actions on the form "Claim Free Gift."
  </Typography>
  <Paper className="paperStyle">
    <DataList items={logs} />
  </Paper>
  <Typography paragraph>
    Note: The logging process started on 25th Dec 10:30 PM IST.
  </Typography>
</TabPanel>

        </TabPanel>
          </>
        ) : (
          <div>
            <Typography variant="h4" gutterBottom className="appHeading">Password Protected</Typography>
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={handlePasswordSubmit}>
              Submit Password
            </Button>
          </div>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default WildrLogs;