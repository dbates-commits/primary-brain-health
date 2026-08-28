import { client } from "@tina/__generated__/client";

export async function getPage(relativePath: string) {
  try {
    const result = await client.queries.page({ relativePath });
    return result;
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}

export async function getPages() {
  try {
    const result = await client.queries.pageConnection();
    return result;
  } catch (error) {
    console.error("Error fetching pages:", error);
    return null;
  }
}

export async function getPost(relativePath: string) {
  try {
    const result = await client.queries.post({ relativePath });
    return result;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function getPosts() {
  try {
    const result = await client.queries.postConnection();
    return result;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return null;
  }
}

export async function getAuthor(relativePath: string) {
  try {
    const result = await client.queries.author({ relativePath });
    return result;
  } catch (error) {
    console.error("Error fetching author:", error);
    return null;
  }
}

export async function getAuthors() {
  try {
    const result = await client.queries.authorConnection();
    return result;
  } catch (error) {
    console.error("Error fetching authors:", error);
    return null;
  }
}

