export interface PinnedRepo {
  name: string;
  description: string;
  url: string;
  homepageUrl: string | null;
  languages: string[];
  topics: string[];
}

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            homepageUrl
            isFork
            isArchived
            repositoryTopics(first: 10) { nodes { topic { name } } }
            languages(first: 5, orderBy: { field: SIZE, direction: DESC }) {
              nodes { name }
            }
          }
        }
      }
    }
  }
`;

export async function fetchPinnedRepos(login: string): Promise<PinnedRepo[]> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  const data = await res.json();
  const nodes = data.data.user.pinnedItems.nodes;
  return nodes
    .filter((r: any) => !r.isFork && !r.isArchived)
    .map((r: any) => ({
      name: r.name,
      description: (r.description || "").trim(),
      url: r.url,
      homepageUrl: r.homepageUrl || null,
      languages: r.languages.nodes.map((l: any) => l.name),
      topics: r.repositoryTopics.nodes.map((t: any) => t.topic.name),
    }));
}
