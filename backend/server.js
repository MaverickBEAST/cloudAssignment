const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const { Octokit } = require("@octokit/rest");

const app = express();
const octokit = new Octokit({ auth: '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' });


// Database connection
const connection = mysql.createConnection({
  host: 'microcrud.cjbcanpgblym.eu-north-1.rds.amazonaws.com',
  user: 'admin',
  password: 'WordLife123!',
  database: 'crudapp',
  port: 3306,
});

connection.connect(err => {
    if (err) throw err;
    console.log('Database connected');
});

app.use(cors());
app.use(express.json());

// User Authentication
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  connection.query('SELECT password FROM gitUser WHERE userId =?', [username], (error, results) => {
      if (error) return res.status(500).json({ error: 'Database error' });
      if(results.password == password) return res.status(200).json({ error: 'success' });   
      if (!(results.length > 0)) return res.status(400).json({ error: 'Invalid username or password0' });      
      const storedPassword = results[0].password;
      if (password !== storedPassword) return res.status(400).json({ error: 'Invalid username or password1' });

      res.sendStatus(200);
  });
});

// Get GitHub data
const getGitHubData = async (username) => {
  try {
    const repos = await octokit.repos.listForUser({ username, per_page: 100 });
    const repoCount = repos.data.length;

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const activeRepos = repos.data.filter(repo => new Date(repo.updated_at) >= threeMonthsAgo);

    const commitsPromises = activeRepos.map(repo => octokit.repos.listCommits({
      owner: username,
      repo: repo.name,
      since: threeMonthsAgo.toISOString()
    }));

    const commitsResponses = await Promise.all(commitsPromises);
    const commitsCount = commitsResponses.reduce((sum, response) => sum + response.data.length, 0);

    const forkCount = repos.data.reduce((sum, repo) => sum + repo.forks_count, 0);
    const starCount = repos.data.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const issuesCount = repos.data.reduce((sum, repo) => sum + repo.open_issues_count, 0);

    return {
      repoCount,
      activeReposCount: activeRepos.length,
      commitsCount,
      forkCount,
      starCount,
      issuesCount
    };

  } catch (error) {
    console.error('Error fetching GitHub data: ', error);
  }
};


// Usage:
app.get('/github/data/:username', async (req, res) => {
  const username = req.params.username;
  const data = await getGitHubData(username);
  res.json(data);
});

// Start the server
app.listen(5000, () => {
    console.log('Server listening on port 5000');
});