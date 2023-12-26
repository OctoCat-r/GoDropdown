const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config();

const labels = [];
const data1 = [];

// Setting up EJS as the view engine
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/repositories", async (req, res) => {
  try {
    const username = req.query.username;

    //  GraphQL query for fetching repositories
    const query = `
      query($login: String!) {
        user(login: $login) {
          repositories(first: 10, orderBy: { field: CREATED_AT, direction: DESC }) {
            nodes {
              name
              owner {
                login
              }
              description
              homepageUrl
              stargazerCount
              primaryLanguage {
                name
                color
              }
            }
          }
        }
      }
    `;

    // GitHub token
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    // Fetching data from GitHub GraphQL API
    const { data } = await axios.post(
      "https://api.github.com/graphql",
      { query, variables: { login: username } },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    const repositories = data.data.user.repositories.nodes;

    res.render("repo", { repositories });
  } catch (error) {
    console.error("Error fetching data from GitHub:", error.message);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/contribution-graph", async (req, res) => {
  try {
    const username = req.query.username;

    // GraphQL query to fetch contribution detail
    const query = `
        query($login: String!) {
          user(login: $login) {
            contributionsCollection(from: "2023-01-25T00:00:00Z", to: "2023-12-26T23:59:59Z") {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
          }
        }
      `;

    // GitHub token
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    // Fetching data from GitHub GraphQL API
    const { data } = await axios.post(
      "https://api.github.com/graphql",
      { query, variables: { login: username } },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    const contributionCalendar =
      data.data.user.contributionsCollection.contributionCalendar;

    // Preparing graph data

    contributionCalendar.weeks.forEach((week) => {
      labels.push(week.contributionDays[0].date);
      data1.push(
        week.contributionDays.reduce(
          (sum, day) => sum + day.contributionCount,
          0
        )
      );
    });
    console.log(contributionCalendar.weeks);

    res.render("graph");
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Render the initial form
app.get("/repo", (req, res) => {
  res.render("repo", { repositories: [] });
});

app.get("/graph", (req, res) => {
  res.render("graph");
});

//Server side access of label and data
app.get("/get-graph-data", (req, res) => {
  res.json({ labels: labels, data1: data1 }); 
});

app.get("/", (req, res) => {
  res.render("homepage", {});
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
