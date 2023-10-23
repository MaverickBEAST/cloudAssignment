import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Card, CardContent, CssBaseline } from '@material-ui/core';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ea',
    },
    secondary: {
      main: '#120e4a',
    },
    background: {
      default: '#a3a3a3',
    },
  },
});

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [githubData, setGithubData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = theme.palette.background.default;
    return () => {
      document.body.style.backgroundColor = null;
    };
  }, []);


  const handleLogin = async () => {
    try {
      await axios.post('http://localhost:5000/login', { username, password });
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const handleFetchGithubData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/github/data/${githubUsername}`);
      setGithubData(response.data);
    } catch (error) {
      console.error('GitHub data fetch error:', error);
      alert('Failed to fetch GitHub data');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" style={{ marginTop: '20px' }}>
        {!isLoggedIn ? (
          <Card style={{ padding: '20px', borderRadius: '8px' }}>
            <CardContent>
              <Typography variant="h5" style={{ marginBottom: '16px' }}>Login</Typography>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleLogin}
                style={{ marginTop: '16px' }}
              >
                Login
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
          <TextField
            label="GitHub Username"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{ style: { color: '#fff' } }}  // Apply white color to the label
          />
            <Button variant="contained" color="primary" onClick={handleFetchGithubData}>
              Fetch GitHub Data
            </Button>
          </div>
        )}

        {githubData && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
            {Object.entries(githubData).map(([key, value], index) => (
              <Card key={index} style={{ flex: '1 1 calc(33.333% - 16px)', boxSizing: 'border-box', backgroundColor: theme.palette.secondary.main }}>
                <CardContent>
                  <Typography variant="h6" style={{ color: '#fff' }}>{key.replace(/([A-Z])/g, ' $1')}</Typography>
                  <Typography variant="h4" style={{ color: '#fff' }}>{value}</Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;
